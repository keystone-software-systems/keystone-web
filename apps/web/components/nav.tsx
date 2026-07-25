"use client";

import Link from "next/link";
import { useState } from "react";
import { KeystoneLogo } from "@keystone/ui";
import { solutions } from "@/app/solutions/content";

const navLinks = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const PORTAL_LOGIN_URL = `${process.env.NEXT_PUBLIC_PORTAL_URL ?? "https://portal.keystone.systems"}/login`;

export function Nav() {
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="border-b border-slate/20 bg-off-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" onClick={() => setMobileOpen(false)}>
          <KeystoneLogo />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <div
            className="relative"
            onMouseEnter={() => setSolutionsOpen(true)}
            onMouseLeave={() => setSolutionsOpen(false)}
          >
            <button
              type="button"
              className="flex items-center gap-1 text-sm font-medium text-blueprint-navy hover:text-technical-blue"
              aria-expanded={solutionsOpen}
              aria-haspopup="true"
              onClick={() => setSolutionsOpen((v) => !v)}
            >
              Solutions
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {solutionsOpen && (
              <div className="absolute left-0 top-full w-72 rounded-lg border border-slate/20 bg-white py-2 shadow-lg">
                {solutions.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/solutions/${s.slug}`}
                    className="block px-4 py-2 text-sm text-blueprint-navy hover:bg-off-white hover:text-technical-blue"
                    onClick={() => setSolutionsOpen(false)}
                  >
                    {s.title}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-blueprint-navy hover:text-technical-blue"
            >
              {link.label}
            </Link>
          ))}

          <a href={PORTAL_LOGIN_URL} className="text-sm font-medium text-blueprint-navy hover:text-technical-blue">
            Log in
          </a>

          <Link
            href="/contact"
            className="rounded-md bg-blueprint-navy px-4 py-2 text-sm font-medium text-white hover:bg-technical-blue"
          >
            Talk through your situation
          </Link>
        </nav>

        <button
          type="button"
          className="flex items-center justify-center md:hidden"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {mobileOpen ? (
              <path d="M6 6L18 18M6 18L18 6" stroke="#14324D" strokeWidth="1.5" strokeLinecap="round" />
            ) : (
              <path d="M4 6H20M4 12H20M4 18H20" stroke="#14324D" strokeWidth="1.5" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <nav className="border-t border-slate/20 bg-off-white px-6 py-4 md:hidden">
          <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-blueprint-navy/70">Solutions</p>
          <div className="mb-4 flex flex-col">
            {solutions.map((s) => (
              <Link
                key={s.slug}
                href={`/solutions/${s.slug}`}
                className="rounded px-2 py-2 text-sm text-blueprint-navy hover:bg-white"
                onClick={() => setMobileOpen(false)}
              >
                {s.title}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded px-2 py-2 text-sm font-medium text-blueprint-navy hover:bg-white"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <a
              href={PORTAL_LOGIN_URL}
              className="rounded px-2 py-2 text-sm font-medium text-blueprint-navy hover:bg-white"
              onClick={() => setMobileOpen(false)}
            >
              Log in
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
