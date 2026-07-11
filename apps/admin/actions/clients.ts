"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity";
import { clientInputSchema, contactInputSchema } from "@/lib/validation";

export async function createClientAction(input: unknown) {
  const profile = await requireRole("staff");
  const parsed = clientInputSchema.parse(input);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .insert({
      name: parsed.name,
      legal_name: parsed.legalName || null,
      billing_email: parsed.billingEmail || null,
      notes: parsed.notes || null,
      created_by: profile.id,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create client");
  }

  await logActivity({
    actorId: profile.id,
    entityType: "client",
    entityId: data.id,
    action: "created",
    summary: `Client "${parsed.name}" created`,
  });

  revalidatePath("/clients");
  return data.id;
}

export async function updateClientAction(clientId: string, input: unknown) {
  const profile = await requireRole("staff");
  const parsed = clientInputSchema.parse(input);

  const supabase = await createClient();
  const { error } = await supabase
    .from("clients")
    .update({
      name: parsed.name,
      legal_name: parsed.legalName || null,
      billing_email: parsed.billingEmail || null,
      notes: parsed.notes || null,
    })
    .eq("id", clientId);

  if (error) throw new Error(error.message);

  await logActivity({
    actorId: profile.id,
    entityType: "client",
    entityId: clientId,
    action: "updated",
    summary: `Client "${parsed.name}" updated`,
  });

  revalidatePath(`/clients/${clientId}`);
}

export async function addContactAction(input: unknown) {
  const profile = await requireRole("staff");
  const parsed = contactInputSchema.parse(input);

  const supabase = await createClient();
  const { error } = await supabase.from("contacts").insert({
    client_id: parsed.clientId,
    name: parsed.name,
    email: parsed.email || null,
    title: parsed.title || null,
    phone: parsed.phone || null,
    is_primary: parsed.isPrimary ?? false,
  });

  if (error) throw new Error(error.message);

  await logActivity({
    actorId: profile.id,
    entityType: "client",
    entityId: parsed.clientId,
    action: "contact_added",
    summary: `Contact "${parsed.name}" added`,
  });

  revalidatePath(`/clients/${parsed.clientId}`);
}
