import { NextRequest, NextResponse } from 'next/server';
import { withTenantContext } from '@/lib/with-tenant-context';
import { facilities, rooms } from '@movent/database/schema';
import { createDbWithTenant } from '@movent/infrastructure/postgres';
import { eq, and } from 'drizzle-orm';

export const GET = withTenantContext(async (_req: NextRequest, { tenantId }, params) => {
  const { id } = params;
  const { db } = createDbWithTenant(tenantId);

  const [facility] = await db
    .select()
    .from(facilities)
    .where(and(eq(facilities.id, id), eq(facilities.tenantId, tenantId)))
    .limit(1);

  if (!facility) {
    return NextResponse.json({ error: 'Venue tidak ditemukan' }, { status: 404 });
  }

  const facilityRooms = await db
    .select()
    .from(rooms)
    .where(and(eq(rooms.facilityId, id), eq(rooms.tenantId, tenantId)));

  return NextResponse.json({ ...facility, rooms: facilityRooms });
});
