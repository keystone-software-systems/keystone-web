import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why StackDiligence's technical read on a software acquisition is different from generalist diligence.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="text-3xl font-semibold tracking-tight text-graphite sm:text-4xl">
        Why This Lens Is Different
      </h1>

      <div className="mt-8 flex flex-col gap-6 text-lg text-graphite/70">
        <p>
          StackDiligence is built around a founder who&apos;s been the engineer responsible for
          the kind of systems you&apos;re now evaluating: formerly a Senior Software Engineer at
          Stripe and a Principal Software Engineer at Microsoft (
          <a
            href="https://www.linkedin.com/in/tannerbarlow/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-steel hover:underline"
          >
            full background on LinkedIn
          </a>
          ). That background means knowing what production-grade actually looks like, and what it
          looks like when a system is held together by habit rather than design.
        </p>
        <p>
          It&apos;s a specialist assessment from someone who has built, scaled, and operated real
          systems under real constraints, applied to the specific question a deal team is actually
          asking: what does this cost me after I own it.
        </p>
      </div>

      <div className="mt-12 border-t border-slate/20 pt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-graphite">
          Assessment, not a guarantee
        </h2>
        <p className="mt-4 text-graphite/70">
          Findings reflect what&apos;s knowable from whatever codebase, infrastructure, and
          documentation access was available during the engagement window. It&apos;s a point-in-time
          technical read to inform a deal decision, not an ongoing warranty on the target&apos;s
          systems.
        </p>
        <Link
          href="/contact"
          className="mt-6 inline-block rounded-md bg-graphite px-6 py-3 text-sm font-medium text-paper hover:bg-steel"
        >
          Book a call
        </Link>
      </div>
    </div>
  );
}
