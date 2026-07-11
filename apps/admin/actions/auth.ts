"use server";

import { createClient } from "@/lib/supabase/server";

export interface SendMagicLinkResult {
  ok: boolean;
  message: string;
}

export async function sendMagicLink(email: string): Promise<SendMagicLinkResult> {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed || !trimmed.includes("@")) {
    return { ok: false, message: "Enter a valid email address." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: trimmed,
    options: {
      emailRedirectTo: `${process.env.APP_BASE_URL}/auth/callback`,
    },
  });

  if (error) {
    return { ok: false, message: "Could not send the sign-in link. Try again." };
  }

  // Deliberately vague: do not reveal whether the email is provisioned.
  return { ok: true, message: "Check your email for a sign-in link." };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
