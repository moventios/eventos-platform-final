import { NextRequest, NextResponse } from 'next/server';
import { withTenantContext } from '@/lib/with-tenant-context';
import { createDbWithTenant } from '@movent/infrastructure/postgres';
import { pointsAccounts, pointsTransactions, profiles, memberships } from '@movent/database/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

export const GET = withTenantContext(async (req: NextRequest, { tenantId, actorId }) => {
  const { db } = createDbWithTenant(tenantId);

  // Check if admin
  const userMembership = await db.query.memberships.findFirst({
    where: and(eq(memberships.tenantId, tenantId), eq(memberships.profileId, actorId)),
  });
  
  const userProfile = await db.query.profiles.findFirst({
    where: and(eq(profiles.tenantId, tenantId), eq(profiles.id, actorId)),
  });

  const isAdmin =
    userMembership?.role === 'admin' ||
    userMembership?.role === 'owner' ||
    userProfile?.email === 'admin@moventios.co';

  if (isAdmin) {
    // Admin gets all accounts
    const accounts = await db
      .select({
        id: pointsAccounts.id,
        profileId: pointsAccounts.profileId,
        balance: pointsAccounts.balance,
        email: profiles.email,
        displayName: profiles.displayName,
      })
      .from(pointsAccounts)
      .innerJoin(profiles, eq(pointsAccounts.profileId, profiles.id))
      .where(eq(pointsAccounts.tenantId, tenantId));

    // Admin gets all transactions
    const txs = await db
      .select({
        id: pointsTransactions.id,
        profileId: pointsTransactions.profileId,
        amount: pointsTransactions.amount,
        type: pointsTransactions.type,
        description: pointsTransactions.description,
        createdAt: pointsTransactions.createdAt,
        email: profiles.email,
        displayName: profiles.displayName,
      })
      .from(pointsTransactions)
      .innerJoin(profiles, eq(pointsTransactions.profileId, profiles.id))
      .where(eq(pointsTransactions.tenantId, tenantId))
      .orderBy(desc(pointsTransactions.createdAt));

    let ownAccount = await db.query.pointsAccounts.findFirst({
      where: and(eq(pointsAccounts.tenantId, tenantId), eq(pointsAccounts.profileId, actorId)),
    });

    if (!ownAccount) {
      await db.insert(pointsAccounts).values({
        tenantId,
        profileId: actorId,
        balance: 1000,
      }).onConflictDoNothing();
      ownAccount = await db.query.pointsAccounts.findFirst({
        where: and(eq(pointsAccounts.tenantId, tenantId), eq(pointsAccounts.profileId, actorId)),
      });
    }

    return NextResponse.json({
      isAdmin: true,
      ownBalance: ownAccount?.balance ?? 1000,
      accounts,
      transactions: txs,
    });
  } else {
    // Normal user gets their own
    let account = await db.query.pointsAccounts.findFirst({
      where: and(eq(pointsAccounts.tenantId, tenantId), eq(pointsAccounts.profileId, actorId)),
    });

    if (!account) {
      // Auto-provision if missing
      await db.insert(pointsAccounts).values({
        tenantId,
        profileId: actorId,
        balance: 1000,
      }).onConflictDoNothing();

      await db.insert(pointsTransactions).values({
        tenantId,
        profileId: actorId,
        amount: 1000,
        type: 'grant',
        description: 'Saldo awal selamat datang (1.000 Poin)',
      });

      account = await db.query.pointsAccounts.findFirst({
        where: and(eq(pointsAccounts.tenantId, tenantId), eq(pointsAccounts.profileId, actorId)),
      });
    }

    const txs = await db
      .select({
        id: pointsTransactions.id,
        profileId: pointsTransactions.profileId,
        amount: pointsTransactions.amount,
        type: pointsTransactions.type,
        description: pointsTransactions.description,
        createdAt: pointsTransactions.createdAt,
      })
      .from(pointsTransactions)
      .where(and(eq(pointsTransactions.tenantId, tenantId), eq(pointsTransactions.profileId, actorId)))
      .orderBy(desc(pointsTransactions.createdAt));

    return NextResponse.json({
      isAdmin: false,
      account: {
        balance: account?.balance ?? 1000,
        email: userProfile?.email,
        displayName: userProfile?.displayName,
      },
      transactions: txs,
    });
  }
});

export const POST = withTenantContext(async (req: NextRequest, { tenantId, actorId }) => {
  const { db } = createDbWithTenant(tenantId);

  // Check if admin
  const userMembership = await db.query.memberships.findFirst({
    where: and(eq(memberships.tenantId, tenantId), eq(memberships.profileId, actorId)),
  });

  const userProfile = await db.query.profiles.findFirst({
    where: and(eq(profiles.tenantId, tenantId), eq(profiles.id, actorId)),
  });

  const isAdmin =
    userMembership?.role === 'admin' ||
    userMembership?.role === 'owner' ||
    userProfile?.email === 'admin@moventios.co';

  if (!isAdmin) {
    return NextResponse.json({ error: 'Akses ditolak: Hanya Super Admin yang dapat mengelola poin.' }, { status: 403 });
  }

  const body = await req.json();
  const { profileId, amount, type, description } = body;

  if (!profileId || amount === undefined || !type) {
    return NextResponse.json({ error: 'Parameter tidak lengkap.' }, { status: 400 });
  }

  try {
    await db.transaction(async (tx) => {
      // Find or create account
      let account = await tx.query.pointsAccounts.findFirst({
        where: and(eq(pointsAccounts.tenantId, tenantId), eq(pointsAccounts.profileId, profileId)),
      });

      if (!account) {
        await tx.insert(pointsAccounts).values({
          tenantId,
          profileId,
          balance: 1000,
        });
        
        await tx.insert(pointsTransactions).values({
          tenantId,
          profileId,
          amount: 1000,
          type: 'grant',
          description: 'Saldo awal selamat datang (1.000 Poin)',
        });

        account = await tx.query.pointsAccounts.findFirst({
          where: and(eq(pointsAccounts.tenantId, tenantId), eq(pointsAccounts.profileId, profileId)),
        });
      }

      const currentBalance = account?.balance ?? 1000;
      const newBalance = currentBalance + Number(amount);

      if (newBalance < 0) {
        throw new Error('Saldo poin tidak boleh negatif.');
      }

      await tx
        .update(pointsAccounts)
        .set({ balance: newBalance, updatedAt: new Date() })
        .where(and(eq(pointsAccounts.tenantId, tenantId), eq(pointsAccounts.profileId, profileId)));

      await tx.insert(pointsTransactions).values({
        tenantId,
        profileId,
        amount: Number(amount),
        type,
        description: description || (Number(amount) >= 0 ? 'Penambahan poin oleh Admin' : 'Pengurangan poin oleh Admin'),
      });
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal mengubah saldo poin.' }, { status: 400 });
  }
});
