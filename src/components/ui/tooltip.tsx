import * as React from "react";

import { cn } from "@/lib/utils";

type TooltipProps = {
  content: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

export function Tooltip({ content, className, children }: TooltipProps) {
  return (
    <span className="group/tooltip relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-30 w-max -translate-x-1/2 rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100",
          className
        )}
      >
        {content}
      </span>
    </span>
  );
}
