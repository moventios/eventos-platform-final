import { NextRequest, NextResponse } from 'next/server';
import { withTenantContext } from '@/lib/with-tenant-context';
import { createDbWithTenant } from '@movent/infrastructure/postgres';
import { pointsAccounts, pointsTransactions } from '@movent/database/schema/points';
import { rooms, bookings, bookingHistories } from '@movent/database/schema/spatial';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const CheckoutBookingSchema = z.object({
  roomId: z.string().uuid(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  title: z.string().max(255).optional(),
  notes: z.string().optional(),
});

/**
 * POST /api/v1/commerce/checkout/booking
 * Process checkout for a Room Booking using Points (Coins)
 */
export const POST = withTenantContext(async (req: NextRequest, { tenantId, actorId }) => {
  const body = CheckoutBookingSchema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 422 });

  const { roomId, startsAt, endsAt, title, notes } = body.data;
  const { db } = createDbWithTenant(tenantId);

  return await db.transaction(async (tx) => {
    // 1. Get the Room
    const room = await tx.query.rooms.findFirst({
      where: and(eq(rooms.id, roomId), eq(rooms.tenantId, tenantId)),
    });

    if (!room) {
      return NextResponse.json({ error: 'Ruangan tidak ditemukan.' }, { status: 404 });
    }

    if (room.status !== 'available') {
      return NextResponse.json({ error: 'Ruangan sedang tidak tersedia.' }, { status: 400 });
    }

    // 2. Check Points Account
    let account = await tx.query.pointsAccounts.findFirst({
      where: eq(pointsAccounts.profileId, actorId),
    });

    if (!account) {
      const [newAccount] = await tx.insert(pointsAccounts).values({
        tenantId,
        profileId: actorId,
        balance: 0,
      }).returning();
      if (!newAccount) {
        return NextResponse.json({ error: 'Gagal menginisialisasi dompet.' }, { status: 500 });
      }
      account = newAccount;
    }

    if (account.balance < room.pointCost) {
      return NextResponse.json({ error: 'Saldo koin tidak mencukupi.' }, { status: 400 });
    }

    // 3. PostgreSQL tstzrange string format: '[startsAt, endsAt)'
    const timeRangeStr = `[${new Date(startsAt).toISOString()},${new Date(endsAt).toISOString()})`;

    // 4. Try to deduct points and insert booking (Postgres will throw if GiST constraint fails)
    try {
      if (room.pointCost > 0) {
        await tx.update(pointsAccounts)
          .set({ balance: account.balance - room.pointCost })
          .where(eq(pointsAccounts.id, account.id));

        await tx.insert(pointsTransactions).values({
          tenantId,
          profileId: actorId,
          amount: -room.pointCost,
          type: 'spend',
          description: `Sewa ruangan: ${room.name}`,
          metadata: { roomId }
        });
      }

      const idempotencyKey = `booking_${actorId}_${roomId}_${Date.now()}`;
      const [booking] = await tx.insert(bookings).values({
        tenantId,
        roomId,
        requestedBy: actorId,
        status: 'approved', // Directly approved!
        timeRange: timeRangeStr,
        idempotencyKey,
        title,
        notes,
        actorType: 'USER',
      }).returning();

      // Insert history
      await tx.insert(bookingHistories).values({
        tenantId,
        bookingId: booking.id,
        toStatus: 'approved',
        changedBy: actorId,
        actorType: 'USER',
        reason: 'Paid with Coins',
      });

      return NextResponse.json({ success: true, booking });
    } catch (err: any) {
      // Catch GiST EXCLUSION constraint violation
      if (err.message?.includes('bookings_no_overlap') || err.message?.includes('exclusion constraint')) {
        // Transaction will rollback automatically (including the points deduction!)
        return NextResponse.json({ error: 'Ruangan sudah dipesan pada jadwal tersebut (bentrok).' }, { status: 409 });
      }
      throw err; // Re-throw if it's another error
    }
  });
});
