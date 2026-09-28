"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Cpu,
  Search,
  Activity,
  Zap,
  ShieldCheck,
  Play,
  CheckCircle2,
  Clock,
  Radio,
  ChevronDown,
  ChevronUp,
  Terminal,
  Filter,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type TimelineEventType =
  | "detected"
  | "agent_started"
  | "evidence_collected"
  | "diagnosis_created"
  | "action_proposed"
  | "safety_check"
  | "action_executed"
  | "verification_started"
  | "verification_successful"
  | "resolved"
  | "custom";

export type TimelineEventStatus = "success" | "pending" | "running" | "warning" | "failed";

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  title: string;
  timestamp: string;
  agentName?: string;
  agentRole?: string;
  status: TimelineEventStatus;
  message: string;
  details?: string;
  metadata?: {
    toolName?: string;
    command?: string;
    durationMs?: number;
    confidence?: number;
    diffSnippet?: string;
  };
}

export const defaultRecoveryEvents: TimelineEvent[] = [
  {
    id: "evt-1",
    type: "detected",
    title: "Incident Detected",
    timestamp: "07:38:02 UTC",
    agentName: "eBPF Kernel Watcher",
    agentRole: "Automated Telemetry Sensor",
    status: "warning",
    message: "Critical error rate spike (14.8%) detected on api-gateway-mesh ingress listeners.",
    details: "TCP reset storm triggered threshold alarm (>5% 5xx responses over 60-second window).",
  },
  {
    id: "evt-2",
    type: "agent_started",
    title: "Diagnostic Agent Started",
    timestamp: "07:38:18 UTC",
    agentName: "Sentinel-SRE",
    agentRole: "Lead Incident Mitigator",
    status: "success",
    message: "Autonomous agent TITAN-ALPHA activated and bound to incident INC-8921.",
    details: "Autonomy Level L3 engaged. Distributed trace sampler and topology blast-radius mapper attached.",
  },
  {
    id: "evt-3",
    type: "evidence_collected",
    title: "Evidence Collected",
    timestamp: "07:39:10 UTC",
    agentName: "TraceHound",
    agentRole: "eBPF Forensics",
    status: "success",
    message: "Captured 3 corroborating evidence signals from GitOps commits, Envoy socket metrics, and Istio telemetry.",
    details: "Spike in upstream connection timeouts (+1,480%) correlated directly with commit 9bf2ad4 timestamp.",
    metadata: {
      confidence: 96.8,
    },
  },
  {
    id: "evt-4",
    type: "diagnosis_created",
    title: "Diagnosis Created",
    timestamp: "07:39:45 UTC",
    agentName: "Sentinel-SRE",
    agentRole: "Lead Incident Mitigator",
    status: "success",
    message: "Root cause isolated: Ingress Envoy upstream gRPC keepalive timeout set too aggressively (250ms).",
    details: "Unintended socket terminations occurred when upstream microservices closed persistent channels.",
  },
  {
    id: "evt-5",
    type: "action_proposed",
    title: "Action Proposed",
    timestamp: "07:40:15 UTC",
    agentName: "Sentinel-SRE",
    agentRole: "Lead Incident Mitigator",
    status: "pending",
    message: "Prepared idempotent Helm canary rollback: api-gateway-mesh v3.8.2 → v3.8.1.",
    details: "Zero-downtime rolling replacement across 12 pods. Approval request APP-401 created for Human-In-The-Loop gate.",
    metadata: {
      toolName: "argo_cd_sync",
      command: "helm rollback api-gateway-mesh 14 --namespace production --wait",
    },
  },
  {
    id: "evt-6",
    type: "safety_check",
    title: "Safety Check Executed",
    timestamp: "07:41:00 UTC",
    agentName: "Quorum Guardrails Engine",
    agentRole: "Safety Supervisor",
    status: "success",
    message: "Automated safety checks passed: Revision cryptographic hash verified, standby capacity confirmed.",
    details: "1 minor warning evaluated: 1,200 active WebSocket sessions will be gracefully drained with reconnection headers.",
  },
  {
    id: "evt-7",
    type: "action_executed",
    title: "Action Executed",
    timestamp: "07:42:00 UTC",
    agentName: "Sentinel-SRE",
    agentRole: "Lead Incident Mitigator",
    status: "success",
    message: "Helm rollback command executed via ArgoCD GitOps synchronizer in 1.4s.",
    details: "12/12 ingress pods rolling replacement initiated. Secondary cluster us-east-1b absorbed 30% traffic smoothly.",
    metadata: {
      durationMs: 1420,
    },
  },
  {
    id: "evt-8",
    type: "verification_started",
    title: "Verification Started",
    timestamp: "07:44:10 UTC",
    agentName: "TraceHound",
    agentRole: "eBPF Forensics",
    status: "running",
    message: "Automated verification suite launched: Monitoring p99 latency, error rate baseline, and pod health.",
    details: "Sampling 10,000 synthetic HTTP transactions per second across all ingress pods.",
  },
  {
    id: "evt-9",
    type: "verification_successful",
    title: "Verification Successful",
    timestamp: "07:45:30 UTC",
    agentName: "Sentinel-SRE",
    agentRole: "Lead Incident Mitigator",
    status: "success",
    message: "All health criteria satisfied: Error rate 0.04% (< 0.1% SLA), p99 latency 32ms (< 50ms).",
    details: "12/12 pods reporting healthy with 0 restarts. Traffic diverted back to 100% primary cluster.",
  },
  {
    id: "evt-10",
    type: "resolved",
    title: "Incident Resolved",
    timestamp: "07:46:00 UTC",
    agentName: "SentinelOps Engine",
    agentRole: "Core Supervisor",
    status: "success",
    message: "Incident INC-8921 marked as RESOLVED. Total time to mitigate (MTTM): 7m 58s. Zero downtime.",
    details: "Automated post-mortem report generated and archived to audit log.",
  },
];

