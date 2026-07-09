import Link from "next/link";
import type { Solution } from "@/lib/solutions";

export function SolutionCard({ solution }: { solution: Solution }) {
  return (
    <Link
      href={`/solutions/${solution.slug}`}
      className="group flex flex-col rounded-lg border border-slate/20 bg-white p-6 transition-colors hover:border-technical-blue"
    >
      <h3 className="text-lg font-semibold text-blueprint-navy">{solution.title}</h3>
      <p className="mt-2 text-sm text-blueprint-navy/70">{solution.headline}</p>
      <span className="mt-4 text-sm font-medium text-technical-blue group-hover:underline">
        Learn more &rarr;
      </span>
    </Link>
  );
}
