import { NextResponse, type NextRequest } from "next/server";
import crypto from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { logActivity } from "@/lib/activity";
import { downloadAndStoreSignedPdf } from "@/lib/zoho/sign";
import type { ContractStatus } from "@/lib/supabase/types";

export const runtime = "nodejs";

interface ZohoWebhookPayload {
  requests: {
    request_id: string;
    request_status: string;
    request_name: string;
  };
}

const STATUS_MAP: Record<string, ContractStatus> = {
  viewed: "viewed",
  signed: "signed",
  completed: "signed",
  declined: "declined",
  expired: "expired",
};

/**
 * Zoho Sign webhook: verifies the shared secret configured when the webhook
 * was registered, then syncs `contracts.status`. On signed/completed,
 * downloads the executed PDF into private Storage
 * (docs/admin-tool-design.md §7).
 *
 * Confirm Zoho's exact signature/secret-verification scheme and event
 * payload shape against current Zoho Sign docs before go-live — this
 * assumes a shared-secret header, which is the common pattern but varies
 * by API version/region.
 */
export async function POST(request: NextRequest) {
  const providedSecret = request.headers.get("x-zoho-webhook-secret");
  const expectedSecret = process.env.ZOHO_WEBHOOK_SECRET;

  if (!expectedSecret || !providedSecret || !timingSafeEqual(providedSecret, expectedSecret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = (await request.json()) as ZohoWebhookPayload;
  const { request_id: zohoRequestId, request_status: rawStatus } = payload.requests;

  const admin = createAdminClient();

  const eventId = `${zohoRequestId}:${rawStatus}`;
  const { error: insertError } = await admin.from("integration_events").insert({
    provider: "zoho",
    event_type: rawStatus,
    external_id: eventId,
    payload_json: payload as unknown as Record<string, unknown>,
  });
  if (insertError) {
    return NextResponse.json({ received: true, replay: true });
  }

  const nextStatus = STATUS_MAP[rawStatus];
  if (nextStatus) {
    const { data: contract } = await admin
      .from("contracts")
      .select("id, title")
      .eq("zoho_request_id", zohoRequestId)
      .maybeSingle();

    if (contract) {
      const updates: { status: ContractStatus; signed_at?: string; signed_pdf_path?: string } = {
        status: nextStatus,
      };
      if (nextStatus === "signed") {
        updates.signed_at = new Date().toISOString();
        try {
          updates.signed_pdf_path = await downloadAndStoreSignedPdf(zohoRequestId, contract.id);
        } catch {
          // Status still syncs even if the PDF fetch fails; retry via a
          // manual "Sync" action rather than failing the whole webhook ack.
        }
      }

      await admin.from("contracts").update(updates).eq("id", contract.id);

      await logActivity({
        actorId: null,
        entityType: "contract",
        entityId: contract.id,
        action: rawStatus,
        summary: `Contract "${contract.title}" → ${nextStatus} (Zoho)`,
      });
    }
  }

  await admin
    .from("integration_events")
    .update({ processed_at: new Date().toISOString() })
    .eq("external_id", eventId);

  return NextResponse.json({ received: true });
}

function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}
