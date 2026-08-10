import { createClient } from "@keystone/db";
import type { Database } from "@keystone/db";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Brand = Database["public"]["Enums"]["brand"];

export const ALL_BRANDS: Brand[] = ["keystone", "stackdiligence"];

/** Owners see every brand; staff/viewer only what's granted in profile_brand_access. */
export async function getAccessibleBrands(profile: Profile): Promise<Brand[]> {
  if (profile.role === "owner") return ALL_BRANDS;

  const supabase = await createClient();
  const { data } = await supabase
    .from("profile_brand_access")
    .select("brand")
    .eq("profile_id", profile.id);

  return data?.map((row) => row.brand) ?? [];
}
