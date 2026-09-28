"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ShieldAlert,
  ArrowLeft,
  Cpu,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Zap,
  Activity,
  ShieldCheck,
  Search,
  Check,
  X,
  FileCode,
  Terminal,
  Server,
  ArrowDown,
} from "lucide-react";
import { SeverityBadge, StatusBadge, RiskBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CodeViewer } from "@/components/ui/CodeViewer";
import { Modal } from "@/components/ui/Modal";
import { mockIncidents, mockAgents, mockApprovals } from "@/lib/mockData";
import { cn } from "@/lib/utils";

interface PipelineStep {
  id: string;
  stageName: string;
  actionTitle: string;
  agent: string;
  status: "completed" | "failed" | "running" | "pending";
  timestamp: string;
  summary: string;
  details?: string;
  command?: string;
}

const INITIAL_PIPELINE: PipelineStep[] = [
  {
    id: "step-1",
    stageName: "1. FAILURE DETECTED",
    actionTitle: "API Gateway 502 Outage",
    agent: "Sensor Sensor",
    status: "completed",
    timestamp: "07:38:02 UTC",
    summary: "14.8% error rate spike on api-gateway following deployment v3.8.2.",
    details: "TCP reset burst triggered automated alarm threshold (>5% 5xx responses).",
  },
  {
    id: "step-2",
    stageName: "2. DIAGNOSE",
    actionTitle: "Triage & Socket Inspection",
    agent: "Diagnostic Agent",
    status: "completed",
    timestamp: "07:38:40 UTC",
    summary: "Isolated upstream socket disconnects causing cascading 502 Bad Gateways.",
  },
  {
    id: "step-3",
    stageName: "3. FIRST FIX",
    actionTitle: "Container Restart (restart_container)",
    agent: "Remediation Agent",
    status: "completed",
    timestamp: "07:39:30 UTC",
    summary: "Restarted api-gateway container replicas to flush hung connection pool.",
    command: "docker restart api-gateway-01 api-gateway-02",
  },
  {
    id: "step-4",
    stageName: "4. VERIFY → FAILED ⚠️",
    actionTitle: "Synthetic Health Check Failed",
    agent: "Verification Agent",
    status: "failed",
    timestamp: "07:40:15 UTC",
    summary: "Verification failed: 12.4% error rate persists! Restart did not resolve root cause.",
    details: "New client connections immediately hit connection reset. Triggered deep re-diagnosis.",
  },
  {
    id: "step-5",
    stageName: "5. RE-DIAGNOSE",
    actionTitle: "Commit Regression Pinpointed",
    agent: "Diagnostic Agent",
    status: "completed",
    timestamp: "07:41:00 UTC",
    summary: "Root cause isolated to commit 9bf2ad4: gRPC keepalive timeout reduced to 250ms.",
    details: "Aggressive ping timeout caused upstream Envoy instances to close persistent sockets.",
  },
  {
    id: "step-6",
    stageName: "6. SECOND FIX (ROLLBACK)",
    actionTitle: "Canary Helm Rollback (APP-401)",
    agent: "Remediation Agent",
    status: "running",
    timestamp: "07:42:00 UTC",
    summary: "Staged canary rollback to v3.8.1 (30s stable keepalive). Requires Commander sign-off.",
    command: "helm rollback api-gateway 14 --namespace production --wait",
  },
  {
    id: "step-7",
    stageName: "7. VERIFY",
    actionTitle: "SLO & Latency Validation",
    agent: "Verification Agent",
    status: "pending",
    timestamp: "Pending",
    summary: "Automated synthetic test probe validating p99 < 50ms and error rate < 0.1%.",
  },
  {
    id: "step-8",
    stageName: "8. RESOLVED",
    actionTitle: "Incident Auto-Closed",
    agent: "SentinelOps Core",
    status: "pending",
    timestamp: "Pending",
    summary: "Cluster health restored to 100%. Total recovery time recorded.",
  },
];

