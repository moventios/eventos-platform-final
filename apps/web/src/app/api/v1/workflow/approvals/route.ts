import { NextRequest, NextResponse } from 'next/server';
import { withTenantContext } from '@/lib/with-tenant-context';
import { createDbWithTenant } from '@eventos/infrastructure/postgres';
import { approvals } from '@eventos/database/schema';
import { eq, and } from 'drizzle-orm';

export const GET = withTenantContext(async (req: NextRequest, { tenantId }) => {
  const { db } = createDbWithTenant(tenantId);
  const statusParam = req.nextUrl.searchParams.get('status') || 'pending';
  
  const conditions = [eq(approvals.tenantId, tenantId)];
  if (statusParam !== 'all') {
    conditions.push(eq(approvals.status, statusParam as any));
  }

  const rows = await db.select().from(approvals)
    .where(and(...conditions));
  return NextResponse.json(rows);
});
