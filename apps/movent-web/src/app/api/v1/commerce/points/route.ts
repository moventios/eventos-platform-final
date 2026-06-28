import { NextRequest, NextResponse } from 'next/server';
import { withTenantContext } from '@/lib/with-tenant-context';
import { createDbWithTenant } from '@movent/infrastructure/postgres';
import { pointsAccounts, pointsTransactions } from '@movent/database/schema/points';
import { profiles } from '@movent/database/schema/iam';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';

/**
 * GET /api/v1/commerce/points
 * Get current user's point balance. If it doesn't exist, create it with 100 initial points.
 */
export const GET = withTenantContext(async (_req: NextRequest, { tenantId, actorId }) => {
  const { db } = createDbWithTenant(tenantId);

  // Find existing account
  let account = await db.query.pointsAccounts.findFirst({
    where: eq(pointsAccounts.profileId, actorId),
  });

  if (!account) {
    // Check if profile exists first
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.id, actorId),
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Initialize with 100 points
    const [newAccount] = await db.insert(pointsAccounts)
      .values({
        tenantId,
        profileId: actorId,
        balance: 100,
      })
      .returning();
    
    account = newAccount;

    // Log the initial grant transaction
    await db.insert(pointsTransactions).values({
      tenantId,
      profileId: actorId,
      amount: 100,
      type: 'grant',
      description: 'Welcome Bonus',
      metadata: { source: 'system_init' }
    });
  }

  // Get recent transactions
  const transactions = await db.select()
    .from(pointsTransactions)
    .where(eq(pointsTransactions.profileId, actorId))
    .orderBy(desc(pointsTransactions.createdAt))
    .limit(10);

  return NextResponse.json({
    account,
    ownBalance: account.balance,
    transactions,
  });
});
