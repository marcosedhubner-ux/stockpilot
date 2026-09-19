import clsx from "clsx";
import type { ReactNode } from "react";

type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info";

const toneStyles: Record<BadgeTone, string> = {
  neutral: "bg-surface text-text-secondary border-border",
  success: "bg-success-soft text-success border-success/30",
  warning: "bg-warning-soft text-warning border-warning/30",
  danger: "bg-danger-soft text-danger border-danger/30",
  info: "bg-info-soft text-info border-info/30",
};

export function Badge({
  tone = "neutral",
  pulse = false,
  children,
}: {
  tone?: BadgeTone;
  /** Brief attention pulse — reserve for genuinely critical states (e.g. out of stock), not routine warnings. */
  pulse?: boolean;
  children: ReactNode;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 font-mono text-xs font-medium",
        toneStyles[tone],
        pulse && "animate-badge-pulse"
      )}
    >
      {children}
    </span>
  );
}
