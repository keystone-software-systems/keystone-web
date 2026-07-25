import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@keystone/db";
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
 * Client signup is self-serve: call this right after `signUp`/`signInWithOtp`
 * succeeds so a brand-new auth user gets a `profiles` row without staff
 * involvement. Only ever inserts — an existing row (staff, viewer, engineer,
 * or a returning client) is left untouched, so a routine magic-link login
 * can never clobber someone's provisioned role.
 */
export async function ensureClientProfile(userId: string, email: string): Promise<void> {
  const admin = createAdminClient();
  const { data: existing } = await admin.from("profiles").select("id").eq("id", userId).maybeSingle();
  if (existing) return;

  const { error } = await admin.from("profiles").insert({ id: userId, email, role: "client" });
  if (error) {
    console.error("ensureClientProfile insert failed", error);
  }
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

  if (!roles.includes(profile.role)) {
    throw new Error(`Forbidden: requires role ${roles.join(" or ")}, caller is ${profile.role}`);
  }

  return profile;
}
