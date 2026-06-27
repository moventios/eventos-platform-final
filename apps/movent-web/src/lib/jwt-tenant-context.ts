export type JwtPayload = {
  tenant_id?: string;
  sub: string;
};

export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3 || !parts[1]) return null;
    const decoded = JSON.parse(Buffer.from(parts[1], 'base64url').toString()) as unknown;
    if (typeof decoded !== 'object' || decoded === null) return null;
    const payload = decoded as Record<string, unknown>;
    if (typeof payload['sub'] !== 'string') return null;
    const tenantId = payload['tenant_id'];
    return {
      sub: payload['sub'],
      ...(typeof tenantId === 'string' ? { tenant_id: tenantId } : {}),
    };
  } catch {
    return null;
  }
}

export function resolveTenantId(
  payload: JwtPayload | null,
  cookieTenantId?: string | null,
): string | undefined {
  return payload?.tenant_id ?? cookieTenantId ?? undefined;
}
