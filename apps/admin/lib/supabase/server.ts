import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";

interface CookieToSet {
  name: string;
  value: string;
  options: CookieOptions;
}

/**
 * Request-scoped Supabase client bound to the signed-in user's session.
 * Reads/writes go through RLS. Use in Server Components and Server Actions
 * for anything that should respect the caller's row-level permissions.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component with no request context to mutate.
            // Middleware refreshes the session cookie on every request instead.
          }
        },
      },
    },
  );
}
