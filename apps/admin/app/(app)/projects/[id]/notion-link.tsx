"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { linkNotionDocAction, createNotionDocAction } from "@/actions/projects";

export function NotionLink({
  projectId,
  projectName,
  notionUrl,
  createEnabled,
}: {
  projectId: string;
  projectName: string;
  notionUrl: string | null;
  createEnabled: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (notionUrl && !editing) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <a href={notionUrl} target="_blank" rel="noreferrer" className="font-medium text-technical-blue hover:underline">
          Open in Notion ↗
        </a>
        <button onClick={() => setEditing(true)} className="text-slate hover:underline">
          Change
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          startTransition(async () => {
            try {
              await linkNotionDocAction(projectId, url);
              setEditing(false);
              router.refresh();
            } catch (err) {
              setError(err instanceof Error ? err.message : "Failed to link Notion doc");
            }
          });
        }}
        className="flex gap-2"
      >
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste Notion URL"
          className="input flex-1"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-blueprint-navy px-3 py-2 text-sm font-semibold text-white hover:bg-technical-blue disabled:opacity-60"
        >
          Link
        </button>
      </form>
      {createEnabled && (
        <button
          disabled={isPending}
          onClick={() => {
            startTransition(async () => {
              try {
                await createNotionDocAction(projectId, projectName);
                router.refresh();
              } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to create Notion doc");
              }
            });
          }}
          className="self-start text-sm font-medium text-technical-blue hover:underline"
        >
          + Create Notion doc
        </button>
      )}
      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  );
}
