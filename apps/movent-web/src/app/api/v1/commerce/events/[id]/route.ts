import { NextRequest, NextResponse } from 'next/server';
import { withTenantContext } from '@/lib/with-tenant-context';
import { events } from '@movent/database/schema';
import { createDbWithTenant } from '@movent/infrastructure/postgres';
import { eq, and } from 'drizzle-orm';

export const GET = withTenantContext(async (_req: NextRequest, { tenantId }, params) => {
  const { id } = params;
  const { db } = createDbWithTenant(tenantId);

  const [event] = await db
    .select()
    .from(events)
    .where(and(eq(events.id, id), eq(events.tenantId, tenantId)))
    .limit(1);

  if (!event) {
    return NextResponse.json({ error: 'Event tidak ditemukan' }, { status: 404 });
  }

  return NextResponse.json(event);
});
