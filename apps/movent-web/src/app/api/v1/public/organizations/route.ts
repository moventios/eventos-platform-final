import { NextRequest, NextResponse } from 'next/server';
import { withTenantContext } from '@/lib/with-tenant-context';
import { organizations } from '@movent/database/schema';
import { createDbWithTenant } from '@movent/infrastructure/postgres';
import { eq } from 'drizzle-orm';

/**
 * Public endpoint — returns all organizations visible in the public ecosystem.
 * No authentication required. Middleware injects the public discovery tenant context.
 */
export const GET = withTenantContext(async (_req: NextRequest, { tenantId }) => {
  const { db } = createDbWithTenant(tenantId);

  const allOrgs = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      description: organizations.description,
      metadata: organizations.metadata,
      createdAt: organizations.createdAt,
    })
    .from(organizations)
    .where(eq(organizations.tenantId, tenantId));

  return NextResponse.json(allOrgs);
});
