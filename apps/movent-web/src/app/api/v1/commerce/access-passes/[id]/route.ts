import { NextRequest, NextResponse } from 'next/server';
import { withTenantContext } from '@/lib/with-tenant-context';
import { createDbWithTenant } from '@movent/infrastructure/postgres';
import { accessPasses, passTiers, pointsAccounts, pointsTransactions } from '@movent/database/schema';
import { eq, and } from 'drizzle-orm';

export const DELETE = withTenantContext(async (req: NextRequest, { tenantId, actorId }, params) => {
  const { id } = params;
  if (!id) return NextResponse.json({ error: 'ID tidak valid' }, { status: 400 });
  const { db } = createDbWithTenant(tenantId);

  const pass = await db.query.accessPasses.findFirst({
    where: and(eq(accessPasses.id, id), eq(accessPasses.tenantId, tenantId)),
  });

  if (!pass) {
    return NextResponse.json({ error: 'Tiket tidak ditemukan.' }, { status: 404 });
  }

  if (pass.status === 'revoked' || pass.status === 'consumed') {
    return NextResponse.json({ error: 'Tiket sudah dibatalkan atau telah digunakan.' }, { status: 400 });
  }

  const tier = await db.query.passTiers.findFirst({
    where: and(eq(passTiers.id, pass.passTierId), eq(passTiers.tenantId, tenantId)),
  });

  try {
    await db.transaction(async (tx) => {
      // Update pass status
      await tx
        .update(accessPasses)
        .set({ status: 'revoked', updatedAt: new Date(), updatedBy: actorId })
        .where(eq(accessPasses.id, id));

      // Refund points if applicable
      if (tier && tier.pointCost > 0) {
        const account = await tx.query.pointsAccounts.findFirst({
          where: and(eq(pointsAccounts.tenantId, tenantId), eq(pointsAccounts.profileId, pass.customerId)),
        });

        const balance = account?.balance ?? 1000;
        await tx
          .update(pointsAccounts)
          .set({ balance: balance + tier.pointCost, updatedAt: new Date() })
          .where(and(eq(pointsAccounts.tenantId, tenantId), eq(pointsAccounts.profileId, pass.customerId)));

        await tx.insert(pointsTransactions).values({
          tenantId,
          profileId: pass.customerId,
          amount: tier.pointCost,
          type: 'refund',
          description: `Pengembalian poin: Pembatalan tiket "${tier.name}"`,
          metadata: { passTierId: tier.id, passId: id },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal membatalkan tiket.' }, { status: 500 });
  }
});

export const PATCH = withTenantContext(async (req: NextRequest, { tenantId, actorId }, params) => {
  const { id } = params;
  if (!id) return NextResponse.json({ error: 'ID tidak valid' }, { status: 400 });
  const { db } = createDbWithTenant(tenantId);
  const body = await req.json();
  const { status } = body;

  if (!status) {
    return NextResponse.json({ error: 'Status harus diisi.' }, { status: 400 });
  }

  const pass = await db.query.accessPasses.findFirst({
    where: and(eq(accessPasses.id, id), eq(accessPasses.tenantId, tenantId)),
  });

  if (!pass) {
    return NextResponse.json({ error: 'Tiket tidak ditemukan.' }, { status: 404 });
  }

  if (pass.status === status) {
    return NextResponse.json({ success: true });
  }

  const tier = await db.query.passTiers.findFirst({
    where: and(eq(passTiers.id, pass.passTierId), eq(passTiers.tenantId, tenantId)),
  });

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(accessPasses)
        .set({ status, updatedAt: new Date(), updatedBy: actorId })
        .where(eq(accessPasses.id, id));

      // Refund points if status changes to revoked or expired
      const isRefundable = (status === 'revoked' || status === 'expired') &&
                           (pass.status !== 'revoked' && pass.status !== 'expired');

      if (isRefundable && tier && tier.pointCost > 0) {
        const account = await tx.query.pointsAccounts.findFirst({
          where: and(eq(pointsAccounts.tenantId, tenantId), eq(pointsAccounts.profileId, pass.customerId)),
        });

        const balance = account?.balance ?? 1000;
        await tx
          .update(pointsAccounts)
          .set({ balance: balance + tier.pointCost, updatedAt: new Date() })
          .where(and(eq(pointsAccounts.tenantId, tenantId), eq(pointsAccounts.profileId, pass.customerId)));

        await tx.insert(pointsTransactions).values({
          tenantId,
          profileId: pass.customerId,
          amount: tier.pointCost,
          type: 'refund',
          description: `Pengembalian poin: Tiket "${tier.name}" ditolak/dibatalkan`,
          metadata: { passTierId: tier.id, passId: id },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal memperbarui status tiket.' }, { status: 500 });
  }
});
