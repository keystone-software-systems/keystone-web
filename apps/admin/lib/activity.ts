import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

interface LogActivityInput {
  actorId: string | null;
  entityType: string;
  entityId: string;
  action: string;
  summary: string;
  metadata?: Record<string, unknown>;
}

/**
 * Appends one row to the audit trail. Uses the admin client because
 * webhook handlers (no signed-in user) log activity too, e.g. "Invoice #12
 * paid" triggered by Stripe rather than a Server Action.
 */
export async function logActivity(input: LogActivityInput) {
  const supabase = createAdminClient();
  await supabase.from("activity_log").insert({
    actor_id: input.actorId,
    entity_type: input.entityType,
    entity_id: input.entityId,
    action: input.action,
    summary: input.summary,
    metadata_json: input.metadata ?? null,
  });
}
