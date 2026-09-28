"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Cpu,
  Shield,
  Activity,
  Zap,
  Wrench,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  Settings,
  Sliders,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Search,
  Check,
  X,
  RefreshCw,
  Flame,
  Radio,
  SlidersHorizontal,
  Lock,
  Unlock,
  Terminal,
  Save,
  RotateCcw,
  Layers,
  Database,
  Eye,
  AlertTriangle,
  Play,
  FileCode,
} from "lucide-react";
import { AutonomyBadge, RiskBadge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { CodeViewer } from "@/components/ui/CodeViewer";
import { AutonomyLevel } from "@/types";
import { cn } from "@/lib/utils";

interface ToolItem {
  id: string;
  name: string;
  description: string;
  category: "telemetry" | "kubernetes" | "cloud" | "network" | "database" | "synthetic";
  safetyTier: "read_only" | "reversible" | "high_risk" | "destructive";
  enabled: boolean;
  executionsCount: number;
}

interface AgentConfig {
  id: string;
  type: "diagnostic" | "remediation" | "verification";
  name: string;
  codename: string;
  role: string;
  status: "active" | "busy" | "paused";
  statusDetail: string;
  description: string;
  model: string;
  autonomyLevel: AutonomyLevel;
  confidenceThreshold: number; // 50 to 99%
  temperature: number; // 0.0 to 1.0
  telemetrySamplingRateRps: number;
  recoveryLimits: {
    maxTimeoutSeconds: number;
    maxConcurrentExecutions: number;
    maxBlastRadiusRps: number;
    memoryCapMb: number;
    cooldownPeriodMinutes: number;
  };
  tools: ToolItem[];
  systemDirectives: string;
  stats: {
    incidentsResolved: number;
    approvalSuccessRate: number;
    avgResolutionTime: string;
    tokenUsageToday: number;
  };
}

const INITIAL_AGENTS: AgentConfig[] = [
  {
    id: "agent-diag-01",
    type: "diagnostic",
    name: "Sentinel-Diagnostic",
    codename: "TITAN-ALPHA-DIAG",
    role: "Lead Root Cause Analyzer & Forensics Hunter",
    status: "busy",
    statusDetail: "Analyzing eBPF socket reset telemetry on api-gateway-mesh",
    description:
      "Autonomous deep-telemetry inspector responsible for high-frequency distributed trace sampling, eBPF socket monitoring, GitOps commit regression pinning, and Bayesian root cause probability scoring.",
    model: "Gemini 1.5 Pro (SRE-Tuned)",
    autonomyLevel: "L3_AUTONOMOUS",
    confidenceThreshold: 92,
    temperature: 0.1,
    telemetrySamplingRateRps: 10000,
    recoveryLimits: {
      maxTimeoutSeconds: 60,
      maxConcurrentExecutions: 24,
      maxBlastRadiusRps: 45000,
      memoryCapMb: 2048,
      cooldownPeriodMinutes: 2,
    },
    tools: [
      {
        id: "ebpf_socket_tracer",
        name: "eBPF Socket & Packet Sniffer",
        description: "Kernel-level probe for TCP resets, SYN drops, and TLS handshake timeouts.",
        category: "telemetry",
        safetyTier: "read_only",
        enabled: true,
        executionsCount: 3840,
      },
      {
        id: "git_blame_analyzer",
        name: "GitOps Differential RCA Engine",
        description: "Scans recent PRs, merges, and helm release commits to isolate offending syntax.",
        category: "telemetry",
        safetyTier: "read_only",
        enabled: true,
        executionsCount: 1290,
      },
      {
        id: "istio_telemetry_sampler",
        name: "Istio Service Mesh Analyzer",
        description: "Samples Envoy connection pools, circuit breaker trips, and 5xx spikes.",
        category: "network",
        safetyTier: "read_only",
        enabled: true,
        executionsCount: 2410,
      },
      {
        id: "log_pattern_clusterer",
        name: "Vector Log Clusterer",
        description: "DBSCAN anomaly clustering across stderr/stdout logs in OpenSearch.",
        category: "telemetry",
        safetyTier: "read_only",
        enabled: true,
        executionsCount: 4120,
      },
      {
        id: "k8s_event_watcher",
        name: "Kubernetes Event Bus Listener",
        description: "Watches OOMKilled, Evicted, and FailedScheduling events in realtime.",
        category: "kubernetes",
        safetyTier: "read_only",
        enabled: true,
        executionsCount: 5280,
      },
      {
        id: "network_packet_capture",
        name: "Raw PCAP Packet Capture",
        description: "Deep pcap capture on ingress NICs (requires elevated privilege).",
        category: "network",
        safetyTier: "high_risk",
        enabled: false,
        executionsCount: 140,
      },
    ],
    systemDirectives:
      "Analyze multi-modal telemetry traces without executing mutating operations. Formulate Bayesian root-cause hypothesis and corroborate with at least 2 independent provenance signals before proposing remediation.",
    stats: {
      incidentsResolved: 42,
      approvalSuccessRate: 98.4,
      avgResolutionTime: "1m 18s",
      tokenUsageToday: 342000,
    },
  },
  {
    id: "agent-rem-02",
    type: "remediation",
    name: "Sentinel-Remediation",
    codename: "AEGIS-REMEDIATION-L3",
    role: "High-Privilege Mitigation & Canary Dispatcher",
    status: "busy",
    statusDetail: "Orchestrating Helm rollback to v3.8.1 across 12 Envoy pods",
    description:
      "High-privilege execution agent orchestrating idempotent, reversible mitigation actions, ArgoCD GitOps rollbacks, virtual service traffic diversion, connection pool flushing, and AWS WAF dynamic defense rules.",
    model: "Gemini 1.5 Pro (SRE-Tuned)",
    autonomyLevel: "L2_HUMAN_IN_THE_LOOP",
    confidenceThreshold: 88,
    temperature: 0.05,
    telemetrySamplingRateRps: 15000,
    recoveryLimits: {
      maxTimeoutSeconds: 120,
      maxConcurrentExecutions: 12,
      maxBlastRadiusRps: 50000,
      memoryCapMb: 4096,
      cooldownPeriodMinutes: 5,
    },
    tools: [
      {
        id: "argo_cd_sync",
        name: "ArgoCD GitOps Synchronizer",
        description: "Trigger declarative rollbacks and canary release synchronizations.",
        category: "kubernetes",
        safetyTier: "reversible",
        enabled: true,
        executionsCount: 890,
      },
      {
        id: "kubectl_traffic_patch",
        name: "Istio VirtualService Traffic Shifter",
        description: "Divert traffic splits (e.g., 30% to secondary cluster) without downtime.",
        category: "network",
        safetyTier: "reversible",
        enabled: true,
        executionsCount: 640,
      },
      {
        id: "aws_waf_rule_inject",
        name: "AWS WAF Dynamic Rule Injector",
        description: "Inject real-time IP blocks, CIDR rate limits, and challenge actions.",
        category: "cloud",
        safetyTier: "high_risk",
        enabled: true,
        executionsCount: 420,
      },
      {
        id: "redis_cluster_ctl",
        name: "Redis Cache Cluster Rebalancer",
        description: "Re-distribute client connection handles and drain hotspot memory shards.",
        category: "database",
        safetyTier: "reversible",
        enabled: true,
        executionsCount: 230,
      },
      {
        id: "postgres_drain_pool",
        name: "PostgreSQL Session Terminator",
        description: "Terminate blocking query PIDs and adjust max connection pool limits.",
        category: "database",
        safetyTier: "destructive",
        enabled: true,
        executionsCount: 180,
      },
      {
        id: "bgp_router_exec",
        name: "BGP Null-Route Edge Injector",
        description: "Execute upstream ISP transit cutoffs for anti-DDoS scrubbing.",
        category: "network",
        safetyTier: "destructive",
        enabled: false,
        executionsCount: 12,
      },
    ],
    systemDirectives:
      "Execute only verified, idempotent mitigation vectors. When blast radius exceeds 20,000 req/sec or involves database connection drops, request Human-In-The-Loop quorum approval before execution.",
    stats: {
      incidentsResolved: 38,
      approvalSuccessRate: 96.1,
      avgResolutionTime: "2m 45s",
      tokenUsageToday: 512000,
    },
  },
  {
    id: "agent-ver-03",
    type: "verification",
    name: "Sentinel-Verification",
    codename: "TRACEHOUND-VERIFY",
    role: "Continuous SLA Verifier & Synthetic Probe Guard",
    status: "active",
    statusDetail: "Measuring synthetic HTTP p99 latency & error rate baseline",
    description:
      "Continuous verification supervisor that executes synthetic HTTP/gRPC transactions, verifies p99 latency normalization, validates error-rate baselines against SLOs, and confirms zero regressions before marking incidents resolved.",
    model: "Gemini 1.5 Pro (SRE-Tuned)",
    autonomyLevel: "L3_AUTONOMOUS",
    confidenceThreshold: 95,
    temperature: 0.1,
    telemetrySamplingRateRps: 20000,
    recoveryLimits: {
      maxTimeoutSeconds: 300,
      maxConcurrentExecutions: 32,
      maxBlastRadiusRps: 10000,
      memoryCapMb: 1024,
      cooldownPeriodMinutes: 1,
    },
    tools: [
      {
        id: "synthetic_traffic_generator",
        name: "Synthetic Load & Probe Runner",
        description: "Injects synthetic end-to-end checkout and auth transactions to test SLA.",
        category: "synthetic",
        safetyTier: "read_only",
        enabled: true,
        executionsCount: 14200,
      },
      {
        id: "prometheus_sli_evaluator",
        name: "Prometheus SLI/SLO Metric Engine",
        description: "Evaluates error rate and latency over 3-minute sliding window.",
        category: "telemetry",
        safetyTier: "read_only",
        enabled: true,
        executionsCount: 9800,
      },
      {
        id: "canary_metric_comparator",
        name: "Canary Regression Detector",
        description: "Compares baseline vs canary pod error rates via Mann-Whitney U test.",
        category: "telemetry",
        safetyTier: "read_only",
        enabled: true,
        executionsCount: 3100,
      },
      {
        id: "datadog_trace_verifier",
        name: "Distributed Trace Span Auditor",
        description: "Verifies downstream microservice spans for residual socket timeouts.",
        category: "telemetry",
        safetyTier: "read_only",
        enabled: true,
        executionsCount: 4500,
      },
      {
        id: "database_consistency_checker",
        name: "DB Read/Write Consistency Validator",
        description: "Verifies zero orphaned transaction locks or replica lag spikes.",
        category: "database",
        safetyTier: "read_only",
        enabled: false,
        executionsCount: 310,
      },
    ],
    systemDirectives:
      "Run continuous verification suite after any mitigation dispatch. Require 3 consecutive sampling windows with error rate <0.1% and p99 latency <50ms before releasing traffic and closing incident.",
    stats: {
      incidentsResolved: 45,
      approvalSuccessRate: 99.2,
      avgResolutionTime: "45s",
      tokenUsageToday: 215000,
    },
  },
];

export default function AgentStudioPage() {
  const [agents, setAgents] = useState<AgentConfig[]>(INITIAL_AGENTS);
  const [activeTab, setActiveTab] = useState<"diagnostic" | "remediation" | "verification">(
    "diagnostic"
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSimulatingProbe, setIsSimulatingProbe] = useState(false);
  const [simulatedLogs, setSimulatedLogs] = useState<string[]>([]);
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);

  const currentAgent = agents.find((a) => a.type === activeTab) || agents[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Local state mutators for configuration
  const handleToggleTool = (toolId: string) => {
    setAgents((prev) =>
      prev.map((agent) => {
        if (agent.type !== activeTab) return agent;
        return {
          ...agent,
          tools: agent.tools.map((t) =>
            t.id === toolId ? { ...t, enabled: !t.enabled } : t
          ),
        };
      })
    );
    const targetTool = currentAgent.tools.find((t) => t.id === toolId);
    showToast(
      `Tool "${targetTool?.name}" is now ${
        targetTool?.enabled ? "DISABLED" : "ENABLED"
      } for ${currentAgent.name}.`
    );
  };

  const handleUpdateAutonomy = (level: AutonomyLevel) => {
    setAgents((prev) =>
      prev.map((agent) =>
        agent.type === activeTab ? { ...agent, autonomyLevel: level } : agent
      )
    );
    showToast(`Updated ${currentAgent.name} governance tier to ${level}.`);
  };

  const handleUpdateModel = (modelName: string) => {
    setAgents((prev) =>
      prev.map((agent) =>
        agent.type === activeTab ? { ...agent, model: modelName } : agent
      )
    );
    showToast(`Assigned model ${modelName} to ${currentAgent.name}.`);
  };

  const handleUpdateConfidence = (val: number) => {
    setAgents((prev) =>
      prev.map((agent) =>
        agent.type === activeTab ? { ...agent, confidenceThreshold: val } : agent
      )
    );
  };

  const handleUpdateTemperature = (val: number) => {
    setAgents((prev) =>
      prev.map((agent) =>
        agent.type === activeTab ? { ...agent, temperature: val } : agent
      )
    );
  };

  const handleUpdateLimit = (
    key: keyof AgentConfig["recoveryLimits"],
    val: number
  ) => {
    setAgents((prev) =>
      prev.map((agent) =>
        agent.type === activeTab
          ? {
              ...agent,
              recoveryLimits: {
                ...agent.recoveryLimits,
                [key]: val,
              },
            }
          : agent
      )
    );
  };

  const handleToggleAgentStatus = () => {
    const nextStatus = currentAgent.status === "paused" ? "active" : "paused";
    setAgents((prev) =>
      prev.map((agent) =>
        agent.type === activeTab ? { ...agent, status: nextStatus } : agent
      )
    );
    showToast(
      `${currentAgent.name} is now ${
        nextStatus === "paused" ? "QUARANTINED & PAUSED" : "ACTIVE ON FLEET BUS"
      }.`
    );
  };

  const handleSaveConfig = () => {
    showToast(
      `✓ Configuration matrix successfully applied and synced across ${currentAgent.name} cluster workers!`
    );
  };

  const handleResetDefaults = () => {
    const defaultAgent = INITIAL_AGENTS.find((a) => a.type === activeTab);
    if (defaultAgent) {
      setAgents((prev) =>
        prev.map((agent) =>
          agent.type === activeTab ? JSON.parse(JSON.stringify(defaultAgent)) : agent
        )
      );
      showToast(`Reset ${currentAgent.name} to default system baseline.`);
    }
  };

  const handleRunSimulation = () => {
    setIsSimModalOpen(true);
    setIsSimulatingProbe(true);
    setSimulatedLogs([
      `[0.00s] Initializing live test harness for ${currentAgent.name} (${currentAgent.model})...`,
      `[0.21s] Loading active tools: ${currentAgent.tools
        .filter((t) => t.enabled)
        .map((t) => t.id)
        .join(", ")}...`,
      `[0.54s] Evaluating mock telemetry signals on api-gateway-mesh...`,
      `[1.10s] Autonomy level check: ${currentAgent.autonomyLevel} verified.`,
      `[1.80s] Execution completed. Agent returned 96.4% confidence rating. 0 safety guardrail violations.`,
    ]);
    setTimeout(() => {
      setIsSimulatingProbe(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {toastMessage && (
        <div className="p-3.5 rounded-full bg-cyan-950/80 border border-cyan-500/60 text-cyber-cyan font-mono text-xs flex items-center justify-between shadow-glowCyan animate-in fade-in duration-200 px-6 backdrop-blur-xl">
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyber-cyan" />
            {toastMessage}
          </span>
          <button
            onClick={() => setToastMessage(null)}
            className="hover:text-white ml-4 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. HEADER & FLEET TELEMETRY STATUS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyber-magenta mb-1">
            <Cpu className="w-4 h-4" />
            <span className="font-bold tracking-wider">
              AUTONOMOUS FLEET CONTROL PANEL
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
            Agent Studio & Governance
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Configure autonomy levels, tool bindings, recovery guardrails, and model engines for the SentinelOps AI fleet
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap font-mono text-xs">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRunSimulation}
            className="rounded-full font-mono text-xs"
          >
            <Play className="w-3.5 h-3.5 mr-1 text-cyber-cyan" />
            Test Live Agent Probe
          </Button>

          <Button
            variant="gradientPill"
            size="sm"
            onClick={handleSaveConfig}
            className="font-mono text-xs"
          >
            <Save className="w-3.5 h-3.5 mr-1" />
            Save Configuration
          </Button>
        </div>
      </div>

      {/* 2. AGENT SELECTOR TABS (THE 3 CORE REQUIRED AGENTS) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 font-mono">
        {agents.map((agent) => {
          const isSelected = activeTab === agent.type;
          const isDiagnostic = agent.type === "diagnostic";
          const isRemediation = agent.type === "remediation";
          const isVerification = agent.type === "verification";

          return (
            <button
              key={agent.id}
              onClick={() => setActiveTab(agent.type)}
              className={cn(
                "p-5 rounded-3xl border text-left transition-all duration-200 backdrop-blur-2xl relative overflow-hidden group",
                isSelected
                  ? isDiagnostic
                    ? "bg-gradient-to-br from-cyan-950/50 via-cosmos-card to-cosmos-bg border-cyan-500 shadow-glowCyan"
                    : isRemediation
                    ? "bg-gradient-to-br from-purple-950/50 via-cosmos-card to-cosmos-bg border-purple-500 shadow-glowPurple"
                    : "bg-gradient-to-br from-emerald-950/50 via-cosmos-card to-cosmos-bg border-emerald-500 shadow-glowEmerald"
                  : "bg-cosmos-panel/80 border-cosmos-border hover:border-slate-600 opacity-80 hover:opacity-100"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs",
                      isDiagnostic
                        ? "bg-cyan-950 text-cyber-cyan border border-cyan-800"
                        : isRemediation
                        ? "bg-purple-950 text-purple-300 border border-purple-800"
                        : "bg-emerald-950 text-emerald-400 border border-emerald-800"
                    )}
                  >
                    {isDiagnostic ? <Search className="w-4 h-4" /> : isRemediation ? <Zap className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white">
                      {agent.name}
                    </h3>
                    <span className="text-[10px] text-slate-400">
                      [{agent.codename}]
                    </span>
                  </div>
                </div>

                <span
                  className={cn(
                    "px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border",
                    agent.status === "paused"
                      ? "bg-slate-900 text-slate-400 border-slate-700"
                      : agent.status === "busy"
                      ? isDiagnostic
                        ? "bg-cyan-950 text-cyan-300 border-cyan-800 animate-pulse shadow-glowCyan"
                        : isRemediation
                        ? "bg-purple-950 text-purple-300 border-purple-800 animate-pulse shadow-glowPurple"
                        : "bg-emerald-950 text-emerald-300 border-emerald-800 animate-pulse shadow-glowEmerald"
                      : "bg-emerald-950 text-emerald-400 border-emerald-800"
                  )}
                >
                  {agent.status}
                </span>
              </div>

              <p className="text-[11px] text-slate-300 line-clamp-2 mt-2 leading-relaxed">
                {agent.role}
              </p>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-cosmos-border/60 text-[10px] text-slate-400">
                <span>Tools: {agent.tools.filter((t) => t.enabled).length}/{agent.tools.length} Active</span>
                <span className="text-cyber-cyan font-semibold">{agent.autonomyLevel.replace("_", " ")}</span>
              </div>

              {isSelected && (
                <div
                  className={cn(
                    "absolute bottom-0 inset-x-0 h-[2px]",
                    isDiagnostic
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500"
                      : isRemediation
                      ? "bg-gradient-to-r from-purple-500 to-pink-500"
                      : "bg-gradient-to-r from-emerald-500 to-teal-400"
                  )}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* 3. ACTIVE AGENT CONTROL ROOM DASHBOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono text-xs">
        {/* Left Column (8 cols): Description, Tools Matrix, & Directives */}
        <div className="lg:col-span-8 space-y-6">
          {/* Agent Overview Hero Card */}
          <Card>
            <CardHeader className="bg-cosmos-subpanel/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-900 via-pink-900 to-cyan-900 border border-purple-500/40 flex items-center justify-center font-extrabold text-white text-sm shadow-glowPurple">
                    {currentAgent.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-extrabold text-white">
                        {currentAgent.name}
                      </h2>
                      <span className="text-[10px] text-slate-400">
                        ({currentAgent.codename})
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs">{currentAgent.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant={currentAgent.status === "paused" ? "success" : "danger"}
                    size="sm"
                    onClick={handleToggleAgentStatus}
                    className="font-mono text-xs rounded-full"
                  >
                    {currentAgent.status === "paused" ? (
                      <>
                        <PlayCircle className="w-3.5 h-3.5 mr-1" />
                        Resume Agent
                      </>
                    ) : (
                      <>
                        <PauseCircle className="w-3.5 h-3.5 mr-1" />
                        Quarantine Agent
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Description */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Mandate & Operational Scope:
                </span>
                <p className="text-xs text-slate-200 leading-relaxed bg-cosmos-subpanel/70 p-3.5 rounded-2xl border border-cosmos-border">
                  {currentAgent.description}
                </p>
              </div>

              {/* Status Detail live telemetry pulse */}
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyber-cyan animate-ping" />
                  <span className="text-[11px] text-slate-300">
                    Live Status: <strong>{currentAgent.statusDetail}</strong>
                  </span>
                </div>
                <span className="text-[10px] text-slate-500">
                  {currentAgent.stats.tokenUsageToday.toLocaleString()} tokens 24h
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Available & Enabled Tools Matrix */}
          <Card>
            <CardHeader className="bg-cosmos-subpanel/50">
              <div className="flex items-center justify-between w-full">
                <CardTitle className="text-xs">
                  <Wrench className="w-4 h-4 text-cyber-cyan" />
                  Available Tool Bindings & Permissions ({currentAgent.tools.filter((t) => t.enabled).length}/{currentAgent.tools.length} Enabled)
                </CardTitle>
                <span className="text-[10px] text-slate-400">
                  Toggle switch to grant or revoke tool execution
                </span>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 gap-2.5">
                {currentAgent.tools.map((tool) => (
                  <div
                    key={tool.id}
                    className={cn(
                      "p-3.5 rounded-2xl border transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3",
                      tool.enabled
                        ? "bg-cosmos-subpanel/80 border-cosmos-border hover:border-purple-500/50"
                        : "bg-slate-950/40 border-slate-800/60 opacity-60"
                    )}
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-xs font-mono">
                          {tool.name}
                        </span>
                        <code className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                          {tool.id}
                        </code>
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-[9px] uppercase font-bold",
                            tool.safetyTier === "read_only"
                              ? "bg-cyan-950 text-cyan-400 border border-cyan-800"
                              : tool.safetyTier === "reversible"
                              ? "bg-purple-950 text-purple-300 border border-purple-800"
                              : tool.safetyTier === "high_risk"
                              ? "bg-amber-950 text-amber-300 border border-amber-800"
                              : "bg-rose-950 text-rose-400 border border-rose-800"
                          )}
                        >
                          {tool.safetyTier.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {tool.description}
                      </p>
                    </div>

                    {/* Enable/Disable Toggle Switch */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[10px] text-slate-500">
                        {tool.executionsCount.toLocaleString()} calls
                      </span>
                      <button
                        onClick={() => handleToggleTool(tool.id)}
                        className={cn(
                          "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5",
                          tool.enabled
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-glowPurple"
                            : "bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
                        )}
                      >
                        {tool.enabled ? (
                          <>
                            <Check className="w-3 h-3" /> Enabled
                          </>
                        ) : (
                          <>
                            <X className="w-3 h-3" /> Disabled
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Prompt Directives */}
          <Card>
            <CardHeader className="bg-cosmos-subpanel/50">
              <CardTitle className="text-xs">
                <FileCode className="w-4 h-4 text-cyber-magenta" />
                System Prompt & Guardrail Directives
              </CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                rows={3}
                value={currentAgent.systemDirectives}
                onChange={(e) => {
                  const val = e.target.value;
                  setAgents((prev) =>
                    prev.map((a) =>
                      a.type === activeTab ? { ...a, systemDirectives: val } : a
                    )
                  );
                }}
                className="w-full p-3.5 rounded-2xl bg-cosmos-void border border-cosmos-border text-slate-200 text-xs font-mono focus:outline-none focus:border-purple-500 leading-relaxed resize-none"
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column (4 cols): Configuration Controls & Recovery Limits */}
        <div className="lg:col-span-4 space-y-6">
          {/* Autonomy & Model Configuration Controls */}
          <Card>
            <CardHeader className="bg-cosmos-subpanel/50">
              <CardTitle className="text-xs">
                <Sliders className="w-4 h-4 text-cyber-cyan" />
                Configuration Controls
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Autonomy Level */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-400 font-bold text-[11px]">
                    Autonomy Governance:
                  </label>
                  <AutonomyBadge level={currentAgent.autonomyLevel} />
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {(
                    [
                      ["L1_ADVISORY", "L1 Advisory (Read-Only)"],
                      ["L2_HUMAN_IN_THE_LOOP", "L2 HITL (Requires Sign-Off)"],
                      ["L3_AUTONOMOUS", "L3 Autonomous (Auto-Remediate)"],
                    ] as const
                  ).map(([lvl, label]) => (
                    <button
                      key={lvl}
                      onClick={() => handleUpdateAutonomy(lvl)}
                      className={cn(
                        "p-2.5 rounded-xl text-left text-xs font-mono transition-all border",
                        currentAgent.autonomyLevel === lvl
                          ? "bg-gradient-to-r from-purple-950/80 to-pink-950/70 border-purple-500 text-white font-bold shadow-glowPurple"
                          : "bg-cosmos-subpanel/60 border-cosmos-border text-slate-400 hover:text-white"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Foundation Model Engine */}
              <div className="space-y-2 pt-2 border-t border-cosmos-border/60">
                <label className="text-slate-400 font-bold text-[11px] block">
                  LLM Model Architecture:
                </label>
                <select
                  value={currentAgent.model}
                  onChange={(e) => handleUpdateModel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-cosmos-subpanel border border-cosmos-border text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                >
                  <option value="Gemini 1.5 Pro (SRE-Tuned)">Gemini 1.5 Pro (SRE-Tuned)</option>
                  <option value="Claude 3.5 Sonnet (Forensics)">Claude 3.5 Sonnet (Forensics)</option>
                  <option value="DeepSeek-Coder-V2 (K8s Ops)">DeepSeek-Coder-V2 (K8s Ops)</option>
                  <option value="GPT-4o Ops Core">GPT-4o Ops Core</option>
                </select>
              </div>

              {/* Confidence Threshold Slider */}
              <div className="space-y-2 pt-2 border-t border-cosmos-border/60">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-bold text-[11px]">
                    Min Confidence Threshold:
                  </span>
                  <span className="text-emerald-400 font-bold text-xs">
                    {currentAgent.confidenceThreshold}%
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="99"
                  value={currentAgent.confidenceThreshold}
                  onChange={(e) => handleUpdateConfidence(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              {/* Temperature Slider */}
              <div className="space-y-2 pt-2 border-t border-cosmos-border/60">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-bold text-[11px]">
                    Inference Temperature:
                  </span>
                  <span className="text-cyber-cyan font-bold text-xs">
                    {currentAgent.temperature}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={currentAgent.temperature}
                  onChange={(e) => handleUpdateTemperature(Number(e.target.value))}
                  className="w-full accent-purple-400"
                />
              </div>
            </CardContent>
          </Card>

          {/* Recovery Limits & Guardrails */}
          <Card>
            <CardHeader className="bg-cosmos-subpanel/50">
              <CardTitle className="text-xs">
                <ShieldAlert className="w-4 h-4 text-cyber-amber" />
                Recovery Limits & Guardrails
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3.5">
              {/* Max Timeout */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Execution Timeout</span>
                  <span className="text-white font-bold">
                    {currentAgent.recoveryLimits.maxTimeoutSeconds}s
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="600"
                  step="10"
                  value={currentAgent.recoveryLimits.maxTimeoutSeconds}
                  onChange={(e) =>
                    handleUpdateLimit("maxTimeoutSeconds", Number(e.target.value))
                  }
                  className="w-full accent-amber-400"
                />
              </div>

              {/* Max Concurrent Executions */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Max Concurrent Executions</span>
                  <span className="text-white font-bold">
                    {currentAgent.recoveryLimits.maxConcurrentExecutions} threads
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="64"
                  value={currentAgent.recoveryLimits.maxConcurrentExecutions}
                  onChange={(e) =>
                    handleUpdateLimit(
                      "maxConcurrentExecutions",
                      Number(e.target.value)
                    )
                  }
                  className="w-full accent-cyan-400"
                />
              </div>

              {/* Blast Radius Limit */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Blast Radius Limit</span>
                  <span className="text-rose-400 font-bold">
                    {currentAgent.recoveryLimits.maxBlastRadiusRps.toLocaleString()} req/s
                  </span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="100000"
                  step="5000"
                  value={currentAgent.recoveryLimits.maxBlastRadiusRps}
                  onChange={(e) =>
                    handleUpdateLimit("maxBlastRadiusRps", Number(e.target.value))
                  }
                  className="w-full accent-rose-400"
                />
              </div>

              {/* Memory Cap */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Memory Sandbox Cap</span>
                  <span className="text-purple-300 font-bold">
                    {currentAgent.recoveryLimits.memoryCapMb} MB
                  </span>
                </div>
                <input
                  type="range"
                  min="512"
                  max="8192"
                  step="512"
                  value={currentAgent.recoveryLimits.memoryCapMb}
                  onChange={(e) =>
                    handleUpdateLimit("memoryCapMb", Number(e.target.value))
                  }
                  className="w-full accent-purple-400"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-cosmos-border/60 flex items-center justify-between gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetDefaults}
                  className="text-[11px] font-mono"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Reset Defaults
                </Button>

                <Button
                  variant="gradientPill"
                  size="sm"
                  onClick={handleSaveConfig}
                  className="font-mono text-xs"
                >
                  Apply Config
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Test Live Probe Simulation Modal */}
      <Modal
        isOpen={isSimModalOpen}
        onClose={() => setIsSimModalOpen(false)}
        title={`Live Harness Simulation: ${currentAgent.name}`}
        description={`Simulating telemetry query using model ${currentAgent.model} under ${currentAgent.autonomyLevel}`}
        maxWidth="xl"
      >
        <div className="space-y-4 font-mono text-xs text-slate-300">
          <div className="p-4 rounded-2xl bg-cosmos-void border border-cosmos-border space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-cyber-cyan font-bold">AGENT EXECUTION LOG:</span>
              <span className="text-slate-500">
                {isSimulatingProbe ? "EXECUTING..." : "PROBE COMPLETED (200 OK)"}
              </span>
            </div>
            <div className="space-y-1.5 text-[11px]">
              {simulatedLogs.map((log, idx) => (
                <div key={idx} className="text-slate-300">
                  {log}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="gradientPill"
              size="sm"
              onClick={() => setIsSimModalOpen(false)}
            >
              Close Simulator
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

