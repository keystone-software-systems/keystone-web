import type { Metadata } from "next";
import { HtmlShell } from "@keystone/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "StackDiligence Admin",
    template: "%s | StackDiligence Admin",
  },
  description: "Internal operations tool for StackDiligence.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <HtmlShell>{children}</HtmlShell>;
}
