"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity";
import { projectInputSchema, milestoneInputSchema } from "@/lib/validation";
import { parseNotionLink, createNotionDoc, isNotionCreateEnabled } from "@/lib/notion/link";

export async function createProjectAction(input: unknown) {
  const profile = await requireRole("staff");
  const parsed = projectInputSchema.parse(input);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .insert({
      client_id: parsed.clientId,
      name: parsed.name,
      service_line: parsed.serviceLine,
      status: parsed.status ?? "lead",
      pricing_type: parsed.pricingType ?? "fixed",
      amount_total: parsed.amountTotal,
      currency: parsed.currency ?? "usd",
      summary: parsed.summary,
      start_date: parsed.startDate || null,
      target_end_date: parsed.targetEndDate || null,
      created_by: profile.id,
    })
    .select("id")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to create project");

  await logActivity({
    actorId: profile.id,
    entityType: "project",
    entityId: data.id,
    action: "created",
    summary: `Project "${parsed.name}" created`,
  });

  revalidatePath("/projects");
  return data.id;
}

export async function updateProjectStatusAction(projectId: string, status: string) {
  const profile = await requireRole("staff");
  const parsed = projectInputSchema.pick({ status: true }).parse({ status });

  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .update({ status: parsed.status })
    .eq("id", projectId);

  if (error) throw new Error(error.message);

  await logActivity({
    actorId: profile.id,
    entityType: "project",
    entityId: projectId,
    action: "status_changed",
    summary: `Project status set to "${status}"`,
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/projects");
}

export async function linkNotionDocAction(projectId: string, url: string) {
  const profile = await requireRole("staff");
  const { url: validUrl, pageId } = parseNotionLink(url);

  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .update({ notion_url: validUrl, notion_page_id: pageId })
    .eq("id", projectId);

  if (error) throw new Error(error.message);

  await logActivity({
    actorId: profile.id,
    entityType: "project",
    entityId: projectId,
    action: "notion_linked",
    summary: "Notion doc linked",
  });

  revalidatePath(`/projects/${projectId}`);
}

export async function createNotionDocAction(projectId: string, projectName: string) {
  const profile = await requireRole("staff");
  if (!isNotionCreateEnabled()) {
    throw new Error("Notion create-doc is not configured for this environment");
  }

  const backLinkUrl = `${process.env.APP_BASE_URL}/projects/${projectId}`;
  const { url, pageId } = await createNotionDoc(projectName, backLinkUrl);

  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .update({ notion_url: url, notion_page_id: pageId })
    .eq("id", projectId);

  if (error) throw new Error(error.message);

  await logActivity({
    actorId: profile.id,
    entityType: "project",
    entityId: projectId,
    action: "notion_created",
    summary: "Notion doc created and linked",
  });

  revalidatePath(`/projects/${projectId}`);
}

export async function addMilestoneAction(input: unknown) {
  const profile = await requireRole("staff");
  const parsed = milestoneInputSchema.parse(input);

  const supabase = await createClient();
  const { error } = await supabase.from("milestones").insert({
    project_id: parsed.projectId,
    title: parsed.title,
    amount: parsed.amount,
    currency: parsed.currency ?? "usd",
    due_date: parsed.dueDate || null,
    sort_order: parsed.sortOrder ?? 0,
  });

  if (error) throw new Error(error.message);

  await logActivity({
    actorId: profile.id,
    entityType: "project",
    entityId: parsed.projectId,
    action: "milestone_added",
    summary: `Milestone "${parsed.title}" added`,
  });

  revalidatePath(`/projects/${parsed.projectId}`);
}

// Milestones are marked `invoiced` by the create-invoice action (actions/invoices.ts)
// and `paid` by the Stripe webhook — never directly here.
