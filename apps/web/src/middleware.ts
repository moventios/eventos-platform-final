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

const PUBLIC_PATHS = ['/login', '/auth/callback', '/api/health'];

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

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  if (process.env['EVENTOS_E2E_CAPTURE'] === '1') {
    // Accept x-e2e-actor-id on page requests and x-actor-id on SSR sub-fetches
    // (fetchWithRequestContext forwards middleware-injected auth headers).
    const e2eActorId =
      request.headers.get('x-e2e-actor-id') ?? request.headers.get('x-actor-id');
    if (e2eActorId) {
      const cookieTenantId = await verifyTenantCookie(
        request.cookies.get('eventos_tenant_id')?.value,
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
    request.cookies.get('eventos_tenant_id')?.value,
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
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};