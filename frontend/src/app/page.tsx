"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  Cpu,
  Clock,
  ArrowRight,
  Zap,
  RotateCcw,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Server,
  Layers,
  Sparkles,
} from "lucide-react";
import { SeverityBadge, StatusBadge, RiskBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { CodeViewer } from "@/components/ui/CodeViewer";
import { mockSystemHealth, mockIncidents, mockApprovals, mockActivityEvents } from "@/lib/mockData";
import { ApprovalRequest, ActivityEvent } from "@/types";
import { cn } from "@/lib/utils";

// Visual 8-step pipeline indicator
const RECOVERY_STAGES = [
  { id: "detected", label: "Failure Detected", status: "completed", agent: "Sensor" },
  { id: "diagnose", label: "Diagnosing", status: "completed", agent: "Diagnostic Agent" },
  { id: "first_fix", label: "First Remediation", status: "completed", agent: "Remediation Agent" },
  { id: "failed", label: "Verify: Failed ⚠️", status: "failed", agent: "Verification Agent" },
  { id: "re_diagnose", label: "Re-Diagnosis", status: "completed", agent: "Diagnostic Agent" },
  { id: "second_fix", label: "Canary Rollback", status: "running", agent: "Remediation Agent" },
  { id: "verify_pass", label: "SLO Verification", status: "pending", agent: "Verification Agent" },
  { id: "resolved", label: "Auto-Resolved", status: "pending", agent: "Supervisor" },
];

export default function CommandCenterPage() {
  const activeIncident = mockIncidents[0]; // INC-8921 (Primary Showcase)
  const [approvalsList, setApprovalsList] = useState(mockApprovals);
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRequest | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const pendingApproval = approvalsList.find((a) => a.status === "pending");

  const handleQuickApprove = (id: string) => {
    setApprovalsList((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: "approved" as const } : app))
    );
    setSelectedApproval(null);
    setActionNotice(`Action ${id} approved! Dispatched rollback to cluster.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleQuickDeny = (id: string) => {
    setApprovalsList((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: "rejected" as const } : app))
    );
    setSelectedApproval(null);
    setActionNotice(`Action ${id} rejected.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto py-2">
      {/* Toast Notification */}
      {actionNotice && (
        <div className="p-4 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center justify-between shadow-glowEmerald animate-in fade-in duration-200 px-6">
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            {actionNotice}
          </span>
          <button onClick={() => setActionNotice(null)} className="text-emerald-400 hover:text-white font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* 1. HERO SYSTEM STATUS & AUTONOMOUS RECOVERY BANNER */}
      <section className="relative rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-cosmos-panel/90 via-cosmos-card/80 to-cosmos-bg border border-cosmos-border/80 backdrop-blur-2xl overflow-hidden shadow-panelCosmos">
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-pink-600/10 rounded-full blur-[90px] pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold bg-rose-950/70 text-cyber-rose border border-rose-500/50 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyber-rose animate-ping" />
                ACTIVE SEV-0 INCIDENT
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono bg-purple-950/40 text-purple-300 border border-purple-500/30">
                1 Outage • 1 Approval Required
              </span>
            </div>

            <div className="text-xs font-mono text-slate-400 flex items-center gap-4">
              <span>MTTD: <strong className="text-white">42s</strong></span>
              <span>•</span>
              <span>MTTM: <strong className="text-white">4m 12s</strong></span>
              <span>•</span>
              <span>Self-Healing: <strong className="text-emerald-400">92.4%</strong></span>
            </div>
          </div>

          <div className="max-w-3xl space-y-3">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Autonomous AI SRE & Outage Remediation
            </h1>
            <p className="text-sm sm:text-base text-slate-300 font-mono leading-relaxed">
              SentinelOps multi-agent swarm detected a 502 cascading spike on <strong className="text-cyan-300">api-gateway</strong>. 
              Initial pod restart failed verification; deep re-diagnosis isolated commit regression and staged a zero-downtime canary rollback.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link href="/incidents/INC-8921">
              <Button variant="gradientPill" size="lg" className="font-mono text-xs">
                <ShieldAlert className="w-4 h-4 mr-2" />
                Investigate INC-8921 War Room
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            {pendingApproval && (
              <Button
                variant="gradientOutlinePill"
                size="lg"
                className="font-mono text-xs"
                onClick={() => setSelectedApproval(pendingApproval)}
              >
                <Zap className="w-4 h-4 mr-2 text-cyber-amber" />
                Review Pending Approval (APP-401)
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* 2. CORE RECOVERY PIPELINE VISUALIZATION */}
      <section className="p-8 rounded-3xl bg-cosmos-card/60 border border-cosmos-border backdrop-blur-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyber-cyan" />
              Live Recovery Pipeline • INC-8921
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Multi-agent autonomous remediation & 2-stage verification loop
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400 font-semibold">
            Stage 6 of 8: Canary Rollback Awaiting Sign-off
          </span>
        </div>

        {/* 8-Stage Recovery Stepper */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 pt-1">
          {RECOVERY_STAGES.map((st, idx) => (
            <div
              key={st.id}
              className={cn(
                "p-3.5 rounded-2xl border font-mono text-xs transition-all relative",
                st.status === "completed"
                  ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-300"
                  : st.status === "failed"
                  ? "bg-rose-950/30 border-rose-500/50 text-rose-300 shadow-[0_0_15px_rgba(255,42,109,0.15)]"
                  : st.status === "running"
                  ? "bg-gradient-to-r from-purple-950/80 to-pink-950/80 border-purple-500/60 text-white shadow-glowPurple"
                  : "bg-cosmos-subpanel/40 border-cosmos-border/60 text-slate-500 opacity-60"
              )}
            >
              <div className="flex items-center justify-between mb-1.5 text-[10px] font-bold">
                <span>0{idx + 1}</span>
                {st.status === "completed" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                {st.status === "failed" && <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />}
                {st.status === "running" && <RotateCcw className="w-3.5 h-3.5 text-pink-400 animate-spin" />}
              </div>
              <div className="font-semibold text-xs leading-tight mb-1">{st.label}</div>
              <div className="text-[10px] text-slate-400 truncate">{st.agent}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. TWO MEANINGFUL SECTIONS: AFFECTED SERVICES & PENDING HUMAN APPROVAL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left (7 cols): Core Microservices */}
        <section className="lg:col-span-7 p-8 rounded-3xl bg-cosmos-card/60 border border-cosmos-border backdrop-blur-xl space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <Server className="w-4 h-4 text-cyber-cyan" />
                Production Microservices Health
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                4 core services under SentinelOps active monitoring
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {mockSystemHealth.services.map((svc) => (
              <div
                key={svc.name}
                className={cn(
                  "p-4 rounded-2xl border font-mono transition-all backdrop-blur-md",
                  svc.status === "critical"
                    ? "bg-rose-950/20 border-rose-500/40"
                    : svc.status === "warning"
                    ? "bg-amber-950/20 border-amber-500/40"
                    : "bg-cosmos-subpanel/50 border-cosmos-border/60"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white font-mono">{svc.name}</span>
                  <span
                    className={cn(
                      "w-2.5 h-2.5 rounded-full",
                      svc.status === "critical"
                        ? "bg-cyber-rose animate-ping"
                        : svc.status === "warning"
                        ? "bg-cyber-amber animate-pulse"
                        : "bg-cyber-emerald"
                    )}
                  />
                </div>

                <div className="space-y-1.5 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>Latency:</span>
                    <span className={cn("font-bold", svc.latency > 100 ? "text-rose-400" : "text-emerald-400")}>
                      {svc.latency}ms
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Error Rate:</span>
                    <span className={cn("font-bold", svc.errorRate > 0 ? "text-rose-400" : "text-slate-400")}>
                      {svc.errorRate}%
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800/80">
                    <span>Traffic: {svc.trafficRps} req/s</span>
                    <span>{svc.node}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right (5 cols): Pending Approval Spotlight */}
        <section className="lg:col-span-5 p-8 rounded-3xl bg-cosmos-card/60 border border-cosmos-border backdrop-blur-xl space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyber-amber" />
                  Human-In-The-Loop Gate
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  High-risk automated actions awaiting confirmation
                </p>
              </div>
              <RiskBadge risk="CRITICAL" />
            </div>

            {pendingApproval ? (
              <div className="p-5 rounded-2xl bg-cosmos-subpanel/80 border border-cosmos-border space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Action: <strong className="text-white">{pendingApproval.action}</strong></span>
                  <span className="text-amber-400">{pendingApproval.expiresInSeconds}s auto-reject</span>
                </div>

                <div className="text-slate-200 leading-snug font-semibold text-xs">
                  {pendingApproval.title}
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {pendingApproval.reason}
                </p>

                <div className="pt-2 flex items-center gap-2">
                  <Button
                    variant="gradientPill"
                    size="sm"
                    className="w-full font-mono text-xs"
                    onClick={() => handleQuickApprove(pendingApproval.id)}
                  >
                    Approve Rollback
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    className="font-mono text-xs rounded-full px-4"
                    onClick={() => handleQuickDeny(pendingApproval.id)}
                  >
                    Deny
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs font-mono text-slate-500">
                ✓ All pending actions signed off. Autonomous system operating smoothly.
              </div>
            )}
          </div>

          <div className="text-[11px] font-mono text-slate-500 pt-3 border-t border-cosmos-border flex items-center justify-between">
            <span>Supervisor Autonomy: <strong className="text-cyan-400">L3 Autonomous</strong></span>
            <Link href="/approvals" className="text-cyan-400 hover:underline">
              Approvals Center →
            </Link>
          </div>
        </section>
      </div>

      {/* 4. RECENT AUTONOMOUS ACTIVITY STREAM */}
      <section className="p-8 rounded-3xl bg-cosmos-card/60 border border-cosmos-border backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyber-cyan" />
              Autonomous Activity Feed
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Live chronological record of diagnostic triage, tool execution, and verifications
            </p>
          </div>
        </div>

        <div className="divide-y divide-cosmos-border/60">
          {mockActivityEvents.slice(0, 5).map((act) => (
            <div key={act.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-3">
                <span className="text-slate-500 text-[11px] shrink-0">{act.timestamp}</span>
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                    act.status === "success"
                      ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/30"
                      : act.status === "failed"
                      ? "bg-rose-950/60 text-rose-400 border border-rose-500/30"
                      : "bg-amber-950/60 text-amber-400 border border-amber-500/30"
                  )}
                >
                  {act.agentName}
                </span>
                <span className="text-slate-200 font-medium">{act.summary}</span>
              </div>
              <span className="text-slate-500 text-[11px] shrink-0">{act.targetResource}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Approval Details Modal */}
      {selectedApproval && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedApproval(null)}
          title={`Approval Request: ${selectedApproval.id}`}
          maxWidth="lg"
        >
          <div className="space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Target: <strong className="text-white">{selectedApproval.target}</strong></span>
              <RiskBadge risk={selectedApproval.riskLevel} />
            </div>

            <p className="text-slate-300 leading-relaxed">{selectedApproval.description}</p>

            {selectedApproval.actionDiff && (
              <CodeViewer
                title="Rollback Execution Plan"
                code={selectedApproval.actionDiff.after}
                language="yaml"
              />
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-cosmos-border">
              <Button
                variant="danger"
                onClick={() => handleQuickDeny(selectedApproval.id)}
              >
                Deny Action
              </Button>
              <Button
                variant="gradientPill"
                onClick={() => handleQuickApprove(selectedApproval.id)}
              >
                Approve & Execute Rollback
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
