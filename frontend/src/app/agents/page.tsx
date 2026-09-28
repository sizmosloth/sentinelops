"use client";

import React, { useState } from "react";
import {
  Cpu,
  Shield,
  Activity,
  Zap,
  CheckCircle2,
  Settings,
  ShieldCheck,
  Check,
  SlidersHorizontal,
} from "lucide-react";
import { AutonomyBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AutonomyLevel } from "@/types";
import { cn } from "@/lib/utils";

interface AgentConfig {
  id: string;
  name: string;
  codename: string;
  role: string;
  status: "active" | "mitigating" | "idle";
  description: string;
  model: string;
  autonomyLevel: AutonomyLevel;
  tools: { name: string; enabled: boolean }[];
  currentTask: string;
}

const INITIAL_AGENTS: AgentConfig[] = [
  {
    id: "agent-diagnostic",
    name: "Diagnostic Agent",
    codename: "SENTINEL-DIAG",
    role: "Root Cause Analysis & Telemetry Correlation",
    status: "mitigating",
    description:
      "Inspects real-time container logs, correlates git commit regressions, analyzes eBPF socket drop events, and isolates outage root causes.",
    model: "Gemini 2.0 Flash (RCA-Tuned)",
    autonomyLevel: "L3_AUTONOMOUS",
    currentTask: "Correlating commit 9bf2ad4 with upstream gRPC keepalive resets on api-gateway",
    tools: [
      { name: "check_health", enabled: true },
      { name: "get_logs", enabled: true },
      { name: "container_status", enabled: true },
    ],
  },
  {
    id: "agent-remediation",
    name: "Remediation Agent",
    codename: "SENTINEL-REMED",
    role: "Autonomous Mitigation & GitOps Canary Rollbacks",
    status: "mitigating",
    description:
      "Executes minimal blast-radius mitigations, applies safe container restarts, patches configurations, and requests human approval for high-risk operations.",
    model: "Gemini 2.0 Flash (SRE-Tuned)",
    autonomyLevel: "L2_HUMAN_IN_THE_LOOP",
    currentTask: "Canary rollback to v3.8.1 awaiting Commander confirmation",
    tools: [
      { name: "restart_container", enabled: true },
      { name: "modify_config", enabled: true },
      { name: "delete_container", enabled: false },
    ],
  },
  {
    id: "agent-verification",
    name: "Verification Agent",
    codename: "SENTINEL-VERIFY",
    role: "Synthetic Probing & SLO Health Validation",
    status: "active",
    description:
      "Performs synthetic HTTP/gRPC health probe testing, measures error rate and latency SLAs, and ensures full health recovery before closing incidents.",
    model: "Gemini 2.0 Flash (QA-Tuned)",
    autonomyLevel: "L3_AUTONOMOUS",
    currentTask: "Synthetic traffic probing across api-gateway ingress endpoints",
    tools: [
      { name: "check_health", enabled: true },
      { name: "get_logs", enabled: true },
    ],
  },
];

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentConfig[]>(INITIAL_AGENTS);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const toggleTool = (agentId: string, toolName: string) => {
    setAgents((prev) =>
      prev.map((agent) =>
        agent.id === agentId
          ? {
              ...agent,
              tools: agent.tools.map((t) =>
                t.name === toolName ? { ...t, enabled: !t.enabled } : t
              ),
            }
          : agent
      )
    );
  };

  const handleAutonomyChange = (agentId: string, level: AutonomyLevel) => {
    setAgents((prev) =>
      prev.map((agent) => (agent.id === agentId ? { ...agent, autonomyLevel: level } : agent))
    );
    setSavedNotice(`Updated autonomy mode for ${agentId}.`);
    setTimeout(() => setSavedNotice(null), 3000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2">
      {/* Toast Notice */}
      {savedNotice && (
        <div className="p-4 rounded-full bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 font-mono text-xs flex items-center justify-between shadow-glowEmerald animate-in fade-in duration-200 px-6">
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            {savedNotice}
          </span>
          <button onClick={() => setSavedNotice(null)} className="text-emerald-400 hover:text-white font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-mono flex items-center gap-2.5">
          <Cpu className="w-6 h-6 text-cyber-magenta" />
          Autonomous Agent Studio
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Configure autonomy levels, tool access permissions, and roles for the 3 core SentinelOps agents
        </p>
      </div>

      {/* 3 Core Agent Cards */}
      <div className="space-y-6">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="p-8 rounded-3xl bg-cosmos-card/80 border border-cosmos-border/80 backdrop-blur-2xl shadow-panelCosmos space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-cyber-emerald animate-pulse" />
                <div>
                  <h2 className="text-lg font-bold text-white font-mono">{agent.name}</h2>
                  <span className="text-xs font-mono text-slate-400">
                    Codename: <strong className="text-cyan-400">{agent.codename}</strong> • Model: {agent.model}
                  </span>
                </div>
              </div>

              <AutonomyBadge level={agent.autonomyLevel} />
            </div>

            <p className="text-xs sm:text-sm text-slate-300 font-mono leading-relaxed">
              {agent.description}
            </p>

            <div className="p-3.5 rounded-2xl bg-cosmos-subpanel/70 border border-cosmos-border font-mono text-xs text-slate-300 flex items-center gap-2">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Active Task:</span>
              <span className="text-white truncate">{agent.currentTask}</span>
            </div>

            {/* Tool Toggles & Autonomy Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-3 border-t border-cosmos-border/60">
              {/* Tool permissions */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider block">
                  Available Tools
                </span>
                <div className="flex flex-wrap gap-2">
                  {agent.tools.map((tool) => (
                    <button
                      key={tool.name}
                      onClick={() => toggleTool(agent.id, tool.name)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-mono transition-all border",
                        tool.enabled
                          ? "bg-purple-950/80 text-purple-300 border-purple-500/50 shadow-sm"
                          : "bg-slate-900 text-slate-500 border-slate-800 line-through"
                      )}
                    >
                      {tool.name} {tool.enabled ? "✓" : "✕"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Autonomy switcher */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider block">
                  Autonomy Level
                </span>
                <div className="flex items-center gap-2">
                  {(["L1_ADVISORY", "L2_HUMAN_IN_THE_LOOP", "L3_AUTONOMOUS"] as AutonomyLevel[]).map(
                    (lvl) => (
                      <button
                        key={lvl}
                        onClick={() => handleAutonomyChange(agent.id, lvl)}
                        className={cn(
                          "px-3 py-1 rounded-full text-[11px] font-mono transition-all border",
                          agent.autonomyLevel === lvl
                            ? "bg-cyan-950 text-cyan-300 border-cyan-500/50 font-bold shadow-glowCyan"
                            : "bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300"
                        )}
                      >
                        {lvl === "L1_ADVISORY" ? "L1 Advisory" : lvl === "L2_HUMAN_IN_THE_LOOP" ? "L2 HITL" : "L3 Auto"}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
