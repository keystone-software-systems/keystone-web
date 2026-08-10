import Link from "next/link";
import { createClient } from "@keystone/db";
import { requireRole } from "@/lib/auth";
import { getAccessibleBrands, type Brand } from "@/lib/brands";
import { BRAND_LABEL, SEGMENTS_BY_BRAND, STATUS_OPTIONS, label, type ProspectSegment, type ProspectStatus } from "@/lib/segments";

type SearchParams = { brand?: string; segment?: string; status?: string };

export default async function ProspectsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const profile = await requireRole("owner", "staff", "viewer");
  const accessibleBrands = await getAccessibleBrands(profile);
  const params = await searchParams;

  if (!accessibleBrands.length) {
    return <p className="text-sm text-slate">No brand access granted yet.</p>;
  }

  const brand = (
    accessibleBrands.includes(params.brand as Brand) ? params.brand : accessibleBrands[0]
  ) as Brand;

  const supabase = await createClient();
  let query = supabase
    .from("prospects")
    .select("id, name, company, segment, status, next_follow_up_on")
    .eq("brand", brand)
    .order("next_follow_up_on", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (params.segment) query = query.eq("segment", params.segment as ProspectSegment);
  if (params.status) query = query.eq("status", params.status as ProspectStatus);

  const { data: prospects } = await query;

  const today = new Date().toISOString().slice(0, 10);
  const dueCount = prospects?.filter((p) => p.next_follow_up_on && p.next_follow_up_on <= today).length ?? 0;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-blueprint-navy">Prospects</h1>
        <Link href="/prospects/new" className="text-sm font-medium text-technical-blue hover:underline">
          + New prospect
        </Link>
      </div>

      <div className="mt-4 flex items-center gap-2 border-b border-slate/20">
        {accessibleBrands.map((b) => (
          <Link
            key={b}
            href={`/prospects?brand=${b}`}
            className={`px-3 py-2 text-sm font-medium ${
              b === brand ? "border-b-2 border-technical-blue text-blueprint-navy" : "text-slate"
            }`}
          >
            {BRAND_LABEL[b]}
          </Link>
        ))}
        <Link href="/prospects/feed" className="ml-auto px-3 py-2 text-sm text-slate hover:text-technical-blue">
          Sourcing inbox →
        </Link>
      </div>

      <form method="get" className="mt-4 flex flex-wrap items-center gap-2">
        <input type="hidden" name="brand" value={brand} />
        <select
          name="segment"
          defaultValue={params.segment ?? ""}
          className="rounded-md border border-slate/30 bg-white px-2 py-1.5 text-sm text-blueprint-navy"
        >
          <option value="">All segments</option>
          {SEGMENTS_BY_BRAND[brand].map((s) => (
            <option key={s} value={s}>
              {label(s)}
            </option>
          ))}
        </select>
        <select
          name="status"
          defaultValue={params.status ?? ""}
          className="rounded-md border border-slate/30 bg-white px-2 py-1.5 text-sm text-blueprint-navy"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {label(s)}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-md border border-slate/30 px-3 py-1.5 text-sm text-slate hover:border-technical-blue">
          Filter
        </button>
      </form>

      {dueCount > 0 && <p className="mt-3 text-sm font-medium text-red-600">{dueCount} due for follow-up</p>}

      {!prospects?.length ? (
        <div className="mt-8 rounded-md border border-dashed border-slate/30 p-8 text-center text-sm text-slate">
          No prospects yet for {BRAND_LABEL[brand]}.
        </div>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {prospects.map((p) => {
            const due = Boolean(p.next_follow_up_on && p.next_follow_up_on <= today);
            return (
              <li key={p.id}>
                <Link
                  href={`/prospects/${p.id}`}
                  className="flex items-center justify-between rounded-md border border-slate/20 bg-white p-3 hover:border-technical-blue"
                >
                  <div>
                    <span className="font-medium text-blueprint-navy">{p.name}</span>
                    {p.company && <span className="ml-2 text-sm text-slate">{p.company}</span>}
                    <p className="text-xs uppercase tracking-wide text-slate">{label(p.segment)}</p>
                  </div>
                  <div className="text-right text-xs text-slate">
                    <p className="uppercase tracking-wide">{label(p.status)}</p>
                    {p.next_follow_up_on && (
                      <p className={due ? "font-medium text-red-600" : ""}>Follow up {p.next_follow_up_on}</p>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
