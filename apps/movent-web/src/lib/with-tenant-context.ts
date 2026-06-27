import { NextRequest, NextResponse } from 'next/server';

export interface TenantContext {
  tenantId: string;
  actorId: string;
  actorType: 'USER' | 'AI_AGENT' | 'SYSTEM';
}

type RouteHandler = (
  req: NextRequest,
  ctx: TenantContext,
  params: Record<string, string>,
) => Promise<NextResponse>;

type ActorContext = Pick<TenantContext, 'actorId' | 'actorType'>;

type ActorRouteHandler = (
  req: NextRequest,
  ctx: ActorContext,
  params: Record<string, string>,
) => Promise<NextResponse>;

type RouteContext = { params: Promise<Record<string, string>> };

/**
 * For routes that require an authenticated actor but not yet a tenant (e.g. initial provisioning).
 */
export function withActorContext(handler: ActorRouteHandler) {
  return async (req: NextRequest, context: RouteContext): Promise<NextResponse> => {
    const actorId = req.headers.get('x-actor-id');
    const actorType = (req.headers.get('x-actor-type') ?? 'USER') as TenantContext['actorType'];

    if (!actorId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const params = await context.params;
      return await handler(req, { actorId, actorType }, params);
    } catch (error) {
      console.error('[API Error]', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}

/**
 * Middleware for API routes — extracts tenant context injected by middleware.ts.
 * Enforces L-05: every API handler has a verified tenant context.
 */
export function withTenantContext(handler: RouteHandler) {
  return async (req: NextRequest, context: RouteContext): Promise<NextResponse> => {
    const tenantId = req.headers.get('x-tenant-id');
    const actorId = req.headers.get('x-actor-id');
    const actorType = (req.headers.get('x-actor-type') ?? 'USER') as TenantContext['actorType'];

    if (!tenantId || !actorId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const params = await context.params;
      return await handler(req, { tenantId, actorId, actorType }, params);
    } catch (error) {
      console.error('[API Error]', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}