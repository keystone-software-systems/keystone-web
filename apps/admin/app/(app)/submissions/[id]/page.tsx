import { notFound } from "next/navigation";
import { createClient } from "@keystone/db";
import { requireRole } from "@keystone/admin-core";
import { StaffCommentThread } from "@/components/staff-comment-thread";
import { PromoteForm } from "@/components/promote-form";

export default async function SubmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireRole("owner", "staff", "viewer");
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("id, name, status, summary, engagement_type, created_at, clients(name, contacts(email, is_primary))")
    .eq("id", id)
    .maybeSingle();

  if (!project) notFound();

  const email = project.clients?.contacts.find((c) => c.is_primary)?.email
    ?? project.clients?.contacts[0]?.email;

  const { data: comments } = await supabase
    .from("submission_comments")
    .select("id, body, created_at, visible_to_client")
    .eq("project_id", id)
    .order("created_at", { ascending: true });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-blueprint-navy">{project.name ?? email ?? "Submission"}</h1>
        <span className="text-xs uppercase tracking-wide text-slate">{project.status}</span>
      </div>
      <p className="mt-1 text-sm text-slate">
        {email} · {project.engagement_type ?? "unspecified"}
      </p>
      {project.summary && (
        <p className="mt-4 whitespace-pre-wrap text-sm text-blueprint-navy">{project.summary}</p>
      )}

      {project.status === "submitted" && (
        <div className="mt-6">
          <PromoteForm projectId={project.id} />
        </div>
      )}

      <div className="mt-8">
        <StaffCommentThread projectId={project.id} comments={comments ?? []} />
      </div>
    </div>
  );
}
