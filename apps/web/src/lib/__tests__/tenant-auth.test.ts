import { describe, expect, it } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { isTenantOptionalPath } from '../tenant-route-policy';
import { withActorContext, withTenantContext } from '../with-tenant-context';

describe('isTenantOptionalPath', () => {
  it('allows onboarding page without tenant', () => {
    expect(isTenantOptionalPath('/onboarding', 'GET')).toBe(true);
  });

  it('allows tenant provision POST without tenant', () => {
    expect(isTenantOptionalPath('/api/v1/iam/tenants', 'POST')).toBe(true);
  });

  it('blocks other API routes without tenant', () => {
    expect(isTenantOptionalPath('/api/v1/iam/tenants', 'GET')).toBe(false);
    expect(isTenantOptionalPath('/api/v1/commerce/events', 'GET')).toBe(false);
  });

  it('blocks dashboard routes without tenant', () => {
    expect(isTenantOptionalPath('/events', 'GET')).toBe(false);
  });
});

describe('withTenantContext', () => {
  it('returns 401 when tenant or actor headers are missing', async () => {
    const handler = withTenantContext(async () => NextResponse.json({ ok: true }));
    const req = new NextRequest('http://localhost/api/v1/commerce/events');
    const res = await handler(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'Unauthorized' });
  });

  it('invokes handler when tenant and actor headers are present', async () => {
    const handler = withTenantContext(async (_req, ctx) =>
      NextResponse.json({ tenantId: ctx.tenantId, actorId: ctx.actorId }),
    );
    const req = new NextRequest('http://localhost/api/v1/commerce/events', {
      headers: {
        'x-tenant-id': 'tenant-1',
        'x-actor-id': 'actor-1',
      },
    });
    const res = await handler(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ tenantId: 'tenant-1', actorId: 'actor-1' });
  });
});

describe('withActorContext', () => {
  it('returns 401 when actor header is missing', async () => {
    const handler = withActorContext(async () => NextResponse.json({ ok: true }));
    const req = new NextRequest('http://localhost/api/v1/iam/tenants', { method: 'POST' });
    const res = await handler(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(401);
  });

  it('allows provisioning with actor only (no tenant)', async () => {
    const handler = withActorContext(async (_req, ctx) =>
      NextResponse.json({ actorId: ctx.actorId }),
    );
    const req = new NextRequest('http://localhost/api/v1/iam/tenants', {
      method: 'POST',
      headers: { 'x-actor-id': 'actor-1' },
    });
    const res = await handler(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ actorId: 'actor-1' });
  });
});