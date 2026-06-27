import { describe, expect, it, vi, beforeAll, beforeEach, afterAll } from 'vitest';
import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { memberships, profiles, tenants } from '@movent/database/schema';
import { bindTestServiceDb, unbindTestServiceDb } from '@movent/infrastructure/postgres';
import { createIamTestDb } from '../../../../../packages/movent-infrastructure/src/postgres/test/create-test-db.js';
import { routeRequestFromMiddleware } from '../../../test/helpers/middleware-route-bridge';

const getSessionImpl = vi.fn();

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(
    (
      _url: string,
      _key: string,
      options: {
        cookies: {
          setAll: (cookies: Array<{ name: string; value: string }>) => void;
        };
      },
    ) => ({
      auth: {
        getSession: async () => {
          options.cookies.setAll([{ name: 'sb-refresh-token', value: 'refreshed-session' }]);
          return getSessionImpl();
        },
      },
    }),
  ),
}));

function makeJwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${header}.${body}.sig`;
}

describe('middleware → bridge → real POST (shipped createServiceDb)', () => {
  vi.setConfig({ hookTimeout: 60_000 });
  let db: Awaited<ReturnType<typeof createIamTestDb>>['db'];
  let middleware: (req: NextRequest) => Promise<Response>;
  let POST: (req: NextRequest, ctx: { params: Promise<Record<string, string>> }) => Promise<Response>;

  beforeAll(async () => {
    process.env['TENANT_COOKIE_SECRET'] = 'test-secret';
    const testDb = await createIamTestDb();
    db = testDb.db;
    bindTestServiceDb(db);
    ({ middleware } = await import('@/middleware'));
    ({ POST } = await import('@/app/api/v1/iam/tenants/route'));
  });

  beforeEach(() => {
    process.env['NEXT_PUBLIC_SUPABASE_URL'] = 'http://test.supabase.co';
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] = 'test-anon-key';
    getSessionImpl.mockReset();
  });

  afterAll(() => {
    unbindTestServiceDb();
  });

  it('runs middleware then bridges headers into the real route handler without manual stitching', async () => {
    const actorId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
    const token = makeJwt({ sub: actorId });
    getSessionImpl.mockResolvedValue({
      data: { session: { access_token: token, user: { id: actorId } } },
    });

    const requestBody = {
      name: 'Pipeline Org',
      slug: 'pipeline-org',
      ownerEmail: 'pipe@org.test',
      ownerDisplayName: 'Pipeline Owner',
    };

    const incoming = new NextRequest('http://localhost/api/v1/iam/tenants', { method: 'POST' });
    const middlewareRes = await middleware(incoming);
    expect(middlewareRes.status).toBe(200);

    const routeReq = routeRequestFromMiddleware(incoming, middlewareRes, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    expect(routeReq.headers.get('x-actor-id')).toBe(actorId);
    expect(routeReq.headers.has('x-tenant-id')).toBe(false);

    const provisionRes = await POST(routeReq, { params: Promise.resolve({}) });
    const provisionBody = (await provisionRes.json()) as { tenantId: string; slug: string };
    const setCookie = provisionRes.headers.get('set-cookie') ?? '';

    expect(provisionRes.status).toBe(201);
    expect(setCookie).toContain('movent_tenant_id');
    expect(setCookie.toLowerCase()).toContain('httponly');
    expect(provisionBody.slug).toBe('pipeline-org');

    const tenant = await db.query.tenants.findFirst({ where: eq(tenants.slug, 'pipeline-org') });
    const profile = await db.query.profiles.findFirst({ where: eq(profiles.id, actorId) });
    const membership = await db
      .select()
      .from(memberships)
      .where(eq(memberships.profileId, actorId));

    expect(tenant?.name).toBe('Pipeline Org');
    expect(profile?.displayName).toBe('Pipeline Owner');
    expect(membership[0]?.role).toBe('owner');
  });
});