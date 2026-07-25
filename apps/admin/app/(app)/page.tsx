import { requireRole } from "@/lib/auth";

export default async function DashboardPage() {
  // Exercises the role gate end to end, on top of proxy.ts + RLS.
  const profile = await requireRole("owner", "staff", "viewer");

  return (
    <div>
      <h1 className="text-lg font-semibold text-blueprint-navy">Dashboard</h1>
      <p className="mt-1 text-sm text-slate">
        Signed in as {profile.email} ({profile.role}).
      </p>
      <div className="mt-8 rounded-md border border-dashed border-slate/30 p-8 text-center text-sm text-slate">
        No projects yet.
      </div>
    </div>
  );
}
