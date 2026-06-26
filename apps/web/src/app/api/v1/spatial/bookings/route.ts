import { NextRequest, NextResponse } from 'next/server';
import { withTenantContext } from '@/lib/with-tenant-context';
import { SubmitBookingSchema } from '@eventos/contracts';
import { SubmitBookingHandler } from '@eventos/core/spatial';
import { DrizzleBookingRepository } from '@eventos/infrastructure/postgres/spatial';
import { OutboxEventBus } from '@eventos/infrastructure/postgres';
import { createDbWithTenant } from '@eventos/infrastructure/postgres';
import { BookingConflictError } from '@eventos/core';

export const POST = withTenantContext(async (req: NextRequest, { tenantId, actorId }) => {
  const body = SubmitBookingSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: body.error.flatten() }, { status: 422 });
  }

  const { db } = createDbWithTenant(tenantId);
  const handler = new SubmitBookingHandler(
    new DrizzleBookingRepository(db),
    new OutboxEventBus(db),
  );

  try {
    const result = await handler.handle(body.data, tenantId, actorId);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof BookingConflictError) {
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
