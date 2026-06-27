import { NextRequest, NextResponse } from 'next/server';
import { withTenantContext } from '@/lib/with-tenant-context';
import { IssueAccessPassSchema } from '@movent/contracts';
import { IssueAccessPassHandler } from '@movent/core/commerce';
import {
  DrizzleAccessPassRepository,
  DrizzlePassTierRepository,
} from '@movent/infrastructure/postgres/commerce';
import { OutboxEventBus, createDbWithTenant } from '@movent/infrastructure/postgres';
import { CapacityExceededError } from '@movent/core';
import { sql, eq, and } from 'drizzle-orm';
import { accessPasses } from '@movent/database/schema';

export const POST = withTenantContext(
  async (req: NextRequest, { tenantId, actorId, actorType }) => {
    const body = IssueAccessPassSchema.safeParse(await req.json());
    if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 422 });

    const { db } = createDbWithTenant(tenantId);

    // L-06: AI WRITE→PENDING
    if (actorType === 'AI_AGENT') {
      const result = await db.execute(sql`
      CALL enforce_ai_write_interception(
        'IssueAccessPass', ${actorId}::uuid, 'AI_AGENT',
        ${body.data.passTierId}::uuid, 'AccessPass', ${tenantId}::uuid
      )
    `);
      return NextResponse.json(
        { approvalId: (result as unknown as { p_approval_id: string }[])[0]?.p_approval_id },
        { status: 202 },
      );
    }

    const handler = new IssueAccessPassHandler(
      new DrizzleAccessPassRepository(db),
      new DrizzlePassTierRepository(db),
      new OutboxEventBus(db),
    );

    try {
      const result = await handler.handle(body.data, tenantId, actorId);
      return NextResponse.json(result, { status: 201 });
    } catch (err) {
      if (err instanceof CapacityExceededError) {
        return NextResponse.json({ error: err.message, code: err.code }, { status: 409 });
      }
      throw err;
    }
  },
);

export const GET = withTenantContext(async (req: NextRequest, { tenantId }) => {
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get('eventId');
  const { db } = createDbWithTenant(tenantId);
  let query = db.select().from(accessPasses).where(eq(accessPasses.tenantId, tenantId));
  if (eventId) {
    query = db
      .select()
      .from(accessPasses)
      .where(and(eq(accessPasses.tenantId, tenantId), eq(accessPasses.eventId, eventId)));
  }
  const rows = await query;
  return NextResponse.json(rows);
});
