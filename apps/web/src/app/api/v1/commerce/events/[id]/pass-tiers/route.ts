import { NextRequest, NextResponse } from 'next/server';
import { withTenantContext } from '@/lib/with-tenant-context';
import { CreateTicketTypeSchema } from '@eventos/contracts';
import { CreateTicketTypeHandler } from '@eventos/core/commerce';
import { DrizzlePassTierRepository } from '@eventos/infrastructure/postgres/commerce';
import { OutboxEventBus, createDbWithTenant } from '@eventos/infrastructure/postgres';
import { passTiers } from '@eventos/database/schema';
import { eq, and } from 'drizzle-orm';

export const POST = withTenantContext(async (req: NextRequest, { tenantId, actorId }) => {
  const body = CreateTicketTypeSchema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 422 });

  const { db } = createDbWithTenant(tenantId);
  const handler = new CreateTicketTypeHandler(
    new DrizzlePassTierRepository(db),
    new OutboxEventBus(db),
  );

  const result = await handler.handle(body.data, tenantId, actorId);
  return NextResponse.json(result, { status: 201 });
});

export const GET = withTenantContext(async (req: NextRequest, { tenantId }) => {
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get('eventId');
  const { db } = createDbWithTenant(tenantId);
  let q = db.select().from(passTiers).where(eq(passTiers.tenantId, tenantId));
  if (eventId) q = db.select().from(passTiers).where(and(eq(passTiers.tenantId, tenantId), eq(passTiers.eventId, eventId)));
  const rows = await q;
  return NextResponse.json(rows);
});
