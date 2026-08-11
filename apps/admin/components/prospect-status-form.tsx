"use client";

import { useActionState } from "react";
import { Button } from "@keystone/ui";
import { updateProspectStatus, type ProspectActionState } from "@/actions/prospects";
import { STATUS_OPTIONS, label, type ProspectStatus } from "@/lib/segments";

const initialState: ProspectActionState = {};

export function ProspectStatusForm({
  prospectId,
  status,
  nextFollowUpOn,
}: {
  prospectId: string;
  status: ProspectStatus;
  nextFollowUpOn: string | null;
}) {
  const boundAction = updateProspectStatus.bind(null, prospectId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <div className="flex flex-col gap-1">
        <label htmlFor="status" className="text-sm font-medium text-blueprint-navy">
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={status}
          className="rounded-md border border-slate/30 bg-white px-3 py-2 text-sm text-blueprint-navy"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {label(s)}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="next_follow_up_on" className="text-sm font-medium text-blueprint-navy">
          Next follow-up
        </label>
        <input
          id="next_follow_up_on"
          name="next_follow_up_on"
          type="date"
          defaultValue={nextFollowUpOn ?? ""}
          className="rounded-md border border-slate/30 bg-white px-3 py-2 text-sm text-blueprint-navy outline-none focus:border-technical-blue"
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Update"}
      </Button>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
