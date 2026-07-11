"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { inviteUserAction } from "@/actions/settings";

export function InviteForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const form = new FormData(e.currentTarget);
        startTransition(async () => {
          try {
            await inviteUserAction({
              email: form.get("email"),
              fullName: form.get("fullName") || undefined,
              role: form.get("role"),
            });
            (e.target as HTMLFormElement).reset();
            router.refresh();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to invite user");
          }
        });
      }}
      className="flex flex-col gap-3 rounded-lg border border-pale-blue bg-white p-4"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <input name="email" type="email" required placeholder="Email" className="input" />
        <input name="fullName" placeholder="Name (optional)" className="input" />
        <select name="role" defaultValue="staff" className="input">
          <option value="staff">Staff</option>
          <option value="viewer">Viewer</option>
          <option value="owner">Owner</option>
        </select>
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded-md bg-blueprint-navy px-4 py-2 text-sm font-semibold text-white hover:bg-technical-blue disabled:opacity-60"
      >
        {isPending ? "Inviting…" : "Invite"}
      </button>
    </form>
  );
}
