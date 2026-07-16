import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sample Report",
  description: "What a StackDiligence report looks like before you commit to an engagement.",
  alternates: { canonical: "/sample-report" },
};

export default function SampleReportPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="text-3xl font-semibold tracking-tight text-graphite sm:text-4xl">
        See the Format Before You Commit
      </h1>
      <p className="mt-4 text-lg text-graphite/70">
        Every report follows the same structure, regardless of deal size:
      </p>

      <ul className="mt-8 flex flex-col gap-4 text-graphite/70">
        <li>How findings are categorized: critical, notable, or low-priority.</li>
        <li>How each finding is translated into deal impact: cost, timeline, or valuation.</li>
        <li>An executive summary written in deal language, not engineering jargon.</li>
      </ul>

      <p className="mt-8 text-graphite/70">
        A redacted sample from a real engagement will be posted here once the first one closes.
        Until then, get in touch and you can walk through the report format directly on a call.
      </p>

      <Link
        href="/contact"
        className="mt-10 inline-block rounded-md bg-graphite px-6 py-3 text-sm font-medium text-paper hover:bg-steel"
      >
        Book a call
      </Link>
    </div>
  );
}
