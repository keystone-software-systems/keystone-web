import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = "https://stackdiligence.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "StackDiligence | Know what you're actually buying",
    template: "%s | StackDiligence",
  },
  description:
    "Technical due diligence for software acquisitions: a full-stack assessment of what you're actually buying, delivered in plain language for deal teams without an in-house technical read.",
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "StackDiligence",
    title: "StackDiligence | Know what you're actually buying",
    description:
      "Technical due diligence for software acquisitions, translated into terms your deal team can act on.",
  },
  twitter: {
    card: "summary_large_image",
    title: "StackDiligence",
    description:
      "Technical due diligence for software acquisitions, translated into terms your deal team can act on.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-paper text-graphite font-sans">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
