import { NextRequest, NextResponse } from 'next/server';
import { withTenantContext } from '@/lib/with-tenant-context';
import { RegisterFacilitySchema } from '@movent/contracts';
import { RegisterFacilityHandler } from '@movent/core/spatial';
import { DrizzleFacilityRepository } from '@movent/infrastructure/postgres/spatial';
import { OutboxEventBus, createDbWithTenant } from '@movent/infrastructure/postgres';
import { facilities } from '@movent/database/schema';
import { eq } from 'drizzle-orm';

export const POST = withTenantContext(async (req: NextRequest, { tenantId, actorId }) => {
  const body = RegisterFacilitySchema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 422 });

  const { db } = createDbWithTenant(tenantId);
  const handler = new RegisterFacilityHandler(
    new DrizzleFacilityRepository(db),
    new OutboxEventBus(db),
  );

  const result = await handler.handle(body.data, tenantId, actorId);
  return NextResponse.json(result, { status: 201 });
});

export const GET = withTenantContext(async (_req: NextRequest, { tenantId }) => {
  const { db } = createDbWithTenant(tenantId);
  const rows = await db.select().from(facilities).where(eq(facilities.tenantId, tenantId));
  return NextResponse.json(rows);
});
