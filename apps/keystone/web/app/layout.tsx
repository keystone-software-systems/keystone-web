import type { Metadata } from "next";
import { HtmlShell, plexMono } from "@keystone/ui";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import "./globals.css";

const SITE_URL = "https://keystone.systems";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Keystone Systems | Senior engineering judgment, without the full-time hire",
    template: "%s | Keystone Systems",
  },
  description:
    "Keystone Systems is a network of senior-plus engineers providing architecture, technical strategy, and senior-level engineering judgment for growing companies.",
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Keystone Systems",
    title: "Keystone Systems | Senior engineering judgment, without the full-time hire",
    description:
      "Architecture, technical strategy, and senior-level engineering judgment for growing companies.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Keystone Systems",
    description:
      "Architecture, technical strategy, and senior-level engineering judgment for growing companies.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <HtmlShell fontVariables={plexMono.variable}>
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
    </HtmlShell>
  );
}
