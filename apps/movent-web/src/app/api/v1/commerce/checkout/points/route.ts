import { NextRequest, NextResponse } from 'next/server';
import { withTenantContext } from '@/lib/with-tenant-context';
import { createDbWithTenant } from '@movent/infrastructure/postgres';
import { pointsAccounts, pointsTransactions } from '@movent/database/schema/points';
import { passTiers, accessPasses } from '@movent/database/schema/commerce';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const CheckoutSchema = z.object({
  passTierId: z.string().uuid(),
});

/**
 * POST /api/v1/commerce/checkout/points
 * Process checkout for an event pass using Points (Coins)
 */
export const POST = withTenantContext(async (req: NextRequest, { tenantId, actorId }) => {
  const body = CheckoutSchema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 422 });

  const { passTierId } = body.data;
  const { db } = createDbWithTenant(tenantId);

  return await db.transaction(async (tx) => {
    // 1. Get the Pass Tier
    const tier = await tx.query.passTiers.findFirst({
      where: and(eq(passTiers.id, passTierId), eq(passTiers.tenantId, tenantId)),
    });

    if (!tier) {
      return NextResponse.json({ error: 'Tiket tidak ditemukan.' }, { status: 404 });
    }

    if (tier.quantityIssued >= tier.capacity) {
      return NextResponse.json({ error: 'Tiket sudah habis (Sold out).' }, { status: 400 });
    }

    // 2. Check if user already has a pass for this tier (limit 1)
    const existingPass = await tx.query.accessPasses.findFirst({
      where: and(
        eq(accessPasses.customerId, actorId),
        eq(accessPasses.passTierId, passTierId),
        eq(accessPasses.tenantId, tenantId)
      ),
    });

    if (existingPass) {
      return NextResponse.json({ error: 'Anda sudah memiliki tiket ini.' }, { status: 400 });
    }

    // 3. Check Points Account
    let account = await tx.query.pointsAccounts.findFirst({
      where: eq(pointsAccounts.profileId, actorId),
    });

    if (!account) {
      // Auto-initialize with 0 if they somehow bypassed the GET endpoint
      const [newAccount] = await tx.insert(pointsAccounts).values({
        tenantId,
        profileId: actorId,
        balance: 0,
      }).returning();
      
      if (!newAccount) {
        return NextResponse.json({ error: 'Gagal membuat dompet koin.' }, { status: 500 });
      }
      account = newAccount;
    }

    if (account.balance < tier.pointCost) {
      return NextResponse.json({ error: 'Saldo koin tidak mencukupi.' }, { status: 400 });
    }

    // 4. Deduct Points if cost > 0
    if (tier.pointCost > 0) {
      await tx.update(pointsAccounts)
        .set({ balance: account.balance - tier.pointCost })
        .where(eq(pointsAccounts.id, account.id));

      await tx.insert(pointsTransactions).values({
        tenantId,
        profileId: actorId,
        amount: -tier.pointCost,
        type: 'spend',
        description: `Pembelian tiket: ${tier.name}`,
        metadata: { passTierId, eventId: tier.eventId }
      });
    }

    // 5. Issue the Access Pass
    const idempotencyKey = `checkout_${actorId}_${passTierId}_${Date.now()}`;
    const [pass] = await tx.insert(accessPasses).values({
      tenantId,
      passTierId,
      eventId: tier.eventId,
      customerId: actorId,
      status: 'issued',
      idempotencyKey,
      actorType: 'USER',
      issuedAt: new Date(),
    }).returning();

    // 6. Update Pass Tier Quantity
    await tx.update(passTiers)
      .set({ quantityIssued: tier.quantityIssued + 1 })
      .where(eq(passTiers.id, tier.id));

    return NextResponse.json({ success: true, pass });
  });
});
