import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@keystone/db";
import type { Database } from "@keystone/db";
import { fetchProductHuntTopic } from "@/lib/feed-sources/producthunt";
import { fetchRssFeed } from "@/lib/feed-sources/rss";
import type { FeedItemCandidate } from "@/lib/feed-sources/types";

type Brand = Database["public"]["Enums"]["brand"];
type ProspectSegment = Database["public"]["Enums"]["prospect_segment"];
type Json = Database["public"]["Tables"]["prospect_feed_items"]["Row"]["raw_json"];

// Vercel Cron calls this directly (see vercel.json) with no Supabase session — protected by
// CRON_SECRET instead, same shape as the Stripe/Zoho webhook routes in docs/admin-tool-design.md.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data: sources, error } = await supabase.from("feed_sources").select("*").eq("active", true);

  if (error) {
    console.error("prospect-feeds: could not load feed_sources", error);
    return NextResponse.json({ error: "could not load feed sources" }, { status: 500 });
  }

  const results = [];
  for (const source of sources ?? []) {
    try {
      const candidates = await fetchForSource(source.kind, source.config_json as Record<string, string>);
      const inserted = await upsertCandidates(supabase, source.id, source.brand, source.segment, candidates);
      await supabase.from("feed_sources").update({ last_run_at: new Date().toISOString() }).eq("id", source.id);
      results.push({ key: source.key, fetched: candidates.length, inserted });
    } catch (err) {
      console.error(`prospect-feeds: source ${source.key} failed`, err);
      results.push({ key: source.key, error: String(err) });
    }
  }

  return NextResponse.json({ results });
}

async function fetchForSource(kind: string, config: Record<string, string>): Promise<FeedItemCandidate[]> {
  if (kind === "producthunt_topic") return fetchProductHuntTopic(config.topic);
  if (kind === "rss") return fetchRssFeed(config.url);
  throw new Error(`Unknown feed source kind: ${kind}`);
}

async function upsertCandidates(
  supabase: ReturnType<typeof createAdminClient>,
  feedSourceId: string,
  brand: Brand,
  segment: ProspectSegment,
  candidates: FeedItemCandidate[],
): Promise<number> {
  if (!candidates.length) return 0;

  const { error, count } = await supabase
    .from("prospect_feed_items")
    .upsert(
      candidates.map((c) => ({
        feed_source_id: feedSourceId,
        brand,
        segment,
        external_id: c.externalId,
        title: c.title,
        url: c.url ?? null,
        snippet: c.snippet ?? null,
        raw_json: (c.raw as Json) ?? null,
      })),
      { onConflict: "feed_source_id,external_id", ignoreDuplicates: true, count: "exact" },
    );

  if (error) {
    console.error("prospect-feeds: upsert failed", error);
    return 0;
  }

  return count ?? 0;
}
