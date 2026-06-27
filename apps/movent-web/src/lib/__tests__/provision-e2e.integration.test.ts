import { describe, expect, it, beforeAll, afterAll, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { memberships, profiles, tenants } from '@movent/database/schema';
import { bindTestServiceDb, unbindTestServiceDb } from '@movent/infrastructure/postgres';
import { createIamTestDb } from '../../../../../packages/movent-infrastructure/src/postgres/test/create-test-db.js';

describe('provision e2e (real route + shipped createServiceDb)', () => {
  vi.setConfig({ hookTimeout: 60_000 });
  let POST: (
    req: NextRequest,
    ctx: { params: Promise<Record<string, string>> },
  ) => Promise<Response>;
  let db: Awaited<ReturnType<typeof createIamTestDb>>['db'];
  const actorId = '33333333-3333-3333-3333-333333333333';

  beforeAll(async () => {
    process.env['TENANT_COOKIE_SECRET'] = 'test-secret';
    const testDb = await createIamTestDb();
    db = testDb.db;
    bindTestServiceDb(db);
    ({ POST } = await import('@/app/api/v1/iam/tenants/route'));
  });

  afterAll(() => {
    unbindTestServiceDb();
  });

  it('POST /api/v1/iam/tenants returns 201 and persists profile+membership', async () => {
    const requestBody = {
      name: 'E2E Org',
      slug: 'e2e-org',
      ownerEmail: 'e2e@org.test',
      ownerDisplayName: 'E2E Owner',
    };

    const req = new NextRequest('http://localhost/api/v1/iam/tenants', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-actor-id': actorId,
      },
      body: JSON.stringify(requestBody),
    });

    const res = await POST(req, { params: Promise.resolve({}) });
    const responseBody = await res.json();
    const setCookie = res.headers.get('set-cookie') ?? '';

    expect(res.status).toBe(201);
    expect(responseBody).toMatchObject({ slug: 'e2e-org' });
    expect(setCookie).toContain('movent_tenant_id');
    expect(setCookie).toContain(responseBody.tenantId);
    expect(setCookie.toLowerCase()).toContain('httponly');

    const profile = await db.query.profiles.findFirst({ where: eq(profiles.id, actorId) });
    const membership = await db
      .select()
      .from(memberships)
      .where(eq(memberships.profileId, actorId));
    const tenant = await db.query.tenants.findFirst({ where: eq(tenants.slug, 'e2e-org') });

    expect(tenant?.name).toBe('E2E Org');
    expect(profile?.displayName).toBe('E2E Owner');
    expect(membership[0]?.role).toBe('owner');
  });

  it('returns 422 for invalid payload', async () => {
    const req = new NextRequest('http://localhost/api/v1/iam/tenants', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-actor-id': actorId,
      },
      body: JSON.stringify({ name: 'x', slug: 'INVALID', ownerEmail: 'not-an-email' }),
    });

    const res = await POST(req, { params: Promise.resolve({}) });
    const responseBody = await res.json();

    expect(res.status).toBe(422);
    expect(responseBody).toHaveProperty('error');
  });

  it('returns 409 when slug is already taken', async () => {
    const seedActorId = '55555555-5555-5555-5555-555555555555';
    const duplicateSlug = 'dup-slug-409';

    const seedReq = new NextRequest('http://localhost/api/v1/iam/tenants', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-actor-id': seedActorId,
      },
      body: JSON.stringify({
        name: 'Seed Org',
        slug: duplicateSlug,
        ownerEmail: 'seed@org.test',
        ownerDisplayName: 'Seed Owner',
      }),
    });
    const seedRes = await POST(seedReq, { params: Promise.resolve({}) });
    expect(seedRes.status).toBe(201);

    const requestBody = {
      name: 'Duplicate Org',
      slug: duplicateSlug,
      ownerEmail: 'dup@org.test',
      ownerDisplayName: 'Dup Owner',
    };

    const req = new NextRequest('http://localhost/api/v1/iam/tenants', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-actor-id': '44444444-4444-4444-4444-444444444444',
      },
      body: JSON.stringify(requestBody),
    });

    const res = await POST(req, { params: Promise.resolve({}) });
    const responseBody = await res.json();

    expect(res.status).toBe(409);
    expect(responseBody.error).toContain('already taken');
  });
});
