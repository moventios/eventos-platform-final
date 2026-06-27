import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest, type NextResponse as NextResponseType } from 'next/server';
import { isTenantOptionalPath } from '@/lib/tenant-route-policy';
import { decodeJwtPayload, resolveTenantId } from '@/lib/jwt-tenant-context';
import { sanitizeRedirectPath } from '@/lib/safe-redirect-path';
import { verifyTenantCookie } from '@/lib/tenant-cookie';

type CookieToSet = {
  name: string;
  value: string;
  options?: Parameters<NextResponseType['cookies']['set']>[2];
};

const PUBLIC_PATHS = [
  '/login',
  '/auth/callback',
  '/api/health',
  // Public discovery (Public First philosophy)
  '/',
  '/events',
  '/facilities',
  '/venues',
  '/organizations',
  '/api/v1/commerce/events',
  '/api/v1/spatial/facilities',
  '/api/v1/iam/tenants',
];

// Synthetic tenant/actor for public unauthenticated discovery reads on events/facilities lists.
// Uses the seeded test tenant so RLS + explicit .where(tenantId) return live data for public ecosystem.
// Only injected for GET on the read APIs (POSTs fall through to full tenant enforcement).
const PUBLIC_DISCOVERY_TENANT_ID = process.env['MOVENT_PUBLIC_DISCOVERY_TENANT_ID'] ?? '00000000-0000-0000-0000-000000000001';
const PUBLIC_DISCOVERY_ACTOR_ID = process.env['MOVENT_PUBLIC_DISCOVERY_ACTOR_ID'] ?? '00000000-0000-0000-0000-0000000000aa';

function copyResponseCookies(from: NextResponse, to: NextResponse): void {
  for (const cookie of from.cookies.getAll()) {
    to.cookies.set(cookie);
  }
}

function buildAuthedPassThrough(
  request: NextRequest,
  actorId: string,
  tenantId: string | undefined,
  cookieSource: NextResponse,
): NextResponse {
  const requestHeaders = new Headers(request.headers);
  if (tenantId) requestHeaders.set('x-tenant-id', tenantId);
  requestHeaders.set('x-actor-id', actorId);
  requestHeaders.set('x-actor-type', 'USER');
  const authedResponse = NextResponse.next({ request: { headers: requestHeaders } });
  copyResponseCookies(cookieSource, authedResponse);
  return authedResponse;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.some((p) => {
    if (p === '/') return pathname === '/';
    return pathname === p || pathname.startsWith(p + '/');
  });

  if (isPublic) {
    const isPublicReadApi =
      request.method === 'GET' &&
      (pathname === '/api/v1/commerce/events' ||
        pathname === '/api/v1/spatial/facilities' ||
        pathname === '/api/v1/iam/tenants' ||
        (pathname.startsWith('/api/v1/spatial/facilities/') && pathname.endsWith('/rooms')));
    if (isPublicReadApi) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-tenant-id', PUBLIC_DISCOVERY_TENANT_ID);
      requestHeaders.set('x-actor-id', PUBLIC_DISCOVERY_ACTOR_ID);
      requestHeaders.set('x-actor-type', 'USER');
      return NextResponse.next({ request: { headers: requestHeaders } });
    }
    return NextResponse.next();
  }

  if (process.env['MOVENT_E2E_CAPTURE'] === '1') {
    // Accept x-e2e-actor-id on page requests and x-actor-id on SSR sub-fetches
    // (fetchWithRequestContext forwards middleware-injected auth headers).
    const e2eActorId = request.headers.get('x-e2e-actor-id') ?? request.headers.get('x-actor-id');
    if (e2eActorId) {
      const cookieTenantId = await verifyTenantCookie(
        request.cookies.get('movent_tenant_id')?.value,
        e2eActorId,
      );
      const tenantId = cookieTenantId;

      if (!tenantId && !isTenantOptionalPath(pathname, request.method)) {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.redirect(new URL('/onboarding', request.url));
      }

      const e2eShell = NextResponse.next({ request: { headers: request.headers } });
      return buildAuthedPassThrough(request, e2eActorId, tenantId, e2eShell);
    }
  }

  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet: CookieToSet[]) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            if (options) response.cookies.set(name, value, options);
            else response.cookies.set(name, value);
          });
        },
      },
    },
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    if (pathname.startsWith('/api/')) {
      const apiResponse = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      copyResponseCookies(response, apiResponse);
      return apiResponse;
    }
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', sanitizeRedirectPath(pathname));
    const loginRedirect = NextResponse.redirect(loginUrl);
    copyResponseCookies(response, loginRedirect);
    return loginRedirect;
  }

  const payload = decodeJwtPayload(session.access_token);
  const actorId = session.user.id;
  const cookieTenantId = await verifyTenantCookie(
    request.cookies.get('movent_tenant_id')?.value,
    actorId,
  );
  const tenantId = resolveTenantId(payload, cookieTenantId);

  if (!tenantId && !isTenantOptionalPath(pathname, request.method)) {
    if (pathname.startsWith('/api/')) {
      const apiResponse = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      copyResponseCookies(response, apiResponse);
      return apiResponse;
    }
    const redirectResponse = NextResponse.redirect(new URL('/onboarding', request.url));
    copyResponseCookies(response, redirectResponse);
    return redirectResponse;
  }

  return buildAuthedPassThrough(request, actorId, tenantId ?? undefined, response);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
