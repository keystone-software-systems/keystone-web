"use client";

import { useActionState } from "react";
import { Button, TextInput } from "@keystone/ui";
import { submitProjectBrief, type SubmitBriefState } from "@/actions/submissions";

const initialState: SubmitBriefState = {};

const fieldClass =
  "rounded-md border border-slate/30 bg-white px-3 py-2 text-sm text-blueprint-navy outline-none focus:border-technical-blue";

export function SubmitForm() {
  const [state, formAction, pending] = useActionState(submitProjectBrief, initialState);

  if (state.success) {
    return (
      <p className="mt-6 text-sm text-blueprint-navy">
        Submitted. Check your email for a link to track it — no account required to have gotten
        this far, and clicking that link is optional too.
      </p>
    );
  }

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="text-sm font-medium text-blueprint-navy">
          What do you need?
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={6}
          className={fieldClass}
          placeholder="Describe the project."
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="engagement_type" className="text-sm font-medium text-blueprint-navy">
          Engagement type
        </label>
        <select id="engagement_type" name="engagement_type" required defaultValue="" className={fieldClass}>
          <option value="" disabled>
            Choose one
          </option>
          <option value="short_term_project">Short-term project</option>
          <option value="long_term_project">Long-term project</option>
          <option value="retainer">Ongoing retainer</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="budget" className="text-sm font-medium text-blueprint-navy">
          Budget band (optional)
        </label>
        <TextInput id="budget" name="budget" placeholder="e.g. $15k-$25k" />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="timeline" className="text-sm font-medium text-blueprint-navy">
          Timeline (optional)
        </label>
        <TextInput id="timeline" name="timeline" placeholder="e.g. need this live in 6 weeks" />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-blueprint-navy">
          Contact email
        </label>
        <TextInput id="email" type="email" name="email" required placeholder="you@example.com" />
      </div>

      {/* Honeypot: hidden from real users via CSS, not `type="hidden"`, so a
          bot filling every visible-looking field still trips it. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="company_website">Company website</label>
        <input id="company_website" name="company_website" tabIndex={-1} autoComplete="off" />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Submitting…" : "Submit"}
      </Button>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
