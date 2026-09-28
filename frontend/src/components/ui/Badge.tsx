import React from "react";
import { cn } from "@/lib/utils";
import { Severity, IncidentStatus, RiskLevel, AutonomyLevel } from "@/types";

export function SeverityBadge({
  severity,
  className,
}: {
  severity: Severity;
  className?: string;
}) {
  const styles: Record<Severity, string> = {
    "SEV-0":
      "bg-gradient-to-r from-rose-950/60 to-pink-950/40 text-cyber-rose border-rose-500/60 shadow-[0_0_15px_rgba(255,42,109,0.4)]",
    "SEV-1":
      "bg-gradient-to-r from-amber-950/60 to-orange-950/40 text-cyber-amber border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.35)]",
    "SEV-2":
      "bg-gradient-to-r from-cyan-950/60 to-blue-950/40 text-cyber-cyan border-cyan-500/50 shadow-[0_0_15px_rgba(0,240,255,0.3)]",
    "SEV-3":
      "bg-slate-900/80 text-slate-400 border-slate-700/60",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-mono font-bold tracking-wider border backdrop-blur-md",
        styles[severity] || styles["SEV-3"],
        className
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          severity === "SEV-0"
            ? "bg-cyber-rose animate-ping"
            : severity === "SEV-1"
            ? "bg-cyber-amber animate-pulse"
            : severity === "SEV-2"
            ? "bg-cyber-cyan"
            : "bg-slate-400"
        )}
      />
      {severity}
    </span>
  );
}

export function StatusBadge({
  status,
  className,
}: {
  status: IncidentStatus;
  className?: string;
}) {
  const config: Record<
    IncidentStatus,
    { label: string; bg: string; text: string; border: string; dot: string }
  > = {
    investigating: {
      label: "Investigating",
      bg: "bg-cyan-950/50",
      text: "text-cyber-cyan",
      border: "border-cyan-500/40",
      dot: "bg-cyber-cyan animate-pulse",
    },
    mitigating: {
      label: "Mitigating",
      bg: "bg-purple-950/50",
      text: "text-purple-300",
      border: "border-purple-500/40",
      dot: "bg-purple-400 animate-spin",
    },
    approval_required: {
      label: "Approval Needed",
      bg: "bg-amber-950/50",
      text: "text-cyber-amber",
      border: "border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.3)]",
      dot: "bg-cyber-amber animate-ping",
    },
    resolved: {
      label: "Resolved",
      bg: "bg-emerald-950/50",
      text: "text-cyber-emerald",
      border: "border-emerald-500/40",
      dot: "bg-cyber-emerald",
    },
    escalated: {
      label: "Escalated",
      bg: "bg-rose-950/50",
      text: "text-cyber-rose",
      border: "border-rose-500/50 shadow-[0_0_12px_rgba(255,42,109,0.3)]",
      dot: "bg-cyber-rose animate-pulse",
    },
  };

  const item = config[status] || config.investigating;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-mono font-medium border backdrop-blur-md",
        item.bg,
        item.text,
        item.border,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", item.dot)} />
      {item.label}
    </span>
  );
}

export function RiskBadge({
  risk,
  className,
}: {
  risk: RiskLevel;
  className?: string;
}) {
  const styles: Record<RiskLevel, string> = {
    CRITICAL:
      "bg-gradient-to-r from-rose-950/70 to-pink-950/60 text-cyber-rose border-rose-500/50 shadow-glowRose",
    HIGH:
      "bg-gradient-to-r from-amber-950/70 to-orange-950/60 text-cyber-amber border-amber-500/50 shadow-glowAmber",
    MEDIUM:
      "bg-gradient-to-r from-cyan-950/70 to-blue-950/60 text-cyber-cyan border-cyan-500/40",
    LOW:
      "bg-slate-900/80 text-slate-400 border-slate-700/60",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider font-bold border backdrop-blur-md",
        styles[risk] || styles.LOW,
        className
      )}
    >
      <span className="w-1 h-1 rounded-full bg-current" />
      {risk} RISK
    </span>
  );
}

export function AutonomyBadge({
  level,
  className,
}: {
  level: AutonomyLevel;
  className?: string;
}) {
  const config: Record<
    AutonomyLevel,
    { label: string; text: string; bg: string; border: string }
  > = {
    L1_ADVISORY: {
      label: "L1 Advisory",
      text: "text-slate-300",
      bg: "bg-slate-800/90",
      border: "border-slate-700",
    },
    L2_HUMAN_IN_THE_LOOP: {
      label: "L2 Human-in-the-Loop",
      text: "text-cyber-amber",
      bg: "bg-amber-950/50",
      border: "border-amber-500/40",
    },
    L3_AUTONOMOUS: {
      label: "L3 Full Autonomous",
      text: "text-cyber-emerald",
      bg: "bg-emerald-950/50",
      border: "border-emerald-500/40",
    },
  };

  const item = config[level] || config.L1_ADVISORY;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-mono font-semibold border backdrop-blur-md",
        item.bg,
        item.text,
        item.border,
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {item.label}
    </span>
  );
}
