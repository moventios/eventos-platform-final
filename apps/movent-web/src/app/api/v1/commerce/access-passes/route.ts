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
import { accessPasses, passTiers, pointsAccounts, pointsTransactions } from '@movent/database/schema';

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

    // Verify point cost and balance
    const tier = await db.query.passTiers.findFirst({
      where: and(eq(passTiers.id, body.data.passTierId), eq(passTiers.tenantId, tenantId)),
    });

    if (!tier) {
      return NextResponse.json({ error: 'Kategori tiket tidak ditemukan.' }, { status: 404 });
    }

    if (tier.pointCost > 0) {
      const customerId = body.data.customerId;
      let account = await db.query.pointsAccounts.findFirst({
        where: and(eq(pointsAccounts.tenantId, tenantId), eq(pointsAccounts.profileId, customerId)),
      });

      if (!account) {
        await db.insert(pointsAccounts).values({
          tenantId,
          profileId: customerId,
          balance: 1000,
        }).onConflictDoNothing();
        account = await db.query.pointsAccounts.findFirst({
          where: and(eq(pointsAccounts.tenantId, tenantId), eq(pointsAccounts.profileId, customerId)),
        });
      }

      const balance = account?.balance ?? 1000;
      if (balance < tier.pointCost) {
        return NextResponse.json(
          { error: `Saldo poin tidak mencukupi. Saldo Anda: ${balance} Poin, Biaya: ${tier.pointCost} Poin.` },
          { status: 400 }
        );
      }

      // Deduct points
      await db.transaction(async (tx) => {
        await tx
          .update(pointsAccounts)
          .set({ balance: balance - tier.pointCost, updatedAt: new Date() })
          .where(and(eq(pointsAccounts.tenantId, tenantId), eq(pointsAccounts.profileId, customerId)));

        await tx.insert(pointsTransactions).values({
          tenantId,
          profileId: customerId,
          amount: -tier.pointCost,
          type: 'spend',
          description: `Pembelian tiket "${tier.name}"`,
          metadata: { passTierId: tier.id, eventId: tier.eventId },
        });
      });
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
        // Refund points if capacity failed
        if (tier.pointCost > 0) {
          const customerId = body.data.customerId;
          const account = await db.query.pointsAccounts.findFirst({
            where: and(eq(pointsAccounts.tenantId, tenantId), eq(pointsAccounts.profileId, customerId)),
          });
          const balance = account?.balance ?? 1000;
          await db.transaction(async (tx) => {
            await tx
              .update(pointsAccounts)
              .set({ balance: balance + tier.pointCost, updatedAt: new Date() })
              .where(and(eq(pointsAccounts.tenantId, tenantId), eq(pointsAccounts.profileId, customerId)));

            await tx.insert(pointsTransactions).values({
              tenantId,
              profileId: customerId,
              amount: tier.pointCost,
              type: 'refund',
              description: `Pengembalian poin: Kuota tiket "${tier.name}" habis`,
              metadata: { passTierId: tier.id },
            });
          });
        }
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
