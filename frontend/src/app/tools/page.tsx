"use client";

import React, { useState } from "react";
import {
  Wrench,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Terminal,
  Cpu,
  Clock,
  Filter,
  Play,
  KeyRound,
  Lock,
  Unlock,
  Sparkles,
  Flame,
  Search,
  Check,
  X,
  RotateCcw,
  Sliders,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Info,
  Layers,
  Server,
  Activity,
} from "lucide-react";
import { RiskBadge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { CodeViewer } from "@/components/ui/CodeViewer";
import { RiskLevel } from "@/types";
import { cn } from "@/lib/utils";

export type PermissionMode = "Automatic" | "Approval Required" | "Disabled";

export interface SentinelTool {
  id: string;
  name: string;
  description: string;
  riskLevel: RiskLevel;
  permissionMode: PermissionMode;
  category: "telemetry" | "kubernetes" | "config" | "system";
  rateLimit: string;
  totalExecutions: number;
  lastExecutedAt: string;
  allowedAgents: string[];
  commandSample: string;
}

const INITIAL_SENTINEL_TOOLS: SentinelTool[] = [
  {
    id: "check_health",
    name: "check_health",
    description:
      "Executes deep liveness, readiness, socket connection pools, and synthetic latency probe checks across container microservice endpoints.",
    riskLevel: "LOW",
    permissionMode: "Automatic",
    category: "telemetry",
    rateLimit: "120 req/min",
    totalExecutions: 24180,
    lastExecutedAt: "2026-09-28T07:44:10Z",
    allowedAgents: ["Sentinel-Diagnostic", "Sentinel-Verifier", "Sentinel-Remediation"],
    commandSample: "$ curl -s http://api-gateway.prod.svc.cluster.local:8080/healthz | jq .status",
  },
  {
    id: "get_logs",
    name: "get_logs",
    description:
      "Streams real-time stdout/stderr container logs, panic stack traces, and structured JSON telemetry from OpenSearch and node FluentBit daemons.",
    riskLevel: "LOW",
    permissionMode: "Automatic",
    category: "telemetry",
    rateLimit: "100 req/min",
    totalExecutions: 18420,
    lastExecutedAt: "2026-09-28T07:43:00Z",
    allowedAgents: ["Sentinel-Diagnostic", "Sentinel-Verifier"],
    commandSample: "$ kubectl logs -n production -l app=api-gateway --tail=200 --timestamps",
  },
  {
    id: "container_status",
    name: "container_status",
    description:
      "Queries low-level container runtime state, OOMKilled events, CPU/Memory cgroup limits, and restart exit code counters from containerd.",
    riskLevel: "LOW",
    permissionMode: "Automatic",
    category: "kubernetes",
    rateLimit: "80 req/min",
    totalExecutions: 15920,
    lastExecutedAt: "2026-09-28T07:42:30Z",
    allowedAgents: ["Sentinel-Diagnostic", "Sentinel-Verifier", "Sentinel-Remediation"],
    commandSample: "$ kubectl get pods -n production -o jsonpath='{range .items[*]}{.metadata.name}{\"\\t\"}{.status.phase}{\"\\n\"}{end}'",
  },
  {
    id: "restart_container",
    name: "restart_container",
    description:
      "Triggers graceful rolling container restarts and Envoy sidecar re-initialization to purge memory leaks, connection deadlock, or thread starvation.",
    riskLevel: "MEDIUM",
    permissionMode: "Approval Required",
    category: "kubernetes",
    rateLimit: "20 req/min",
    totalExecutions: 1280,
    lastExecutedAt: "2026-09-28T07:35:12Z",
    allowedAgents: ["Sentinel-Remediation"],
    commandSample: "$ kubectl rollout restart deployment/checkout-billing -n production",
  },
  {
    id: "modify_config",
    name: "modify_config",
    description:
      "Applies live ConfigMap updates, environment variable overrides, upstream gRPC keepalive adjustments, and Envoy ingress route weight patches.",
    riskLevel: "HIGH",
    permissionMode: "Approval Required",
    category: "config",
    rateLimit: "10 req/min",
    totalExecutions: 410,
    lastExecutedAt: "2026-09-28T07:40:15Z",
    allowedAgents: ["Sentinel-Remediation"],
    commandSample: "$ kubectl patch configmap/envoy-config -n production --patch-file patch.yaml",
  },
  {
    id: "delete_container",
    name: "delete_container",
    description:
      "Forces immediate termination, pod eviction, and cgroup teardown of unresponsive or compromised container replicas with zero grace period.",
    riskLevel: "CRITICAL",
    permissionMode: "Approval Required",
    category: "system",
    rateLimit: "5 req/min",
    totalExecutions: 85,
    lastExecutedAt: "2026-09-28T06:12:00Z",
    allowedAgents: ["Sentinel-Remediation"],
    commandSample: "$ kubectl delete pod/api-gateway-mesh-7b9f8d6c-xz92p -n production --force --grace-period=0",
  },
];

export default function ToolsPage() {
  const [tools, setTools] = useState<SentinelTool[]>(INITIAL_SENTINEL_TOOLS);
  const [selectedRisk, setSelectedRisk] = useState<string>("ALL");
  const [selectedPermission, setSelectedPermission] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [testingTool, setTestingTool] = useState<SentinelTool | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testOutput, setTestOutput] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Change permission mode in local state
  const handleSetPermissionMode = (toolId: string, newMode: PermissionMode) => {
    setTools((prev) =>
      prev.map((t) => (t.id === toolId ? { ...t, permissionMode: newMode } : t))
    );
    const target = tools.find((t) => t.id === toolId);
    showToast(`Updated "${target?.name}" permission mode to: ${newMode}`);
  };

  const handleRunDiagnostic = (tool: SentinelTool) => {
    setTestingTool(tool);
    setIsTesting(true);
    setTestOutput(null);

    setTimeout(() => {
      setIsTesting(false);
      setTestOutput(
        `[AUDIT_PASS] Security & Execution dry-run verification for: ${tool.name}\n` +
          `• Risk Rating: ${tool.riskLevel}\n` +
          `• Permission Mode: ${tool.permissionMode}\n` +
          `• Rate Limit: ${tool.rateLimit}\n` +
          `• Cryptographic Quorum: VERIFIED\n` +
          `• Sample Command: ${tool.commandSample}\n` +
          `• Status: 200 OK (Vector is healthy and ready for autonomous dispatch)`
      );
    }, 1100);
  };

  // Filter tools
  const filteredTools = tools.filter((tool) => {
    const matchesRisk = selectedRisk === "ALL" || tool.riskLevel === selectedRisk;
    const matchesPermission =
      selectedPermission === "ALL" || tool.permissionMode === selectedPermission;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !q ||
      tool.name.toLowerCase().includes(q) ||
      tool.description.toLowerCase().includes(q) ||
      tool.id.toLowerCase().includes(q) ||
      tool.category.toLowerCase().includes(q);

    return matchesRisk && matchesPermission && matchesQuery;
  });

  // Calculate summary metrics
  const totalCount = tools.length;
  const automaticCount = tools.filter((t) => t.permissionMode === "Automatic").length;
  const approvalCount = tools.filter((t) => t.permissionMode === "Approval Required").length;
  const disabledCount = tools.filter((t) => t.permissionMode === "Disabled").length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
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

      {/* 1. HEADER BANNER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyber-cyan mb-1">
            <KeyRound className="w-4 h-4" />
            <span className="font-bold tracking-wider">
              AUTONOMOUS TOOL CAPABILITY MATRIX
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
            Tools & Permissions
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Configure authorization modes and risk governance for autonomous container tools
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-300 bg-cosmos-panel/90 px-4 py-2 rounded-full border border-cosmos-border shadow-panelCosmos">
          <ShieldCheck className="w-4 h-4 text-cyber-emerald" />
          <span>Multi-Tier RBAC & Zero-Trust Active</span>
        </div>
      </div>

      {/* 2. SUMMARY COUNTERS (KPI TILES) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 font-mono">
        <div className="p-4 rounded-2xl bg-cosmos-panel/80 border border-cosmos-border font-mono backdrop-blur-xl shadow-panelCosmos">
          <span className="text-[11px] text-slate-400 uppercase">Available Tools</span>
          <div className="text-2xl font-extrabold text-white mt-1">{totalCount}</div>
        </div>
        <div className="p-4 rounded-2xl bg-cosmos-panel/80 border border-emerald-500/40 backdrop-blur-xl shadow-[0_0_20px_rgba(16,185,129,0.15)]">
          <span className="text-[11px] text-emerald-400 uppercase">Automatic Mode</span>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1">
            {automaticCount}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-cosmos-panel/80 border border-amber-500/40 backdrop-blur-xl shadow-[0_0_20px_rgba(245,158,11,0.15)]">
          <span className="text-[11px] text-amber-400 uppercase">Approval Required</span>
          <div className="text-2xl font-extrabold text-amber-400 mt-1">
            {approvalCount}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-cosmos-panel/80 border border-rose-500/40 backdrop-blur-xl shadow-[0_0_20px_rgba(255,42,109,0.15)]">
          <span className="text-[11px] text-rose-400 uppercase">Disabled Vectors</span>
          <div className="text-2xl font-extrabold text-rose-400 mt-1">
            {disabledCount}
          </div>
        </div>
      </div>

      {/* 3. SEARCH & MULTI-FILTER BAR */}
      <div className="p-4 rounded-2xl bg-cosmos-panel/80 border border-cosmos-border backdrop-blur-xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 font-mono text-xs shadow-panelCosmos">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tool by name, description, or id..."
            className="w-full pl-9 pr-4 py-2 rounded-full bg-cosmos-subpanel border border-cosmos-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Permission Mode Filter */}
          <div className="flex items-center gap-1 bg-cosmos-subpanel/60 p-1 rounded-full border border-cosmos-border">
            <span className="text-slate-500 text-[10px] px-2">Mode:</span>
            {["ALL", "Automatic", "Approval Required", "Disabled"].map((mode) => (
              <button
                key={mode}
                onClick={() => setSelectedPermission(mode)}
                className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-mono transition-all font-semibold",
                  selectedPermission === mode
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-glowPurple"
                    : "text-slate-400 hover:text-white"
                )}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Risk Level Filter */}
          <div className="flex items-center gap-1 bg-cosmos-subpanel/60 p-1 rounded-full border border-cosmos-border">
            <span className="text-slate-500 text-[10px] px-2">Risk:</span>
            {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRisk(r)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-[10px] font-mono transition-all font-semibold",
                  selectedRisk === r
                    ? r === "CRITICAL"
                      ? "bg-rose-600 text-white shadow-glowRose"
                      : r === "HIGH"
                      ? "bg-amber-600 text-white shadow-glowAmber"
                      : r === "MEDIUM"
                      ? "bg-cyan-600 text-white shadow-glowCyan"
                      : r === "LOW"
                      ? "bg-emerald-600 text-white shadow-glowEmerald"
                      : "bg-slate-700 text-white"
                    : "text-slate-400 hover:text-white"
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. THE 6 REQUESTED TOOLS INVENTORY GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 font-mono text-xs">
        {filteredTools.map((tool) => {
          const isCritical = tool.riskLevel === "CRITICAL";
          const isHigh = tool.riskLevel === "HIGH";
          const isMedium = tool.riskLevel === "MEDIUM";
          const isLow = tool.riskLevel === "LOW";

          // Dynamic Card Style based on Risk & Permission
          const cardBorder =
            tool.permissionMode === "Disabled"
              ? "border-slate-800 opacity-60"
              : isCritical
              ? "border-rose-500/50 hover:border-rose-500/80 shadow-[0_0_20px_rgba(255,42,109,0.12)]"
              : isHigh
              ? "border-amber-500/50 hover:border-amber-500/80 shadow-[0_0_20px_rgba(245,158,11,0.12)]"
              : isMedium
              ? "border-cyan-500/40 hover:border-cyan-500/70 shadow-[0_0_20px_rgba(0,240,255,0.1)]"
              : "border-emerald-500/40 hover:border-emerald-500/70 shadow-[0_0_20px_rgba(16,185,129,0.1)]";

          return (
            <Card
              key={tool.id}
              className={cn("flex flex-col justify-between transition-all duration-200", cardBorder)}
            >
              {/* Card Header with Tool Name & Risk Level */}
              <CardHeader className="bg-cosmos-subpanel/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyber-cyan shadow-glowCyan">
                      <Terminal className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-mono text-base font-extrabold text-white">
                          {tool.name}
                        </h3>
                        <code className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                          ID: {tool.id}
                        </code>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Category: <strong className="text-slate-300">{tool.category}</strong> • Rate: {tool.rateLimit}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <RiskBadge risk={tool.riskLevel} />
                  </div>
                </div>
              </CardHeader>

              {/* Card Content: Description, Permission Mode Selector, Metadata */}
              <CardContent className="space-y-4 flex-1">
                {/* Description */}
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
                    Description:
                  </span>
                  <p className="text-slate-200 text-xs leading-relaxed bg-cosmos-subpanel/60 p-3 rounded-2xl border border-cosmos-border">
                    {tool.description}
                  </p>
                </div>

                {/* PERMISSION MODE INTERACTIVE SELECTOR (Automatic | Approval Required | Disabled) */}
                <div className="p-3.5 rounded-2xl bg-cosmos-void border border-cosmos-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-cyber-cyan" />
                      Permission Governance Mode:
                    </span>
                    <span
                      className={cn(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border",
                        tool.permissionMode === "Automatic"
                          ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                          : tool.permissionMode === "Approval Required"
                          ? "bg-amber-950 text-amber-300 border-amber-800"
                          : "bg-rose-950 text-rose-400 border-rose-800"
                      )}
                    >
                      {tool.permissionMode}
                    </span>
                  </div>

                  {/* 3-Segment Button Selector */}
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    {(["Automatic", "Approval Required", "Disabled"] as const).map((mode) => {
                      const isActive = tool.permissionMode === mode;
                      return (
                        <button
                          key={mode}
                          onClick={() => handleSetPermissionMode(tool.id, mode)}
                          className={cn(
                            "py-1.5 px-2 rounded-xl text-[11px] font-mono text-center transition-all border",
                            isActive
                              ? mode === "Automatic"
                                ? "bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold shadow-glowEmerald"
                                : mode === "Approval Required"
                                ? "bg-amber-950/80 border-amber-500 text-amber-300 font-bold shadow-glowAmber"
                                : "bg-rose-950/80 border-rose-500 text-rose-300 font-bold shadow-glowRose"
                              : "bg-cosmos-subpanel/40 border-cosmos-border text-slate-400 hover:text-white"
                          )}
                        >
                          {mode}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sample Command & Permitted Agents */}
                <div className="space-y-2 pt-1 text-[11px]">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
                      Execution Command Sample:
                    </span>
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 font-mono text-emerald-400 text-[11px] truncate">
                      {tool.commandSample}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
                      Authorized Autonomous Agents:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {tool.allowedAgents.map((ag) => (
                        <span
                          key={ag}
                          className="px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-800 text-[10px] flex items-center gap-1"
                        >
                          <Cpu className="w-2.5 h-2.5 text-cyber-cyan" />
                          {ag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>

              {/* Card Footer with Execution Stats & Dry-Run Trigger */}
              <div className="px-6 py-4 border-t border-cosmos-border/60 bg-cosmos-subpanel/30 flex items-center justify-between font-mono text-xs">
                <span className="text-slate-500 text-[11px]">
                  Total Invocations: <strong className="text-white">{tool.totalExecutions.toLocaleString()}</strong>
                </span>

                <Button
                  variant="gradientOutlinePill"
                  size="sm"
                  onClick={() => handleRunDiagnostic(tool)}
                  className="font-mono text-xs"
                >
                  <Play className="w-3 h-3 mr-1 text-cyber-cyan" />
                  Dry-Run Test
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* 5. DRY RUN AUDIT MODAL */}
      {testingTool && (
        <Modal
          isOpen={true}
          onClose={() => setTestingTool(null)}
          title={`Diagnostic Dry-Run Probe: ${testingTool.name}`}
          description={`Risk: ${testingTool.riskLevel} • Permission Mode: ${testingTool.permissionMode}`}
          maxWidth="lg"
        >
          <div className="space-y-4 font-mono text-xs">
            <div className="p-4 rounded-2xl bg-cosmos-subpanel border border-cosmos-border">
              <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
                Target Tool Vector:
              </span>
              <p className="text-slate-200">{testingTool.description}</p>
            </div>

            {isTesting ? (
              <div className="py-8 text-center text-cyber-cyan flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyber-cyan animate-ping" />
                Executing security sandbox simulation against Kubernetes cluster...
              </div>
            ) : (
              testOutput && (
                <div>
                  <span className="text-slate-400 font-bold text-[11px] block mb-1">
                    Simulation Response & Quorum Verification:
                  </span>
                  <CodeViewer
                    code={testOutput}
                    language="bash"
                    title="PROBE RESULT"
                  />
                </div>
              )
            )}

            <div className="flex justify-end pt-3 border-t border-cosmos-border">
              <Button
                variant="gradientPill"
                size="sm"
                onClick={() => setTestingTool(null)}
              >
                Close Diagnostic
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
