"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@keystone/db";
import { requireRole } from "@/lib/auth";

export type CommentActionState = { error?: string };

/**
 * Client-authored reply on their own submission's comment thread. RLS
 * (submission_comments_insert_client) independently requires
 * is_project_client(project_id) and visible_to_client=true — this re-checks
 * role first per the three-layer pattern in intake-portal-design.md §3.
 */
export async function addComment(
  projectId: string,
  _prevState: CommentActionState,
  formData: FormData,
): Promise<CommentActionState> {
  const profile = await requireRole("client");
  const body = String(formData.get("body") ?? "").trim();

  if (!body) {
    return { error: "Write a reply first." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("submission_comments").insert({
    project_id: projectId,
    author_id: profile.id,
    visible_to_client: true,
    body,
  });

  if (error) {
    console.error("addComment insert failed", error);
    return { error: "Could not post that. Try again." };
  }

  revalidatePath(`/projects/${projectId}`);
  return {};
}
