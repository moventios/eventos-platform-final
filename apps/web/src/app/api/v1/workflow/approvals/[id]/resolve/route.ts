import { NextRequest, NextResponse } from 'next/server';
import { withTenantContext } from '@/lib/with-tenant-context';
import { ResolveApprovalSchema } from '@eventos/contracts';
import { ResolveApprovalHandler } from '@eventos/core/workflow';
import { DrizzleApprovalRepository } from '@eventos/infrastructure/postgres/workflow';
import { OutboxEventBus, createDbWithTenant } from '@eventos/infrastructure/postgres';

export const POST = withTenantContext(async (req: NextRequest, { tenantId, actorId }) => {
  const body = ResolveApprovalSchema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 422 });

  const { db } = createDbWithTenant(tenantId);
  const handler = new ResolveApprovalHandler(
    new DrizzleApprovalRepository(db),
    new OutboxEventBus(db),
  );

  const result = await handler.handle(body.data, tenantId, actorId);
  return NextResponse.json(result);
});
