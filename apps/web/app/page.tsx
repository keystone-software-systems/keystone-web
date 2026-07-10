import type { Metadata } from "next";
import Link from "next/link";
import { solutions } from "@/app/solutions/content";
import { SolutionCard } from "@/components/solution-card";
import { ArchDiagram } from "@/components/arch-diagram";
import { RotatingQuestion } from "@/components/rotating-question";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const steps = [
  {
    title: "Scope",
    description:
      "We start by understanding the problem, not the tech stack. What's the decision that's expensive to get wrong, and what does a good outcome look like?",
  },
  {
    title: "Build / Advise",
    description:
      "Hands-on engineering or hands-on advising, depending on what the engagement calls for. Either way, you get direct senior involvement, not delegated work.",
  },
  {
    title: "Handoff",
    description:
      "A clean handoff to your team, with documentation and context, not a black box you're dependent on us to maintain.",
  },
];

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ProfessionalService",
            name: "Keystone Systems",
            url: "https://keystone.systems",
            description:
              "Software engineering consultancy providing architecture, technical strategy, and senior-level engineering judgment for growing companies.",
            areaServed: "Worldwide",
            serviceType: solutions.map((s) => s.category),
          }),
        }}
      />

      <section className="blueprint-grid border-b border-slate/20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-20 pt-20 sm:pt-28 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="max-w-2xl">
            <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-technical-blue">
              Keystone Systems
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-blueprint-navy sm:text-5xl">
              Senior engineering judgment, without the full-time hire
            </h1>
            <p className="mt-6 text-lg text-blueprint-navy/70">
              From new builds to production-hardening to technical due diligence, Keystone Systems
              brings staff-level engineering judgment to the decisions that are expensive to get
              wrong and hard to undo later.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="rounded-md bg-blueprint-navy px-6 py-3 text-sm font-medium text-white hover:bg-technical-blue"
              >
                Talk through your situation
              </Link>
              <Link
                href="#solutions"
                className="rounded-md border border-slate/30 px-6 py-3 text-sm font-medium text-blueprint-navy hover:border-technical-blue hover:text-technical-blue"
              >
                See what we do
              </Link>
            </div>
          </div>
          <div className="hidden justify-self-center lg:flex">
            <ArchDiagram />
          </div>
        </div>
      </section>

      <section className="border-t border-slate/20 bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-technical-blue">
            How we work
          </h2>
          <div className="mt-6 grid gap-8 sm:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.title}>
                <span className="text-sm font-semibold text-blueprint-navy/70">0{i + 1}</span>
                <h3 className="mt-2 text-lg font-semibold text-blueprint-navy">{step.title}</h3>
                <p className="mt-2 text-sm text-blueprint-navy/70">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="solutions" className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-technical-blue">
            Solutions
          </h2>
          <p className="mt-2 max-w-2xl text-lg text-blueprint-navy">
            Six ways to bring in senior engineering judgment, scoped to a specific moment.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {solutions.map((solution) => (
              <SolutionCard key={solution.slug} solution={solution} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate/20 bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-technical-blue">
            About the founder
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-blueprint-navy">
            Keystone Systems is led by a Principal Software Engineer at Microsoft, with prior
            experience as a Senior Software Engineer at Stripe — over a decade building
            production systems at real scale, including systems that processed billions of
            dollars in transactions a day. That background shapes how engagements are scoped:
            long-term defensibility, architecture tradeoffs, and systems built to hold up under
            real load, not just a demo.
          </p>
          <Link
            href="/about"
            className="mt-4 inline-block text-sm font-medium text-technical-blue hover:underline"
          >
            More about the firm &rarr;
          </Link>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <RotatingQuestion />
          <p className="mt-3 text-blueprint-navy/70">Let&apos;s talk through your situation before you commit to a direction.</p>
          <Link
            href="/contact"
            className="mt-6 inline-block rounded-md bg-blueprint-navy px-6 py-3 text-sm font-medium text-white hover:bg-technical-blue"
          >
            Get in touch
          </Link>
        </div>
      </section>
    </>
  );
}
