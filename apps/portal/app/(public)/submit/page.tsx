import type { Metadata } from "next";
import { SubmitForm } from "@/components/submit-form";

export const metadata: Metadata = {
  title: "Submit a project — Keystone Systems",
  description: "Describe your project and get it into Keystone Systems' pipeline. No account required.",
};

export default function SubmitPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-12">
      <h1 className="text-xl font-semibold text-blueprint-navy">Submit a project</h1>
      <p className="mt-1 text-sm text-slate">
        Tell us what you need. No account required to submit — you&apos;ll get an email link to
        check on it afterward.
      </p>
      <SubmitForm />
    </div>
  );
}
