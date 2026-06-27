import { NextRequest, NextResponse } from 'next/server';
import { withTenantContext } from '@/lib/with-tenant-context';
import { createDbWithTenant } from '@movent/infrastructure/postgres';
import { approvals } from '@movent/database/schema';
import { eq, and } from 'drizzle-orm';
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('movent-api', '1.0.0');

export const GET = withTenantContext(async (req: NextRequest, { tenantId }) => {
  const span = tracer.startSpan('GET /api/v1/workflow/approvals', {
    attributes: { tenantId, status: req.nextUrl.searchParams.get('status') || 'pending' },
  });

  try {
    const { db } = createDbWithTenant(tenantId);
    const statusParam = req.nextUrl.searchParams.get('status') || 'pending';

    const conditions = [eq(approvals.tenantId, tenantId)];
    if (statusParam !== 'all') {
      conditions.push(eq(approvals.status, statusParam as any));
    }

    const rows = await db
      .select()
      .from(approvals)
      .where(and(...conditions));
    span.setAttribute('rows_count', rows.length);
    return NextResponse.json(rows);
  } finally {
    span.end();
  }
});
