import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-accent text-[#0e1216] hover:bg-accent-hover disabled:bg-accent/30 disabled:text-text-secondary",
  secondary: "bg-surface text-text border border-border hover:border-accent/50",
  ghost: "text-text-secondary hover:bg-white/5 hover:text-text",
  danger: "bg-danger text-[#0e1216] hover:bg-danger/85 disabled:bg-danger/30 disabled:text-text-secondary",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
