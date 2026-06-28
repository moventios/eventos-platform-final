import { NextRequest, NextResponse } from 'next/server';
import { withTenantContext } from '@/lib/with-tenant-context';
import { createDbWithTenant } from '@movent/infrastructure/postgres';
import { pointsAccounts, pointsTransactions } from '@movent/database/schema/points';
import { profiles } from '@movent/database/schema/iam';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';

/**
 * GET /api/v1/commerce/points/admin
 * Admin API to get all point accounts with profile details.
 */
export const GET = withTenantContext(async (_req: NextRequest, { tenantId }) => {
  const { db } = createDbWithTenant(tenantId);

  const allAccounts = await db
    .select({
      id: pointsAccounts.id,
      balance: pointsAccounts.balance,
      profileId: pointsAccounts.profileId,
      profileEmail: profiles.email,
      profileName: profiles.displayName,
    })
    .from(pointsAccounts)
    .innerJoin(profiles, eq(pointsAccounts.profileId, profiles.id))
    .where(eq(pointsAccounts.tenantId, tenantId));

  return NextResponse.json(allAccounts);
});

const AdjustPointsSchema = z.object({
  profileId: z.string().uuid(),
  amount: z.number().int().min(1),
  type: z.enum(['grant', 'adjust', 'spend']),
  description: z.string().optional(),
});

/**
 * POST /api/v1/commerce/points/admin
 * Admin API to grant or adjust points for a user.
 */
export const POST = withTenantContext(async (req: NextRequest, { tenantId, actorId }) => {
  const body = AdjustPointsSchema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 422 });

  const { profileId, amount, type, description } = body.data;
  const { db } = createDbWithTenant(tenantId);

  return await db.transaction(async (tx) => {
    // Ensure account exists
    let account = await tx.query.pointsAccounts.findFirst({
      where: eq(pointsAccounts.profileId, profileId),
    });

    if (!account) {
      const [newAccount] = await tx.insert(pointsAccounts).values({
        tenantId,
        profileId,
        balance: 0,
      }).returning();
      account = newAccount;
    }

    // Determine final balance change (negative for spend)
    const changeAmount = type === 'spend' ? -amount : amount;

    // Update balance
    const [updatedAccount] = await tx
      .update(pointsAccounts)
      .set({ balance: account.balance + changeAmount })
      .where(eq(pointsAccounts.id, account.id))
      .returning();

    // Log transaction
    await tx.insert(pointsTransactions).values({
      tenantId,
      profileId,
      amount: changeAmount,
      type,
      description: description || 'Admin adjustment',
      metadata: { adminId: actorId }
    });

    return NextResponse.json(updatedAccount, { status: 200 });
  });
});
