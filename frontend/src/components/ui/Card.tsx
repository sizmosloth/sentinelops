import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "subtle"
    | "elevated"
    | "glowCyan"
    | "glowRose"
    | "glowAmber"
    | "glowPurple";
}

export function Card({
  className,
  variant = "default",
  children,
  ...props
}: CardProps) {
  const variants: Record<string, string> = {
    default:
      "bg-cosmos-panel/75 border-cosmos-border/70 backdrop-blur-xl shadow-panelCosmos",
    subtle:
      "bg-cosmos-card/50 border-cosmos-border-subtle backdrop-blur-md",
    elevated:
      "bg-cosmos-subpanel/80 border-cosmos-border-bright/80 backdrop-blur-2xl shadow-panelCosmos",
    glowCyan:
      "bg-cosmos-panel/85 border-cyan-500/40 shadow-[0_0_30px_-5px_rgba(0,240,255,0.22)] backdrop-blur-xl",
    glowRose:
      "bg-cosmos-panel/85 border-rose-500/40 shadow-[0_0_30px_-5px_rgba(255,42,109,0.25)] backdrop-blur-xl",
    glowAmber:
      "bg-cosmos-panel/85 border-amber-500/40 shadow-[0_0_30px_-5px_rgba(245,158,11,0.22)] backdrop-blur-xl",
    glowPurple:
      "bg-cosmos-panel/85 border-purple-500/40 shadow-[0_0_30px_-5px_rgba(168,85,247,0.25)] backdrop-blur-xl",
  };

  return (
    <div
      className={cn(
        "rounded-2xl border transition-all duration-300 relative overflow-hidden",
        variants[variant],
        className
      )}
      {...props}
    >
      {/* Top fine gradient highlight edge */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent pointer-events-none" />
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "px-6 py-4 border-b border-cosmos-border/60 flex items-center justify-between gap-4 bg-cosmos-subpanel/20",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-sm font-semibold tracking-wide text-white flex items-center gap-2 font-mono",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-xs text-slate-400 mt-0.5", className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "px-6 py-3.5 border-t border-cosmos-border/60 bg-cosmos-subpanel/40 rounded-b-2xl flex items-center justify-between",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
