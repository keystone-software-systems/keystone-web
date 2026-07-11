"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/actions/auth";
import type { Profile } from "@/lib/supabase/types";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/clients", label: "Clients" },
  { href: "/projects", label: "Projects" },
  { href: "/invoices", label: "Invoices" },
  { href: "/contracts", label: "Contracts" },
  { href: "/settings", label: "Settings" },
];

export function Nav({ profile }: { profile: Profile }) {
  const pathname = usePathname();

  return (
    <header className="border-b border-pale-blue bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-8">
          <span className="font-mono text-sm font-semibold text-blueprint-navy">
            Keystone Admin
          </span>
          <nav className="flex gap-1">
            {LINKS.map((link) => {
              const active =
                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                    active
                      ? "bg-blueprint-navy text-white"
                      : "text-blueprint-navy hover:bg-off-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate">
          <span>{profile.full_name || profile.email}</span>
          <form action={signOut}>
            <button type="submit" className="font-medium text-technical-blue hover:underline">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
