import { NextRequest, NextResponse } from 'next/server';
import { withTenantContext } from '@/lib/with-tenant-context';
import { createDbWithTenant } from '@movent/infrastructure/postgres';
import { bookings, rooms, pointsAccounts, pointsTransactions } from '@movent/database/schema';
import { eq, and } from 'drizzle-orm';

export const DELETE = withTenantContext(async (req: NextRequest, { tenantId, actorId }, params) => {
  const { id } = params;
  if (!id) return NextResponse.json({ error: 'ID tidak valid' }, { status: 400 });
  const { db } = createDbWithTenant(tenantId);

  const booking = await db.query.bookings.findFirst({
    where: and(eq(bookings.id, id), eq(bookings.tenantId, tenantId)),
  });

  if (!booking) {
    return NextResponse.json({ error: 'Reservasi tidak ditemukan.' }, { status: 404 });
  }

  if (booking.status === 'canceled' || booking.status === 'rejected') {
    return NextResponse.json({ error: 'Reservasi sudah dibatalkan atau ditolak.' }, { status: 400 });
  }

  const room = await db.query.rooms.findFirst({
    where: and(eq(rooms.id, booking.roomId), eq(rooms.tenantId, tenantId)),
  });

  try {
    await db.transaction(async (tx) => {
      // Update booking status
      await tx
        .update(bookings)
        .set({ status: 'canceled', updatedAt: new Date(), updatedBy: actorId })
        .where(eq(bookings.id, id));

      // Refund points if applicable
      if (room && room.pointCost > 0) {
        const account = await tx.query.pointsAccounts.findFirst({
          where: and(eq(pointsAccounts.tenantId, tenantId), eq(pointsAccounts.profileId, booking.requestedBy)),
        });

        const balance = account?.balance ?? 1000;
        await tx
          .update(pointsAccounts)
          .set({ balance: balance + room.pointCost, updatedAt: new Date() })
          .where(and(eq(pointsAccounts.tenantId, tenantId), eq(pointsAccounts.profileId, booking.requestedBy)));

        await tx.insert(pointsTransactions).values({
          tenantId,
          profileId: booking.requestedBy,
          amount: room.pointCost,
          type: 'refund',
          description: `Pengembalian poin: Pembatalan reservasi ruangan "${room.name}"`,
          metadata: { roomId: room.id, bookingId: id },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal membatalkan reservasi.' }, { status: 500 });
  }
});

export const PATCH = withTenantContext(async (req: NextRequest, { tenantId, actorId }, params) => {
  const { id } = params;
  if (!id) return NextResponse.json({ error: 'ID tidak valid' }, { status: 400 });
  const { db } = createDbWithTenant(tenantId);
  const body = await req.json();
  const { status } = body;

  if (!status) {
    return NextResponse.json({ error: 'Status harus diisi.' }, { status: 400 });
  }

  const booking = await db.query.bookings.findFirst({
    where: and(eq(bookings.id, id), eq(bookings.tenantId, tenantId)),
  });

  if (!booking) {
    return NextResponse.json({ error: 'Reservasi tidak ditemukan.' }, { status: 404 });
  }

  if (booking.status === status) {
    return NextResponse.json({ success: true });
  }

  const room = await db.query.rooms.findFirst({
    where: and(eq(rooms.id, booking.roomId), eq(rooms.tenantId, tenantId)),
  });

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(bookings)
        .set({ status, updatedAt: new Date(), updatedBy: actorId })
        .where(eq(bookings.id, id));

      // Refund points if transitioning to rejected or canceled
      const isRefundable = (status === 'rejected' || status === 'canceled') &&
                           (booking.status !== 'rejected' && booking.status !== 'canceled');

      if (isRefundable && room && room.pointCost > 0) {
        const account = await tx.query.pointsAccounts.findFirst({
          where: and(eq(pointsAccounts.tenantId, tenantId), eq(pointsAccounts.profileId, booking.requestedBy)),
        });

        const balance = account?.balance ?? 1000;
        await tx
          .update(pointsAccounts)
          .set({ balance: balance + room.pointCost, updatedAt: new Date() })
          .where(and(eq(pointsAccounts.tenantId, tenantId), eq(pointsAccounts.profileId, booking.requestedBy)));

        await tx.insert(pointsTransactions).values({
          tenantId,
          profileId: booking.requestedBy,
          amount: room.pointCost,
          type: 'refund',
          description: `Pengembalian poin: Reservasi ruangan "${room.name}" ditolak/dibatalkan`,
          metadata: { roomId: room.id, bookingId: id },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal memperbarui status reservasi.' }, { status: 500 });
  }
});
