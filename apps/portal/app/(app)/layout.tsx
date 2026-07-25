import type { ReactNode } from "react";
import { DashboardShell, SignOutButton } from "@keystone/ui";
import { signOut } from "@keystone/db";
import { getCurrentProfile } from "@/lib/auth";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const profile = await getCurrentProfile();

  return (
    <DashboardShell
      profile={profile && <span>{profile.email}</span>}
      signOut={profile && <SignOutButton action={signOut} />}
    >
      {children}
    </DashboardShell>
  );
}
