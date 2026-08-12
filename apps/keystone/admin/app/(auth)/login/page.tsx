import { AuthForm } from "@keystone/ui";
import { sendMagicLink, signInWithPassword } from "@keystone/db";

export default function LoginPage() {
  return (
    <AuthForm
      title="Keystone Admin"
      emailPlaceholder="you@keystone.systems"
      variant="signin"
      passwordAction={signInWithPassword}
      magicLinkAction={sendMagicLink}
    />
  );
}
