import { redirect } from "next/navigation";
import { createClient } from "@keystone/db";
import type { Database } from "@keystone/db";

type Role = Database["public"]["Enums"]["profile_role"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

/** The signed-in caller's `profiles` row, or null if unauthenticated or unprovisioned. */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", claims.sub)
    .maybeSingle();

  return profile;
}

/**
 * Server Action / Route Handler guard: redirects to /login if there's no
 * active, provisioned caller, and throws if their role isn't in `roles`.
 * This re-asserts what proxy.ts and RLS already enforce — a missing or
 * loose policy shouldn't be the only thing standing between a `viewer` and
 * a privileged write.
 */
export async function requireRole(...roles: Role[]): Promise<Profile> {
  const profile = await getCurrentProfile();

  if (!profile || !profile.active) {
    redirect("/login");
  }

  if (profile.role !== "admin" && !roles.includes(profile.role)) {
    throw new Error(`Forbidden: requires role ${roles.join(" or ")}, caller is ${profile.role}`);
  }

  return profile;
}
