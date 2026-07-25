import { AuthForm } from "@keystone/ui";
import { sendMagicLink } from "@keystone/db";
import { signUpWithPassword } from "@/actions/auth";

export default function SignupPage() {
  return (
    <AuthForm
      title="Create your account"
      variant="signup"
      passwordAction={signUpWithPassword}
      magicLinkAction={sendMagicLink}
      switchAccount={{ href: "/login", prompt: "Already have an account?", linkLabel: "Log in" }}
    />
  );
}
