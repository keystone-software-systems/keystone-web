"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "./supabase/server";

export type AuthActionState = { error?: string; success?: boolean };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Derives the base URL from the incoming request's Host header instead of a
 * manually-maintained APP_BASE_URL env var, so magic links are correct on
 * production, preview deployments, and local dev without per-environment
 * config. Falls back to APP_BASE_URL/localhost only if Host is somehow absent.
 */
async function resolveBaseUrl(): Promise<string> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host");
  if (!host) return process.env.APP_BASE_URL ?? "http://localhost:3000";

  const proto =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");

  return `${proto}://${host}`;
}

/**
 * Generic magic-link/password/sign-out actions shared by apps/admin and
 * apps/portal — both auth against the same Supabase project, and both
 * dashboards live at "/" with "/login" as the sign-in route, so there's
 * nothing app-specific left to parameterize. apps/portal's self-serve
 * signUpWithPassword and profile provisioning stay local to that app —
 * apps/admin is invite-only and has neither.
 */
export async function sendMagicLink(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email || !EMAIL_RE.test(email)) {
    return { error: "Enter a valid email address." };
  }

  const supabase = await createClient();
  const baseUrl = process.env.APP_BASE_URL ?? "http://localhost:3000";

  // signInWithOtp never returns a user/session in its response (by design,
  // so the caller can't probe whether an email is already registered) — a
  // new-vs-returning-user check has to happen once they click the link, in
  // apps/portal's /auth/confirm/route.ts.
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${baseUrl}/auth/confirm`,
    },
  });

  if (error) {
    console.error("signInWithOtp failed", error);
    return { error: "Could not send the sign-in link. Try again." };
  }

  return { success: true };
}

export async function signInWithPassword(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Incorrect email or password." };
  }

  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
