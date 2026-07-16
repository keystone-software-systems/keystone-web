import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "What We Assess",
  description:
    "A complete read on the technical risk of the software business you're buying: codebase, infrastructure, security, team, vendor risk, and AI-generated code.",
  alternates: { canonical: "/what-we-assess" },
};

const categories = [
  {
    title: "Codebase & Architecture",
    description:
      "Code quality, maintainability, architectural decisions, technical debt load, and how much of the roadmap is achievable on the current foundation vs. requiring a rebuild.",
  },
  {
    title: "Infrastructure",
    description:
      "Hosting and cloud cost structure, scalability ceiling under real growth assumptions, deployment practices, backup and disaster recovery posture, and single points of failure.",
  },
  {
    title: "Security & Compliance",
    description:
      "Access controls, data handling practices, known vulnerability exposure, and gaps against relevant compliance frameworks (SOC 2, HIPAA, PCI, as applicable to the target).",
  },
  {
    title: "Team & Process",
    description:
      "Key-person risk (what happens if the founder or lead engineer leaves), engineering velocity, support/on-call sustainability, and hiring pipeline health.",
  },
  {
    title: "Vendor & Dependency Risk",
    description:
      "Third-party API dependencies, open-source license compliance, contractor IP assignment gaps, and any single vendor the business can't survive losing.",
  },
  {
    title: "AI-Generated Code Risk",
    description:
      "Unreviewed AI-generated code with no clear owner, inconsistent patterns from tool-assisted changes, and commits nobody on the team can fully explain. A growing blind spot in smaller and earlier-stage software companies, assessed explicitly rather than assumed away.",
  },
];

export default function WhatWeAssessPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-20">
      <h1 className="text-3xl font-semibold tracking-tight text-graphite sm:text-4xl">
        Full Technical Stack Assessment
      </h1>
      <p className="mt-4 text-lg text-graphite/70">
        Not just a code review. A complete read on the technical risk of the business
        you&apos;re buying.
      </p>

      <div className="mt-12 flex flex-col gap-10">
        {categories.map((category) => (
          <div key={category.title} className="border-t border-slate/20 pt-6">
            <h2 className="text-lg font-semibold text-graphite">{category.title}</h2>
            <p className="mt-2 text-graphite/70">{category.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
