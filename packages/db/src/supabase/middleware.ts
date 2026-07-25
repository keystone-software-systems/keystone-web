import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "../types";

/**
 * Refreshes the Supabase session cookie for the current request and returns
 * a request-scoped client bound to that (possibly just-refreshed) session,
 * for use by proxy.ts to look up the caller's `profiles` row.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getClaims() verifies the JWT and refreshes it if expired, without the
  // extra round trip getUser() makes.
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  return { supabase, response, claims };
}
