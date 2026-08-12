import Link from "next/link";
import { createClient } from "@keystone/db";
import { requireRole } from "@keystone/admin-core";

export default async function SubmissionsPage() {
  await requireRole("owner", "staff", "viewer");
  const supabase = await createClient();

  const { data: submissions } = await supabase
    .from("projects")
    .select("id, summary, engagement_type, created_at, clients(name, contacts(email, is_primary))")
    .eq("status", "submitted")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-lg font-semibold text-blueprint-navy">Submissions</h1>
      <p className="mt-1 text-sm text-slate">New portal intake, awaiting review.</p>

      {!submissions?.length ? (
        <div className="mt-8 rounded-md border border-dashed border-slate/30 p-8 text-center text-sm text-slate">
          Nothing waiting on review.
        </div>
      ) : (
        <ul className="mt-8 flex flex-col gap-3">
          {submissions.map((project) => {
            const email = project.clients?.contacts.find((c) => c.is_primary)?.email
              ?? project.clients?.contacts[0]?.email;
            return (
              <li key={project.id}>
                <Link
                  href={`/submissions/${project.id}`}
                  className="block rounded-md border border-slate/20 bg-white p-4 hover:border-technical-blue"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-blueprint-navy">{email ?? "Unknown contact"}</span>
                    <span className="text-xs uppercase tracking-wide text-slate">
                      {project.engagement_type ?? "unspecified"}
                    </span>
                  </div>
                  {project.summary && (
                    <p className="mt-1 line-clamp-2 text-sm text-slate">{project.summary}</p>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
