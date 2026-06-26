import { NextRequest, NextResponse } from 'next/server';
import { withTenantContext } from '@/lib/with-tenant-context';
import { PublishEventSchema } from '@eventos/contracts';
import { PublishEventHandler } from '@eventos/core/commerce';
import { DrizzleEventRepository } from '@eventos/infrastructure/postgres/commerce';
import { OutboxEventBus, createDbWithTenant } from '@eventos/infrastructure/postgres';
import { events } from '@eventos/database/schema';
import { eq } from 'drizzle-orm';

export const POST = withTenantContext(async (req: NextRequest, { tenantId, actorId }) => {
  const body = PublishEventSchema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 422 });

  const { db } = createDbWithTenant(tenantId);
  const handler = new PublishEventHandler(
    new DrizzleEventRepository(db),
    new OutboxEventBus(db),
  );

  const result = await handler.handle(body.data, tenantId, actorId);
  return NextResponse.json(result, { status: 201 });
});

export const GET = withTenantContext(async (_req: NextRequest, { tenantId }) => {
  const { db } = createDbWithTenant(tenantId);
  const rows = await db.select().from(events).where(eq(events.tenantId, tenantId));
  return NextResponse.json(rows);
});
