import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import { plexSans } from "./fonts";

type Props = {
  children: ReactNode;
  /** Extra `next/font` variable classes to add alongside Inter, e.g. `plexMono.variable`. */
  fontVariables?: string;
};

export function HtmlShell({ children, fontVariables = "" }: Props) {
  return (
    <html lang="en" className={`${plexSans.variable} ${fontVariables} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-off-white font-sans text-blueprint-navy">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
