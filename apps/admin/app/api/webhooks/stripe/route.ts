import { NextResponse, type NextRequest } from "next/server";
import { getStripe } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { logActivity } from "@/lib/activity";
import type Stripe from "stripe";
import type { InvoiceStatus } from "@/lib/supabase/types";

export const runtime = "nodejs";

/**
 * Stripe webhook: pure status-follower. Stripe is the source of truth for
 * money; this handler only ever syncs cached status onto our `invoices`
 * row (docs/admin-tool-design.md §6). Idempotent via `integration_events`.
 */
export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  const rawBody = await request.text();

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { error: insertError } = await admin.from("integration_events").insert({
    provider: "stripe",
    event_type: event.type,
    external_id: event.id,
    payload_json: event as unknown as Record<string, unknown>,
  });
  if (insertError) {
    // Unique violation on external_id => already processed; ack and stop.
    return NextResponse.json({ received: true, replay: true });
  }

  const invoice = event.data.object as Stripe.Invoice;

  const statusByEventType: Record<string, InvoiceStatus> = {
    "invoice.paid": "paid",
    "invoice.payment_failed": "open",
    "invoice.finalized": "open",
    "invoice.sent": "open",
    "invoice.voided": "void",
    "invoice.marked_uncollectible": "uncollectible",
  };

  const nextStatus = statusByEventType[event.type];
  if (nextStatus && invoice?.id) {
    const { data: row } = await admin
      .from("invoices")
      .select("id, project_id, client_id")
      .eq("stripe_invoice_id", invoice.id)
      .maybeSingle();

    if (row) {
      await admin
        .from("invoices")
        .update({
          status: nextStatus,
          amount_paid: invoice.amount_paid ?? undefined,
          paid_at: event.type === "invoice.paid" ? new Date().toISOString() : undefined,
          hosted_invoice_url: invoice.hosted_invoice_url ?? undefined,
          pdf_url: invoice.invoice_pdf ?? undefined,
        })
        .eq("id", row.id);

      if (event.type === "invoice.paid") {
        await admin.from("milestones").update({ status: "paid" }).eq("invoice_id", row.id);
      }

      await logActivity({
        actorId: null,
        entityType: "invoice",
        entityId: row.id,
        action: event.type,
        summary: `Invoice ${invoice.number ?? row.id} → ${nextStatus} (Stripe)`,
      });
    }
  }

  await admin
    .from("integration_events")
    .update({ processed_at: new Date().toISOString() })
    .eq("external_id", event.id);

  return NextResponse.json({ received: true });
}
