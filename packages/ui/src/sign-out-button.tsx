"use client";

type Props = {
  action: () => void | Promise<void>;
};

export function SignOutButton({ action }: Props) {
  return (
    <form action={action}>
      <button type="submit" className="text-sm text-slate hover:text-blueprint-navy">
        Sign out
      </button>
    </form>
  );
}
