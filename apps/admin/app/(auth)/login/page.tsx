import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-pale-blue bg-white p-8 shadow-sm">
        <h1 className="mb-1 font-mono text-lg font-semibold text-blueprint-navy">
          Keystone Admin
        </h1>
        <p className="mb-6 text-sm text-slate">
          Sign in with your Keystone email. Access is provisioned per person — there is no signup.
        </p>
        {error === "not_provisioned" && (
          <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            That account isn&apos;t provisioned for admin access.
          </p>
        )}
        <LoginForm />
      </div>
    </div>
  );
}
