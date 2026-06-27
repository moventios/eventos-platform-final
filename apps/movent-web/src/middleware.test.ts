import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { signTenantCookie } from './lib/tenant-cookie';

const getSessionImpl = vi.fn();

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(
    (_url: string, _key: string, options: { cookies: { setAll: (cookies: Array<{ name: string; value: string }>) => void } }) => ({
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

describe('middleware()', () => {
  beforeEach(() => {
    process.env['NEXT_PUBLIC_SUPABASE_URL'] = 'http://test.supabase.co';
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] = 'test-anon-key';
    process.env['TENANT_COOKIE_SECRET'] = 'test-secret';
    getSessionImpl.mockReset();
    vi.resetModules();
  });

  async function loadMiddleware() {
    return import('./middleware');
  }

  it('copies supabase refresh cookies on unauthenticated redirect to login', async () => {
    getSessionImpl.mockResolvedValue({ data: { session: null } });
    const { middleware } = await loadMiddleware();

    const req = new NextRequest('http://localhost/events');
    const res = await middleware(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/login');
    expect(res.cookies.get('sb-refresh-token')?.value).toBe('refreshed-session');
  });

  it('copies supabase refresh cookies on unauthenticated API 401', async () => {
    getSessionImpl.mockResolvedValue({ data: { session: null } });
    const { middleware } = await loadMiddleware();

    const req = new NextRequest('http://localhost/api/v1/commerce/events');
    const res = await middleware(req);

    expect(res.status).toBe(401);
    expect(res.cookies.get('sb-refresh-token')?.value).toBe('refreshed-session');
  });

  it('allows tenant POST without tenant claim and copies cookies', async () => {
    const token = makeJwt({ sub: 'actor-uuid-1' });
    getSessionImpl.mockResolvedValue({
      data: { session: { access_token: token, user: { id: 'actor-uuid-1' } } },
    });
    const { middleware } = await loadMiddleware();

    const req = new NextRequest('http://localhost/api/v1/iam/tenants', { method: 'POST' });
    const res = await middleware(req);

    expect(res.status).toBe(200);
    expect(res.cookies.get('sb-refresh-token')?.value).toBe('refreshed-session');
    expect(res.headers.get('x-middleware-request-x-actor-id')).toBe('actor-uuid-1');
    expect(res.headers.get('x-middleware-request-x-tenant-id')).toBeNull();
  });

  it('resolves tenant from signed movent_tenant_id cookie when JWT lacks claim', async () => {
    const token = makeJwt({ sub: 'actor-uuid-1' });
    getSessionImpl.mockResolvedValue({
      data: { session: { access_token: token, user: { id: 'actor-uuid-1' } } },
    });
    const signed = await signTenantCookie('tenant-from-cookie', 'actor-uuid-1');
    const { middleware } = await loadMiddleware();

    const req = new NextRequest('http://localhost/', {
      headers: { cookie: `movent_tenant_id=${signed}` },
    });
    const res = await middleware(req);

    expect(res.status).toBe(200);
    expect(res.headers.get('x-middleware-request-x-tenant-id')).toBe('tenant-from-cookie');
  });

  it('rejects unsigned tenant cookie values', async () => {
    const token = makeJwt({ sub: 'actor-uuid-1' });
    getSessionImpl.mockResolvedValue({
      data: { session: { access_token: token, user: { id: 'actor-uuid-1' } } },
    });
    const { middleware } = await loadMiddleware();

    const req = new NextRequest('http://localhost/', {
      headers: { cookie: 'movent_tenant_id=foreign-tenant-id' },
    });
    const res = await middleware(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/onboarding');
  });

  it('redirects to onboarding without tenant and copies cookies', async () => {
    const token = makeJwt({ sub: 'actor-uuid-1' });
    getSessionImpl.mockResolvedValue({
      data: { session: { access_token: token, user: { id: 'actor-uuid-1' } } },
    });
    const { middleware } = await loadMiddleware();

    const req = new NextRequest('http://localhost/events');
    const res = await middleware(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/onboarding');
    expect(res.cookies.get('sb-refresh-token')?.value).toBe('refreshed-session');
  });

  it('does not throw on malformed JWT and falls back to signed cookie tenant', async () => {
    getSessionImpl.mockResolvedValue({
      data: { session: { access_token: 'not.valid.jwt', user: { id: 'actor-uuid-1' } } },
    });
    const signed = await signTenantCookie('cookie-tenant', 'actor-uuid-1');
    const { middleware } = await loadMiddleware();

    const req = new NextRequest('http://localhost/', {
      headers: { cookie: `movent_tenant_id=${signed}` },
    });
    const res = await middleware(req);

    expect(res.status).toBe(200);
    expect(res.headers.get('x-middleware-request-x-tenant-id')).toBe('cookie-tenant');
  });
});