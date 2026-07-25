import type { ReactNode } from "react";
import Link from "next/link";
import { KeystoneLogo } from "./logo";

type Props = {
  homeHref?: string;
  appLabel?: string;
  profile?: ReactNode;
  signOut?: ReactNode;
  children: ReactNode;
};

export function DashboardShell({ homeHref = "/", appLabel, profile, signOut, children }: Props) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate/20 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href={homeHref} className="flex items-center gap-2.5">
            <KeystoneLogo />
            {appLabel && (
              <span className="rounded-full bg-off-white px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-slate">
                {appLabel}
              </span>
            )}
          </Link>
          {(profile || signOut) && (
            <div className="flex items-center gap-4 text-sm text-slate">
              {profile}
              {signOut}
            </div>
          )}
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
