import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const headersMock = vi.fn();
const cookiesMock = vi.fn();

vi.mock('next/headers', () => ({
  headers: () => headersMock(),
  cookies: () => cookiesMock(),
}));

describe('fetchWithRequestContext', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('NODE_ENV', 'development');
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(new Response('[]', { status: 200 }));
    delete process.env['NEXT_PUBLIC_APP_URL'];
    cookiesMock.mockResolvedValue({ getAll: () => [] });
    headersMock.mockResolvedValue(new Headers({ host: 'localhost:3000' }));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  async function loadServerApi() {
    return import('../server-api');
  }

  it('forwards x-e2e-actor-id for E2E capture SSR sub-fetches', async () => {
    headersMock.mockResolvedValue(
      new Headers({
        host: 'localhost:3000',
        'x-e2e-actor-id': 'e2e-actor',
        'x-tenant-id': 'tenant-1',
        'x-actor-id': 'actor-1',
      }),
    );

    const { fetchWithRequestContext } = await loadServerApi();
    await fetchWithRequestContext('/api/v1/commerce/events');

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const forwarded = init.headers as Headers;
    expect(forwarded.get('x-e2e-actor-id')).toBe('e2e-actor');
  });

  it('forwards cookies and auth context headers to internal API calls', async () => {
    headersMock.mockResolvedValue(
      new Headers({
        host: 'localhost:3000',
        'x-tenant-id': 'tenant-1',
        'x-actor-id': 'actor-1',
        'x-actor-type': 'USER',
      }),
    );
    cookiesMock.mockResolvedValue({
      getAll: () => [
        { name: 'sb-access-token', value: 'token-value' },
        { name: 'movent_tenant_id', value: 'tenant-1' },
      ],
    });

    const { fetchWithRequestContext } = await loadServerApi();
    await fetchWithRequestContext('/api/v1/commerce/events');

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://localhost:3000/api/v1/commerce/events');
    expect(init.cache).toBe('no-store');

    const forwarded = init.headers as Headers;
    expect(forwarded.get('cookie')).toBe('sb-access-token=token-value; movent_tenant_id=tenant-1');
    expect(forwarded.get('x-tenant-id')).toBe('tenant-1');
    expect(forwarded.get('x-actor-id')).toBe('actor-1');
    expect(forwarded.get('x-actor-type')).toBe('USER');
  });

  it('omits cookie header when request has no cookies', async () => {
    const { fetchWithRequestContext } = await loadServerApi();
    await fetchWithRequestContext('/api/v1/commerce/events');

    const [, init] = fetchMock.mock.calls.at(-1)! as [string, RequestInit];
    const forwarded = init.headers as Headers;
    expect(forwarded.get('cookie')).toBeNull();
  });

  it('merges caller init with forwarded auth headers', async () => {
    headersMock.mockResolvedValue(
      new Headers({
        host: 'localhost:3000',
        'x-tenant-id': 'tenant-1',
        'x-actor-id': 'actor-1',
      }),
    );

    const { fetchWithRequestContext } = await loadServerApi();
    await fetchWithRequestContext('/api/v1/commerce/events', {
      method: 'POST',
      headers: { 'x-custom': 'probe' },
      cache: 'default',
    });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe('POST');
    expect(init.cache).toBe('default');

    const forwarded = init.headers as Headers;
    expect(forwarded.get('x-custom')).toBe('probe');
    expect(forwarded.get('x-tenant-id')).toBe('tenant-1');
  });

  it('uses NEXT_PUBLIC_APP_URL when configured', async () => {
    process.env['NEXT_PUBLIC_APP_URL'] = 'https://app.movent.test/';
    headersMock.mockResolvedValue(
      new Headers({
        host: 'evil.example.com',
        'x-forwarded-host': 'evil.example.com',
      }),
    );

    const { resolveBaseUrl, fetchWithRequestContext } = await loadServerApi();
    expect(resolveBaseUrl(new Headers({ host: 'evil.example.com' }))).toBe(
      'https://app.movent.test',
    );

    await fetchWithRequestContext('/api/v1/commerce/events');
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://app.movent.test/api/v1/commerce/events');
  });

  it('rejects untrusted host in development', async () => {
    const { resolveBaseUrl } = await loadServerApi();
    expect(() => resolveBaseUrl(new Headers({ host: 'evil.example.com:3000' }))).toThrow(
      'Untrusted host',
    );
  });

  it('allows IPv6 localhost host header', async () => {
    const { resolveBaseUrl, extractHostname } = await loadServerApi();
    expect(extractHostname('[::1]:3000')).toBe('::1');
    expect(resolveBaseUrl(new Headers({ host: '[::1]:3000' }))).toBe('http://[::1]:3000');
  });

  it('requires NEXT_PUBLIC_APP_URL in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');

    const { resolveBaseUrl } = await loadServerApi();
    expect(() => resolveBaseUrl(new Headers({ host: 'app.movent.test' }))).toThrow(
      'NEXT_PUBLIC_APP_URL is required in production',
    );
  });

  it('defaults protocol to https in production when env URL is set', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    process.env['NEXT_PUBLIC_APP_URL'] = 'https://app.movent.test';

    const { resolveBaseUrl } = await loadServerApi();
    expect(resolveBaseUrl(new Headers())).toBe('https://app.movent.test');
  });

  it('uses first token from compound x-forwarded-proto', async () => {
    const { resolveProtocol } = await loadServerApi();
    expect(resolveProtocol(new Headers({ 'x-forwarded-proto': 'https, http' }))).toBe('https');
  });

  it('defaults protocol to http in development', async () => {
    const { resolveBaseUrl } = await loadServerApi();
    expect(resolveBaseUrl(new Headers({ host: 'localhost:3000' }))).toBe('http://localhost:3000');
  });

  it('rejects invalid paths', async () => {
    const { fetchWithRequestContext, normalizeApiPath } = await loadServerApi();

    expect(() => normalizeApiPath('https://evil.test')).toThrow('Invalid internal API path');
    expect(() => normalizeApiPath('//evil.test')).toThrow('Invalid internal API path');

    await expect(fetchWithRequestContext('api/v1/events')).rejects.toThrow(
      'Invalid internal API path',
    );
  });

  it('normalizes paths with leading slash', async () => {
    const { normalizeApiPath, fetchWithRequestContext } = await loadServerApi();
    expect(normalizeApiPath('  /api/v1/events  ')).toBe('/api/v1/events');

    await fetchWithRequestContext('  /api/v1/events  ');
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://localhost:3000/api/v1/events');
  });
});
