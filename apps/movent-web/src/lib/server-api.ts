import { cookies, headers } from 'next/headers';

const AUTH_CONTEXT_HEADERS = [
  'x-tenant-id',
  'x-actor-id',
  'x-actor-type',
  'x-e2e-actor-id',
] as const;
const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1']);

function isLocalHostname(hostname: string): boolean {
  return LOCAL_HOSTNAMES.has(hostname.toLowerCase());
}

/** Extract hostname from a Host header value (supports IPv6 bracket form). */
export function extractHostname(host: string): string {
  let hostname: string;
  try {
    hostname = new URL(`http://${host}`).hostname;
  } catch {
    if (host.startsWith('[')) {
      const end = host.indexOf(']');
      if (end > 0) return host.slice(1, end);
    }
    return host.split(':')[0] ?? host;
  }

  if (hostname.startsWith('[') && hostname.endsWith(']')) {
    return hostname.slice(1, -1);
  }
  return hostname;
}

/** Normalize and validate an internal API path (must be relative, same-origin). */
export function normalizeApiPath(path: string): string {
  const trimmed = path.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    throw new Error(`Invalid internal API path: ${path}`);
  }
  return trimmed;
}

export function resolveProtocol(headerStore: Headers): string {
  const forwarded = headerStore.get('x-forwarded-proto');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first === 'http' || first === 'https') return first;
  }
  return process.env['NODE_ENV'] === 'production' ? 'https' : 'http';
}

/**
 * Resolve the base URL for internal SSR fetches.
 * Production requires NEXT_PUBLIC_APP_URL; dev allows localhost host header only.
 */
export function resolveBaseUrl(headerStore: Headers): string {
  const configured = process.env['NEXT_PUBLIC_APP_URL']?.replace(/\/$/, '');
  if (configured) return configured;

  if (process.env['NODE_ENV'] === 'production') {
    throw new Error('NEXT_PUBLIC_APP_URL is required in production for internal SSR fetches');
  }

  const host = headerStore.get('host') ?? 'localhost:3000';
  const hostname = extractHostname(host);
  if (!isLocalHostname(hostname)) {
    throw new Error(`Untrusted host for internal SSR fetch: ${host}`);
  }

  return `${resolveProtocol(headerStore)}://${host}`;
}

/**
 * Server-side fetch that forwards the incoming request's cookies and
 * middleware-injected auth headers to internal API routes.
 */
export async function fetchWithRequestContext(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const headerStore = await headers();
  const cookieStore = await cookies();
  const normalizedPath = normalizeApiPath(path);
  const url = `${resolveBaseUrl(headerStore)}${normalizedPath}`;

  const forwarded = new Headers(init.headers);

  for (const name of AUTH_CONTEXT_HEADERS) {
    const value = headerStore.get(name);
    if (value) forwarded.set(name, value);
  }

  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ');

  if (cookieHeader) {
    forwarded.set('cookie', cookieHeader);
  } else {
    forwarded.delete('cookie');
  }

  return fetch(url, { ...init, headers: forwarded, cache: init.cache ?? 'no-store' });
}
