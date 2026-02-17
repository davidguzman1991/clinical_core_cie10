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
        "w-full rounded-xl border p-4 shadow-lg backdrop-blur-sm",
        variant === "destructive"
          ? "border-red-300 bg-red-50/95 text-red-900"
          : "border-cyan-200/90 bg-[linear-gradient(145deg,rgba(255,255,255,0.97)_0%,rgba(236,254,255,0.96)_46%,rgba(239,246,255,0.97)_100%)] text-slate-900",
        className
      )}
      {...props}
    />
  );
}

export function ToastTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h4 className={cn("text-sm font-semibold", className)} {...props} />;
}

export function ToastDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("mt-1 text-xs text-cyan-900/75", className)} {...props} />;
}
