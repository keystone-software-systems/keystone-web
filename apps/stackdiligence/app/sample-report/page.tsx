import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sample Report",
  description: "What a StackDiligence report looks like before you commit to an engagement.",
  alternates: { canonical: "/sample-report" },
};

const findings = [
  {
    severity: "Critical",
    finding:
      "Customer PII (name, email, last four of SSN) is written to plaintext application logs across all environments, including production.",
    impact:
      "Blocks SOC 2 attestation as-is. Estimated 3–4 weeks of engineering time to remediate before enterprise renewals can rely on it. Recommend a price adjustment or escrow holdback tied to remediation, not a walk-away on its own.",
    action:
      "Before close: get a written remediation commitment and timeline from the target's engineering lead. After close: re-test within 30 days to confirm the fix landed before relying on it in front of a customer or auditor.",
  },
  {
    severity: "Notable",
    finding:
      "The billing service (Stripe integration, subscription logic) has no automated test coverage and one engineer who has touched it in the last 18 months.",
    impact:
      "Key-person risk on revenue-critical code. Budget 4–6 weeks of paid knowledge-transfer time post-close, and factor it into any retention or earn-out terms for that engineer.",
    action:
      "Add a retention clause or consulting agreement for that engineer through the transition period. Prioritize test coverage on this service in the first post-close sprint, before any refactor touches it.",
  },
  {
    severity: "Low priority",
    finding: "Frontend dependencies are two major versions behind current, with no known active exploits.",
    impact: "Routine maintenance. No cost to model into the deal. Flag for the first post-close engineering sprint.",
    action: "No deal action needed. Add to the engineering team's backlog after close.",
  },
];

const severityStyles: Record<string, string> = {
  Critical: "border-graphite/30 text-graphite",
  Notable: "border-steel/40 text-steel",
  "Low priority": "border-slate/40 text-slate",
};

export default function SampleReportPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="text-3xl font-semibold tracking-tight text-graphite sm:text-4xl">
        See the Format Before You Commit
      </h1>
      <p className="mt-4 text-lg text-graphite/70">
        Every report follows the same structure, regardless of deal size: an executive summary in
        deal language, then findings categorized by severity with a plain-English cost or timeline
        attached. Below is an illustrative excerpt showing that structure.
      </p>

      <div className="mt-8 rounded-md border border-slate/30 bg-white px-5 py-4 text-sm text-graphite/70">
        Illustrative example. &ldquo;Northlane&rdquo; is a composite scenario built to show the
        report format, not a real client or engagement.
      </div>

      <div className="mt-10 border-t border-slate/20 pt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-graphite">
          Executive Summary: Northlane (target company)
        </h2>
        <p className="mt-4 text-graphite/70">
          Northlane&apos;s core platform is well-architected and actively maintained: the codebase
          reflects deliberate engineering decisions, not accumulated shortcuts. One finding below
          is a genuine blocker for SOC 2 attestation and should factor into pricing or holdback
          terms. A second reflects real but manageable key-person risk. Nothing found here is a
          reason to walk away, but two items should change the terms of the deal.
        </p>
      </div>

      <div className="mt-10 border-t border-slate/20 pt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-graphite">Findings</h2>
        <div className="mt-6 flex flex-col gap-6">
          {findings.map((item) => (
            <div key={item.severity} className="rounded-md border border-slate/20 p-5">
              <span
                className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide ${severityStyles[item.severity]}`}
              >
                {item.severity}
              </span>
              <p className="mt-3 text-graphite">{item.finding}</p>
              <p className="mt-3 text-sm text-graphite/70">
                <span className="font-medium text-graphite">Deal impact: </span>
                {item.impact}
              </p>
              <p className="mt-2 text-sm text-graphite/70">
                <span className="font-medium text-graphite">Recommended action: </span>
                {item.action}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-graphite/70">
          A full report runs across all six categories in What We Assess, typically 10&ndash;25
          findings depending on target size. These three, one per severity tier, are here to show
          the format, not the full page count.
        </p>
      </div>

      <p className="mt-10 text-graphite/70">
        A redacted excerpt from a real engagement will replace this once the first one closes.
        Until then, get in touch and you can walk through the full report format directly on a
        call.
      </p>

      <Link
        href="/contact"
        className="mt-6 inline-block rounded-md bg-graphite px-6 py-3 text-sm font-medium text-paper hover:bg-steel"
      >
        Book a call
      </Link>
    </div>
  );
}
