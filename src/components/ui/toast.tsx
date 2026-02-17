import * as React from "react";

import { cn } from "@/lib/utils";

type ToastVariant = "default" | "destructive";

type ToastProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: ToastVariant;
};

export function Toast({ className, variant = "default", ...props }: ToastProps) {
  return (
    <div
      className={cn(
        "w-full rounded-2xl border p-4 shadow-lg backdrop-blur-md",
        variant === "destructive"
          ? "border-red-300/60 bg-red-50/95 text-red-900 dark:border-red-800/60 dark:bg-red-950/90 dark:text-red-200"
          : "border-turquoise-200/60 bg-card/95 text-foreground dark:border-turquoise-800/40",
        className
      )}
      {...props}
    />
  );
}

export function ToastTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h4 className={cn("text-sm font-semibold text-foreground", className)} {...props} />;
}

export function ToastDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("mt-1 text-xs text-muted-foreground", className)} {...props} />;
}
