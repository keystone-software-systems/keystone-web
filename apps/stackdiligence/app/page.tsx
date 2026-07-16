import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const processSteps = [
  "Kickoff call",
  "Data room & access review",
  "Technical assessment",
  "Team interviews",
  "Report delivery",
];

const covers = [
  {
    title: "Codebase & architecture",
    description: "Is it maintainable, or inherited debt.",
  },
  {
    title: "Infrastructure & scalability",
    description: "What breaks, and at what growth curve.",
  },
  {
    title: "Security & compliance",
    description: "Exposure you'd be buying into.",
  },
  {
    title: "Team & continuity",
    description: "Key-person risk, what leaves when the founder does.",
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
            name: "StackDiligence",
            url: "https://stackdiligence.com",
            description:
              "Technical due diligence for software acquisitions: a full-stack assessment of what you're actually buying.",
            areaServed: "Worldwide",
            serviceType: "Technical Due Diligence",
          }),
        }}
      />

      <section className="border-b border-slate/20">
        <div className="mx-auto max-w-4xl px-6 pb-20 pt-20 sm:pt-28">
          <h1 className="text-4xl font-semibold tracking-tight text-graphite sm:text-5xl">
            Know what you&apos;re actually buying.
          </h1>
          <p className="mt-6 text-lg text-graphite/70">
            Most deal teams don&apos;t have anyone who can tell them what they&apos;re actually
            buying, technically. We do: full-stack technical due diligence for software
            acquisitions, translated into terms your deal team can act on.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="rounded-md bg-graphite px-6 py-3 text-sm font-medium text-paper hover:bg-steel"
            >
              Book a call
            </Link>
            <Link
              href="/sample-report"
              className="rounded-md border border-slate/30 px-6 py-3 text-sm font-medium text-graphite hover:border-steel hover:text-steel"
            >
              See a sample report
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-slate/20 bg-white py-16">
        <div className="mx-auto max-w-3xl px-6">
          <p className="text-xl font-semibold text-graphite sm:text-2xl">
            Software doesn&apos;t come with a Carfax.
          </p>
          <p className="mt-4 text-lg text-graphite/70">
            A used car with a bad engine makes noise. A software company with a bad architecture,
            a security hole, or a key-person dependency looks exactly like a healthy one, right up
            until you own it. That&apos;s what this catches before you close, not after.
          </p>
          <p className="mt-6 text-lg text-graphite/70">
            You don&apos;t need to know how to read code to know if you&apos;re overpaying for a
            software company. Before you close, someone who&apos;s actually built and scaled
            production systems should tell you what&apos;s underneath: what will hold up, what
            will cost you six months post-close, and what&apos;s a walk-away issue. That&apos;s
            the job.
          </p>
        </div>
      </section>

      <section className="border-t border-slate/20 bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-steel">
            What this covers
          </h2>
          <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {covers.map((item) => (
              <div key={item.title}>
                <h3 className="text-base font-semibold text-graphite">{item.title}</h3>
                <p className="mt-2 text-sm text-graphite/70">{item.description}</p>
              </div>
            ))}
          </div>
          <Link
            href="/what-we-assess"
            className="mt-8 inline-block text-sm font-medium text-steel hover:underline"
          >
            See the full assessment &rarr;
          </Link>
        </div>
      </section>

      <section className="border-t border-slate/20 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-steel">How it works</h2>
          <p className="mt-2 max-w-2xl text-lg text-graphite">
            1&ndash;3 weeks, start to report in hand.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {processSteps.map((step, i) => (
              <div key={step}>
                <span className="text-sm font-semibold text-steel">{i + 1}</span>
                <h3 className="mt-1 text-sm font-semibold text-graphite">{step}</h3>
              </div>
            ))}
          </div>
          <Link
            href="/process"
            className="mt-8 inline-block text-sm font-medium text-steel hover:underline"
          >
            See the full process &rarr;
          </Link>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-sm font-medium text-graphite/70">
            Background across Microsoft and Stripe, building and operating the kind of systems now
            being evaluated. Built for deal teams at smaller PE and VC firms without technical
            staff in-house. Engagements run 1&ndash;3 weeks, fixed fee, scoped to the deal rather
            than billed by the hour.
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-block rounded-md bg-graphite px-6 py-3 text-sm font-medium text-paper hover:bg-steel"
          >
            Book a call
          </Link>
        </div>
      </section>
    </>
  );
}