export default function IncidentDetailsPage() {
  const params = useParams();
  const incidentId = (params?.id as string) || "INC-8921";
  const incident = mockIncidents.find((i) => i.id === incidentId) || mockIncidents[0];

  const [pipeline, setPipeline] = useState<PipelineStep[]>(INITIAL_PIPELINE);
  const [isResolved, setIsResolved] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleExecuteApproval = () => {
    setIsApproving(true);

    // Step 1: Second Fix completed
    setTimeout(() => {
      setPipeline((prev) =>
        prev.map((step) => {
          if (step.id === "step-6") {
            return { ...step, status: "completed" as const, timestamp: "07:43:00 UTC", summary: "Canary rollback to v3.8.1 executed successfully in 1.4s." };
          }
          if (step.id === "step-7") {
            return { ...step, status: "running" as const, timestamp: "07:43:30 UTC", summary: "Synthetically probing 1,850 req/s across rolled ingress pods..." };
          }
          return step;
        })
      );
      setActionNotice("Rollback executed! Verification Agent validating SLOs...");
    }, 800);

    // Step 2: Verification Passed and Resolved
    setTimeout(() => {
      setPipeline((prev) =>
        prev.map((step) => {
          if (step.id === "step-7") {
            return {
              ...step,
              status: "completed" as const,
              timestamp: "07:44:30 UTC",
              summary: "Verification Passed ✓: Error rate 0.02% (< 0.1%), p99 latency 24ms.",
            };
          }
          if (step.id === "step-8") {
            return {
              ...step,
              status: "completed" as const,
              timestamp: "07:45:00 UTC",
              summary: "Incident marked RESOLVED. Total recovery time (MTTM): 6m 58s. 0 downtime.",
            };
          }
          return step;
        })
      );
      setIsResolved(true);
      setIsApproving(false);
      setActionNotice("✓ Incident resolved! All verification checks passed.");
    }, 2400);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-2">
      {/* Toast Notice */}
      {actionNotice && (
        <div className="p-4 rounded-full bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 font-mono text-xs flex items-center justify-between shadow-glowEmerald animate-in fade-in duration-200 px-6">
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            {actionNotice}
          </span>
          <button onClick={() => setActionNotice(null)} className="text-emerald-400 hover:text-white font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/incidents">
            <Button variant="outline" size="sm" className="font-mono text-xs rounded-full">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Incidents
            </Button>
          </Link>
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-slate-500">Incident</span>
            <span className="text-white font-bold">{incident.id}</span>
            <span className="text-slate-600">•</span>
            <span className="text-cyan-400">{incident.affectedServices.join(", ")}</span>
          </div>
        </div>

        {!isResolved && (
          <Button
            variant="gradientPill"
            size="sm"
            onClick={handleExecuteApproval}
            disabled={isApproving}
            className="font-mono text-xs"
          >
            <Zap className="w-3.5 h-3.5 mr-1.5" />
            {isApproving ? "Executing Rollback..." : "Approve & Execute Rollback (APP-401)"}
          </Button>
        )}
      </div>

      {/* 1. CLEAN INCIDENT SUMMARY BANNER */}
      <section className="p-8 rounded-3xl bg-cosmos-card/80 border border-cosmos-border backdrop-blur-2xl shadow-panelCosmos space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <SeverityBadge severity={incident.severity} />
            <span className="font-mono text-base font-bold text-white">{incident.id}</span>
            <StatusBadge status={isResolved ? "resolved" : incident.status} />
            <span className="text-xs font-mono text-slate-400">Duration: {incident.duration}</span>
          </div>

          <div className="text-xs font-mono text-slate-400 flex items-center gap-3">
            <span>RCA Confidence: <strong className="text-emerald-400">97.4%</strong></span>
            <span>•</span>
            <span>Target: <strong className="text-cyan-300">api-gateway</strong></span>
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
          {incident.title}
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 font-mono leading-relaxed max-w-4xl">
          {incident.summary}
        </p>

        <div className="p-4 rounded-2xl bg-cosmos-subpanel/80 border border-cosmos-border font-mono text-xs text-slate-300 flex items-start gap-3">
          <span className="px-2 py-0.5 rounded bg-rose-950/80 text-cyber-rose font-bold text-[10px] shrink-0">
            ROOT CAUSE
          </span>
          <span className="leading-relaxed">{incident.rca.rootCause}</span>
        </div>
      </section>

      {/* 2. THE VISUAL RECOVERY PIPELINE (THE PRIMARY DEMO SHOWCASE) */}
      <section className="p-8 sm:p-10 rounded-3xl bg-cosmos-card/80 border border-cosmos-border backdrop-blur-2xl shadow-panelCosmos space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyber-cyan" />
              Autonomous Recovery Workflow
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Visual proof of the 2-stage verification failure & re-diagnosis recovery story
            </p>
          </div>
          <span className="text-xs font-mono text-purple-300 bg-purple-950/50 px-3 py-1 rounded-full border border-purple-500/30">
            8-Stage Autonomous Loop
          </span>
        </div>

        {/* The 8-Step Vertical Timeline */}
        <div className="space-y-4 pt-2">
          {pipeline.map((step, idx) => (
            <div
              key={step.id}
              className={cn(
                "p-5 rounded-2xl border font-mono transition-all relative",
                step.status === "completed"
                  ? "bg-emerald-950/20 border-emerald-500/40 shadow-sm"
                  : step.status === "failed"
                  ? "bg-rose-950/30 border-rose-500/50 shadow-[0_0_20px_rgba(255,42,109,0.15)]"
                  : step.status === "running"
                  ? "bg-gradient-to-r from-purple-950/80 to-pink-950/80 border-purple-500/60 shadow-glowPurple"
                  : "bg-cosmos-subpanel/40 border-cosmos-border/60 opacity-60"
              )}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase",
                      step.status === "completed"
                        ? "bg-emerald-900/60 text-emerald-300"
                        : step.status === "failed"
                        ? "bg-rose-900/80 text-rose-300"
                        : step.status === "running"
                        ? "bg-pink-900/80 text-pink-200 animate-pulse"
                        : "bg-slate-800 text-slate-400"
                    )}
                  >
                    {step.stageName}
                  </span>
                  <span className="text-xs font-bold text-white">{step.actionTitle}</span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="text-cyan-400 font-semibold">{step.agent}</span>
                  <span>•</span>
                  <span>{step.timestamp}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed pl-1">
                {step.summary}
              </p>

              {step.details && (
                <div className="text-[11px] text-slate-400 mt-2 pl-1 border-t border-slate-800/80 pt-1.5">
                  {step.details}
                </div>
              )}

              {step.command && (
                <div className="mt-2.5 p-2.5 rounded-xl bg-black/60 border border-slate-800 text-[11px] text-cyan-300 font-mono flex items-center justify-between">
                  <span>{step.command}</span>
                  <span className="text-[10px] text-slate-500">Idempotent</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
