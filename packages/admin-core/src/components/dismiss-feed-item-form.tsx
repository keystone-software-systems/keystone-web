"use client";

import { useActionState } from "react";
import { dismissFeedItem, type ProspectActionState } from "../actions/prospects";

const initialState: ProspectActionState = {};

export function DismissFeedItemForm({ feedItemId }: { feedItemId: string }) {
  const boundAction = dismissFeedItem.bind(null, feedItemId);
  const [, formAction, pending] = useActionState(boundAction, initialState);

  return (
    <form action={formAction}>
      <button type="submit" disabled={pending} className="text-sm text-slate hover:text-red-600">
        {pending ? "…" : "Dismiss"}
      </button>
    </form>
  );
}
