"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { sendContractAction } from "@/actions/contracts";
import type { Contact } from "@/lib/supabase/types";

export function SendContractForm({
  clientId,
  projectId,
  projectName,
  contacts,
}: {
  clientId: string;
  projectId: string;
  projectName: string;
  contacts: Contact[];
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const signableContacts = contacts.filter((c) => c.email);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="self-start rounded-md bg-blueprint-navy px-4 py-2 text-sm font-semibold text-white hover:bg-technical-blue"
      >
        Send contract
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
            await sendContractAction({
              clientId,
              projectId,
              contactId: form.get("contactId"),
              templateKey: form.get("templateKey"),
              title: form.get("title"),
            });
            setOpen(false);
            router.refresh();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to send contract");
          }
        });
      }}
      className="flex flex-col gap-3 rounded-lg border border-pale-blue bg-white p-4"
    >
      {signableContacts.length === 0 ? (
        <p className="text-sm text-slate">Add a contact with an email address before sending a contract.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <select name="contactId" required className="input" defaultValue="">
            <option value="" disabled>
              Signer
            </option>
            {signableContacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.email})
              </option>
            ))}
          </select>
          <input name="templateKey" required placeholder="Zoho template key" className="input" />
          <input name="title" required defaultValue={`${projectName} — Engagement Agreement`} className="input" />
        </div>
      )}
      {error && <p className="text-sm text-red-700">{error}</p>}
      <div className="flex gap-2">
        {signableContacts.length > 0 && (
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-blueprint-navy px-4 py-2 text-sm font-semibold text-white hover:bg-technical-blue disabled:opacity-60"
          >
            {isPending ? "Sending…" : "Send for signature"}
          </button>
        )}
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
