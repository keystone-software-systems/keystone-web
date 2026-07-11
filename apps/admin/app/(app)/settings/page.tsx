import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { UserRow } from "./user-row";
import { InviteForm } from "./invite-form";

export default async function SettingsPage() {
  const self = await requireRole("owner");
  const supabase = await createClient();

  const [{ data: profiles }, { data: recentEvents }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at"),
    supabase
      .from("integration_events")
      .select("provider, event_type, processed_at, created_at")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const lastByProvider = ["stripe", "zoho"].map((provider) => ({
    provider,
    event: (recentEvents ?? []).find((e) => e.provider === provider) ?? null,
  }));
  const unprocessedCount = (recentEvents ?? []).filter((e) => !e.processed_at).length;

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-mono text-xl font-semibold">Settings</h1>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate">Users &amp; roles</h2>
        <div className="overflow-hidden rounded-lg border border-pale-blue bg-white">
          {(profiles ?? []).map((p) => (
            <UserRow key={p.id} profile={p} isSelf={p.id === self.id} />
          ))}
        </div>
        <div className="mt-3">
          <InviteForm />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate">Integration health</h2>
        <div className="rounded-lg border border-pale-blue bg-white p-4 text-sm">
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {lastByProvider.map(({ provider, event }) => (
              <div key={provider}>
                <dt className="text-xs uppercase text-slate">{provider} — last webhook</dt>
                <dd>
                  {event
                    ? `${event.event_type} · ${new Date(event.created_at).toLocaleString()}`
                    : "No events received yet"}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs text-slate">
            {unprocessedCount} unprocessed event{unprocessedCount === 1 ? "" : "s"} in the last 20.
          </p>
        </div>
      </section>
    </div>
  );
}
