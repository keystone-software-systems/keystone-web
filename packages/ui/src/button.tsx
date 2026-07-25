import type { ButtonHTMLAttributes } from "react";

export function Button({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`rounded-md bg-blueprint-navy px-3 py-2 text-sm font-medium text-white hover:bg-technical-blue disabled:opacity-60 ${className}`}
      {...props}
    />
  );
}
