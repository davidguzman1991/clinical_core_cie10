import * as React from "react";

import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement>;

export function Badge({ className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-xl border border-cyan-300/80 bg-gradient-to-br from-cyan-100 via-cyan-50 to-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-800",
        className
      )}
      {...props}
    />
  );
}
