"use client";

import Link from "next/link";
import { useState } from "react";
import { Mark } from "@/components/mark";

const navLinks = [
  { href: "/what-we-assess", label: "What We Assess" },
  { href: "/process", label: "Process" },
  { href: "/sample-report", label: "Sample Report" },
  { href: "/about", label: "About" },
];

export function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="border-b border-slate/20 bg-paper">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
          <Mark className="h-7 w-7 text-graphite" />
          <span className="text-xl font-bold tracking-wide">
            <span className="text-graphite">STACK</span>
            <span className="text-slate">DILIGENCE</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-graphite hover:text-steel"
            >
              {link.label}
            </Link>
          ))}

          <Link
            href="/contact"
            className="rounded-md bg-graphite px-4 py-2 text-sm font-medium text-paper hover:bg-steel"
          >
            Book a call
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
              <path d="M6 6L18 18M6 18L18 6" stroke="#1E2328" strokeWidth="1.5" strokeLinecap="round" />
            ) : (
              <path d="M4 6H20M4 12H20M4 18H20" stroke="#1E2328" strokeWidth="1.5" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <nav className="border-t border-slate/20 bg-paper px-6 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded px-2 py-2 text-sm font-medium text-graphite hover:bg-white"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contact"
              className="rounded px-2 py-2 text-sm font-medium text-graphite hover:bg-white"
              onClick={() => setMobileOpen(false)}
            >
              Contact
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
