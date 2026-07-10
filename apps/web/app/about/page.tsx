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
          AI coding tools collapsed the cost of producing code. They didn&apos;t collapse the cost
          of knowing whether that code is sound. Writing code was never the scarce, valuable
          part, and now that anyone can generate a plausible-looking product in a weekend, the
          market is flooded with unverified systems built by people who can produce code but
          can&apos;t evaluate what they produced. That&apos;s the gap Keystone Systems fills: not
          &ldquo;AI-assisted development,&rdquo; which every freelancer and dev shop now claims, but the
          judgment layer sitting on top of it, knowing what to build, what to refuse to build, and
          which shortcuts are harmless versus which ones quietly become an outage or a failed
          audit six months out.
        </p>
        <p>
          Keystone Systems is a solo, founder-led software engineering consultancy built around
          that judgment: architecture decisions, scoping, and hands-on engineering, rather than
          commodity development capacity. Clients bring it in for the decisions that are expensive
          to get wrong and hard to undo later, not for headcount augmentation. The firm is meant
          to be the call a company makes before a big technical decision, not after.
        </p>
        <p>
          The founder spent over a decade in engineering, starting as a new-grad at Microsoft and
          reaching Senior Software Engineer within three years, then building core payments
          infrastructure as a senior engineer at Stripe on systems that processed billions of
          dollars in transactions a day, before returning to Microsoft as a Principal Software
          Engineer. That trajectory means having been on-call for what happens when a shortcut
          turns out to be a landmine, which is the actual source of the judgment: architecture
          calls that still hold up under real production load two years in, not just at launch.
        </p>
        <p>
          Fluency with AI-assisted development tools is part of how the firm operates day to day,
          but it&apos;s the delivery mechanism, not the pitch. It&apos;s what lets one person deliver
          senior-level judgment at solo speed, without the standups, handoffs, and telephone-game
          overhead a traditional dev shop needs to move at the same pace.
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
          Every engagement starts with scoping the actual decision at hand, not the tech stack,
          and is priced to that outcome up front rather than billed hourly, so incentives stay
          aligned toward moving fast rather than dragging things out. From there, work is
          hands-on, whether that means building, advising, or auditing. Most engagements end with
          a clean handoff so your team isn&apos;t dependent on us to maintain what we built; for
          companies that want continued senior technical leadership without a full-time hire,
          ongoing or fractional-CTO-style arrangements are available too.
        </p>
        <p className="mt-4 text-blueprint-navy/70">
          Keystone Systems is solo-led, but not a single point of failure: the founder works
          alongside a small network of equally experienced independent engineers who can jump in
          when a timeline calls for extra hands, adding capacity rather than replacing who
          you&apos;re working with. And if something delivered doesn&apos;t hold up the way it
          should, that&apos;s on Keystone Systems to fix, not on you to discover the hard way.
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
