"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createProjectAction } from "@/actions/projects";

const SERVICE_LINES = [
  "net_new_development",
  "vibe_code_to_production",
  "business_process_automation",
  "acquisition_due_diligence",
  "ai_training_setup",
  "codebase_improvement",
];

export function NewProjectForm({ clients }: { clients: { id: string; name: string }[] }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="self-start rounded-md bg-blueprint-navy px-4 py-2 text-sm font-semibold text-white hover:bg-technical-blue"
      >
        + New project
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
            const amount = form.get("amountTotal");
            const id = await createProjectAction({
              clientId: form.get("clientId"),
              name: form.get("name"),
              serviceLine: form.get("serviceLine") || undefined,
              pricingType: form.get("pricingType") || "fixed",
              amountTotal: amount ? Math.round(Number(amount) * 100) : undefined,
              summary: form.get("summary") || undefined,
            });
            router.push(`/projects/${id}`);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create project");
          }
        });
      }}
      className="flex flex-col gap-3 rounded-lg border border-pale-blue bg-white p-4"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <select name="clientId" required className="input" defaultValue="">
          <option value="" disabled>
            Client
          </option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input name="name" required placeholder="Project name" className="input" />
        <select name="serviceLine" className="input" defaultValue="">
          <option value="">Service line</option>
          {SERVICE_LINES.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <select name="pricingType" className="input" defaultValue="fixed">
          <option value="fixed">Fixed</option>
          <option value="retainer">Retainer</option>
        </select>
        <input name="amountTotal" type="number" step="0.01" placeholder="Amount ($, optional)" className="input" />
        <input name="summary" placeholder="One-line summary (optional)" className="input sm:col-span-2 lg:col-span-2" />
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-blueprint-navy px-4 py-2 text-sm font-semibold text-white hover:bg-technical-blue disabled:opacity-60"
        >
          {isPending ? "Creating…" : "Create project"}
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
