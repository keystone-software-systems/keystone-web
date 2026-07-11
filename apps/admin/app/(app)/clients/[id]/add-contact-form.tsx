"use client";

import { useState, useTransition } from "react";
import { addContactAction } from "@/actions/clients";

export function AddContactForm({ clientId }: { clientId: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-2 text-sm font-medium text-technical-blue hover:underline"
      >
        + Add contact
      </button>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const form = new FormData(e.currentTarget);
        startTransition(async () => {
          try {
            await addContactAction({
              clientId,
              name: form.get("name"),
              email: form.get("email") || undefined,
              title: form.get("title") || undefined,
              isPrimary: form.get("isPrimary") === "on",
            });
            setOpen(false);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to add contact");
          }
        });
      }}
      className="mt-2 flex flex-col gap-3 rounded-lg border border-pale-blue bg-white p-4"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <input name="name" required placeholder="Name" className="input" />
        <input name="title" placeholder="Title (optional)" className="input" />
        <input name="email" type="email" placeholder="Email (optional)" className="input" />
      </div>
      <label className="flex items-center gap-2 text-sm text-slate">
        <input type="checkbox" name="isPrimary" />
        Primary contact
      </label>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-blueprint-navy px-4 py-2 text-sm font-semibold text-white hover:bg-technical-blue disabled:opacity-60"
        >
          {isPending ? "Adding…" : "Add contact"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md px-4 py-2 text-sm font-medium text-slate hover:bg-off-white"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
