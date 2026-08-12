import { createClient } from "@keystone/db";
import { requireRole, hasBrandAccess, NoBrandAccess, ProspectForm } from "@keystone/admin-core";
import { BRAND } from "@/lib/brand";

export default async function NewProspectPage({
  searchParams,
}: {
  searchParams: Promise<{ feed_item_id?: string }>;
}) {
  const profile = await requireRole("owner", "staff");
  if (!(await hasBrandAccess(profile, BRAND))) return <NoBrandAccess />;

  const { feed_item_id: feedItemId } = await searchParams;

  let defaults;
  if (feedItemId) {
    const supabase = await createClient();
    const { data: item } = await supabase
      .from("prospect_feed_items")
      .select("segment, title, url, snippet")
      .eq("id", feedItemId)
      .maybeSingle();
    if (item) {
      defaults = {
        segment: item.segment,
        name: item.title,
        source: "Product Hunt / feed",
        websiteUrl: item.url ?? undefined,
        notes: item.snippet ?? undefined,
      };
    }
  }

  return (
    <div>
      <h1 className="text-lg font-semibold text-blueprint-navy">New prospect</h1>
      <div className="mt-6 max-w-lg">
        <ProspectForm brand={BRAND} feedItemId={feedItemId} defaults={defaults} />
      </div>
    </div>
  );
}
