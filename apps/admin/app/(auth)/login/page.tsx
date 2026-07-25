"use client";

import { useActionState } from "react";
import { sendMagicLink, type SendMagicLinkState } from "@/actions/auth";

const initialState: SendMagicLinkState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(sendMagicLink, initialState);

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="text-xl font-semibold text-blueprint-navy">Keystone Admin</h1>
      <p className="mt-1 text-sm text-slate">
        Enter your email and we&apos;ll send you a sign-in link.
      </p>

      {state.success ? (
        <p className="mt-6 text-sm text-blueprint-navy">
          Check your email for a sign-in link.
        </p>
      ) : (
        <form action={formAction} className="mt-6 flex flex-col gap-3">
          <input
            type="email"
            name="email"
            required
            placeholder="you@keystone.systems"
            className="rounded-md border border-slate/30 bg-white px-3 py-2 text-sm text-blueprint-navy outline-none focus:border-technical-blue"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-blueprint-navy px-3 py-2 text-sm font-medium text-white hover:bg-technical-blue disabled:opacity-60"
          >
            {pending ? "Sending…" : "Send sign-in link"}
          </button>
          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        </form>
      )}
    </div>
  );
}
