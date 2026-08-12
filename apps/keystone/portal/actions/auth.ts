"use server";

import { redirect } from "next/navigation";
import { createClient, type AuthActionState } from "@keystone/db";
import { ensureClientProfile, linkClientByEmail } from "@/lib/auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * apps/portal-only: self-serve client signup. apps/admin has no equivalent —
 * staff/viewer/engineer accounts are provisioned out-of-band by the founder,
 * never through a public signup form.
 */
export async function signUpWithPassword(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !EMAIL_RE.test(email)) {
    return { error: "Enter a valid email address." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const supabase = await createClient();
  const baseUrl = process.env.APP_BASE_URL ?? "http://localhost:3000";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${baseUrl}/auth/confirm`,
    },
  });

  if (error) {
    console.error("signUp failed", error);
    return { error: "Could not create your account. Try again." };
  }

  if (data.user) {
    await ensureClientProfile(data.user.id, email);
    await linkClientByEmail(data.user.id, email);
  }

  // Email confirmation off: signUp already returned an active session.
  if (data.session) {
    redirect("/");
  }

  return { success: true };
}
