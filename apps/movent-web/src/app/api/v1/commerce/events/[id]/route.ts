import { NextRequest, NextResponse } from 'next/server';
import { withTenantContext } from '@/lib/with-tenant-context';
import { events } from '@movent/database/schema';
import { createDbWithTenant } from '@movent/infrastructure/postgres';
import { eq, and, or, sql } from 'drizzle-orm';

/**
 * GET /api/v1/commerce/events/[slug]
 * Resolves by UUID id OR by metadata->>'slug' for SEO-friendly URLs.
 * e.g. /api/v1/commerce/events/pameran-seni-rupa-lokal-2025
 *      /api/v1/commerce/events/00000000-0000-0000-0000-0000000000d1
 */
export const GET = withTenantContext(async (_req: NextRequest, { tenantId }, params) => {
  const { slug } = params;
  const { db } = createDbWithTenant(tenantId);

  // UUID pattern check
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug || '');

  let event;

  if (isUuid) {
    // Lookup by UUID id
    [event] = await db
      .select()
      .from(events)
      .where(and(eq(events.id, slug as string), eq(events.tenantId, tenantId)))
      .limit(1);
  } else {
    // Lookup by metadata.slug (SEO-friendly slug)
    [event] = await db
      .select()
      .from(events)
      .where(
        and(
          eq(events.tenantId, tenantId),
          sql`${events.metadata}->>'slug' = ${slug}`,
        ),
      )
      .limit(1);
  }

  if (!event) {
    return NextResponse.json({ error: 'Event tidak ditemukan' }, { status: 404 });
  }

  // Always include canonical slug in response
  const canonical = (event.metadata as Record<string, unknown>)?.slug ?? event.id;
  return NextResponse.json({ ...event, _slug: canonical });
});
