"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setUserActiveAction, setUserRoleAction } from "@/actions/settings";
import type { Profile, UserRole } from "@/lib/supabase/types";

const ROLES: UserRole[] = ["owner", "staff", "viewer"];

export function UserRow({ profile, isSelf }: { profile: Profile; isSelf: boolean }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="flex items-center justify-between gap-4 border-b border-off-white px-4 py-2.5 text-sm last:border-none">
      <div>
        <p className="font-medium">{profile.full_name || profile.email}</p>
        <p className="text-xs text-slate">{profile.email}</p>
      </div>
      <div className="flex items-center gap-3">
        <select
          defaultValue={profile.role}
          disabled={isPending || isSelf}
          onChange={(e) => {
            startTransition(async () => {
              await setUserRoleAction(profile.id, e.target.value);
              router.refresh();
            });
          }}
          className="input"
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <button
          disabled={isPending || isSelf}
          onClick={() => {
            startTransition(async () => {
              await setUserActiveAction(profile.id, !profile.active);
              router.refresh();
            });
          }}
          className="text-xs font-medium text-technical-blue hover:underline disabled:opacity-40"
        >
          {profile.active ? "Deactivate" : "Reactivate"}
        </button>
      </div>
    </div>
  );
}
