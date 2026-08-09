import { notFound } from "next/navigation";
import { createClient } from "@keystone/db";
import { requireRole } from "@/lib/auth";
import { CommentThread } from "@/components/comment-thread";

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

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await requireRole("client", "engineer");
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("id, name, status, summary, engagement_type, created_at")
    .eq("id", id)
    .maybeSingle();

  if (!project) notFound();

  const { data: comments } = await supabase
    .from("submission_comments")
    .select("id, body, created_at, author_id")
    .eq("project_id", id)
    .order("created_at", { ascending: true });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-blueprint-navy">
          {project.name ?? "Untitled submission"}
        </h1>
        <span className="text-xs uppercase tracking-wide text-slate">
          {STATUS_LABELS[project.status] ?? project.status}
        </span>
      </div>
      {project.summary && (
        <p className="mt-4 whitespace-pre-wrap text-sm text-blueprint-navy">{project.summary}</p>
      )}

      <div className="mt-8">
        <CommentThread projectId={project.id} comments={comments ?? []} currentUserId={profile.id} />
      </div>
    </div>
  );
}
