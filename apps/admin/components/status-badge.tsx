const PALETTES: Record<string, string> = {
  // neutral
  draft: "bg-slate/15 text-slate",
  lead: "bg-slate/15 text-slate",
  pending: "bg-slate/15 text-slate",
  // in-progress
  scoping: "bg-technical-blue/15 text-technical-blue",
  contracting: "bg-technical-blue/15 text-technical-blue",
  active: "bg-technical-blue/15 text-technical-blue",
  open: "bg-technical-blue/15 text-technical-blue",
  sent: "bg-technical-blue/15 text-technical-blue",
  viewed: "bg-technical-blue/15 text-technical-blue",
  invoiced: "bg-technical-blue/15 text-technical-blue",
  handoff: "bg-technical-blue/15 text-technical-blue",
  // success
  paid: "bg-emerald-100 text-emerald-700",
  signed: "bg-emerald-100 text-emerald-700",
  closed: "bg-emerald-100 text-emerald-700",
  // warning / failure
  overdue: "bg-amber-100 text-amber-700",
  declined: "bg-red-100 text-red-700",
  expired: "bg-red-100 text-red-700",
  void: "bg-red-100 text-red-700",
  uncollectible: "bg-red-100 text-red-700",
  lost: "bg-red-100 text-red-700",
};

export function StatusBadge({ status }: { status: string }) {
  const palette = PALETTES[status] ?? "bg-slate/15 text-slate";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${palette}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
