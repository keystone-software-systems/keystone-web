import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { NewClientForm } from "./new-client-form";

export default async function ClientsPage() {
  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("clients")
    .select("id, name, billing_email, created_at")
    .order("name");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-mono text-xl font-semibold">Clients</h1>
      </div>

      <NewClientForm />

      <div className="overflow-hidden rounded-lg border border-pale-blue bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-pale-blue bg-off-white text-xs uppercase tracking-wide text-slate">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Billing email</th>
            </tr>
          </thead>
          <tbody>
            {(clients ?? []).map((c) => (
              <tr key={c.id} className="border-b border-off-white last:border-none hover:bg-off-white">
                <td className="px-4 py-2.5">
                  <Link href={`/clients/${c.id}`} className="font-medium text-blueprint-navy hover:text-technical-blue">
                    {c.name}
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-slate">{c.billing_email ?? "—"}</td>
              </tr>
            ))}
            {(clients ?? []).length === 0 && (
              <tr>
                <td colSpan={2} className="px-4 py-6 text-center text-slate">
                  No clients yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
