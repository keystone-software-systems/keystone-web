import "server-only";
import { getStripe } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Client } from "@/lib/supabase/types";

/** Lazily creates the Stripe Customer for a client on first invoice, per docs/admin-tool-design.md §6. */
export async function ensureStripeCustomer(client: Client): Promise<string> {
  if (client.stripe_customer_id) return client.stripe_customer_id;

  const stripe = getStripe();
  const customer = await stripe.customers.create(
    {
      name: client.name,
      email: client.billing_email ?? undefined,
      metadata: { app_client_id: client.id },
    },
    { idempotencyKey: `customer-create:${client.id}` },
  );

  const admin = createAdminClient();
  await admin.from("clients").update({ stripe_customer_id: customer.id }).eq("id", client.id);

  return customer.id;
}

export interface InvoiceLineItemInput {
  description: string;
  quantity: number;
  unitAmount: number;
  milestoneId?: string;
}

export interface CreateStripeInvoiceInput {
  customerId: string;
  currency: string;
  daysUntilDue: number;
  lineItems: InvoiceLineItemInput[];
  metadata: Record<string, string>;
  idempotencyKeyBase: string;
}

/**
 * Creates a Stripe hosted invoice: line items, finalize, send. Every write
 * carries an idempotency key derived from our own invoice id so a retried
 * Server Action never double-bills (docs/admin-tool-design.md §6).
 */
export async function createAndSendStripeInvoice(input: CreateStripeInvoiceInput) {
  const stripe = getStripe();

  for (const [i, item] of input.lineItems.entries()) {
    await stripe.invoiceItems.create(
      {
        customer: input.customerId,
        currency: input.currency,
        quantity: item.quantity,
        unit_amount: item.unitAmount,
        description: item.description,
        metadata: item.milestoneId ? { milestone_id: item.milestoneId } : undefined,
      },
      { idempotencyKey: `invoice-item:${input.idempotencyKeyBase}:${i}` },
    );
  }

  const invoice = await stripe.invoices.create(
    {
      customer: input.customerId,
      collection_method: "send_invoice",
      days_until_due: input.daysUntilDue,
      currency: input.currency,
      metadata: input.metadata,
    },
    { idempotencyKey: `invoice-create:${input.idempotencyKeyBase}` },
  );

  const finalized = await stripe.invoices.finalizeInvoice(invoice.id!, undefined, {
    idempotencyKey: `invoice-finalize:${input.idempotencyKeyBase}`,
  });

  const sent = await stripe.invoices.sendInvoice(finalized.id!, undefined, {
    idempotencyKey: `invoice-send:${input.idempotencyKeyBase}`,
  });

  return sent;
}
