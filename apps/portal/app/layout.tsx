import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

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
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-off-white font-sans text-blueprint-navy">{children}</body>
    </html>
  );
}
