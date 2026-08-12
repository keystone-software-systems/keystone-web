import { XMLParser } from "fast-xml-parser";
import type { FeedItemCandidate } from "./types";

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });

function toArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function text(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "#text" in value) {
    return String((value as { "#text": unknown })["#text"]);
  }
  return undefined;
}

function stripTags(value: string | undefined): string | undefined {
  return value?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

/** RSS 2.0 <item> or Atom <entry> link — Atom links are `{ @_href, @_rel }`, RSS links are plain text. */
function itemLink(item: Record<string, unknown>): string | undefined {
  if (typeof item.link === "string") return item.link;
  const links = toArray(item.link as Record<string, unknown> | Record<string, unknown>[]);
  const href = links.find((l) => !l["@_rel"] || l["@_rel"] === "alternate")?.["@_href"];
  return typeof href === "string" ? href : undefined;
}

/** Fetches an RSS 2.0 or Atom feed (e.g. a Google Alerts RSS URL) and normalizes entries. */
export async function fetchRssFeed(url: string): Promise<FeedItemCandidate[]> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`RSS fetch error for ${url}: ${res.status}`);
  }

  const xml = await res.text();
  const doc = parser.parse(xml);

  const rssItems = toArray(doc.rss?.channel?.item);
  const atomEntries = toArray(doc.feed?.entry);

  const items: FeedItemCandidate[] = rssItems.length
    ? rssItems.map((item) => ({
        externalId: text(item.guid) ?? itemLink(item) ?? text(item.title) ?? "",
        title: text(item.title) ?? "(untitled)",
        url: itemLink(item),
        snippet: stripTags(text(item.description)),
        raw: item,
      }))
    : atomEntries.map((entry) => ({
        externalId: text(entry.id) ?? itemLink(entry) ?? text(entry.title) ?? "",
        title: text(entry.title) ?? "(untitled)",
        url: itemLink(entry),
        snippet: stripTags(text(entry.summary) ?? text(entry.content)),
        raw: entry,
      }));

  return items.filter((item) => Boolean(item.externalId));
}
