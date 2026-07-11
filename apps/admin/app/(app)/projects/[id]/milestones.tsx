"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addMilestoneAction } from "@/actions/projects";
import { createInvoiceAction } from "@/actions/invoices";
import { StatusBadge } from "@/components/status-badge";
import { Money } from "@/components/money";
import type { Milestone } from "@/lib/supabase/types";

export function Milestones({
  projectId,
  clientId,
  milestones,
}: {
  projectId: string;
  clientId: string;
  milestones: Milestone[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-lg border border-pale-blue bg-white">
        {milestones.length === 0 && <p className="p-4 text-sm text-slate">No milestones yet.</p>}
        {milestones.map((m) => (
          <div
            key={m.id}
            className="flex items-center justify-between border-b border-off-white px-4 py-2.5 text-sm last:border-none"
          >
            <span className="font-medium">{m.title}</span>
            <div className="flex items-center gap-3">
              <Money amount={m.amount} currency={m.currency} />
              <StatusBadge status={m.status} />
              {m.status === "pending" && (
                <button
                  disabled={isPending}
                  onClick={() => {
                    setError(null);
                    startTransition(async () => {
                      try {
                        await createInvoiceAction({
                          clientId,
                          projectId,
                          lineItems: [
                            {
                              description: m.title,
                              quantity: 1,
                              unitAmount: m.amount,
                              milestoneId: m.id,
                            },
                          ],
                          daysUntilDue: 30,
                        });
                        router.refresh();
                      } catch (err) {
                        setError(err instanceof Error ? err.message : "Failed to create invoice");
                      }
                    });
                  }}
                  className="text-xs font-medium text-technical-blue hover:underline disabled:opacity-60"
                >
                  Create invoice
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      {showForm ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            const form = new FormData(e.currentTarget);
            startTransition(async () => {
              try {
                await addMilestoneAction({
                  projectId,
                  title: form.get("title"),
                  amount: Math.round(Number(form.get("amount")) * 100),
                  dueDate: form.get("dueDate") || undefined,
                });
                setShowForm(false);
                router.refresh();
              } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to add milestone");
              }
            });
          }}
          className="flex flex-col gap-3 rounded-lg border border-pale-blue bg-white p-4"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <input name="title" required placeholder="Milestone title" className="input" />
            <input name="amount" type="number" step="0.01" required placeholder="Amount ($)" className="input" />
            <input name="dueDate" type="date" className="input" />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-blueprint-navy px-4 py-2 text-sm font-semibold text-white hover:bg-technical-blue disabled:opacity-60"
            >
              Add milestone
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-md px-4 py-2 text-sm font-medium text-slate hover:bg-off-white"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="self-start text-sm font-medium text-technical-blue hover:underline"
        >
          + Add milestone
        </button>
      )}
    </div>
  );
}
