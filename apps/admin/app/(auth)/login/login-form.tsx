"use client";

import { useState, useTransition } from "react";
import { sendMagicLink } from "@/actions/auth";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const result = await sendMagicLink(email);
          setMessage(result.message);
        });
      }}
      className="flex flex-col gap-4"
    >
      <label className="flex flex-col gap-1 text-sm font-medium">
        Email
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@keystone.systems"
          className="rounded-md border border-pale-blue bg-white px-3 py-2 text-blueprint-navy outline-none focus:border-technical-blue"
        />
      </label>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-blueprint-navy px-4 py-2 text-sm font-semibold text-white transition hover:bg-technical-blue disabled:opacity-60"
      >
        {isPending ? "Sending…" : "Send sign-in link"}
      </button>
      {message && <p className="text-sm text-slate">{message}</p>}
    </form>
  );
}
