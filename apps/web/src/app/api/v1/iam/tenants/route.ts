import { NextRequest, NextResponse } from 'next/server';
import { withActorContext, withTenantContext } from '@/lib/with-tenant-context';
import { ProvisionTenantSchema } from '@eventos/contracts';
import { ProvisionTenantHandler } from '@eventos/core/iam';
import { DrizzleTenantProvisioner, DrizzleTenantRepository } from '@eventos/infrastructure/postgres/iam';
import { createDbWithTenant, createServiceDb } from '@eventos/infrastructure/postgres';
import { DomainError } from '@eventos/core';
import { signTenantCookie, tenantCookieOptions, TENANT_COOKIE_NAME } from '@/lib/tenant-cookie';

export const POST = withActorContext(async (req: NextRequest, { actorId }) => {
  const body = ProvisionTenantSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: body.error.flatten() }, { status: 422 });
  }

  const db = createServiceDb();
  const handler = new ProvisionTenantHandler(
    new DrizzleTenantRepository(db),
    new DrizzleTenantProvisioner(db),
  );

  try {
    const result = await handler.handle(body.data, actorId);
    const response = NextResponse.json(result, { status: 201 });
    const signedCookie = await signTenantCookie(result.tenantId, actorId);
    response.cookies.set(TENANT_COOKIE_NAME, signedCookie, tenantCookieOptions());
    return response;
  } catch (error) {
    if (error instanceof DomainError && error.code === 'SLUG_TAKEN') {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    throw error;
  }
});

export const GET = withTenantContext(async (_req: NextRequest, { tenantId }) => {
  const { db } = createDbWithTenant(tenantId);
  const repo = new DrizzleTenantRepository(db);
  const tenant = await repo.findById(tenantId);
  return NextResponse.json(tenant ? [tenant] : []);
});