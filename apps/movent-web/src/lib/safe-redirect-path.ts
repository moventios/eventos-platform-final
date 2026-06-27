/**
 * Sanitize a post-auth redirect target to a same-origin relative path.
 * Rejects protocol-relative (`//`), absolute URLs, and backslash tricks.
 */
export function sanitizeRedirectPath(
  raw: string | null | undefined,
  fallback = '/',
): string {
  if (!raw) return fallback;

  const trimmed = raw.trim();
  if (
    !trimmed.startsWith('/') ||
    trimmed.startsWith('//') ||
    trimmed.includes('://') ||
    trimmed.includes('\\')
  ) {
    return fallback;
  }

  return trimmed;
}