import React from "react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  trendPositive?: boolean;
  icon?: React.ReactNode;
  statusDot?: "cyan" | "emerald" | "amber" | "rose" | "magenta";
  className?: string;
}

export function MetricCard({
  label,
  value,
  subtext,
  trend,
  trendValue,
  trendPositive,
  icon,
  statusDot,
  className,
}: MetricCardProps) {
  const dotColors: Record<string, string> = {
    cyan: "bg-cyber-cyan shadow-glowCyan",
    emerald: "bg-cyber-emerald shadow-glowEmerald",
    amber: "bg-cyber-amber shadow-glowAmber",
    rose: "bg-cyber-rose shadow-glowRose",
    magenta: "bg-cyber-magenta shadow-glowMagenta",
  };

  return (
    <div
      className={cn(
        "relative p-4 rounded-2xl bg-cosmos-panel/80 border border-cosmos-border/80 backdrop-blur-xl hover:border-purple-500/50 shadow-panelCosmos transition-all duration-300 group overflow-hidden",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 text-xs font-mono text-slate-400 mb-1.5">
        <span className="flex items-center gap-1.5 font-medium uppercase tracking-wider text-[11px]">
          {statusDot && (
            <span
              className={cn(
                "w-1.5 h-1.5 rounded-full animate-pulse",
                dotColors[statusDot] || "bg-cyber-cyan"
              )}
            />
          )}
          {label}
        </span>
        {icon && (
          <span className="text-slate-400 group-hover:text-cyber-cyan transition-colors">
            {icon}
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-2xl font-extrabold font-mono tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-cyan-200 transition-all">
          {value}
        </span>
        {trendValue && (
          <span
            className={cn(
              "text-[11px] font-mono font-bold flex items-center gap-0.5 px-2 py-0.5 rounded-full border",
              trendPositive
                ? "text-emerald-400 bg-emerald-950/40 border-emerald-500/30"
                : "text-rose-400 bg-rose-950/40 border-rose-500/30"
            )}
          >
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "•"}
            {trendValue}
          </span>
        )}
      </div>

      {subtext && (
        <p className="text-[11px] text-slate-500 font-mono mt-1.5 truncate">
          {subtext}
        </p>
      )}

      {/* Top glowing edge line */}
      <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent opacity-40 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
