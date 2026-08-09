"use server";

import { createAdminClient, sendMagicLink } from "@keystone/db";
import type { Database } from "@keystone/db";

type EngagementType = Database["public"]["Enums"]["engagement_type"];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ENGAGEMENT_TYPES: EngagementType[] = ["short_term_project", "long_term_project", "retainer"];
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 3;

export type SubmitBriefState = { error?: string; success?: boolean };

/**
 * Public, unauthenticated entry point for /submit (intake-portal-design.md
 * §5/§9 Phase 1). Finds or creates the clients/contacts row by email,
 * inserts a `submitted` project, and sends a magic link — an invitation to
 * check status, never a requirement (§5). Runs entirely through the
 * admin client since the caller has no session yet.
 */
export async function submitProjectBrief(
  _prevState: SubmitBriefState,
  formData: FormData,
): Promise<SubmitBriefState> {
  // Honeypot: bots fill every field, including ones hidden from real users.
  // Report success without doing anything, so the bot doesn't learn to retry.
  if (String(formData.get("company_website") ?? "").trim()) {
    return { success: true };
  }

  const description = String(formData.get("description") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const engagementType = String(formData.get("engagement_type") ?? "") as EngagementType;
  const budget = String(formData.get("budget") ?? "").trim();
  const timeline = String(formData.get("timeline") ?? "").trim();

  if (!description) {
    return { error: "Describe the project." };
  }
  if (!email || !EMAIL_RE.test(email)) {
    return { error: "Enter a valid email address." };
  }
  if (!ENGAGEMENT_TYPES.includes(engagementType)) {
    return { error: "Choose an engagement type." };
  }

  const admin = createAdminClient();

  const { data: matchedContacts, error: lookupError } = await admin
    .from("contacts")
    .select("client_id")
    .ilike("email", email);

  if (lookupError) {
    console.error("submitProjectBrief contact lookup failed", lookupError);
    return { error: "Could not submit right now. Try again." };
  }

  const clientIds = [...new Set((matchedContacts ?? []).map((c) => c.client_id))];

  if (clientIds.length) {
    const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
    const { count } = await admin
      .from("projects")
      .select("id", { count: "exact", head: true })
      .in("client_id", clientIds)
      .gte("created_at", since);

    if ((count ?? 0) >= RATE_LIMIT_MAX) {
      return { error: "Too many submissions from this email recently. Try again later." };
    }
  }

  let clientId: string;
  if (clientIds.length) {
    clientId = clientIds[0];
  } else {
    // clients.name is not-null (unlike projects.name, left null below) — the
    // form only collects an email, so it's the placeholder until the founder
    // names the account on promotion to `lead`.
    const { data: client, error: clientError } = await admin
      .from("clients")
      .insert({ name: email })
      .select("id")
      .single();

    if (clientError || !client) {
      console.error("submitProjectBrief client insert failed", clientError);
      return { error: "Could not submit right now. Try again." };
    }
    clientId = client.id;

    const { error: contactError } = await admin
      .from("contacts")
      .insert({ client_id: clientId, name: email, email, is_primary: true });

    if (contactError) {
      console.error("submitProjectBrief contact insert failed", contactError);
      return { error: "Could not submit right now. Try again." };
    }
  }

  const summaryParts = [description];
  if (budget) summaryParts.push(`Budget: ${budget}`);
  if (timeline) summaryParts.push(`Timeline: ${timeline}`);

  const { error: projectError } = await admin.from("projects").insert({
    client_id: clientId,
    status: "submitted",
    engagement_type: engagementType,
    summary: summaryParts.join("\n\n"),
  });

  if (projectError) {
    console.error("submitProjectBrief project insert failed", projectError);
    return { error: "Could not submit right now. Try again." };
  }

  const magicLinkForm = new FormData();
  magicLinkForm.set("email", email);
  await sendMagicLink({}, magicLinkForm);

  await notifyFounder(email, description).catch((err) =>
    console.error("submitProjectBrief founder notification failed", err),
  );

  return { success: true };
}

async function notifyFounder(email: string, description: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "Keystone Systems <onboarding@resend.dev>";
  const toEmail = process.env.FOUNDER_NOTIFICATION_EMAIL ?? "tanner@propdog.ai";

  await resend.emails.send({
    from: fromEmail,
    to: toEmail,
    replyTo: email,
    subject: `New project submission from ${email}`,
    text: description,
  });
}
