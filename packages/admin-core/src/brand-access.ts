import { createClient } from "@keystone/db";
import type { Database } from "@keystone/db";

export type Brand = Database["public"]["Enums"]["brand"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

/**
 * Mirrors the `has_brand_access()` RLS helper: owner/admin see every brand, staff/viewer need an
 * explicit `profile_brand_access` row for it. Each admin app is scoped to a single brand, so this
 * checks one brand rather than returning a list — the UI-level counterpart to what RLS already
 * enforces, so a staff/viewer profile without a grant gets a clear "no access" screen instead of
 * a silently empty query.
 */
export async function hasBrandAccess(profile: Profile, brand: Brand): Promise<boolean> {
  if (profile.role === "owner" || profile.role === "admin") return true;

  const supabase = await createClient();
  const { data } = await supabase
    .from("profile_brand_access")
    .select("brand")
    .eq("profile_id", profile.id)
    .eq("brand", brand)
    .maybeSingle();

  return Boolean(data);
}
