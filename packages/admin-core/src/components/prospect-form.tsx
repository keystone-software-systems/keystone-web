"use client";

import { useActionState } from "react";
import { Button, TextInput } from "@keystone/ui";
import { createProspect, type ProspectActionState } from "../actions/prospects";
import { SEGMENTS_BY_BRAND, label, type ProspectSegment } from "../segments";
import type { Brand } from "../brand-access";

const initialState: ProspectActionState = {};

type Defaults = {
  segment?: ProspectSegment;
  name?: string;
  source?: string;
  notes?: string;
  websiteUrl?: string;
};

export function ProspectForm({
  brand,
  feedItemId,
  defaults,
}: {
  brand: Brand;
  feedItemId?: string;
  defaults?: Defaults;
}) {
  const [state, formAction, pending] = useActionState(createProspect, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="brand" value={brand} />
      {feedItemId && <input type="hidden" name="feed_item_id" value={feedItemId} />}

      <div className="flex flex-col gap-1">
        <label htmlFor="segment" className="text-sm font-medium text-blueprint-navy">
          Segment
        </label>
        <select
          id="segment"
          name="segment"
          defaultValue={defaults?.segment}
          className="rounded-md border border-slate/30 bg-white px-3 py-2 text-sm text-blueprint-navy"
        >
          {SEGMENTS_BY_BRAND[brand].map((s) => (
            <option key={s} value={s}>
              {label(s)}
            </option>
          ))}
        </select>
      </div>

      <Field label="Name" name="name" required defaultValue={defaults?.name} />
      <Field label="Company" name="company" />
      <Field label="Title" name="title" />
      <Field label="Email" name="email" type="email" />
      <Field label="LinkedIn URL" name="linkedin_url" type="url" />
      <Field label="Website URL" name="website_url" type="url" defaultValue={defaults?.websiteUrl} />
      <Field label="Location" name="location" />
      <Field label="Source" name="source" defaultValue={defaults?.source} placeholder="Product Hunt, ACG roster, referral…" />
      <Field label="Next follow-up" name="next_follow_up_on" type="date" />

      <div className="flex flex-col gap-1">
        <label htmlFor="notes" className="text-sm font-medium text-blueprint-navy">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={defaults?.notes}
          className="rounded-md border border-slate/30 bg-white px-3 py-2 text-sm text-blueprint-navy outline-none focus:border-technical-blue"
        />
      </div>

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Saving…" : "Save prospect"}
      </Button>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}

function Field({
  label: fieldLabel,
  name,
  type = "text",
  required,
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium text-blueprint-navy">
        {fieldLabel}
      </label>
      <TextInput id={name} name={name} type={type} required={required} defaultValue={defaultValue} placeholder={placeholder} />
    </div>
  );
}
