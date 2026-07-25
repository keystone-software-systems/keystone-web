"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type SendMagicLinkState = { error?: string; success?: boolean };

export async function sendMagicLink(
  _prevState: SendMagicLinkState,
  formData: FormData,
): Promise<SendMagicLinkState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email address." };
  }

  const supabase = await createClient();
  const baseUrl = process.env.APP_BASE_URL ?? "http://localhost:3000";

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

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
