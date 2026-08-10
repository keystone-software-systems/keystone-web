import { createClient } from "@keystone/db";
import { requireRole } from "@/lib/auth";
import { getAccessibleBrands } from "@/lib/brands";
import { ProspectForm } from "@/components/prospect-form";

export default async function NewProspectPage({
  searchParams,
}: {
  searchParams: Promise<{ feed_item_id?: string }>;
}) {
  const profile = await requireRole("owner", "staff");
  const accessibleBrands = await getAccessibleBrands(profile);
  const { feed_item_id: feedItemId } = await searchParams;

  if (!accessibleBrands.length) {
    return <p className="text-sm text-slate">No brand access granted yet.</p>;
  }

  let defaults;
  if (feedItemId) {
    const supabase = await createClient();
    const { data: item } = await supabase
      .from("prospect_feed_items")
      .select("brand, segment, title, url, snippet")
      .eq("id", feedItemId)
      .maybeSingle();

    if (item) {
      defaults = {
        brand: item.brand,
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
        <ProspectForm accessibleBrands={accessibleBrands} feedItemId={feedItemId} defaults={defaults} />
      </div>
    </div>
  );
}
