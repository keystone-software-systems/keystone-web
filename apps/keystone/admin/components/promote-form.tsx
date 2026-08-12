"use client";

import { useActionState } from "react";
import { Button, TextInput } from "@keystone/ui";
import { promoteToLead, type SubmissionActionState } from "@/actions/submissions";

const initialState: SubmissionActionState = {};

export function PromoteForm({ projectId }: { projectId: string }) {
  const boundAction = promoteToLead.bind(null, projectId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  return (
    <form action={formAction} className="flex items-end gap-2">
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium text-blueprint-navy">
          Project name
        </label>
        <TextInput id="name" name="name" required placeholder="Name this project" />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Promoting…" : "Promote to lead"}
      </Button>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
