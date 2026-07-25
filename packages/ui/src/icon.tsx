// Path matches branding/keystone-icon-*.svg (viewBox 0 0 200 190).
export const KEYSTONE_ICON_PATH =
  "M30,20 L170,20 Q180,20 177.9,29.8 L150.1,160.2 Q148,170 138,170 L62,170 Q52,170 49.9,160.2 L22.1,29.8 Q20,20 30,20 Z";

type Props = {
  className?: string;
  color?: string;
};

export function KeystoneIcon({ className = "h-8 w-auto", color = "#14324D" }: Props) {
  return (
    <svg viewBox="0 0 200 190" className={className} role="img" aria-hidden="true">
      <title>Keystone Systems icon</title>
      <path d={KEYSTONE_ICON_PATH} fill={color} />
    </svg>
  );
}
