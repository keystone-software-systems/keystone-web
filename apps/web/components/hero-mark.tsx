// Matches the path in public/brand/keystone-icon-navy.svg (viewBox 0 0 200 190).
const LOGO_PATH =
  "M30,20 L170,20 Q180,20 177.9,29.8 L150.1,160.2 Q148,170 138,170 L62,170 Q52,170 49.9,160.2 L22.1,29.8 Q20,20 30,20 Z";

export function HeroMark() {
  return (
    <svg viewBox="0 0 200 190" role="img" aria-label="Keystone Systems mark" className="h-auto w-56">
      <path className="hero-mark-in" d={LOGO_PATH} fill="var(--color-blueprint-navy)" />
    </svg>
  );
}
