import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";
import { createClient } from "@keystone/db";
import { ensureClientProfile } from "@/lib/auth";

// Landing point for the magic-link/signup-confirmation email. Supabase sends
// the signed-in user here with a one-time token_hash; verifying it
// establishes the session. This is also the first point where a brand-new
// magic-link signup has a real user id, so it's where self-serve profile
// provisioning happens for that path (signUpWithPassword provisions
// immediately instead, since it already has the id).
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  if (token_hash && type) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      if (data.user?.email) {
        await ensureClientProfile(data.user.id, data.user.email);
      }
      redirect(next);
    }
  }

  redirect("/auth/auth-code-error");
}
