import { NextRequest, NextResponse } from 'next/server';
import { withTenantContext } from '@/lib/with-tenant-context';
import { SubmitBookingSchema } from '@movent/contracts';
import { SubmitBookingHandler } from '@movent/core/spatial';
import { DrizzleBookingRepository } from '@movent/infrastructure/postgres/spatial';
import { OutboxEventBus } from '@movent/infrastructure/postgres';
import { createDbWithTenant } from '@movent/infrastructure/postgres';
import { BookingConflictError } from '@movent/core';

import { rooms, pointsAccounts, pointsTransactions } from '@movent/database/schema';
import { eq, and } from 'drizzle-orm';

export const POST = withTenantContext(async (req: NextRequest, { tenantId, actorId }) => {
  const body = SubmitBookingSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: body.error.flatten() }, { status: 422 });
  }

  const { db } = createDbWithTenant(tenantId);

  // Check room point cost
  const room = await db.query.rooms.findFirst({
    where: and(eq(rooms.id, body.data.roomId), eq(rooms.tenantId, tenantId)),
  });

  if (!room) {
    return NextResponse.json({ error: 'Ruangan tidak ditemukan.' }, { status: 404 });
  }

  if (room.pointCost > 0) {
    let account = await db.query.pointsAccounts.findFirst({
      where: and(eq(pointsAccounts.tenantId, tenantId), eq(pointsAccounts.profileId, actorId)),
    });

    if (!account) {
      await db.insert(pointsAccounts).values({
        tenantId,
        profileId: actorId,
        balance: 1000,
      }).onConflictDoNothing();
      account = await db.query.pointsAccounts.findFirst({
        where: and(eq(pointsAccounts.tenantId, tenantId), eq(pointsAccounts.profileId, actorId)),
      });
    }

    const balance = account?.balance ?? 1000;
    if (balance < room.pointCost) {
      return NextResponse.json(
        { error: `Saldo poin tidak mencukupi. Saldo Anda: ${balance} Poin, Biaya: ${room.pointCost} Poin.` },
        { status: 400 }
      );
    }

    // Deduct points
    await db.transaction(async (tx) => {
      await tx
        .update(pointsAccounts)
        .set({ balance: balance - room.pointCost, updatedAt: new Date() })
        .where(and(eq(pointsAccounts.tenantId, tenantId), eq(pointsAccounts.profileId, actorId)));

      await tx.insert(pointsTransactions).values({
        tenantId,
        profileId: actorId,
        amount: -room.pointCost,
        type: 'spend',
        description: `Pemesanan ruangan "${room.name}"`,
        metadata: { roomId: room.id, title: body.data.title },
      });
    });
  }

  const handler = new SubmitBookingHandler(
    new DrizzleBookingRepository(db),
    new OutboxEventBus(db),
  );

  try {
    const result = await handler.handle(body.data, tenantId, actorId);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof BookingConflictError) {
      // Refund points on conflict
      if (room.pointCost > 0) {
        const account = await db.query.pointsAccounts.findFirst({
          where: and(eq(pointsAccounts.tenantId, tenantId), eq(pointsAccounts.profileId, actorId)),
        });
        const balance = account?.balance ?? 1000;
        await db.transaction(async (tx) => {
          await tx
            .update(pointsAccounts)
            .set({ balance: balance + room.pointCost, updatedAt: new Date() })
            .where(and(eq(pointsAccounts.tenantId, tenantId), eq(pointsAccounts.profileId, actorId)));

          await tx.insert(pointsTransactions).values({
            tenantId,
            profileId: actorId,
            amount: room.pointCost,
            type: 'refund',
            description: `Pengembalian poin: Bentrok jadwal pada ruangan "${room.name}"`,
            metadata: { roomId: room.id },
          });
        });
      }
      return NextResponse.json({ error: err.message, code: err.code }, { status: 409 });
    }
    throw err;
  }
});

export const GET = withTenantContext(async (req: NextRequest, { tenantId }) => {
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get('roomId');
  const { db } = createDbWithTenant(tenantId);
  const repo = new DrizzleBookingRepository(db);
  const raw = await repo.findByTenant(tenantId, roomId ?? undefined);
  // Normalize for UI (startAt/endAt) instead of raw timeRange
  const results = raw.map((b: any) => {
    let startAt = b.startAt;
    let endAt = b.endAt;
    if (b.timeRange && !startAt) {
      const m = String(b.timeRange).match(/\[(.*?),(.*?)\)/);
      if (m) {
        startAt = m[1];
        endAt = m[2];
      }
    }
    return { ...b, startAt, endAt };
  });
  return NextResponse.json(results);
});
