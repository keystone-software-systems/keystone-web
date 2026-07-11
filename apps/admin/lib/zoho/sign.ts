import "server-only";
import { getZohoAccessToken } from "@/lib/zoho/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export interface SendContractInput {
  templateKey: string;
  title: string;
  signerName: string;
  signerEmail: string;
  fields: Record<string, string>;
}

export interface SendContractResult {
  requestId: string;
}

/**
 * Creates a signature request from a Zoho Sign template and submits it for
 * signature. Templates live in Zoho (legal copy edited there, not in code);
 * this only picks a template_key and supplies merge fields
 * (docs/admin-tool-design.md §7).
 *
 * Confirm exact Zoho Sign REST API request/response shapes against current
 * docs during real integration — this follows the documented `/templates`
 * flow but Zoho's exact field names vary by API version/region.
 */
export async function sendContractFromTemplate(input: SendContractInput): Promise<SendContractResult> {
  const accessToken = await getZohoAccessToken();

  const res = await fetch(
    `${process.env.ZOHO_API_DOMAIN}/api/v1/templates/${input.templateKey}/createdocument`,
    {
      method: "POST",
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        templates: {
          field_text_data: input.fields,
          actions: [
            {
              action_type: "SIGN",
              recipient_name: input.signerName,
              recipient_email: input.signerEmail,
            },
          ],
          notes: input.title,
        },
      }),
    },
  );

  if (!res.ok) {
    throw new Error(`Zoho Sign createdocument failed: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as { requests: { request_id: string } };
  return { requestId: data.requests.request_id };
}

/** Downloads the executed PDF and stores it in the private `contracts` bucket. */
export async function downloadAndStoreSignedPdf(zohoRequestId: string, contractId: string): Promise<string> {
  const accessToken = await getZohoAccessToken();

  const res = await fetch(`${process.env.ZOHO_API_DOMAIN}/api/v1/requests/${zohoRequestId}/pdf`, {
    headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`Zoho Sign PDF download failed: ${res.status} ${await res.text()}`);
  }

  const bytes = new Uint8Array(await res.arrayBuffer());
  const path = `${contractId}.pdf`;

  const admin = createAdminClient();
  const { error } = await admin.storage.from("contracts").upload(path, bytes, {
    contentType: "application/pdf",
    upsert: true,
  });
  if (error) throw new Error(`Failed to store signed PDF: ${error.message}`);

  return path;
}
