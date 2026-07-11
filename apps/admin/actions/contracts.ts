"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity";
import { sendContractInputSchema } from "@/lib/validation";
import { sendContractFromTemplate } from "@/lib/zoho/sign";

export async function sendContractAction(input: unknown) {
  const profile = await requireRole("staff");
  const parsed = sendContractInputSchema.parse(input);

  const supabase = await createClient();
  const [{ data: client, error: clientError }, { data: contact, error: contactError }] = await Promise.all([
    supabase.from("clients").select("*").eq("id", parsed.clientId).single(),
    supabase.from("contacts").select("*").eq("id", parsed.contactId).single(),
  ]);
  if (clientError || !client) throw new Error("Client not found");
  if (contactError || !contact || !contact.email) throw new Error("Contact with an email is required");

  const { requestId } = await sendContractFromTemplate({
    templateKey: parsed.templateKey,
    title: parsed.title,
    signerName: contact.name,
    signerEmail: contact.email,
    fields: {
      client_legal_name: client.legal_name ?? client.name,
    },
  });

  const { data: contractRow, error: insertError } = await supabase
    .from("contracts")
    .insert({
      client_id: parsed.clientId,
      project_id: parsed.projectId ?? null,
      zoho_request_id: requestId,
      title: parsed.title,
      status: "sent",
      template_key: parsed.templateKey,
      sent_at: new Date().toISOString(),
      created_by: profile.id,
    })
    .select("id")
    .single();
  if (insertError || !contractRow) throw new Error(insertError?.message ?? "Failed to record contract");

  await logActivity({
    actorId: profile.id,
    entityType: "contract",
    entityId: contractRow.id,
    action: "sent",
    summary: `Contract "${parsed.title}" sent to ${contact.name} at ${client.name}`,
  });

  if (parsed.projectId) revalidatePath(`/projects/${parsed.projectId}`);
  revalidatePath("/contracts");
  return contractRow.id;
}
