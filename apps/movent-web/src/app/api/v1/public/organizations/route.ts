import { NextRequest, NextResponse } from 'next/server';
import { withTenantContext } from '@/lib/with-tenant-context';
import { tenants, organizations } from '@movent/database/schema';
import { createDbWithTenant } from '@movent/infrastructure/postgres';
import { eq } from 'drizzle-orm';

/**
 * Public endpoint — returns all organizations (tenants) visible in the public ecosystem.
 * Requires no authentication. The middleware injects the public discovery tenant context.
 */
export const GET = withTenantContext(async (_req: NextRequest, { tenantId }) => {
  const { db } = createDbWithTenant(tenantId);

  // Return all tenants as public organizations for the discovery directory
  const allTenants = await db
    .select({
      id: tenants.id,
      name: tenants.name,
      slug: tenants.slug,
      isActive: tenants.isActive,
      createdAt: tenants.createdAt,
    })
    .from(tenants)
    .where(eq(tenants.isActive, true));

  return NextResponse.json(allTenants);
});
