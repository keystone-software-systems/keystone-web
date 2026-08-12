export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <polyline
        points="8,22 8,8 22,8"
        fill="none"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points="78,8 92,8 92,22"
        fill="none"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points="8,78 8,92 22,92"
        fill="none"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points="92,78 92,92 78,92"
        fill="none"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="29" y="24" width="42" height="14" rx="4" fill="currentColor" />
      <rect x="22" y="43" width="56" height="14" rx="4" className="fill-steel" />
      <rect x="15" y="62" width="70" height="14" rx="4" fill="currentColor" />
    </svg>
  );
}
