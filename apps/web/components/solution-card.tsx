import Link from "next/link";
import type { Solution } from "@/lib/solutions";

export function SolutionCard({ solution, index }: { solution: Solution; index: number }) {
  return (
    <Link
      href={`/solutions/${solution.slug}`}
      className="group grid items-baseline gap-x-8 gap-y-2 border-b border-slate/20 py-6 transition-colors hover:border-b-technical-blue sm:grid-cols-[56px_1fr_auto]"
    >
      <span className="font-mono text-sm text-slate">{String(index + 1).padStart(2, "0")}</span>
      <div>
        <h3 className="text-xl font-bold text-blueprint-navy group-hover:text-technical-blue">
          {solution.title}
        </h3>
        <p className="mt-1 text-sm text-blueprint-navy/70">{solution.headline}</p>
      </div>
      <span className="text-sm font-medium text-technical-blue opacity-0 transition-opacity group-hover:opacity-100">
        Learn more &rarr;
      </span>
    </Link>
  );
}
