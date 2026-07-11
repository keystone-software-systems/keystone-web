import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/status-badge";
import { NewProjectForm } from "./new-project-form";

const STATUS_COLUMNS = [
  "lead",
  "scoping",
  "contracting",
  "active",
  "handoff",
  "closed",
] as const;

export default async function ProjectsPage() {
  const supabase = await createClient();
  const [{ data: projects }, { data: clients }] = await Promise.all([
    supabase
      .from("projects")
      .select("id, name, status, service_line, client_id, clients(name)")
      .order("updated_at", { ascending: false }),
    supabase.from("clients").select("id, name").order("name"),
  ]);

  const byStatus = STATUS_COLUMNS.map((status) => ({
    status,
    items: (projects ?? []).filter((p) => p.status === status),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-mono text-xl font-semibold">Projects</h1>
      </div>

      <NewProjectForm clients={clients ?? []} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {byStatus.map(({ status, items }) => (
          <div key={status} className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <StatusBadge status={status} />
              <span className="text-xs text-slate">{items.length}</span>
            </div>
            <div className="flex flex-col gap-2">
              {items.map((p) => (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="rounded-lg border border-pale-blue bg-white p-3 text-sm hover:border-technical-blue"
                >
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-slate">
                    {(p.clients as unknown as { name: string } | null)?.name}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
