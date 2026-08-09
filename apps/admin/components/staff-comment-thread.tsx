"use client";

import { useActionState } from "react";
import { Button } from "@keystone/ui";
import { addStaffComment, type SubmissionActionState } from "@/actions/submissions";

type Comment = {
  id: string;
  body: string;
  created_at: string;
  visible_to_client: boolean;
};

const initialState: SubmissionActionState = {};

export function StaffCommentThread({ projectId, comments }: { projectId: string; comments: Comment[] }) {
  const boundAction = addStaffComment.bind(null, projectId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  return (
    <div>
      <h2 className="text-sm font-medium text-blueprint-navy">Comments</h2>
      {!comments.length ? (
        <p className="mt-2 text-sm text-slate">No comments yet.</p>
      ) : (
        <ul className="mt-2 flex flex-col gap-3">
          {comments.map((comment) => (
            <li key={comment.id} className="rounded-md border border-slate/20 bg-white p-3">
              <p className="text-xs text-slate">
                {new Date(comment.created_at).toLocaleString()}
                {!comment.visible_to_client && " · internal only"}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-blueprint-navy">{comment.body}</p>
            </li>
          ))}
        </ul>
      )}

      <form action={formAction} className="mt-4 flex flex-col gap-2">
        <textarea
          name="body"
          required
          rows={3}
          placeholder="Reply…"
          className="rounded-md border border-slate/30 bg-white px-3 py-2 text-sm text-blueprint-navy outline-none focus:border-technical-blue"
        />
        <label className="flex items-center gap-2 text-sm text-slate">
          <input type="checkbox" name="visible_to_client" defaultChecked />
          Visible to client
        </label>
        <Button type="submit" disabled={pending} className="self-start">
          {pending ? "Posting…" : "Post reply"}
        </Button>
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      </form>
    </div>
  );
}
