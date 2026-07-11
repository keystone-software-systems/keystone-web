"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity";
import { createInvoiceInputSchema } from "@/lib/validation";
import { ensureStripeCustomer, createAndSendStripeInvoice } from "@/lib/stripe/invoices";
import { formatMoney } from "@/components/money";

export async function createInvoiceAction(input: unknown) {
  const profile = await requireRole("staff");
  const parsed = createInvoiceInputSchema.parse(input);

  const supabase = await createClient();
  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("*")
    .eq("id", parsed.clientId)
    .single();
  if (clientError || !client) throw new Error("Client not found");

  const currency = "usd";
  const amountDue = parsed.lineItems.reduce((sum, li) => sum + li.quantity * li.unitAmount, 0);

  // Insert our row first (status='draft') so we have an app_invoice_id to
  // pass to Stripe as metadata and to derive idempotency keys from.
  const { data: invoiceRow, error: insertError } = await supabase
    .from("invoices")
    .insert({
      client_id: parsed.clientId,
      project_id: parsed.projectId ?? null,
      status: "draft",
      amount_due: amountDue,
      currency,
      created_by: profile.id,
    })
    .select("id")
    .single();
  if (insertError || !invoiceRow) throw new Error(insertError?.message ?? "Failed to create invoice");

  const customerId = await ensureStripeCustomer(client);

  const stripeInvoice = await createAndSendStripeInvoice({
    customerId,
    currency,
    daysUntilDue: parsed.daysUntilDue,
    lineItems: parsed.lineItems.map((li) => ({
      description: li.description,
      quantity: li.quantity,
      unitAmount: li.unitAmount,
      milestoneId: li.milestoneId,
    })),
    metadata: { project_id: parsed.projectId ?? "", app_invoice_id: invoiceRow.id },
    idempotencyKeyBase: invoiceRow.id,
  });

  await supabase
    .from("invoices")
    .update({
      stripe_invoice_id: stripeInvoice.id,
      number: stripeInvoice.number ?? null,
      status: "open",
      amount_due: stripeInvoice.amount_due,
      issued_at: new Date().toISOString(),
      due_at: stripeInvoice.due_date ? new Date(stripeInvoice.due_date * 1000).toISOString() : null,
      hosted_invoice_url: stripeInvoice.hosted_invoice_url ?? null,
      pdf_url: stripeInvoice.invoice_pdf ?? null,
    })
    .eq("id", invoiceRow.id);

  for (const li of parsed.lineItems) {
    if (!li.milestoneId) continue;
    await supabase
      .from("milestones")
      .update({ status: "invoiced", invoice_id: invoiceRow.id })
      .eq("id", li.milestoneId);
  }

  await logActivity({
    actorId: profile.id,
    entityType: "invoice",
    entityId: invoiceRow.id,
    action: "sent",
    summary: `Invoice ${stripeInvoice.number ?? ""} sent to ${client.name} for ${formatMoney(amountDue, currency)}`,
  });

  if (parsed.projectId) revalidatePath(`/projects/${parsed.projectId}`);
  revalidatePath("/invoices");
  return invoiceRow.id;
}
