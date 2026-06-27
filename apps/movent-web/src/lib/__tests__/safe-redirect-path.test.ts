import { describe, expect, it } from 'vitest';
import { sanitizeRedirectPath } from '../safe-redirect-path';

describe('sanitizeRedirectPath', () => {
  it('allows normal relative paths', () => {
    expect(sanitizeRedirectPath('/events')).toBe('/events');
    expect(sanitizeRedirectPath('/')).toBe('/');
  });

  it('rejects protocol-relative and absolute URLs', () => {
    expect(sanitizeRedirectPath('//evil.test')).toBe('/');
    expect(sanitizeRedirectPath('https://evil.test')).toBe('/');
    expect(sanitizeRedirectPath('/\\evil')).toBe('/');
  });

  it('returns fallback for nullish values', () => {
    expect(sanitizeRedirectPath(null)).toBe('/');
    expect(sanitizeRedirectPath(undefined, '/login')).toBe('/login');
  });
});