import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { signTenantCookie, verifyTenantCookie } from '../tenant-cookie';

describe('tenant-cookie', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'development');
    process.env['TENANT_COOKIE_SECRET'] = 'test-secret';
    delete process.env['SUPABASE_SERVICE_ROLE_KEY'];
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    delete process.env['TENANT_COOKIE_SECRET'];
  });

  it('round-trips a signed tenant cookie for the same actor', async () => {
    const signed = await signTenantCookie('tenant-1', 'actor-1');
    await expect(verifyTenantCookie(signed, 'actor-1')).resolves.toBe('tenant-1');
  });

  it('rejects cookies signed for a different actor', async () => {
    const signed = await signTenantCookie('tenant-1', 'actor-1');
    await expect(verifyTenantCookie(signed, 'actor-2')).resolves.toBeUndefined();
  });

  it('rejects unsigned tenant ids', async () => {
    await expect(verifyTenantCookie('tenant-1', 'actor-1')).resolves.toBeUndefined();
  });

  it('returns undefined in production when TENANT_COOKIE_SECRET is missing', async () => {
    const signed = await signTenantCookie('tenant-1', 'actor-1');

    vi.stubEnv('NODE_ENV', 'production');
    delete process.env['TENANT_COOKIE_SECRET'];
    vi.resetModules();

    const { verifyTenantCookie: verifyFresh } = await import('../tenant-cookie');
    await expect(verifyFresh(signed, 'actor-1')).resolves.toBeUndefined();
  });

  it('requires TENANT_COOKIE_SECRET for signing in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    delete process.env['TENANT_COOKIE_SECRET'];
    vi.resetModules();

    const { signTenantCookie: signFresh } = await import('../tenant-cookie');
    await expect(signFresh('tenant-1', 'actor-1')).rejects.toThrow(
      'TENANT_COOKIE_SECRET is required in production',
    );
  });
});
