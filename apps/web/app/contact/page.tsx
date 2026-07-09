import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Talk through your situation with Keystone Systems.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="text-3xl font-semibold tracking-tight text-blueprint-navy sm:text-4xl">
        Talk through your situation
      </h1>
      <p className="mt-4 text-lg text-blueprint-navy/70">
        Tell us what you&apos;re working on and what decision you&apos;re facing. We&apos;ll get back to you to
        set up a call.
      </p>
      <div className="mt-10">
        <ContactForm />
      </div>
    </div>
  );
}
