import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./types";

interface CookieToSet {
  name: string;
  value: string;
  options: CookieOptions;
}

const PUBLIC_PATHS = ["/login", "/auth/callback"];

/**
 * Refreshes the Supabase session cookie on every request and gates access
 * to everything under (app). Runs before RLS ever gets a query — this is
 * the first of three enforcement layers (see docs/admin-tool-design.md §4).
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (user && !isPublicPath) {
    // Reject any authenticated identity without a provisioned profile row,
    // even though Supabase Auth itself accepted the login.
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, active")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile || !profile.active) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("error", "not_provisioned");
      const redirect = NextResponse.redirect(url);
      await supabase.auth.signOut();
      return redirect;
    }
  }

  if (user && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
