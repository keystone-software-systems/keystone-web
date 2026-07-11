"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProjectStatusAction } from "@/actions/projects";
import type { ProjectStatus } from "@/lib/supabase/types";

const STATUSES: ProjectStatus[] = ["lead", "scoping", "contracting", "active", "handoff", "closed", "lost"];

export function StatusSelect({ projectId, status }: { projectId: string; status: ProjectStatus }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <select
      defaultValue={status}
      disabled={isPending}
      onChange={(e) => {
        startTransition(async () => {
          await updateProjectStatusAction(projectId, e.target.value);
          router.refresh();
        });
      }}
      className="input"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
