const COOKIE_NAME = 'movent_tenant_id';
const DEV_FALLBACK_SECRET = 'dev-tenant-cookie-secret';

function getCookieSecretForSign(): string {
  const dedicated = process.env['TENANT_COOKIE_SECRET'];
  if (dedicated) return dedicated;

  if (process.env['NODE_ENV'] === 'production') {
    throw new Error('TENANT_COOKIE_SECRET is required in production');
  }

  const serviceRole = process.env['SUPABASE_SERVICE_ROLE_KEY'];
  if (serviceRole) return serviceRole;

  return DEV_FALLBACK_SECRET;
}

function getCookieSecretForVerify(): string | undefined {
  const dedicated = process.env['TENANT_COOKIE_SECRET'];
  if (dedicated) return dedicated;

  if (process.env['NODE_ENV'] === 'production') {
    return undefined;
  }

  return process.env['SUPABASE_SERVICE_ROLE_KEY'] ?? DEV_FALLBACK_SECRET;
}

function timingSafeEqualString(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const left = enc.encode(a);
  const right = enc.encode(b);
  if (left.length !== right.length) return false;

  let diff = 0;
  for (let i = 0; i < left.length; i++) {
    diff |= left[i]! ^ right[i]!;
  }
  return diff === 0;
}

async function signPayload(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return Buffer.from(signature).toString('base64url');
}

/** Bind tenantId to actorId so the cookie cannot be reused across users. */
export async function signTenantCookie(tenantId: string, actorId: string): Promise<string> {
  const signature = await signPayload(`${tenantId}:${actorId}`, getCookieSecretForSign());
  return `${tenantId}.${signature}`;
}

export async function verifyTenantCookie(
  value: string | undefined,
  actorId: string,
): Promise<string | undefined> {
  if (!value) return undefined;

  const secret = getCookieSecretForVerify();
  if (!secret) return undefined;

  const separator = value.indexOf('.');
  if (separator <= 0) return undefined;

  const tenantId = value.slice(0, separator);
  const providedSignature = value.slice(separator + 1);
  if (!tenantId || !providedSignature) return undefined;

  try {
    const expectedSignature = await signPayload(`${tenantId}:${actorId}`, secret);
    if (!timingSafeEqualString(providedSignature, expectedSignature)) return undefined;
    return tenantId;
  } catch {
    return undefined;
  }
}

export const TENANT_COOKIE_NAME = COOKIE_NAME;

export function tenantCookieOptions(): {
  httpOnly: true;
  secure: boolean;
  sameSite: 'lax';
  path: string;
  maxAge: number;
} {
  return {
    httpOnly: true,
    secure: process.env['NODE_ENV'] === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  };
}