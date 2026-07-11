import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/status-badge";
import { AddContactForm } from "./add-contact-form";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: client }, { data: contacts }, { data: projects }] = await Promise.all([
    supabase.from("clients").select("*").eq("id", id).maybeSingle(),
    supabase.from("contacts").select("*").eq("client_id", id).order("is_primary", { ascending: false }),
    supabase.from("projects").select("id, name, status, service_line").eq("client_id", id).order("created_at", { ascending: false }),
  ]);

  if (!client) notFound();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-mono text-xl font-semibold">{client.name}</h1>
        {client.legal_name && <p className="text-sm text-slate">{client.legal_name}</p>}
      </div>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate">Projects</h2>
            <div className="overflow-hidden rounded-lg border border-pale-blue bg-white">
              {(projects ?? []).length === 0 && (
                <p className="p-4 text-sm text-slate">No projects yet.</p>
              )}
              {(projects ?? []).map((p) => (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="flex items-center justify-between border-b border-off-white px-4 py-2.5 text-sm last:border-none hover:bg-off-white"
                >
                  <span className="font-medium">{p.name}</span>
                  <StatusBadge status={p.status} />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate">Contacts</h2>
            <div className="overflow-hidden rounded-lg border border-pale-blue bg-white">
              {(contacts ?? []).length === 0 && (
                <p className="p-4 text-sm text-slate">No contacts yet.</p>
              )}
              {(contacts ?? []).map((c) => (
                <div key={c.id} className="flex items-center justify-between border-b border-off-white px-4 py-2.5 text-sm last:border-none">
                  <span>
                    <span className="font-medium">{c.name}</span>
                    {c.title && <span className="text-slate"> · {c.title}</span>}
                    {c.is_primary && <span className="ml-2 text-xs text-technical-blue">primary</span>}
                  </span>
                  <span className="text-slate">{c.email}</span>
                </div>
              ))}
            </div>
            <AddContactForm clientId={client.id} />
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate">Billing</h2>
          <div className="rounded-lg border border-pale-blue bg-white p-4 text-sm">
            <dl className="flex flex-col gap-2">
              <div>
                <dt className="text-xs text-slate uppercase">Billing email</dt>
                <dd>{client.billing_email ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate uppercase">Stripe customer</dt>
                <dd>{client.stripe_customer_id ?? "Not yet created"}</dd>
              </div>
              {client.notes && (
                <div>
                  <dt className="text-xs text-slate uppercase">Notes</dt>
                  <dd className="whitespace-pre-wrap">{client.notes}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </section>
    </div>
  );
}