interface RecoveryTimelineProps {
  events?: TimelineEvent[];
  isLive?: boolean;
  className?: string;
  onEventClick?: (event: TimelineEvent) => void;
}

export function RecoveryTimeline({
  events = defaultRecoveryEvents,
  isLive = true,
  className,
  onEventClick,
}: RecoveryTimelineProps) {
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({});
  const [filterType, setFilterType] = useState<string>("ALL");

  const toggleExpand = (id: string) => {
    setExpandedEvents((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getEventIcon = (type: TimelineEventType) => {
    switch (type) {
      case "detected":
        return AlertTriangle;
      case "agent_started":
        return Cpu;
      case "evidence_collected":
        return Search;
      case "diagnosis_created":
        return Activity;
      case "action_proposed":
        return Zap;
      case "safety_check":
        return ShieldCheck;
      case "action_executed":
        return Play;
      case "verification_started":
        return Radio;
      case "verification_successful":
        return CheckCircle2;
      case "resolved":
        return ShieldCheck;
      default:
        return Activity;
    }
  };

  const getEventColor = (type: TimelineEventType, status: TimelineEventStatus) => {
    if (status === "failed") {
      return {
        dot: "bg-cyber-rose shadow-glowRose",
        border: "border-rose-500/50",
        badge: "bg-rose-950/70 text-cyber-rose border-rose-500/40",
      };
    }
    if (status === "running") {
      return {
        dot: "bg-cyber-magenta animate-ping shadow-glowMagenta",
        border: "border-purple-500/60 shadow-[0_0_15px_rgba(157,78,221,0.25)]",
        badge: "bg-purple-950/70 text-purple-300 border-purple-500/40",
      };
    }
    if (status === "pending") {
      return {
        dot: "bg-cyber-amber animate-pulse shadow-glowAmber",
        border: "border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]",
        badge: "bg-amber-950/70 text-cyber-amber border-amber-500/40",
      };
    }
    if (type === "detected") {
      return {
        dot: "bg-cyber-rose",
        border: "border-rose-500/40",
        badge: "bg-rose-950/50 text-rose-400 border-rose-500/30",
      };
    }
    return {
      dot: "bg-cyber-emerald shadow-glowEmerald",
      border: "border-emerald-500/40",
      badge: "bg-emerald-950/60 text-emerald-400 border-emerald-500/30",
    };
  };

  const filteredEvents = events.filter((evt) => {
    if (filterType === "ALL") return true;
    if (filterType === "ACTIONS") return evt.type === "action_proposed" || evt.type === "action_executed" || evt.type === "safety_check";
    if (filterType === "DIAGNOSIS") return evt.type === "agent_started" || evt.type === "evidence_collected" || evt.type === "diagnosis_created";
    if (filterType === "VERIFICATION") return evt.type === "verification_started" || evt.type === "verification_successful" || evt.type === "resolved";
    return true;
  });

  return (
    <div className={cn("space-y-4 font-mono text-xs", className)}>
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-cosmos-subpanel/50 border border-cosmos-border backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <Clock className="w-4 h-4 text-cyber-cyan" />
          <span className="font-bold text-white uppercase text-xs tracking-wider">
            Autonomous Recovery Pipeline
          </span>
          {isLive && (
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-[10px] text-emerald-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-emerald animate-pulse" />
              Live Stream
            </span>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {["ALL", "DIAGNOSIS", "ACTIONS", "VERIFICATION"].map((f) => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={cn(
                "px-3 py-1 rounded-full text-[10px] font-mono transition-all",
                filterType === f
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-glowPurple border border-purple-400/40"
                  : "bg-cosmos-panel text-slate-400 hover:text-white border border-cosmos-border"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="relative border-l-2 border-slate-800 ml-4 pl-6 space-y-4">
        {filteredEvents.map((evt, idx) => {
          const Icon = getEventIcon(evt.type);
          const colors = getEventColor(evt.type, evt.status);
          const isExpanded = !!expandedEvents[evt.id];

          return (
            <div
              key={evt.id}
              className="relative group animate-in fade-in slide-in-from-bottom-2 duration-200"
              onClick={() => onEventClick && onEventClick(evt)}
            >
              {/* Pulsing Timeline Bullet Dot */}
              <div
                className={cn(
                  "absolute -left-[31px] top-3.5 w-3.5 h-3.5 rounded-full border-2 border-cosmos-void transition-transform group-hover:scale-125",
                  colors.dot
                )}
              />

              {/* Event Card Surface */}
              <div
                className={cn(
                  "p-4 rounded-2xl bg-cosmos-panel/80 border backdrop-blur-xl transition-all duration-200 shadow-panelCosmos group-hover:border-purple-500/50",
                  colors.border
                )}
              >
                {/* Top Row: Timestamp, Agent, Status Pill */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="w-6 h-6 rounded-xl bg-cosmos-subpanel border border-cosmos-border flex items-center justify-center text-slate-300 shrink-0">
                      <Icon className="w-3.5 h-3.5 text-cyber-cyan" />
                    </span>
                    <h4 className="text-xs font-bold text-white tracking-wide font-mono">
                      {evt.title}
                    </h4>
                    {evt.agentName && (
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-[10px] text-cyan-300 border border-slate-800 flex items-center gap-1 font-semibold">
                        <Cpu className="w-3 h-3 text-cyber-cyan" />
                        {evt.agentName}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span
                      className={cn(
                        "px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border",
                        colors.badge
                      )}
                    >
                      {evt.status}
                    </span>
                    <span className="text-slate-500">{evt.timestamp}</span>
                  </div>
                </div>

                {/* Event Message */}
                <p className="text-slate-200 text-xs leading-relaxed font-mono">
                  {evt.message}
                </p>

                {/* Metadata details / Code snippets */}
                {(evt.details || evt.metadata) && (
                  <div className="mt-2.5 pt-2 border-t border-cosmos-border/50">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
                        {evt.details}
                      </p>
                      {evt.metadata && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(evt.id);
                          }}
                          className="text-[10px] text-cyber-cyan hover:underline flex items-center gap-1 font-bold ml-2 shrink-0"
                        >
                          {isExpanded ? (
                            <>
                              Hide Vector <ChevronUp className="w-3 h-3" />
                            </>
                          ) : (
                            <>
                              View Vector <ChevronDown className="w-3 h-3" />
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Expandable Command / Diff Snippet */}
                    {isExpanded && evt.metadata && (
                      <div className="mt-2.5 p-3 rounded-xl bg-cosmos-void/90 border border-slate-800 text-[11px] text-slate-300 space-y-1.5 animate-in fade-in duration-150">
                        {evt.metadata.toolName && (
                          <div className="text-[10px] text-purple-400 font-bold uppercase">
                            Tool: {evt.metadata.toolName}
                          </div>
                        )}
                        {evt.metadata.command && (
                          <div className="text-emerald-400 bg-slate-900/90 p-2 rounded-lg border border-slate-800 break-all font-mono">
                            $ {evt.metadata.command}
                          </div>
                        )}
                        {evt.metadata.durationMs && (
                          <div className="text-[10px] text-slate-500">
                            Execution Latency: {evt.metadata.durationMs}ms
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
