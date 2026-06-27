import { NextRequest, NextResponse } from 'next/server';
import { withTenantContext } from '@/lib/with-tenant-context';
import { CreateRoomSchema } from '@movent/contracts';
import { CreateRoomHandler } from '@movent/core/spatial';
import { DrizzleRoomRepository } from '@movent/infrastructure/postgres/spatial';
import { OutboxEventBus, createDbWithTenant } from '@movent/infrastructure/postgres';
import { rooms } from '@movent/database/schema';
import { eq, and } from 'drizzle-orm';

export const POST = withTenantContext(async (req: NextRequest, { tenantId, actorId }) => {
  const body = CreateRoomSchema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 422 });

  const { db } = createDbWithTenant(tenantId);
  const handler = new CreateRoomHandler(
    new DrizzleRoomRepository(db),
    new OutboxEventBus(db),
  );

  const result = await handler.handle(body.data, tenantId, actorId);
  return NextResponse.json(result, { status: 201 });
});

export const GET = withTenantContext(async (req: NextRequest, { tenantId }) => {
  // Extract facilityId from path e.g. /api/.../facilities/xxx/rooms
  const url = new URL(req.url);
  const parts = url.pathname.split('/');
  const facilityId = parts[parts.indexOf('facilities') + 1] || '';
  const { db } = createDbWithTenant(tenantId);
  const repo = new DrizzleRoomRepository(db);
  const results = await repo.findByFacility(facilityId, tenantId);
  return NextResponse.json(results);
});
