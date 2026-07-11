import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/lib/supabase/types";

const ROLE_RANK: Record<UserRole, number> = { viewer: 0, staff: 1, owner: 2 };

/**
 * The signed-in user's profile row, or null if unauthenticated/unprovisioned.
 * Middleware already redirects unprovisioned users away from (app) routes,
 * so a null here inside (app) means something upstream changed underneath
 * the request — callers should redirect to /login rather than assume it.
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return profile;
}

/**
 * Re-asserts role in code before privileged work in a Server Action or
 * Route Handler — independent of RLS, per the defense-in-depth design in
 * docs/admin-tool-design.md §4. Redirects rather than throws so a stale
 * client (e.g. a demoted user's open tab) lands on /login instead of a
 * raw error screen.
 */
export async function requireRole(minRole: UserRole): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile || ROLE_RANK[profile.role] < ROLE_RANK[minRole]) {
    redirect("/login");
  }
  return profile;
}
