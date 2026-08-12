import type { Metadata } from "next";
import { HtmlShell } from "@keystone/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Keystone Systems",
    template: "%s | Keystone Systems",
  },
  description: "Submit and track a project with Keystone Systems.",
  // Phase 0 is entirely behind auth (login + dashboard only) — no public
  // pages exist yet to index. Revisit once /submit ships (Phase 1); see
  // docs/intake-portal-design.md §11.7.
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <HtmlShell>{children}</HtmlShell>;
}
