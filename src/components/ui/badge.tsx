import * as React from "react";

import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "ai" | "outline" | "success" | "warning";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const variantStyles: Record<BadgeVariant, string> = {
  default:
    "border-turquoise-200 bg-turquoise-50 text-turquoise-700 dark:border-turquoise-800 dark:bg-turquoise-900/30 dark:text-turquoise-300",
  ai:
    "border-purple-ai-200 bg-gradient-to-r from-turquoise-50 to-purple-ai-50 text-purple-ai-700 dark:border-purple-ai-800 dark:from-turquoise-900/20 dark:to-purple-ai-900/20 dark:text-purple-ai-300",
  outline:
    "border-border bg-transparent text-muted-foreground",
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  warning:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
