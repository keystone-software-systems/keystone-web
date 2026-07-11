"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { logActivity } from "@/lib/activity";
import { z } from "zod";

const inviteSchema = z.object({
  email: z.string().email(),
  fullName: z.string().optional(),
  role: z.enum(["owner", "staff", "viewer"]),
});

/**
 * Provisions access by inserting a profiles row ahead of first login (per
 * docs/admin-tool-design.md §4 — there is no self-serve signup). If the
 * person hasn't signed in yet, auth.users has no matching id; this invites
 * them via Supabase Auth's admin API, which creates the auth.users row and
 * emails an invite, then our own row completes the pairing.
 */
export async function inviteUserAction(input: unknown) {
  const actor = await requireRole("owner");
  const parsed = inviteSchema.parse(input);

  const admin = createAdminClient();
  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(parsed.email, {
    redirectTo: `${process.env.APP_BASE_URL}/auth/callback`,
  });
  if (inviteError || !invited.user) {
    throw new Error(inviteError?.message ?? "Failed to invite user");
  }

  const { error } = await admin.from("profiles").insert({
    id: invited.user.id,
    email: parsed.email,
    full_name: parsed.fullName || null,
    role: parsed.role,
    active: true,
  });
  if (error) throw new Error(error.message);

  await logActivity({
    actorId: actor.id,
    entityType: "profile",
    entityId: invited.user.id,
    action: "invited",
    summary: `Invited ${parsed.email} as ${parsed.role}`,
  });

  revalidatePath("/settings");
}

export async function setUserActiveAction(profileId: string, active: boolean) {
  const actor = await requireRole("owner");
  const admin = createAdminClient();

  const { error } = await admin.from("profiles").update({ active }).eq("id", profileId);
  if (error) throw new Error(error.message);

  await logActivity({
    actorId: actor.id,
    entityType: "profile",
    entityId: profileId,
    action: active ? "reactivated" : "deactivated",
    summary: `User ${active ? "reactivated" : "deactivated"}`,
  });

  revalidatePath("/settings");
}

export async function setUserRoleAction(profileId: string, role: string) {
  const actor = await requireRole("owner");
  const parsed = inviteSchema.shape.role.parse(role);
  const admin = createAdminClient();

  const { error } = await admin.from("profiles").update({ role: parsed }).eq("id", profileId);
  if (error) throw new Error(error.message);

  await logActivity({
    actorId: actor.id,
    entityType: "profile",
    entityId: profileId,
    action: "role_changed",
    summary: `Role changed to ${parsed}`,
  });

  revalidatePath("/settings");
}
