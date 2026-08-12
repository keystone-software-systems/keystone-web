import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Process",
  description: "How a StackDiligence engagement works, from kickoff call to report delivery.",
  alternates: { canonical: "/process" },
};

const steps = [
  {
    title: "Kickoff call",
    description: "Understand the deal, the target, and what matters most to you specifically.",
  },
  {
    title: "Data room & access review",
    description: "Codebase, infrastructure, and documentation access.",
  },
  {
    title: "Technical assessment",
    description: "Full-stack review against the categories in What We Assess.",
  },
  {
    title: "Team interviews",
    description: "Conversations with the target's technical leadership.",
  },
  {
    title: "Report delivery",
    description:
      "Executive summary (deal-language, no jargon) plus technical appendix (for anyone on your side who wants the detail).",
  },
];

export default function ProcessPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="text-3xl font-semibold tracking-tight text-graphite sm:text-4xl">
        How It Works
      </h1>
      <p className="mt-4 text-lg text-graphite/70">
        1&ndash;3 weeks, depending on deal size and data room access.
      </p>

      <ol className="mt-12 flex flex-col gap-8">
        {steps.map((step, i) => (
          <li key={step.title} className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-graphite text-sm font-semibold text-paper">
              {i + 1}
            </span>
            <div>
              <h2 className="text-lg font-semibold text-graphite">{step.title}</h2>
              <p className="mt-1 text-graphite/70">{step.description}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-12 border-t border-slate/20 pt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-graphite">Pricing</h2>
        <p className="mt-3 text-graphite/70">
          Fixed-fee engagements scoped to deal size, no open-ended hourly billing.
        </p>
      </div>

      <Link
        href="/contact"
        className="mt-10 inline-block rounded-md bg-graphite px-6 py-3 text-sm font-medium text-paper hover:bg-steel"
      >
        Book a call
      </Link>
    </div>
  );
}
