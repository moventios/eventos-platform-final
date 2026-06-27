import { NextRequest, NextResponse } from 'next/server';
import { withTenantContext } from '@/lib/with-tenant-context';
import { CreateTicketTypeSchema } from '@movent/contracts';
import { CreateTicketTypeHandler } from '@movent/core/commerce';
import { DrizzlePassTierRepository } from '@movent/infrastructure/postgres/commerce';
import { OutboxEventBus, createDbWithTenant } from '@movent/infrastructure/postgres';
import { passTiers } from '@movent/database/schema';
import { eq, and } from 'drizzle-orm';

export const POST = withTenantContext(async (req: NextRequest, { tenantId, actorId }) => {
  const rawJson = await req.json();
  const body = CreateTicketTypeSchema.safeParse(rawJson);
  if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 422 });

  const { db } = createDbWithTenant(tenantId);
  const handler = new CreateTicketTypeHandler(
    new DrizzlePassTierRepository(db),
    new OutboxEventBus(db),
  );

  const result = await handler.handle(body.data, tenantId, actorId);

  // Update point cost if provided
  const pointCost = Number(rawJson.pointCost || 0);
  if (pointCost > 0) {
    await db
      .update(passTiers)
      .set({ pointCost })
      .where(and(eq(passTiers.id, result.passTierId), eq(passTiers.tenantId, tenantId)));
  }

  return NextResponse.json({ ...result, pointCost }, { status: 201 });
});

export const GET = withTenantContext(async (req: NextRequest, { tenantId }) => {
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get('eventId');
  const { db } = createDbWithTenant(tenantId);
  let q = db.select().from(passTiers).where(eq(passTiers.tenantId, tenantId));
  if (eventId)
    q = db
      .select()
      .from(passTiers)
      .where(and(eq(passTiers.tenantId, tenantId), eq(passTiers.eventId, eventId)));
  const rows = await q;
  return NextResponse.json(rows);
});
