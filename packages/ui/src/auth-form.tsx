"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import type { AuthActionState } from "@keystone/db";
import { Button } from "./button";
import { TextInput } from "./input";
import { KeystoneLogo } from "./logo";

type ServerAction = (state: AuthActionState, formData: FormData) => Promise<AuthActionState>;

type Props = {
  title: string;
  emailPlaceholder?: string;
  passwordAction: ServerAction;
  magicLinkAction: ServerAction;
  variant: "signin" | "signup";
  switchAccount?: { href: string; prompt: string; linkLabel: string };
};

const initialState: AuthActionState = {};

const COPY = {
  signin: {
    passwordPrompt: "Sign in to your account.",
    passwordSubmitLabel: "Sign in",
    passwordPendingLabel: "Signing in…",
    passwordMinLength: undefined as number | undefined,
    magicLinkPrompt: "Enter your email and we'll send you a sign-in link.",
    magicLinkSubmitLabel: "Send sign-in link",
    magicLinkPendingLabel: "Sending…",
    magicLinkSuccessMessage: "Check your email for a sign-in link.",
  },
  signup: {
    passwordPrompt: "Set a password to get started.",
    passwordSubmitLabel: "Create account",
    passwordPendingLabel: "Creating account…",
    passwordMinLength: 8 as number | undefined,
    magicLinkPrompt: "Enter your email and we'll send you a link to get started.",
    magicLinkSubmitLabel: "Send me a link",
    magicLinkPendingLabel: "Sending…",
    magicLinkSuccessMessage: "Check your email for a link to get started.",
  },
} as const;

/**
 * Shared by apps/admin and apps/portal — both auth against the same
 * Supabase project via `signInWithPassword`/`signUp`/`signInWithOtp`, so the
 * form only differs by copy and which Server Actions are wired in.
 */
export function AuthForm({
  title,
  emailPlaceholder = "you@example.com",
  passwordAction,
  magicLinkAction,
  variant,
  switchAccount,
}: Props) {
  const [mode, setMode] = useState<"password" | "magic-link">("password");
  const [passwordState, passwordFormAction, passwordPending] = useActionState(passwordAction, initialState);
  const [magicLinkState, magicLinkFormAction, magicLinkPending] = useActionState(magicLinkAction, initialState);
  const copy = COPY[variant];

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <KeystoneLogo />
      <h1 className="mt-6 text-xl font-semibold text-blueprint-navy">{title}</h1>
      <p className="mt-1 text-sm text-slate">{mode === "password" ? copy.passwordPrompt : copy.magicLinkPrompt}</p>

      {mode === "password" ? (
        variant === "signup" && passwordState.success ? (
          <p className="mt-6 text-sm text-blueprint-navy">Check your email to confirm your account.</p>
        ) : (
          <form action={passwordFormAction} className="mt-6 flex flex-col gap-3">
            <TextInput type="email" name="email" required placeholder={emailPlaceholder} />
            <TextInput
              type="password"
              name="password"
              required
              minLength={copy.passwordMinLength}
              placeholder="Password"
            />
            <Button type="submit" disabled={passwordPending}>
              {passwordPending ? copy.passwordPendingLabel : copy.passwordSubmitLabel}
            </Button>
            {passwordState.error && <p className="text-sm text-red-600">{passwordState.error}</p>}
          </form>
        )
      ) : magicLinkState.success ? (
        <p className="mt-6 text-sm text-blueprint-navy">{copy.magicLinkSuccessMessage}</p>
      ) : (
        <form action={magicLinkFormAction} className="mt-6 flex flex-col gap-3">
          <TextInput type="email" name="email" required placeholder={emailPlaceholder} />
          <Button type="submit" disabled={magicLinkPending}>
            {magicLinkPending ? copy.magicLinkPendingLabel : copy.magicLinkSubmitLabel}
          </Button>
          {magicLinkState.error && <p className="text-sm text-red-600">{magicLinkState.error}</p>}
        </form>
      )}

      <button
        type="button"
        onClick={() => setMode(mode === "password" ? "magic-link" : "password")}
        className="mt-4 text-left text-sm text-technical-blue hover:underline"
      >
        {mode === "password" ? "Use a magic link instead" : "Use a password instead"}
      </button>

      {switchAccount && (
        <p className="mt-6 text-sm text-slate">
          {switchAccount.prompt}{" "}
          <Link href={switchAccount.href} className="font-medium text-technical-blue hover:underline">
            {switchAccount.linkLabel}
          </Link>
        </p>
      )}
    </div>
  );
}
