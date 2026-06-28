import { NextRequest, NextResponse } from 'next/server';
import { withTenantContext } from '@/lib/with-tenant-context';
import { facilities, rooms } from '@movent/database/schema';
import { createDbWithTenant } from '@movent/infrastructure/postgres';
import { eq, and, sql } from 'drizzle-orm';

/**
 * GET /api/v1/spatial/facilities/[slug]
 * Resolves by UUID id OR metadata->>'slug' for SEO-friendly URLs.
 * Returns facility with embedded rooms.
 */
export const GET = withTenantContext(async (_req: NextRequest, { tenantId }, params) => {
  const { id: slug } = params;
  const { db } = createDbWithTenant(tenantId);

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

  let facility;

  if (isUuid) {
    [facility] = await db
      .select()
      .from(facilities)
      .where(and(eq(facilities.id, slug), eq(facilities.tenantId, tenantId)))
      .limit(1);
  } else {
    [facility] = await db
      .select()
      .from(facilities)
      .where(
        and(
          eq(facilities.tenantId, tenantId),
          sql`${facilities.metadata}->>'slug' = ${slug}`,
        ),
      )
      .limit(1);
  }

  if (!facility) {
    return NextResponse.json({ error: 'Venue tidak ditemukan' }, { status: 404 });
  }

  const facilityRooms = await db
    .select()
    .from(rooms)
    .where(and(eq(rooms.facilityId, facility.id), eq(rooms.tenantId, tenantId)));

  const canonical = (facility.metadata as Record<string, unknown>)?.slug ?? facility.id;
  return NextResponse.json({ ...facility, rooms: facilityRooms, _slug: canonical });
});
