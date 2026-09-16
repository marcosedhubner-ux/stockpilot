import clsx from "clsx";
import type { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx("rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200", className)}
      {...props}
    />
  );
}
