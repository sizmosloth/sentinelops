import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "gradientPill"
    | "gradientOutlinePill"
    | "cyanPill"
    | "primary"
    | "secondary"
    | "danger"
    | "warning"
    | "success"
    | "ghost"
    | "outline";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "gradientPill",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cosmos-void disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

    const variants: Record<string, string> = {
      gradientPill:
        "rounded-full bg-gradient-to-r from-[#6d28d9] via-[#9333ea] to-[#ec4899] text-white font-semibold shadow-pill hover:shadow-[0_0_35px_rgba(236,72,153,0.65)] hover:brightness-110 border border-white/20 focus:ring-purple-500",
      gradientOutlinePill:
        "rounded-full bg-cosmos-panel/80 hover:bg-cosmos-subpanel text-white font-medium border border-purple-500/50 hover:border-pink-500/80 shadow-[0_0_15px_rgba(147,51,234,0.25)] hover:shadow-glowPurple focus:ring-purple-500",
      cyanPill:
        "rounded-full bg-gradient-to-r from-[#0284c7] via-[#06b6d4] to-[#00f0ff] text-slate-950 font-bold shadow-pill-cyan hover:shadow-glowCyan hover:brightness-105 border border-cyan-300/40 focus:ring-cyan-400",
      primary:
        "rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:brightness-110 shadow-glowCyan border border-cyan-400/40 focus:ring-cyber-cyan",
      secondary:
        "rounded-xl bg-cosmos-subpanel/80 text-slate-200 hover:bg-cosmos-card border border-cosmos-border hover:border-slate-500 focus:ring-slate-500",
      danger:
        "rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white hover:brightness-110 shadow-glowRose border border-rose-500/40 focus:ring-cyber-rose",
      warning:
        "rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 text-white hover:brightness-110 shadow-glowAmber border border-amber-500/40 focus:ring-cyber-amber",
      success:
        "rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white hover:brightness-110 shadow-glowEmerald border border-emerald-500/40 focus:ring-cyber-emerald",
      ghost:
        "rounded-xl bg-transparent text-slate-400 hover:text-white hover:bg-cosmos-subpanel/60 focus:ring-slate-600",
      outline:
        "rounded-xl bg-transparent text-slate-300 border border-cosmos-border hover:border-purple-500/60 hover:text-white focus:ring-slate-600",
    };

    const sizes: Record<string, string> = {
      sm: "h-8 px-3.5 text-xs gap-1.5",
      md: "h-9 px-4 text-xs tracking-wide gap-2",
      lg: "h-11 px-6 text-sm tracking-wide gap-2.5",
      icon: "h-9 w-9 p-0 rounded-xl",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
