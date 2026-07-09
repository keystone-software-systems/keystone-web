import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { solutions, getSolution } from "@/app/solutions/content";

export function generateStaticParams() {
  return solutions.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const solution = getSolution(slug);
  if (!solution) return {};

  return {
    title: solution.title,
    description: solution.description,
    alternates: { canonical: `/solutions/${solution.slug}` },
    openGraph: {
      title: solution.title,
      description: solution.description,
    },
  };
}

export default async function SolutionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const solution = getSolution(slug);
  if (!solution) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <p className="text-sm font-semibold uppercase tracking-wide text-technical-blue">
        {solution.title}
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-blueprint-navy sm:text-4xl">
        {solution.headline}
      </h1>
      <p className="mt-6 text-lg text-blueprint-navy/70">{solution.description}</p>

      <div className="mt-12 grid gap-10 sm:grid-cols-2">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-blueprint-navy">
            Who this is for
          </h2>
          <ul className="mt-4 flex flex-col gap-3">
            {solution.whoFor.map((item) => (
              <li key={item} className="text-sm text-blueprint-navy/70">
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-blueprint-navy">
            What you get
          </h2>
          <ul className="mt-4 flex flex-col gap-3">
            {solution.whatYouGet.map((item) => (
              <li key={item} className="text-sm text-blueprint-navy/70">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-14 border-t border-slate/20 pt-10">
        <Link
          href="/contact"
          className="inline-block rounded-md bg-blueprint-navy px-6 py-3 text-sm font-medium text-white hover:bg-technical-blue"
        >
          Talk through your situation
        </Link>
      </div>
    </div>
  );
}
