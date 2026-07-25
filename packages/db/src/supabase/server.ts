import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "../types";

/**
 * Request-scoped Supabase client bound to the signed-in user via cookies.
 * RLS applies. Use in Server Components, Server Actions, and Route Handlers
 * for anything that should be governed by the caller's own permissions.
 *
 * Shared by apps/admin and apps/portal — both auth against the same
 * Supabase project (docs/intake-portal-design.md §2), so this client factory
 * has no per-app configuration to parameterize.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // `setAll` was called from a Server Component, which can't set
            // cookies. Safe to ignore as long as `proxy.ts` is refreshing
            // the session on every request.
          }
        },
      },
    },
  );
}
