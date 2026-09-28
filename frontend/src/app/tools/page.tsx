"use client";

import React, { useState } from "react";
import {
  Wrench,
  Shield,
  CheckCircle2,
  Lock,
  Unlock,
  Terminal,
  ShieldAlert,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { RiskBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { RiskLevel } from "@/types";
import { cn } from "@/lib/utils";

export type PermissionMode = "Automatic" | "Approval Required" | "Disabled";

export interface SentinelTool {
  id: string;
  name: string;
  description: string;
  riskLevel: RiskLevel;
  permissionMode: PermissionMode;
  commandSample: string;
}

const INITIAL_TOOLS: SentinelTool[] = [
  {
    id: "check_health",
    name: "check_health",
    description: "Executes deep liveness, readiness, socket pool inspection, and synthetic latency checks.",
    riskLevel: "LOW",
    permissionMode: "Automatic",
    commandSample: "check_health --service api-gateway --endpoint /healthz",
  },
  {
    id: "get_logs",
    name: "get_logs",
    description: "Fetches and streams container stdout/stderr logs, panic stack traces, and error logs.",
    riskLevel: "LOW",
    permissionMode: "Automatic",
    commandSample: "get_logs --container api-gateway --tail 100 --level ERROR",
  },
  {
    id: "container_status",
    name: "container_status",
    description: "Inspects container runtime state, OOMKilled cgroup events, and restart exit codes.",
    riskLevel: "LOW",
    permissionMode: "Automatic",
    commandSample: "container_status --service api-gateway",
  },
  {
    id: "restart_container",
    name: "restart_container",
    description: "Triggers graceful rolling container restarts to clear deadlocks or memory leaks.",
    riskLevel: "MEDIUM",
    permissionMode: "Automatic",
    commandSample: "docker restart api-gateway-01 api-gateway-02",
  },
  {
    id: "modify_config",
    name: "modify_config",
    description: "Applies ConfigMap updates, environment variable changes, and Helm canary rollbacks.",
    riskLevel: "HIGH",
    permissionMode: "Approval Required",
    commandSample: "helm rollback api-gateway 14 --namespace production",
  },
  {
    id: "delete_container",
    name: "delete_container",
    description: "Force terminates or evicts a container replica with zero grace period.",
    riskLevel: "CRITICAL",
    permissionMode: "Disabled",
    commandSample: "kubectl delete pod api-gateway-pod-9x --force",
  },
];

export default function ToolsPage() {
  const [tools, setTools] = useState<SentinelTool[]>(INITIAL_TOOLS);
  const [notice, setNotice] = useState<string | null>(null);

  const handleModeChange = (id: string, mode: PermissionMode) => {
    setTools((prev) =>
      prev.map((t) => (t.id === id ? { ...t, permissionMode: mode } : t))
    );
    setNotice(`Updated permission for ${id} to "${mode}".`);
    setTimeout(() => setNotice(null), 3000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2">
      {/* Toast Notice */}
      {notice && (
        <div className="p-4 rounded-full bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 font-mono text-xs flex items-center justify-between shadow-glowEmerald animate-in fade-in duration-200 px-6">
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            {notice}
          </span>
          <button onClick={() => setNotice(null)} className="text-emerald-400 hover:text-white font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-mono flex items-center gap-2.5">
          <Wrench className="w-6 h-6 text-cyber-cyan" />
          Tools & Safety Permissions
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Configure safety levels and approval gates for autonomous agent tools
        </p>
      </div>

      {/* Tools List */}
      <div className="space-y-4">
        {tools.map((tool) => (
          <div
            key={tool.id}
            className="p-6 rounded-3xl bg-cosmos-card/80 border border-cosmos-border/80 backdrop-blur-2xl shadow-panelCosmos space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-base font-bold text-white">{tool.name}</span>
                <RiskBadge risk={tool.riskLevel} />
              </div>

              {/* Permission Mode Switcher */}
              <div className="flex items-center gap-1.5 bg-cosmos-subpanel/80 p-1 rounded-full border border-cosmos-border">
                {(["Automatic", "Approval Required", "Disabled"] as PermissionMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => handleModeChange(tool.id, mode)}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-mono font-medium transition-all",
                      tool.permissionMode === mode
                        ? mode === "Automatic"
                          ? "bg-emerald-600 text-white font-bold shadow-glowEmerald"
                          : mode === "Approval Required"
                          ? "bg-amber-600 text-white font-bold shadow-glowAmber"
                          : "bg-rose-700 text-white font-bold"
                        : "text-slate-400 hover:text-slate-200"
                    )}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 font-mono leading-relaxed">
              {tool.description}
            </p>

            <div className="p-3 rounded-2xl bg-black/60 border border-slate-800 text-xs font-mono text-cyan-300 flex items-center justify-between">
              <span>$ {tool.commandSample}</span>
              <span className="text-[10px] text-slate-500">CLI Template</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
