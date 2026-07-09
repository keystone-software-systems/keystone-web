import type { Solution } from "@/lib/solutions";

export const solutions: Solution[] = [
  {
    slug: "net-new-development",
    title: "Net New Development",
    headline: "A greenfield build, done right the first time",
    description:
      "For companies that need new software built from scratch, not fast and disposable. We scope the architecture up front, make the calls that are expensive to reverse later, and build a system your team can maintain long after the engagement ends.",
    whoFor: [
      "Startups building a first version of a core product",
      "Companies launching a new product line or internal system",
      "Teams that need senior architectural judgment before writing code, not after",
    ],
    whatYouGet: [
      "An architecture and technical scope you can hand to any engineering team",
      "A working, production-grade system, not a prototype",
      "Documentation and a clean handoff to your internal team",
    ],
  },
  {
    slug: "vibe-code-to-production",
    title: "Vibe-Code to Production",
    headline: "Take your AI-generated prototype to production, safely",
    description:
      "AI tools make it easy to get a working prototype fast. They don't make it production-ready. We audit what's there, fix the parts that will break under real users, and harden the system so it can actually run your business.",
    whoFor: [
      "Non-technical or semi-technical founders with a working AI-built MVP",
      "Teams that vibe-coded a prototype and now have real users or funding",
      "Anyone unsure whether their prototype's foundation will hold up",
    ],
    whatYouGet: [
      "A clear-eyed technical assessment of what's solid and what isn't",
      "Fixes to the architecture, data model, and security gaps that matter most",
      "A system that's ready for real users, not just a demo",
    ],
  },
  {
    slug: "business-process-automation",
    title: "Business Process Automation",
    headline: "Automate the manual work that's slowing your team down",
    description:
      "Every growing company accumulates manual, repetitive, error-prone workflows. We find the ones worth automating, build the automation, and integrate it into how your team already works.",
    whoFor: [
      "Operations teams doing repetitive work by hand across tools",
      "Companies scaling past the point where manual processes hold up",
      "Teams that know something should be automated but haven't scoped it",
    ],
    whatYouGet: [
      "An audit of your current workflow and where it breaks down",
      "A working automation integrated with your existing tools",
      "Fewer manual steps and fewer opportunities for human error",
    ],
  },
  {
    slug: "acquisition-due-diligence",
    title: "Acquisition Due Diligence",
    headline: "Know what you're buying before you close",
    description:
      "An independent technical assessment of a target company's codebase, architecture, and engineering risk, delivered before the deal closes. We look at what a buyer actually needs to know: technical debt, scalability, security posture, and the true cost of maintaining what's there.",
    whoFor: [
      "Buyers and investors evaluating a software-driven acquisition",
      "Private equity and holding companies doing technical inspection ahead of a deal",
      "Anyone who needs a second, independent set of senior technical eyes before closing",
    ],
    whatYouGet: [
      "A written technical risk assessment of the target's codebase and architecture",
      "A clear view of technical debt and what it will cost to address",
      "Findings delivered on your deal timeline",
    ],
  },
  {
    slug: "ai-training-setup",
    title: "AI Training & Setup",
    headline: "Stand up AI tooling and workflows the right way",
    description:
      "Adopting AI-assisted development or internal AI tooling haphazardly creates as many problems as it solves. We help your team set up the tools, workflows, and guardrails so adoption actually sticks.",
    whoFor: [
      "Engineering teams adopting AI-assisted development practices",
      "Companies rolling out internal AI tooling without a clear plan",
      "Teams that want AI adoption guided by someone who's done it, not a vendor pitch",
    ],
    whatYouGet: [
      "An AI tooling and workflow setup fit to your team's actual work",
      "Hands-on training so the tools get used, not shelved",
      "Guardrails that keep adoption safe and consistent",
    ],
  },
  {
    slug: "codebase-improvement",
    title: "Existing Codebase Improvement",
    headline: "A second set of senior eyes on your existing system",
    description:
      "Not every engagement starts from zero. We drop into an existing codebase for audits, refactors, and ongoing feature development, bringing senior-level judgment to a system someone else already built.",
    whoFor: [
      "Teams with an existing codebase who need outside senior help",
      "Companies without a long-term hiring commitment who still need staff-level judgment",
      "Engineering teams that want an audit before a major refactor or scale-up",
    ],
    whatYouGet: [
      "A codebase audit identifying risk, debt, and quick wins",
      "Hands-on refactoring or feature work where it matters most",
      "Ongoing improvement, scoped to what your team actually needs",
    ],
  },
];

export function getSolution(slug: string) {
  return solutions.find((s) => s.slug === slug);
}
