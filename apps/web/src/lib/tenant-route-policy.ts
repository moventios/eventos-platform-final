/** Routes reachable without a tenant_id claim (authenticated user only). */
export const TENANT_OPTIONAL_PATHS = ['/onboarding'] as const;

export const TENANT_OPTIONAL_API: Array<{ path: string; methods: string[] }> = [
  { path: '/api/v1/iam/tenants', methods: ['POST'] },
];

export function isTenantOptionalPath(pathname: string, method: string): boolean {
  if (TENANT_OPTIONAL_PATHS.some((p) => pathname.startsWith(p))) return true;
  return TENANT_OPTIONAL_API.some(
    (r) => pathname === r.path && r.methods.includes(method),
  );
}