import { describe, expect, it } from 'vitest';
import { decodeJwtPayload, resolveTenantId } from '../jwt-tenant-context';

function makeJwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${header}.${body}.signature`;
}

describe('decodeJwtPayload', () => {
  it('decodes tenant_id and sub from a valid JWT', () => {
    const token = makeJwt({ sub: 'user-1', tenant_id: 'tenant-abc' });
    expect(decodeJwtPayload(token)).toEqual({ sub: 'user-1', tenant_id: 'tenant-abc' });
  });

  it('returns null for malformed tokens without throwing', () => {
    expect(decodeJwtPayload('not-a-jwt')).toBeNull();
    expect(decodeJwtPayload('a.b')).toBeNull();
    expect(decodeJwtPayload(makeJwt({ tenant_id: 'only-tenant' }))).toBeNull();
    expect(decodeJwtPayload('a.%%%invalid%%%.c')).toBeNull();
  });
});

describe('resolveTenantId', () => {
  it('prefers JWT tenant_id over cookie', () => {
    expect(resolveTenantId({ sub: 'u1', tenant_id: 'jwt-tenant' }, 'cookie-tenant')).toBe(
      'jwt-tenant',
    );
  });

  it('falls back to movent_tenant_id cookie when JWT lacks claim', () => {
    expect(resolveTenantId({ sub: 'u1' }, 'cookie-tenant')).toBe('cookie-tenant');
  });

  it('returns undefined when neither source provides tenant', () => {
    expect(resolveTenantId({ sub: 'u1' }, undefined)).toBeUndefined();
    expect(resolveTenantId(null, null)).toBeUndefined();
  });
});
