import { notFound } from "next/navigation";
import { createClient } from "@keystone/db";
import { requireRole } from "@/lib/auth";
import { BRAND_LABEL, label } from "@/lib/segments";
import { ProspectStatusForm } from "@/components/prospect-status-form";
import { ProspectTouchLog } from "@/components/prospect-touch-log";

export default async function ProspectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireRole("owner", "staff", "viewer");
  const supabase = await createClient();

  const { data: prospect } = await supabase
    .from("prospects")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!prospect) notFound();

  const { data: activity } = await supabase
    .from("activity_log")
    .select("id, action, summary, created_at")
    .eq("entity_type", "prospect")
    .eq("entity_id", id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-blueprint-navy">{prospect.name}</h1>
        <span className="text-xs uppercase tracking-wide text-slate">
          {BRAND_LABEL[prospect.brand]} · {label(prospect.segment)}
        </span>
      </div>
      <p className="mt-1 text-sm text-slate">
        {[prospect.title, prospect.company].filter(Boolean).join(" at ") || "No title/company on file"}
      </p>

      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
        {prospect.email && <Detail label="Email" value={prospect.email} />}
        {prospect.linkedin_url && <Detail label="LinkedIn" value={prospect.linkedin_url} href={prospect.linkedin_url} />}
        {prospect.website_url && <Detail label="Website" value={prospect.website_url} href={prospect.website_url} />}
        {prospect.location && <Detail label="Location" value={prospect.location} />}
        {prospect.source && <Detail label="Source" value={prospect.source} />}
        {prospect.last_contacted_at && (
          <Detail label="Last contacted" value={new Date(prospect.last_contacted_at).toLocaleDateString()} />
        )}
      </dl>

      {prospect.notes && <p className="mt-4 whitespace-pre-wrap text-sm text-blueprint-navy">{prospect.notes}</p>}

      <div className="mt-6">
        <ProspectStatusForm prospectId={prospect.id} status={prospect.status} nextFollowUpOn={prospect.next_follow_up_on} />
      </div>

      <div className="mt-8">
        <ProspectTouchLog prospectId={prospect.id} activity={activity ?? []} />
      </div>
    </div>
  );
}

function Detail({ label: fieldLabel, value, href }: { label: string; value: string; href?: string }) {
  return (
    <>
      <dt className="text-slate">{fieldLabel}</dt>
      <dd className="text-blueprint-navy">
        {href ? (
          <a href={href} target="_blank" rel="noreferrer" className="hover:text-technical-blue hover:underline">
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </>
  );
}
