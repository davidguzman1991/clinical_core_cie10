import * as React from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "secondary" | "outline" | "ghost" | "gradient";
type ButtonSize = "default" | "sm" | "lg" | "icon";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantStyles: Record<ButtonVariant, string> = {
  default:
    "bg-turquoise-500 text-white shadow-[0_4px_14px_-4px_rgba(0,184,184,0.5)] hover:bg-turquoise-600 hover:shadow-[0_6px_20px_-4px_rgba(0,184,184,0.6)] dark:shadow-[0_4px_14px_-4px_rgba(0,184,184,0.3)]",
  secondary:
    "bg-muted text-foreground hover:bg-muted/80 dark:hover:bg-muted/60",
  outline:
    "border border-border bg-card text-foreground hover:border-turquoise-300 hover:bg-turquoise-50/50 dark:hover:bg-turquoise-900/20",
  ghost:
    "text-foreground hover:bg-muted/60",
  gradient:
    "bg-gradient-to-r from-turquoise-500 to-purple-ai-500 text-white shadow-[0_4px_16px_-4px_rgba(108,99,255,0.4)] hover:shadow-[0_6px_24px_-4px_rgba(108,99,255,0.5)] hover:brightness-110",
};

const sizeStyles: Record<ButtonSize, string> = {
  default: "h-11 px-5 py-2.5",
  sm: "h-9 rounded-lg px-3.5 text-xs",
  lg: "h-12 rounded-2xl px-6 text-base",
  icon: "h-11 w-11",
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
