import { NextRequest } from 'next/server';

const MIDDLEWARE_REQUEST_PREFIX = 'x-middleware-request-';

export type MiddlewareRouteInit = {
  method?: string;
  body?: BodyInit | null;
  headers?: Record<string, string>;
};

/**
 * Build the NextRequest a route handler receives after middleware returns
 * NextResponse.next(). Reads all x-middleware-request-* headers from the
 * middleware response — no manual field copying in tests.
 */
export function routeRequestFromMiddleware(
  original: NextRequest,
  middlewareResponse: Response,
  init?: MiddlewareRouteInit,
): NextRequest {
  if (middlewareResponse.headers.get('x-middleware-next') !== '1') {
    throw new Error(
      `Middleware did not pass through (status ${middlewareResponse.status}); cannot bridge to route`,
    );
  }

  const headers = new Headers();

  for (const [key, value] of middlewareResponse.headers.entries()) {
    if (!key.startsWith(MIDDLEWARE_REQUEST_PREFIX)) continue;
    const target = key.slice(MIDDLEWARE_REQUEST_PREFIX.length);
    if (target === 'cookie') {
      headers.set('cookie', value);
    } else {
      headers.set(target, value);
    }
  }

  if (init?.headers) {
    for (const [name, value] of Object.entries(init.headers)) {
      headers.set(name, value);
    }
  }

  const options: ConstructorParameters<typeof NextRequest>[1] = {
    method: init?.method ?? original.method,
    headers,
  };
  if (init?.body !== undefined) {
    options.body = init.body;
  }
  return new NextRequest(original.url, options);
}