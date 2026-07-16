import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with StackDiligence about a deal.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="text-3xl font-semibold tracking-tight text-graphite sm:text-4xl">
        Get in Touch
      </h1>
      <p className="mt-4 text-lg text-graphite/70">
        A few details on the deal and timeline, and we&apos;ll set up a direct call to talk it
        through.
      </p>
      <div className="mt-10">
        <ContactForm />
      </div>
    </div>
  );
}
