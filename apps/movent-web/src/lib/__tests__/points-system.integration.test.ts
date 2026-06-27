import { describe, expect, it, beforeAll, afterAll, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { tenants, profiles, memberships, pointsAccounts, pointsTransactions } from '@movent/database/schema';
import { bindTestServiceDb, unbindTestServiceDb } from '@movent/infrastructure/postgres';
import { createIamTestDb } from '../../../../../packages/movent-infrastructure/src/postgres/test/create-test-db.js';

describe('points system integration tests', () => {
  vi.setConfig({ hookTimeout: 60_000 });
  let GET_POINTS: any;
  let POST_POINTS: any;
  let db: any;
  const tenantId = '11111111-1111-1111-1111-111111111111';
  const actorId = '33333333-3333-3333-3333-333333333333';

  beforeAll(async () => {
    const testDb = await createIamTestDb();
    db = testDb.db;
    bindTestServiceDb(db);

    // Seed tenant
    await db.insert(tenants).values({
      id: tenantId,
      name: 'Test Tenant',
      slug: 'test-tenant',
    });

    // Seed profile (trigger will automatically create points account)
    await db.insert(profiles).values({
      id: actorId,
      tenantId,
      email: 'admin@moventios.co', // Use admin email to bypass admin checks
      displayName: 'Admin User',
    });

    // Seed membership
    await db.insert(memberships).values({
      id: '22222222-2222-2222-2222-222222222222',
      tenantId,
      profileId: actorId,
      role: 'admin',
    });

    // Dynamic import to ensure test DB is bound first
    const pointsRoute = await import('@/app/api/v1/commerce/points/route');
    GET_POINTS = pointsRoute.GET;
    POST_POINTS = pointsRoute.POST;
  });

  afterAll(() => {
    unbindTestServiceDb();
  });

  it('GET /api/v1/commerce/points returns balance and transactions history', async () => {
    const req = new NextRequest('http://localhost/api/v1/commerce/points', {
      method: 'GET',
      headers: {
        'x-tenant-id': tenantId,
        'x-actor-id': actorId,
      },
    });

    const res = await GET_POINTS(req, { params: Promise.resolve({}) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.ownBalance).toBe(1000); // Admin gets ownBalance
    expect(Array.isArray(body.transactions)).toBe(true);
    expect(body.transactions.length).toBe(1);
    expect(body.transactions[0].type).toBe('grant');
  });

  it('POST /api/v1/commerce/points adjusts member points balance', async () => {
    const reqAdjust = new NextRequest('http://localhost/api/v1/commerce/points', {
      method: 'POST',
      headers: {
        'x-tenant-id': tenantId,
        'x-actor-id': actorId,
      },
      body: JSON.stringify({
        profileId: actorId,
        amount: 250,
        type: 'grant',
        description: 'Uji coba bonus integrasi',
      }),
    });

    const res = await POST_POINTS(reqAdjust, { params: Promise.resolve({}) });
    const body = await res.json();
    console.log('POST RESPONSE:', body);

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);

    // Verify transaction history in database
    const txs = await db
      .select()
      .from(pointsTransactions)
      .where(eq(pointsTransactions.profileId, actorId));
    
    // We should have 2 transactions now: 1000 welcome points + 250 grant points
    expect(txs.length).toBe(2);
    const addedTx = txs.find((t: any) => t.amount === 250);
    expect(addedTx).toBeDefined();
    expect(addedTx.type).toBe('grant');
    expect(addedTx.description).toBe('Uji coba bonus integrasi');
  });
});
