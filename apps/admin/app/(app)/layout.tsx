import type { ReactNode } from "react";
import { DashboardShell, SignOutButton } from "@keystone/ui";
import { getCurrentProfile } from "@/lib/auth";
import { signOut } from "@/actions/auth";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const profile = await getCurrentProfile();

  return (
    <DashboardShell
      appLabel="Admin"
      profile={
        profile && (
          <span>
            {profile.email} · {profile.role}
          </span>
        )
      }
      signOut={profile && <SignOutButton action={signOut} />}
    >
      {children}
    </DashboardShell>
  );
}
