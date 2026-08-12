import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@keystone/db";

// Next.js 16 renamed the `middleware.ts` convention to `proxy.ts` (same
// functionality, new name/file — see AGENTS.md). This is that file.

const PUBLIC_PATHS = ["/login", "/signup", "/submit", "/auth/confirm", "/auth/auth-code-error"];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export async function proxy(request: NextRequest) {
  const { supabase, response, claims } = await updateSession(request);
  const { pathname } = request.nextUrl;

  if (!claims) {
    if (isPublicPath(pathname)) return response;
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (isPublicPath(pathname)) return response;

  // Authenticated with Supabase, but do they have a provisioned, active
  // `profiles` row (role 'client' or 'engineer')? Client accounts are
  // self-serve — `ensureClientProfile` (lib/auth.ts) provisions the row at
  // signup/first magic-link — but it still has to exist and be active
  // before anything behind auth is reachable.
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, active")
    .eq("id", claims.sub)
    .maybeSingle();

  if (!profile || !profile.active) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("error", "not-provisioned");
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    // Run on everything except static assets and metadata files.
    "/((?!_next/static|_next/image|favicon.ico|robots.txt).*)",
  ],
};
