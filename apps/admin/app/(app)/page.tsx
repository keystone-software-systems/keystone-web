import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/status-badge";
import { Money } from "@/components/money";
import { isPastDue } from "@/lib/dates";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [projectsRes, invoicesRes, contractsRes, activityRes] = await Promise.all([
    supabase
      .from("projects")
      .select("id, name, status, client_id, clients(name)")
      .not("status", "in", "(closed,lost)")
      .order("updated_at", { ascending: false })
      .limit(8),
    supabase
      .from("invoices")
      .select("id, number, status, amount_due, currency, due_at, client_id, clients(name)")
      .in("status", ["open", "draft"])
      .order("due_at", { ascending: true })
      .limit(8),
    supabase
      .from("contracts")
      .select("id, title, status, client_id, clients(name)")
      .in("status", ["draft", "sent", "viewed"])
      .order("updated_at", { ascending: false })
      .limit(8),
    supabase
      .from("activity_log")
      .select("id, summary, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const projects = projectsRes.data ?? [];
  const invoices = invoicesRes.data ?? [];
  const contracts = contractsRes.data ?? [];
  const activity = activityRes.data ?? [];

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-mono text-xl font-semibold">Dashboard</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <DashboardCard title="Active projects" href="/projects">
          {projects.length === 0 && <EmptyRow />}
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="flex items-center justify-between gap-2 py-2 text-sm hover:text-technical-blue"
            >
              <span className="truncate">
                {p.name}
                <span className="ml-1 text-slate">
                  · {(p.clients as unknown as { name: string } | null)?.name}
                </span>
              </span>
              <StatusBadge status={p.status} />
            </Link>
          ))}
        </DashboardCard>

        <DashboardCard title="Outstanding invoices" href="/invoices">
          {invoices.length === 0 && <EmptyRow />}
          {invoices.map((inv) => {
            const overdue = isPastDue(inv.due_at);
            return (
              <Link
                key={inv.id}
                href={`/invoices`}
                className="flex items-center justify-between gap-2 py-2 text-sm hover:text-technical-blue"
              >
                <span className="truncate">
                  {inv.number ?? "Draft"}
                  <span className="ml-1 text-slate">
                    · {(inv.clients as unknown as { name: string } | null)?.name}
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  <Money amount={inv.amount_due} currency={inv.currency} />
                  <StatusBadge status={overdue ? "overdue" : inv.status} />
                </span>
              </Link>
            );
          })}
        </DashboardCard>

        <DashboardCard title="Contracts awaiting signature" href="/contracts">
          {contracts.length === 0 && <EmptyRow />}
          {contracts.map((c) => (
            <Link
              key={c.id}
              href="/contracts"
              className="flex items-center justify-between gap-2 py-2 text-sm hover:text-technical-blue"
            >
              <span className="truncate">
                {c.title}
                <span className="ml-1 text-slate">
                  · {(c.clients as unknown as { name: string } | null)?.name}
                </span>
              </span>
              <StatusBadge status={c.status} />
            </Link>
          ))}
        </DashboardCard>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate uppercase tracking-wide">
          Recent activity
        </h2>
        <div className="rounded-lg border border-pale-blue bg-white">
          {activity.length === 0 && <div className="p-4"><EmptyRow /></div>}
          {activity.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between gap-4 border-b border-off-white px-4 py-2.5 text-sm last:border-none"
            >
              <span>{a.summary}</span>
              <span className="shrink-0 text-xs text-slate">
                {new Date(a.created_at).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  href,
  children,
}: {
  title: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-pale-blue bg-white p-4">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate uppercase tracking-wide">{title}</h2>
        <Link href={href} className="text-xs font-medium text-technical-blue hover:underline">
          View all
        </Link>
      </div>
      <div className="flex flex-col divide-y divide-off-white">{children}</div>
    </div>
  );
}

function EmptyRow() {
  return <p className="py-2 text-sm text-slate">Nothing here.</p>;
}
