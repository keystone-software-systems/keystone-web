"use client";

import { signOut } from "@/actions/auth";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button type="submit" className="text-sm text-slate hover:text-blueprint-navy">
        Sign out
      </button>
    </form>
  );
}
