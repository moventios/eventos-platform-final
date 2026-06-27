import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const exchangeCodeForSession = vi.fn();

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: { exchangeCodeForSession },
  })),
}));

vi.mock('next/headers', () => ({
  cookies: async () => ({
    getAll: () => [],
    set: vi.fn(),
  }),
}));

describe('auth callback GET', () => {
  beforeEach(() => {
    vi.resetModules();
    exchangeCodeForSession.mockReset();
    process.env['NEXT_PUBLIC_SUPABASE_URL'] = 'http://test.supabase.co';
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] = 'test-anon-key';
  });

  it('redirects to login when exchangeCodeForSession fails', async () => {
    exchangeCodeForSession.mockResolvedValue({
      data: { session: null },
      error: { message: 'invalid code' },
    });

    const { GET } = await import('./route');
    const req = new NextRequest('http://localhost/auth/callback?code=bad-code');
    const res = await GET(req);

    expect(res.status).toBe(307);
    const location = res.headers.get('location') ?? '';
    expect(location).toContain('/login');
    expect(location).toContain('error=auth_callback_failed');
  });

  it('redirects to next on successful exchange', async () => {
    exchangeCodeForSession.mockResolvedValue({
      data: { session: { user: { id: 'actor-1' } } },
      error: null,
    });

    const { GET } = await import('./route');
    const req = new NextRequest('http://localhost/auth/callback?code=good-code&next=/events');
    const res = await GET(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost/events');
  });

  it('redirects to / when code is absent', async () => {
    const { GET } = await import('./route');
    const req = new NextRequest('http://localhost/auth/callback');
    const res = await GET(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost/');
    expect(exchangeCodeForSession).not.toHaveBeenCalled();
  });

  it('rejects open-redirect next targets', async () => {
    exchangeCodeForSession.mockResolvedValue({
      data: { session: { user: { id: 'actor-1' } } },
      error: null,
    });

    const { GET } = await import('./route');
    const req = new NextRequest('http://localhost/auth/callback?code=good&next=//evil.test');
    const res = await GET(req);

    expect(res.headers.get('location')).toBe('http://localhost/');
  });

  it('rejects absolute URL next targets', async () => {
    const { GET } = await import('./route');
    const req = new NextRequest('http://localhost/auth/callback?next=https%3A%2F%2Fevil.test');
    const res = await GET(req);

    expect(res.headers.get('location')).toBe('http://localhost/');
  });
});
