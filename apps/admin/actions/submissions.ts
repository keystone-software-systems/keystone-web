"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@keystone/db";
import { requireRole } from "@/lib/auth";

export type SubmissionActionState = { error?: string };

/** `submitted` -> `lead` (intake-portal-design.md §5/§9 Phase 1): the founder
 * names the project on promotion, since it arrives with only a description. */
export async function promoteToLead(
  projectId: string,
  _prevState: SubmissionActionState,
  formData: FormData,
): Promise<SubmissionActionState> {
  await requireRole("owner", "staff");
  const name = String(formData.get("name") ?? "").trim();

  if (!name) {
    return { error: "Name the project before promoting it." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .update({ name, status: "lead" })
    .eq("id", projectId);

  if (error) {
    console.error("promoteToLead update failed", error);
    return { error: "Could not promote this. Try again." };
  }

  revalidatePath(`/submissions/${projectId}`);
  revalidatePath("/submissions");
  return {};
}

export async function addStaffComment(
  projectId: string,
  _prevState: SubmissionActionState,
  formData: FormData,
): Promise<SubmissionActionState> {
  const profile = await requireRole("owner", "staff");
  const body = String(formData.get("body") ?? "").trim();
  const visibleToClient = formData.get("visible_to_client") === "on";

  if (!body) {
    return { error: "Write a reply first." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("submission_comments").insert({
    project_id: projectId,
    author_id: profile.id,
    visible_to_client: visibleToClient,
    body,
  });

  if (error) {
    console.error("addStaffComment insert failed", error);
    return { error: "Could not post that. Try again." };
  }

  revalidatePath(`/submissions/${projectId}`);
  return {};
}
