"use client";

import { useActionState } from "react";
import { Button } from "@keystone/ui";
import { logTouch, type ProspectActionState } from "../actions/prospects";

type Activity = {
  id: string;
  action: string;
  summary: string | null;
  created_at: string;
};

const initialState: ProspectActionState = {};

export function ProspectTouchLog({ prospectId, activity }: { prospectId: string; activity: Activity[] }) {
  const boundAction = logTouch.bind(null, prospectId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  return (
    <div>
      <h2 className="text-sm font-medium text-blueprint-navy">Activity</h2>
      {!activity.length ? (
        <p className="mt-2 text-sm text-slate">No touches logged yet.</p>
      ) : (
        <ul className="mt-2 flex flex-col gap-3">
          {activity.map((entry) => (
            <li key={entry.id} className="rounded-md border border-slate/20 bg-white p-3">
              <p className="text-xs text-slate">
                {new Date(entry.created_at).toLocaleString()} · {entry.action.replaceAll("_", " ")}
              </p>
              {entry.summary && <p className="mt-1 whitespace-pre-wrap text-sm text-blueprint-navy">{entry.summary}</p>}
            </li>
          ))}
        </ul>
      )}

      <form action={formAction} className="mt-4 flex flex-col gap-2">
        <textarea
          name="body"
          required
          rows={2}
          placeholder="Log a touch — sent an email, had a call…"
          className="rounded-md border border-slate/30 bg-white px-3 py-2 text-sm text-blueprint-navy outline-none focus:border-technical-blue"
        />
        <Button type="submit" disabled={pending} className="self-start">
          {pending ? "Saving…" : "Log touch"}
        </Button>
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      </form>
    </div>
  );
}
