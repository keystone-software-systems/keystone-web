import type { ReactNode } from "react";
import { DashboardShell, SignOutButton } from "@keystone/ui";
import { signOut } from "@keystone/db";
import { getCurrentProfile } from "@keystone/admin-core";
import { StackDiligenceLogo } from "@/components/stackdiligence-logo";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const profile = await getCurrentProfile();

  return (
    <DashboardShell
      appLabel="Admin"
      logo={<StackDiligenceLogo />}
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
