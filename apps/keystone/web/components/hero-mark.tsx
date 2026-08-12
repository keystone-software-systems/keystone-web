import { KEYSTONE_ICON_PATH } from "@keystone/ui";

export function HeroMark() {
  return (
    <svg viewBox="0 0 200 190" role="img" aria-label="Keystone Systems mark" className="h-auto w-56">
      <path className="hero-mark-in" d={KEYSTONE_ICON_PATH} fill="var(--color-blueprint-navy)" />
    </svg>
  );
}
