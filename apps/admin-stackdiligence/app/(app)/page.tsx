import Link from "next/link";
import { requireRole } from "@keystone/admin-core";

export default async function DashboardPage() {
  const profile = await requireRole("owner", "staff", "viewer");

  return (
    <div>
      <h1 className="text-lg font-semibold text-blueprint-navy">Dashboard</h1>
      <p className="mt-1 text-sm text-slate">
        Signed in as {profile.email} ({profile.role}).
      </p>
      <div className="mt-8 flex flex-col gap-3">
        <Link
          href="/prospects"
          className="block rounded-md border border-dashed border-slate/30 p-8 text-center text-sm text-slate hover:border-technical-blue"
        >
          Prospects & outreach →
        </Link>
      </div>
    </div>
  );
}
