import Link from "next/link";
import { createClient } from "@keystone/db";
import { requireRole } from "@/lib/auth";

const STATUS_LABELS: Record<string, string> = {
  submitted: "Submitted",
  lead: "In review",
  scoping: "Scoping",
  contracting: "Contracting",
  active: "Active",
  handoff: "Handoff",
  closed: "Closed",
  lost: "Closed",
};

export default async function DashboardPage() {
  // RLS (is_project_client / is_project_engineer) scopes this to the
  // caller's own rows — no manual client_id/engineer_id filtering needed.
  const profile = await requireRole("client", "engineer");
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, status, summary, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-lg font-semibold text-blueprint-navy">Dashboard</h1>
      <p className="mt-1 text-sm text-slate">Signed in as {profile.email}.</p>

      {!projects?.length ? (
        <div className="mt-8 rounded-md border border-dashed border-slate/30 p-8 text-center text-sm text-slate">
          No submissions yet.
        </div>
      ) : (
        <ul className="mt-8 flex flex-col gap-3">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                href={`/projects/${project.id}`}
                className="block rounded-md border border-slate/20 bg-white p-4 hover:border-technical-blue"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-blueprint-navy">
                    {project.name ?? "Untitled submission"}
                  </span>
                  <span className="text-xs uppercase tracking-wide text-slate">
                    {STATUS_LABELS[project.status] ?? project.status}
                  </span>
                </div>
                {project.summary && (
                  <p className="mt-1 line-clamp-2 text-sm text-slate">{project.summary}</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
