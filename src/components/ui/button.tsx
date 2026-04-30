import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-[var(--accent)] text-[var(--accent-foreground)] shadow-lg shadow-teal-950/10 hover:-translate-y-0.5 hover:opacity-95",
  secondary:
    "surface text-[var(--foreground)] hover:border-[var(--line-strong)] hover:bg-[var(--card-strong)]",
  ghost: "text-[var(--muted)] hover:bg-white/50 hover:text-[var(--foreground)] dark:hover:bg-white/6",
  danger: "bg-[var(--danger)] text-white hover:opacity-95",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/50 disabled:pointer-events-none disabled:opacity-60",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
