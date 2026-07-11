import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/status-badge";
import { Money } from "@/components/money";
import { isNotionCreateEnabled } from "@/lib/notion/link";
import { StatusSelect } from "./status-select";
import { NotionLink } from "./notion-link";
import { Milestones } from "./milestones";
import { SendContractForm } from "./send-contract-form";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*, clients(id, name)")
    .eq("id", id)
    .maybeSingle();
  if (!project) notFound();

  const client = project.clients as unknown as { id: string; name: string };

  const [{ data: milestones }, { data: contacts }, { data: invoices }, { data: contracts }, { data: activity }] =
    await Promise.all([
      supabase.from("milestones").select("*").eq("project_id", id).order("sort_order"),
      supabase.from("contacts").select("*").eq("client_id", client.id),
      supabase.from("invoices").select("id, number, status, amount_due, currency, hosted_invoice_url").eq("project_id", id),
      supabase.from("contracts").select("id, title, status").eq("project_id", id),
      supabase.from("activity_log").select("id, summary, created_at").eq("entity_id", id).order("created_at", { ascending: false }).limit(20),
    ]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate">
            <Link href={`/clients/${client.id}`} className="hover:text-technical-blue hover:underline">
              {client.name}
            </Link>
          </p>
          <h1 className="font-mono text-xl font-semibold">{project.name}</h1>
          {project.summary && <p className="mt-1 text-sm text-slate">{project.summary}</p>}
        </div>
        <StatusSelect projectId={project.id} status={project.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col gap-8">
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate">Milestones</h2>
            <Milestones projectId={project.id} clientId={client.id} milestones={milestones ?? []} />
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate">Invoices</h2>
            <div className="overflow-hidden rounded-lg border border-pale-blue bg-white">
              {(invoices ?? []).length === 0 && <p className="p-4 text-sm text-slate">No invoices yet.</p>}
              {(invoices ?? []).map((inv) => (
                <div key={inv.id} className="flex items-center justify-between border-b border-off-white px-4 py-2.5 text-sm last:border-none">
                  <a href={inv.hosted_invoice_url ?? "#"} target="_blank" rel="noreferrer" className="font-medium text-technical-blue hover:underline">
                    {inv.number ?? "Draft"}
                  </a>
                  <div className="flex items-center gap-3">
                    <Money amount={inv.amount_due} currency={inv.currency} />
                    <StatusBadge status={inv.status} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate">Contract</h2>
            <div className="flex flex-col gap-3">
              <div className="overflow-hidden rounded-lg border border-pale-blue bg-white">
                {(contracts ?? []).length === 0 && <p className="p-4 text-sm text-slate">No contract sent yet.</p>}
                {(contracts ?? []).map((c) => (
                  <div key={c.id} className="flex items-center justify-between border-b border-off-white px-4 py-2.5 text-sm last:border-none">
                    <span className="font-medium">{c.title}</span>
                    <StatusBadge status={c.status} />
                  </div>
                ))}
              </div>
              <SendContractForm
                clientId={client.id}
                projectId={project.id}
                projectName={project.name}
                contacts={contacts ?? []}
              />
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate">Activity</h2>
            <div className="rounded-lg border border-pale-blue bg-white">
              {(activity ?? []).length === 0 && <p className="p-4 text-sm text-slate">No activity yet.</p>}
              {(activity ?? []).map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-4 border-b border-off-white px-4 py-2.5 text-sm last:border-none">
                  <span>{a.summary}</span>
                  <span className="shrink-0 text-xs text-slate">{new Date(a.created_at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate">Overview</h2>
            <div className="rounded-lg border border-pale-blue bg-white p-4 text-sm">
              <dl className="flex flex-col gap-2">
                <div>
                  <dt className="text-xs uppercase text-slate">Service line</dt>
                  <dd className="capitalize">{project.service_line?.replace(/_/g, " ") ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-slate">Pricing</dt>
                  <dd className="capitalize">
                    {project.pricing_type}
                    {project.amount_total ? (
                      <>
                        {" · "}
                        <Money amount={project.amount_total} currency={project.currency} />
                      </>
                    ) : null}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-slate">Dates</dt>
                  <dd>
                    {project.start_date ?? "—"} → {project.target_end_date ?? "—"}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate">Notion doc</h2>
            <NotionLink
              projectId={project.id}
              projectName={project.name}
              notionUrl={project.notion_url}
              createEnabled={isNotionCreateEnabled()}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
