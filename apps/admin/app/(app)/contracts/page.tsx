import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/status-badge";

export default async function ContractsPage() {
  const supabase = await createClient();
  const { data: contracts } = await supabase
    .from("contracts")
    .select("id, title, status, sent_at, signed_at, clients(name)")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-mono text-xl font-semibold">Contracts</h1>
      <div className="overflow-hidden rounded-lg border border-pale-blue bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-pale-blue bg-off-white text-xs uppercase tracking-wide text-slate">
            <tr>
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Client</th>
              <th className="px-4 py-2">Sent</th>
              <th className="px-4 py-2">Signed</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {(contracts ?? []).map((c) => (
              <tr key={c.id} className="border-b border-off-white last:border-none hover:bg-off-white">
                <td className="px-4 py-2.5 font-medium">{c.title}</td>
                <td className="px-4 py-2.5">{(c.clients as unknown as { name: string } | null)?.name}</td>
                <td className="px-4 py-2.5 text-slate">{c.sent_at ? new Date(c.sent_at).toLocaleDateString() : "—"}</td>
                <td className="px-4 py-2.5 text-slate">{c.signed_at ? new Date(c.signed_at).toLocaleDateString() : "—"}</td>
                <td className="px-4 py-2.5">
                  <StatusBadge status={c.status} />
                </td>
              </tr>
            ))}
            {(contracts ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate">
                  No contracts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
