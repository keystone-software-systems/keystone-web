"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@keystone/db";
import type { Database } from "@keystone/db";
import { requireRole } from "../auth";

type Brand = Database["public"]["Enums"]["brand"];
type ProspectSegment = Database["public"]["Enums"]["prospect_segment"];
type ProspectStatus = Database["public"]["Enums"]["prospect_status"];

export type ProspectActionState = { error?: string };

const CONTACTED_STATUSES: ProspectStatus[] = ["contacted", "replied", "call_booked", "engaged"];

export async function createProspect(
  _prevState: ProspectActionState,
  formData: FormData,
): Promise<ProspectActionState> {
  const profile = await requireRole("owner", "staff");

  const brand = String(formData.get("brand") ?? "") as Brand;
  const segment = String(formData.get("segment") ?? "") as ProspectSegment;
  const name = String(formData.get("name") ?? "").trim();
  const feedItemId = String(formData.get("feed_item_id") ?? "").trim() || null;

  if (!brand || !segment || !name) {
    return { error: "Brand, segment, and name are required." };
  }

  const supabase = await createClient();
  const { data: prospect, error } = await supabase
    .from("prospects")
    .insert({
      brand,
      segment,
      name,
      company: optionalString(formData, "company"),
      title: optionalString(formData, "title"),
      email: optionalString(formData, "email"),
      linkedin_url: optionalString(formData, "linkedin_url"),
      website_url: optionalString(formData, "website_url"),
      location: optionalString(formData, "location"),
      source: optionalString(formData, "source"),
      notes: optionalString(formData, "notes"),
      next_follow_up_on: optionalString(formData, "next_follow_up_on"),
      created_by: profile.id,
    })
    .select("id")
    .single();

  if (error || !prospect) {
    console.error("createProspect insert failed", error);
    return { error: "Could not save this prospect. Try again." };
  }

  if (feedItemId) {
    const { error: feedError } = await supabase
      .from("prospect_feed_items")
      .update({ status: "promoted", prospect_id: prospect.id })
      .eq("id", feedItemId);
    if (feedError) console.error("promote feed item link failed", feedError);
    revalidatePath("/prospects/feed");
  }

  revalidatePath("/prospects");
  redirect(`/prospects/${prospect.id}`);
}

export async function updateProspectStatus(
  prospectId: string,
  _prevState: ProspectActionState,
  formData: FormData,
): Promise<ProspectActionState> {
  const profile = await requireRole("owner", "staff");
  const status = String(formData.get("status") ?? "") as ProspectStatus;
  const nextFollowUpOn = optionalString(formData, "next_follow_up_on");

  if (!status) {
    return { error: "Pick a status." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("prospects")
    .update({
      status,
      next_follow_up_on: nextFollowUpOn,
      ...(CONTACTED_STATUSES.includes(status) ? { last_contacted_at: new Date().toISOString() } : {}),
    })
    .eq("id", prospectId);

  if (error) {
    console.error("updateProspectStatus failed", error);
    return { error: "Could not update status. Try again." };
  }

  await supabase.from("activity_log").insert({
    actor_id: profile.id,
    entity_type: "prospect",
    entity_id: prospectId,
    action: "status_change",
    summary: `Status → ${status}`,
  });

  revalidatePath(`/prospects/${prospectId}`);
  revalidatePath("/prospects");
  return {};
}

export async function logTouch(
  prospectId: string,
  _prevState: ProspectActionState,
  formData: FormData,
): Promise<ProspectActionState> {
  const profile = await requireRole("owner", "staff");
  const body = String(formData.get("body") ?? "").trim();

  if (!body) {
    return { error: "Write a note first." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("activity_log").insert({
    actor_id: profile.id,
    entity_type: "prospect",
    entity_id: prospectId,
    action: "touch",
    summary: body,
  });

  if (error) {
    console.error("logTouch insert failed", error);
    return { error: "Could not save that. Try again." };
  }

  await supabase
    .from("prospects")
    .update({ last_contacted_at: new Date().toISOString() })
    .eq("id", prospectId);

  revalidatePath(`/prospects/${prospectId}`);
  return {};
}

// useActionState requires the (state, formData) shape even though this action needs neither.
/* eslint-disable @typescript-eslint/no-unused-vars */
export async function dismissFeedItem(
  feedItemId: string,
  _prevState: ProspectActionState,
  _formData: FormData,
): Promise<ProspectActionState> {
  /* eslint-enable @typescript-eslint/no-unused-vars */
  await requireRole("owner", "staff");
  const supabase = await createClient();
  const { error } = await supabase
    .from("prospect_feed_items")
    .update({ status: "dismissed" })
    .eq("id", feedItemId);

  if (error) {
    console.error("dismissFeedItem update failed", error);
    return { error: "Could not dismiss this. Try again." };
  }

  revalidatePath("/prospects/feed");
  return {};
}

function optionalString(formData: FormData, key: string): string | null {
  const value = String(formData.get(key) ?? "").trim();
  return value || null;
}
