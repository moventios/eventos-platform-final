import { NextRequest, NextResponse } from 'next/server';
import { withTenantContext } from '@/lib/with-tenant-context';
import { CheckInAccessPassSchema } from '@eventos/contracts';
import { CheckInAccessPassHandler } from '@eventos/core/commerce';
import { DrizzleAccessPassRepository } from '@eventos/infrastructure/postgres/commerce';
import { OutboxEventBus, createDbWithTenant } from '@eventos/infrastructure/postgres';

export const PATCH = withTenantContext(async (req: NextRequest, { tenantId, actorId }) => {
  const body = CheckInAccessPassSchema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 422 });

  const { db } = createDbWithTenant(tenantId);
  const handler = new CheckInAccessPassHandler(
    new DrizzleAccessPassRepository(db),
    new OutboxEventBus(db),
  );

  try {
    const result = await handler.handle(body.data, tenantId, actorId);
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Check-in failed' }, { status: 400 });
  }
});
