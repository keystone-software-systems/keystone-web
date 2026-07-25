import { AuthForm } from "@keystone/ui";
import { sendMagicLink, signInWithPassword } from "@keystone/db";

export default function LoginPage() {
  return (
    <AuthForm
      title="Keystone Systems"
      variant="signin"
      passwordAction={signInWithPassword}
      magicLinkAction={sendMagicLink}
      switchAccount={{ href: "/signup", prompt: "Don't have an account?", linkLabel: "Create one" }}
    />
  );
}
