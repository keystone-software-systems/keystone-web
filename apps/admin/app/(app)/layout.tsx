import type { ReactNode } from "react";
import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const profile = await getCurrentProfile();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate/20 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="text-sm font-semibold tracking-wide text-blueprint-navy">
            KEYSTONE ADMIN
          </Link>
          {profile && (
            <div className="flex items-center gap-4 text-sm text-slate">
              <span>
                {profile.email} · {profile.role}
              </span>
              <SignOutButton />
            </div>
          )}
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
