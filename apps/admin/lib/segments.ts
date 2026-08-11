import type { Database } from "@keystone/db";
import type { Brand } from "./brands";

export type ProspectSegment = Database["public"]["Enums"]["prospect_segment"];
export type ProspectStatus = Database["public"]["Enums"]["prospect_status"];

export const BRAND_LABEL: Record<Brand, string> = {
  keystone: "Keystone",
  stackdiligence: "StackDiligence",
};

export const SEGMENTS_BY_BRAND: Record<Brand, ProspectSegment[]> = {
  keystone: [
    "vibe_code_to_production",
    "codebase_improvement",
    "ai_training_setup",
    "warm_network",
    "partner_referral",
  ],
  stackdiligence: ["referral_partner", "live_deal", "independent_sponsor"],
};

export const STATUS_OPTIONS: ProspectStatus[] = [
  "new",
  "researching",
  "contacted",
  "replied",
  "call_booked",
  "engaged",
  "not_now",
  "dead",
];

export function label(value: string): string {
  return value.replaceAll("_", " ");
}
