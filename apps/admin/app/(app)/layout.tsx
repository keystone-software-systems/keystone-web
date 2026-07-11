import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { Nav } from "@/components/nav";

// Middleware already redirects unauthenticated/unprovisioned requests to
// /login before this ever renders; this check is the belt to that
// suspenders in case a stale session slips through (defense in depth, see
// docs/admin-tool-design.md §4).
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      <Nav profile={profile} />
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
