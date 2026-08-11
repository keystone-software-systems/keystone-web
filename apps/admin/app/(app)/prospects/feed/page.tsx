import Link from "next/link";
import { createClient } from "@keystone/db";
import { requireRole } from "@/lib/auth";
import { getAccessibleBrands } from "@/lib/brands";
import { BRAND_LABEL, label } from "@/lib/segments";
import { DismissFeedItemForm } from "@/components/dismiss-feed-item-form";

export default async function ProspectFeedPage() {
  const profile = await requireRole("owner", "staff", "viewer");
  const accessibleBrands = await getAccessibleBrands(profile);

  if (!accessibleBrands.length) {
    return <p className="text-sm text-slate">No brand access granted yet.</p>;
  }

  const supabase = await createClient();
  const { data: items } = await supabase
    .from("prospect_feed_items")
    .select("id, brand, segment, title, url, snippet, created_at")
    .in("brand", accessibleBrands)
    .eq("status", "new")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-blueprint-navy">Sourcing inbox</h1>
        <Link href="/prospects" className="text-sm font-medium text-technical-blue hover:underline">
          ← Prospects
        </Link>
      </div>
      <p className="mt-1 text-sm text-slate">
        Candidates from automated feeds, awaiting a look. Nothing here becomes a prospect until you promote it.
      </p>

      {!items?.length ? (
        <div className="mt-8 rounded-md border border-dashed border-slate/30 p-8 text-center text-sm text-slate">
          Nothing waiting on review.
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {items.map((item) => (
            <li key={item.id} className="rounded-md border border-slate/20 bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-blueprint-navy">{item.title}</span>
                <span className="text-xs uppercase tracking-wide text-slate">
                  {BRAND_LABEL[item.brand]} · {label(item.segment)}
                </span>
              </div>
              {item.snippet && <p className="mt-1 text-sm text-slate">{item.snippet}</p>}
              {item.url && (
                <a href={item.url} target="_blank" rel="noreferrer" className="mt-1 block text-sm text-technical-blue hover:underline">
                  {item.url}
                </a>
              )}
              <div className="mt-3 flex items-center gap-4">
                <Link href={`/prospects/new?feed_item_id=${item.id}`} className="text-sm font-medium text-technical-blue hover:underline">
                  Promote →
                </Link>
                <DismissFeedItemForm feedItemId={item.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
