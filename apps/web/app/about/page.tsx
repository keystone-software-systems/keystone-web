import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "Keystone Systems is a solo, founder-led engineering consultancy built around senior technical judgment, not commodity development capacity.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="text-3xl font-semibold tracking-tight text-blueprint-navy sm:text-4xl">
        About Keystone Systems
      </h1>

      <div className="mt-8 flex flex-col gap-6 text-lg text-blueprint-navy/70">
        <p>
          Keystone Systems is a solo, founder-led software engineering consultancy built around
          senior technical judgment: architecture decisions, scoping, and hands-on engineering,
          rather than commodity development capacity.
        </p>
        <p>
          Clients bring Keystone Systems in for the decisions that are expensive to get wrong and
          hard to undo later, not for headcount augmentation. The firm is meant to be the call a
          company makes before a big technical decision, not after.
        </p>
        <p>
          The founder is a Senior/Staff-level software engineer, currently working remotely at
          Cedar. Prior experience includes a role as Principal Software Engineer at Microsoft and
          an engineering role at Stripe. That background shapes the firm&apos;s actual differentiation:
          thinking in terms of long-term defensibility, architecture tradeoffs, and systems-level
          design, the kind of judgment that typically comes from having built and scaled real
          infrastructure at large-scale technical organizations.
        </p>
        <p>
          Keystone Systems isn&apos;t a dev shop. It doesn&apos;t compete on headcount, cheap hourly rates,
          or speed of delivery alone. It competes on the quality of technical decisions made
          early, which is what prevents expensive rework later. Because the firm covers six
          distinct service lines, from net-new builds to due diligence to AI adoption, it&apos;s best
          understood as a technical judgment and systems-advisory practice, not narrowly as
          &ldquo;a software development shop.&rdquo;
        </p>
      </div>

      <div className="mt-12 border-t border-slate/20 pt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-blueprint-navy">
          Approach
        </h2>
        <p className="mt-4 text-blueprint-navy/70">
          Every engagement starts with scoping the actual decision at hand, not the tech stack.
          From there, work is hands-on, whether that means building, advising, or auditing, and
          ends with a clean handoff so your team isn&apos;t dependent on us to maintain what we built.
        </p>
        <Link
          href="/contact"
          className="mt-6 inline-block rounded-md bg-blueprint-navy px-6 py-3 text-sm font-medium text-white hover:bg-technical-blue"
        >
          Talk through your situation
        </Link>
      </div>
    </div>
  );
}
