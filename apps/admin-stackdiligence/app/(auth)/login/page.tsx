import { AuthForm } from "@keystone/ui";
import { sendMagicLink, signInWithPassword } from "@keystone/db";

export default function LoginPage() {
  return (
    <AuthForm
      title="StackDiligence Admin"
      emailPlaceholder="you@stackdiligence.com"
      variant="signin"
      passwordAction={signInWithPassword}
      magicLinkAction={sendMagicLink}
    />
  );
}
