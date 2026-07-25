import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 text-center">
      <h1 className="text-lg font-semibold text-blueprint-navy">Sign-in link expired</h1>
      <p className="mt-2 text-sm text-slate">That link is no longer valid. Request a new one.</p>
      <Link href="/login" className="mt-6 text-sm font-medium text-technical-blue hover:underline">
        Back to sign in
      </Link>
    </div>
  );
}
