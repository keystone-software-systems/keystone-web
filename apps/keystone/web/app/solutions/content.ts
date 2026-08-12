import type { Solution } from "@/lib/solutions";

export const solutions: Solution[] = [
  {
    slug: "net-new-development",
    title: "New Development",
    category: "Net New Development",
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
    title: "Production Hardening",
    category: "Vibe-Code to Production",
    headline: "Find out what's actually solid before real users do",
    description:
      "AI tools make it easy to ship a working prototype fast. They don't know what they don't know, and they won't tell you which parts are about to break, because they're built to say yes. We audit the codebase, name exactly what's solid and what isn't, and fix what needs fixing before real users or a funding round put weight on a foundation that can't hold it.",
    whoFor: [
      "Non-technical or semi-technical founders with a working AI-built MVP",
      "Teams with real users or a funding round riding on a prototype they can't fully vouch for",
      "Anyone who can't tell if their AI-built product is a solid foundation or a house of cards",
    ],
    whatYouGet: [
      "A specific list of what's solid, what's broken, and what it costs to fix",
      "Fixes to the architecture, data model, and security gaps that matter most",
      "A system that holds up under real users and real growth, not just a demo",
    ],
  },
  {
    slug: "business-process-automation",
    title: "Process Automation",
    category: "Business Process Automation",
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
    slug: "ai-training-setup",
    title: "AI Training",
    category: "AI Training & Setup",
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
    title: "Codebase Modernization",
    category: "Existing Codebase Improvement",
    headline: "A second set of senior eyes on your existing system",
    description:
      "Not every engagement starts from zero. Technical debt is cheap to fix early and expensive to fix after it's caused an outage or blocked a launch. We drop into an existing codebase for audits, refactors, and ongoing feature development, bringing senior-level judgment to a system someone else already built.",
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
