import "server-only";
import { notionUrlSchema, parseNotionPageId } from "@/lib/validation";

export interface ParsedNotionLink {
  url: string;
  pageId: string | null;
}

/** Validates a pasted Notion URL and extracts its page id. No API call, no secret. */
export function parseNotionLink(url: string): ParsedNotionLink {
  const validated = notionUrlSchema.parse(url);
  return { url: validated, pageId: parseNotionPageId(validated) };
}

export function isNotionCreateEnabled(): boolean {
  return Boolean(process.env.NOTION_TOKEN && process.env.NOTION_PARENT_PAGE_ID);
}

/**
 * Optional "Create Notion doc" path: creates a blank page titled after the
 * project under the configured parent, and returns its URL. Only called
 * when isNotionCreateEnabled() — otherwise the UI hides the button and
 * paste-to-link is the only path (see docs/admin-tool-design.md §8).
 */
export async function createNotionDoc(projectName: string, backLinkUrl: string): Promise<ParsedNotionLink> {
  if (!isNotionCreateEnabled()) {
    throw new Error("Notion create-doc is not configured (missing NOTION_TOKEN/NOTION_PARENT_PAGE_ID)");
  }

  const res = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      parent: { page_id: process.env.NOTION_PARENT_PAGE_ID },
      properties: {
        title: [{ text: { content: projectName } }],
      },
      children: [
        {
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [
              { type: "text", text: { content: "Commercial record: " } },
              { type: "text", text: { content: backLinkUrl, link: { url: backLinkUrl } } },
            ],
          },
        },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`Notion API error creating page: ${res.status} ${await res.text()}`);
  }

  const page = (await res.json()) as { id: string; url: string };
  return { url: page.url, pageId: page.id.replace(/-/g, "") };
}
