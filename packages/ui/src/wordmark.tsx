type Props = {
  className?: string;
  primaryClassName?: string;
  secondaryClassName?: string;
};

export function KeystoneWordmark({
  className = "text-xl",
  primaryClassName = "text-blueprint-navy",
  secondaryClassName = "text-slate",
}: Props) {
  return (
    <span className={`flex items-baseline gap-1.5 ${className}`}>
      <span className={`font-bold tracking-wide ${primaryClassName}`}>KEYSTONE</span>
      <span className={`font-bold tracking-wide ${secondaryClassName}`}>SYSTEMS</span>
    </span>
  );
}
