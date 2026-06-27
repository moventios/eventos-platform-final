import { createServerClient } from '@supabase/ssr';

type CookieStore = {
  getAll(): Array<{ name: string; value: string }>;
  set?(name: string, value: string, options?: Record<string, unknown>): void;
};

export function createSupabaseServerClient(cookieStore: CookieStore) {
  const url = process.env['NEXT_PUBLIC_SUPABASE_URL'];
  const anonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];
  if (!url || !anonKey) throw new Error('Supabase env vars missing');

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
        cookiesToSet.forEach(({ name, value, options }) => {
          try {
            cookieStore.set?.(name, value, options);
          } catch {
            // Server Components cannot mutate cookies; middleware handles session refresh.
          }
        });
      },
    },
  });
}