import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/status-badge";
import { Money } from "@/components/money";
import { isPastDue } from "@/lib/dates";

export default async function InvoicesPage() {
  const supabase = await createClient();
  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, number, status, amount_due, amount_paid, currency, due_at, hosted_invoice_url, clients(name)")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-mono text-xl font-semibold">Invoices</h1>
      <div className="overflow-hidden rounded-lg border border-pale-blue bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-pale-blue bg-off-white text-xs uppercase tracking-wide text-slate">
            <tr>
              <th className="px-4 py-2">Number</th>
              <th className="px-4 py-2">Client</th>
              <th className="px-4 py-2">Amount</th>
              <th className="px-4 py-2">Due</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {(invoices ?? []).map((inv) => {
              const overdue = inv.status === "open" && isPastDue(inv.due_at);
              return (
                <tr key={inv.id} className="border-b border-off-white last:border-none hover:bg-off-white">
                  <td className="px-4 py-2.5 font-medium">
                    {inv.hosted_invoice_url ? (
                      <a href={inv.hosted_invoice_url} target="_blank" rel="noreferrer" className="text-technical-blue hover:underline">
                        {inv.number ?? "Draft"}
                      </a>
                    ) : (
                      inv.number ?? "Draft"
                    )}
                  </td>
                  <td className="px-4 py-2.5">{(inv.clients as unknown as { name: string } | null)?.name}</td>
                  <td className="px-4 py-2.5">
                    <Money amount={inv.amount_due} currency={inv.currency} />
                    {inv.amount_paid > 0 && inv.amount_paid < inv.amount_due && (
                      <span className="ml-1 text-xs text-slate">
                        (<Money amount={inv.amount_paid} currency={inv.currency} /> paid)
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-slate">
                    {inv.due_at ? new Date(inv.due_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={overdue ? "overdue" : inv.status} />
                  </td>
                </tr>
              );
            })}
            {(invoices ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate">
                  No invoices yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
