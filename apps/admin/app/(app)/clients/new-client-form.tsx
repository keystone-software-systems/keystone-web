"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClientAction } from "@/actions/clients";

export function NewClientForm() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="self-start rounded-md bg-blueprint-navy px-4 py-2 text-sm font-semibold text-white hover:bg-technical-blue"
      >
        + New client
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const form = new FormData(e.currentTarget);
        startTransition(async () => {
          try {
            const id = await createClientAction({
              name: form.get("name"),
              legalName: form.get("legalName") || undefined,
              billingEmail: form.get("billingEmail") || undefined,
            });
            router.push(`/clients/${id}`);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create client");
          }
        });
      }}
      className="flex flex-col gap-3 rounded-lg border border-pale-blue bg-white p-4"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <input name="name" required placeholder="Client name" className="input" />
        <input name="legalName" placeholder="Legal name (optional)" className="input" />
        <input name="billingEmail" type="email" placeholder="Billing email (optional)" className="input" />
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-blueprint-navy px-4 py-2 text-sm font-semibold text-white hover:bg-technical-blue disabled:opacity-60"
        >
          {isPending ? "Creating…" : "Create client"}
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
