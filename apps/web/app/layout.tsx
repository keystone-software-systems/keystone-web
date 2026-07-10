import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
});

const SITE_URL = "https://keystone.systems";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Keystone Systems | Senior engineering judgment, without the full-time hire",
    template: "%s | Keystone Systems",
  },
  description:
    "Keystone Systems is a software engineering consultancy providing architecture, technical strategy, and senior-level engineering judgment for growing companies.",
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
    <html lang="en" className={`${inter.variable} ${plexMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-off-white text-blueprint-navy font-sans">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
