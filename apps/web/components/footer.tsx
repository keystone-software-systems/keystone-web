import Link from "next/link";
import Image from "next/image";
import { solutions } from "@/app/solutions/content";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate/20 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <Image
              src="/brand/keystone-logomark-navy.svg"
              alt="Keystone Systems"
              width={160}
              height={44}
              className="h-7 w-auto"
            />
            <p className="mt-4 max-w-xs text-sm text-blueprint-navy/70">
              Senior engineering judgment, without the full-time hire.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blueprint-navy/70">Solutions</p>
            <ul className="mt-3 flex flex-col gap-2">
              {solutions.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/solutions/${s.slug}`}
                    className="text-sm text-blueprint-navy hover:text-technical-blue"
                  >
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blueprint-navy/70">Company</p>
            <ul className="mt-3 flex flex-col gap-2">
              <li>
                <Link href="/about" className="text-sm text-blueprint-navy hover:text-technical-blue">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-blueprint-navy hover:text-technical-blue">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-slate/20 pt-6 text-xs text-blueprint-navy/70 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {year} Keystone Systems. All rights reserved.</p>
          <p>keystone.systems</p>
        </div>
      </div>
    </footer>
  );
}
