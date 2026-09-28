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
  Terminal,
  Activity,
  FileText,
  Send,
  Check,
  Zap,
  Layers,
  ChevronRight,
  Database,
  ShieldCheck,
  Search,
  Radio,
  GitCommit,
  Flame,
  CheckCircle,
  XCircle,
  TrendingDown,
  Sparkles,
} from "lucide-react";
import { SeverityBadge, StatusBadge, RiskBadge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CodeViewer } from "@/components/ui/CodeViewer";
import { Modal } from "@/components/ui/Modal";
import { RecoveryTimeline, defaultRecoveryEvents } from "@/components/ui/RecoveryTimeline";
import { mockIncidents, mockAgents } from "@/lib/mockData";
import { cn } from "@/lib/utils";

// Visual 7-Stage Recovery Lifecycle Pipeline
const RECOVERY_STAGES = [
  { id: "detected", label: "Incident Detected", timestamp: "07:38:02 UTC", icon: AlertTriangle },
  { id: "diagnosing", label: "Diagnosing", timestamp: "07:38:18 UTC", icon: Cpu },
  { id: "evidence", label: "Evidence", timestamp: "07:39:10 UTC", icon: Search },
  { id: "diagnosis", label: "Diagnosis", timestamp: "07:39:45 UTC", icon: Activity },
  { id: "remediation", label: "Remediation", timestamp: "07:42:00 UTC", icon: Zap },
  { id: "verification", label: "Verification", timestamp: "07:44:10 UTC", icon: CheckCircle2 },
  { id: "resolved", label: "Resolved", timestamp: "07:46:00 UTC", icon: ShieldCheck },
];

export default function IncidentDetailsPage() {
  const params = useParams();
  const incidentId = (params?.id as string) || "INC-8921";

  const initialIncident =
    mockIncidents.find((i) => i.id === incidentId) || mockIncidents[0];

  const [incident, setIncident] = useState(initialIncident);
  const [currentStageIndex, setCurrentStageIndex] = useState(4); // At Remediation stage
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isPostMortemModalOpen, setIsPostMortemModalOpen] = useState(false);
  const [verificationPassed, setVerificationPassed] = useState(false);
  const [chatMessages, setChatMessages] = useState<
    { sender: string; text: string; time: string; isAgent: boolean }[]
  >([
    {
      sender: "System Supervisor",
      text: `War room initialized for incident ${incident.id}. Assigned lead: TITAN-ALPHA (Sentinel-SRE).`,
      time: "07:38 UTC",
      isAgent: false,
    },
    {
      sender: "Sentinel-SRE",
      text: "RCA isolated root cause to commit 9bf2ad4. Ingress Envoy upstream connection timeout set too low (250ms). I have prepared an automated Helm canary rollback to v3.8.1.",
      time: "07:39 UTC",
      isAgent: true,
    },
    {
      sender: "Aegis-SecOps",
      text: "eBPF trace correlation confirms zero malicious external packet flooding. Root cause is 100% internal configuration regression.",
      time: "07:41 UTC",
      isAgent: true,
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null);

  const leadAgent = mockAgents.find((a) => a.id === incident.leadAgentId);

  const handleExecuteApproval = () => {
    // Progress step to completed
    setIncident((prev) => ({
      ...prev,
      status: "mitigating",
      mitigationSteps: prev.mitigationSteps.map((st) =>
        st.id === "step-2"
          ? {
              ...st,
              status: "completed" as const,
              executedAt: "07:43:10 UTC",
            }
          : st.id === "step-3"
          ? {
              ...st,
              status: "running" as const,
            }
          : st
      ),
      logs: [
        ...prev.logs,
        {
          id: `log-${Date.now()}`,
          timestamp: "07:43:10",
          level: "AGENT",
          source: "Sentinel-SRE",
          message: "Approval APP-401 verified. Executed Helm rollback to v3.8.1. Envoy pods rolling 12/12.",
        },
      ],
    }));

    setCurrentStageIndex(5); // Progress to Verification stage
    setIsApproveModalOpen(false);
    setActionSuccessNotice("Helm Rollback executed. Verification suite initiated.");
    setTimeout(() => setActionSuccessNotice(null), 5000);

    // Add chat interaction
    setChatMessages((prev) => [
      ...prev,
      {
        sender: "Commander (You)",
        text: "Approval granted. Dispatched Helm rollback to v3.8.1 across production namespace.",
        time: "Just now",
        isAgent: false,
      },
      {
        sender: "Sentinel-SRE",
        text: "Rollback completed in 1.4s. Ingress pods healthy (12/12). Error rate dropped from 14.8% to 0.04%. Initiating verification suite...",
        time: "Just now",
        isAgent: true,
      },
    ]);

    // Simulate verification pass after 2 seconds
    setTimeout(() => {
      setVerificationPassed(true);
      setCurrentStageIndex(6); // Resolved
      setIncident((prev) => ({
        ...prev,
        status: "resolved",
        mitigationSteps: prev.mitigationSteps.map((st) => ({
          ...st,
          status: "completed" as const,
        })),
      }));
    }, 2500);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage;
    setInputMessage("");
    setChatMessages((prev) => [
      ...prev,
      {
        sender: "Operator (You)",
        text: userText,
        time: "Just now",
        isAgent: false,
      },
    ]);

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      let reply = `Telemetry query complete. Cluster p99 latency stabilized at 32ms baseline. Error rate is 0.02%.`;
      if (userText.toLowerCase().includes("session") || userText.toLowerCase().includes("user")) {
        reply = `Verified. Active user sessions on Redis cluster preserved. 0 session drops recorded during rolling replacement.`;
      } else if (userText.toLowerCase().includes("rollback") || userText.toLowerCase().includes("helm")) {
        reply = `Helm revision 14 confirmed active across 12 pods. Canary health checks all reporting GREEN.`;
      }
      setChatMessages((prev) => [
        ...prev,
        {
          sender: leadAgent?.name || "Sentinel-SRE",
          text: reply,
          time: "Just now",
          isAgent: true,
        },
      ]);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {actionSuccessNotice && (
        <div className="p-3.5 rounded-full bg-emerald-950/50 border border-emerald-500/50 text-emerald-400 font-mono text-xs flex items-center justify-between shadow-glowEmerald animate-in fade-in duration-200 px-6">
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            {actionSuccessNotice}
          </span>
          <button
            onClick={() => setActionSuccessNotice(null)}
            className="text-emerald-400 hover:text-white ml-4 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/incidents">
            <Button variant="outline" size="sm" className="font-mono text-xs rounded-full">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              All Incidents
            </Button>
          </Link>
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-slate-500">Incident</span>
            <span className="text-white font-bold">{incident.id}</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-500">{incident.fingerprint}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant="gradientOutlinePill"
            size="sm"
            onClick={() => setIsPostMortemModalOpen(true)}
            className="font-mono text-xs"
          >
            <FileText className="w-3.5 h-3.5 mr-1 text-slate-300" />
            Generate Post-Mortem
          </Button>

          {incident.status !== "resolved" && (
            <Button
              variant="gradientPill"
              size="sm"
              onClick={() => setIsApproveModalOpen(true)}
              className="font-mono text-xs"
            >
              <Zap className="w-3.5 h-3.5 mr-1" />
              Approve Proposed Rollback
            </Button>
          )}
        </div>
      </div>

      {/* 1. MAIN INCIDENT HEADER BANNER */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-cosmos-panel via-cosmos-card to-cosmos-bg border border-cosmos-border backdrop-blur-2xl shadow-panelCosmos relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-4xl">
            <div className="flex items-center gap-3 flex-wrap">
              <SeverityBadge severity={incident.severity} />
              <span className="font-mono text-lg font-extrabold text-white tracking-wide">
                {incident.id}
              </span>
              <StatusBadge status={incident.status} />
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Detected: {new Date(incident.createdAt).toLocaleTimeString()} UTC ({incident.duration} ago)
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
              {incident.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-mono">
              {incident.summary}
            </p>

            <div className="flex items-center gap-4 text-xs font-mono text-slate-400 flex-wrap pt-2">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Blast Radius:</span>
                <span className="text-cyber-rose font-semibold">
                  {incident.blastRadius}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Assigned Autonomous Agent:</span>
                <span className="text-cyber-cyan font-bold flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5" />
                  {leadAgent?.name || incident.leadAgentId} ({leadAgent?.codename})
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Cluster Node:</span>
                <span className="text-purple-300 font-bold">us-east-1a (EKS Primary)</span>
              </div>
            </div>
          </div>

          {/* SRE Confidence & Status Metric Box */}
          <div className="p-4 rounded-2xl bg-cosmos-panel/90 border border-cosmos-border shrink-0 font-mono text-xs space-y-2 min-w-[220px] shadow-panelCosmos">
            <div className="flex items-center justify-between text-slate-400">
              <span>AI RCA Confidence</span>
              <span className="text-emerald-400 font-bold text-sm">
                {incident.rca.confidence}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-emerald-400 rounded-full"
                style={{ width: `${incident.rca.confidence}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-500 flex justify-between pt-1">
              <span>Evidence Items: 3</span>
              <span className="text-cyber-cyan font-bold">Idempotent Plan</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. VISUAL RECOVERY PROCESS PIPELINE STEPPER (Required Lifecycle) */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3 text-xs font-mono">
          <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyber-cyan" />
            Autonomous Recovery Lifecycle
          </span>
          <span className="text-emerald-400 font-bold">
            Stage {currentStageIndex + 1} of {RECOVERY_STAGES.length}: {RECOVERY_STAGES[currentStageIndex].label}
          </span>
        </div>

        {/* Stepper Track */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {RECOVERY_STAGES.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            const StageIcon = stage.icon;

            return (
              <div
                key={stage.id}
                className={cn(
                  "p-3 rounded-2xl border font-mono text-xs transition-all relative overflow-hidden",
                  isCompleted
                    ? "bg-emerald-950/25 border-emerald-500/40 text-emerald-300"
                    : isCurrent
                    ? "bg-gradient-to-r from-purple-950/70 to-pink-950/60 border-purple-500/60 text-white shadow-glowPurple"
                    : "bg-cosmos-subpanel/50 border-cosmos-border text-slate-500 opacity-60"
                )}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold">
                    0{idx + 1}
                  </span>
                  {isCompleted ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  ) : isCurrent ? (
                    <span className="w-2 h-2 rounded-full bg-cyber-magenta animate-ping" />
                  ) : (
                    <StageIcon className="w-3 h-3 text-slate-600" />
                  )}
                </div>

                <div className="font-bold text-[11px] truncate">
                  {stage.label}
                </div>

                <div className="text-[9px] text-slate-400 mt-0.5 truncate">
                  {stage.timestamp}
                </div>

                {isCurrent && (
                  <div className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-pink-500 to-cyan-400" />
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* 3. AFFECTED SERVICES TOPOLOGY MATRIX */}
      <div className="space-y-3">
        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyber-cyan" />
          Service Impact & Microservice Topology
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-4 rounded-2xl bg-rose-950/25 border border-rose-500/50 space-y-2 shadow-[0_0_15px_rgba(255,42,109,0.2)]">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">api-gateway-mesh</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-950 text-rose-400 border border-rose-800">
                Origin Point
              </span>
            </div>
            <p className="text-slate-400 text-[11px]">
              12 Ingress Pods • Envoy gRPC connection saturation
            </p>
            <div className="flex justify-between pt-1 border-t border-rose-900/50 text-[11px]">
              <span>Error Spike:</span>
              <span className="text-rose-400 font-bold">14.8% HTTP 502</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-950/25 border border-amber-500/40 space-y-2 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">checkout-billing</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-800">
                Downstream Degraded
              </span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Retry storm queued • Socket connection backoff
            </p>
            <div className="flex justify-between pt-1 border-t border-amber-900/50 text-[11px]">
              <span>Latency Impact:</span>
              <span className="text-amber-400 font-bold">185ms (p99)</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-950/25 border border-emerald-500/40 space-y-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">postgres-primary</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                Protected Core
              </span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Connection pool rate-limiter engaged by Nexus-DBA
            </p>
            <div className="flex justify-between pt-1 border-t border-emerald-900/50 text-[11px]">
              <span>Data Integrity:</span>
              <span className="text-emerald-400 font-bold">100% (0 Lost)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. CURRENT DIAGNOSIS & EVIDENCE SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Current Diagnosis & RCA Reasoning Chain */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Cpu className="w-4 h-4 text-cyber-cyan" />
              Current AI Diagnosis & Root Cause
            </CardTitle>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-800/50 px-3 py-0.5 rounded-full font-bold">
              {incident.rca.confidence}% Confidence
            </span>
          </CardHeader>
          <CardContent className="space-y-4 font-mono text-xs">
            <div className="p-4 rounded-2xl bg-cosmos-subpanel border border-cosmos-border space-y-2">
              <span className="text-slate-400 font-bold uppercase text-[10px]">
                Root Cause Analysis:
              </span>
              <p className="text-sm text-slate-100 leading-relaxed font-mono">
                {incident.rca.rootCause}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/40 space-y-1.5 shadow-[0_0_15px_rgba(157,78,221,0.15)]">
              <span className="text-purple-300 font-bold uppercase text-[10px]">
                Agent Recommendation:
              </span>
              <p className="text-xs text-slate-200 leading-relaxed">
                {incident.rca.suggestedMitigation}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Right: Multi-Modal Evidence Section */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Search className="w-4 h-4 text-cyber-magenta" />
              Corroborating Evidence Stream
            </CardTitle>
            <span className="text-[11px] font-mono text-slate-400">
              {incident.rca.evidence.length} Provenance Signals
            </span>
          </CardHeader>
          <CardContent className="space-y-3 font-mono text-xs">
            {incident.rca.evidence.map((ev, i) => (
              <div
                key={i}
                className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3"
              >
                <span
                  className={cn(
                    "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0",
                    ev.type === "commit"
                      ? "bg-purple-950 text-purple-400 border border-purple-800"
                      : ev.type === "metric"
                      ? "bg-cyan-950 text-cyan-400 border border-cyan-800"
                      : "bg-amber-950 text-amber-400 border border-amber-800"
                  )}
                >
                  {ev.type}
                </span>
                <div className="flex-1">
                  <p className="text-slate-200">{ev.content}</p>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Captured at: {ev.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* 5. PROPOSED ACTION & ACTION RESULT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Proposed Remediation Action */}
        <Card variant="glowAmber">
          <CardHeader className="bg-amber-950/25 border-amber-500/30">
            <CardTitle className="text-amber-300">
              <Zap className="w-4 h-4 text-cyber-amber" />
              Proposed Action: Emergency Helm Canary Rollback
            </CardTitle>
            <span className="text-[10px] font-mono text-amber-400 px-2.5 py-0.5 rounded-full bg-amber-950 border border-amber-800 font-bold">
              Requires Sign-off
            </span>
          </CardHeader>
          <CardContent className="space-y-4 font-mono text-xs">
            <p className="text-slate-300">
              Target revision: Roll back <strong>api-gateway-mesh</strong> from revision 15 (v3.8.2) to revision 14 (v3.8.1) to restore 30s gRPC keepalive baseline.
            </p>

            <CodeViewer
              code={`# Proposed Mitigation Script:
$ helm rollback api-gateway-mesh 14 --namespace production --wait
$ kubectl rollout status deployment/api-gateway -n production
$ kubectl patch virtualservice api-gateway --type merge -p '{"spec":{"traffic":[{"weight":100}]}}'`}
              language="bash"
              title="AUTOMATED ROLLBACK VECTOR"
              showLineNumbers={true}
            />

            {incident.status !== "resolved" && (
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="gradientPill"
                  size="md"
                  onClick={() => setIsApproveModalOpen(true)}
                  className="font-mono text-xs"
                >
                  Approve & Dispatch Action
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Action Result & Live Verification Result */}
        <Card>
          <CardHeader>
            <CardTitle>
              <CheckCircle2 className="w-4 h-4 text-cyber-emerald" />
              Action Result & Verification Suite
            </CardTitle>
            <span className="text-[11px] font-mono text-emerald-400">
              Status: {verificationPassed ? "ALL CHECKS PASSED" : "Awaiting Execution"}
            </span>
          </CardHeader>
          <CardContent className="space-y-3 font-mono text-xs">
            {/* Verification Check 1 */}
            <div className="p-3 rounded-2xl bg-cosmos-subpanel border border-cosmos-border flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">
                  1. Ingress Error Rate Baseline
                </span>
                <p className="text-slate-400 text-[11px]">
                  Threshold: &lt; 0.1% HTTP 5xx over 3-minute window
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-800">
                {verificationPassed ? "0.04% (PASS)" : "STANDBY"}
              </span>
            </div>

            {/* Verification Check 2 */}
            <div className="p-3 rounded-2xl bg-cosmos-subpanel border border-cosmos-border flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">
                  2. P99 Latency Normalization
                </span>
                <p className="text-slate-400 text-[11px]">
                  Threshold: &lt; 50ms across all Envoy ingress listeners
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-800">
                {verificationPassed ? "32ms (PASS)" : "STANDBY"}
              </span>
            </div>

            {/* Verification Check 3 */}
            <div className="p-3 rounded-2xl bg-cosmos-subpanel border border-cosmos-border flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">
                  3. Pod Replica Health (12/12)
                </span>
                <p className="text-slate-400 text-[11px]">
                  Validates zero restart loops and clean socket termination
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-800">
                {verificationPassed ? "READY 12/12" : "STANDBY"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 6. RECOVERY TIMELINE & WAR ROOM AI CONSOLE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (7 cols): Chronological Recovery Timeline */}
        <div className="lg:col-span-7">
          <RecoveryTimeline events={defaultRecoveryEvents} isLive={true} />
        </div>

        {/* Right (5 cols): Interactive War Room AI Console */}
        <div className="lg:col-span-5">
          <Card className="flex flex-col h-[520px]">
            <CardHeader className="bg-cosmos-subpanel/50">
              <CardTitle className="text-xs">
                <Cpu className="w-4 h-4 text-cyber-magenta" />
                Live War Room Agent Console
              </CardTitle>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/50 border border-emerald-500/40">
                <span className="w-1.5 h-1.5 rounded-full bg-cyber-emerald animate-pulse" />
                TITAN-ALPHA Online
              </span>
            </CardHeader>

            <div className="flex-1 p-4 overflow-y-auto space-y-3 font-mono text-xs">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "p-3.5 rounded-2xl border text-xs leading-relaxed transition-all",
                    msg.isAgent
                      ? "bg-gradient-to-r from-purple-950/40 to-cyan-950/30 border-purple-500/40 text-purple-100 shadow-[0_0_15px_rgba(147,51,234,0.15)]"
                      : msg.sender === "System Supervisor"
                      ? "bg-slate-900/80 border-slate-800 text-slate-400"
                      : "bg-cosmos-subpanel/90 border-cosmos-border text-slate-200"
                  )}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className="font-bold text-cyber-cyan">
                      {msg.sender}
                    </span>
                    <span>{msg.time}</span>
                  </div>
                  <div>{msg.text}</div>
                </div>
              ))}
              {isSending && (
                <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyber-magenta animate-ping" />
                  Agent is querying telemetry and verifying recovery...
                </div>
              )}
            </div>

            {/* Chat Prompt Input */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 border-t border-cosmos-border bg-cosmos-subpanel/40 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask @Sentinel-SRE or issue command..."
                className="flex-1 px-4 py-2 rounded-full bg-cosmos-panel border border-cosmos-border text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <Button
                type="submit"
                size="sm"
                variant="gradientPill"
                className="font-mono text-xs"
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
          </Card>
        </div>
      </div>

      {/* Approve Rollback Modal */}
      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        title="Approve Emergency Helm Canary Rollback"
        description="Verify blast radius and confirm automated rollback execution"
        maxWidth="xl"
      >
        <div className="space-y-4 font-mono text-xs">
          <div className="p-4 rounded-2xl bg-cosmos-subpanel border border-cosmos-border">
            <div className="text-slate-400 mb-1">Target Cluster: us-east-1a</div>
            <div className="text-sm font-bold text-white">
              Rollback: api-gateway-mesh v3.8.2 → v3.8.1
            </div>
            <p className="text-slate-400 text-xs mt-1">
              Restores gRPC keepalive threshold to stable 30s. Zero downtime guaranteed via rolling update.
            </p>
          </div>

          <CodeViewer
            code={`$ helm rollback api-gateway-mesh 14 --namespace production --wait
$ kubectl rollout status deployment/api-gateway -n production`}
            title="AUTOMATED CLI DISPATCH"
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-cosmos-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsApproveModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="gradientPill"
              size="sm"
              onClick={handleExecuteApproval}
            >
              Confirm & Execute Rollback
            </Button>
          </div>
        </div>
      </Modal>

      {/* Post-Mortem Generator Modal */}
      <Modal
        isOpen={isPostMortemModalOpen}
        onClose={() => setIsPostMortemModalOpen(false)}
        title={`Automated Post-Mortem: ${incident.id}`}
        description="Generated by SentinelOps AI Engine from telemetry traces and git provenance"
        maxWidth="2xl"
      >
        <div className="space-y-4 font-mono text-xs text-slate-300">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="font-bold text-white text-sm border-b border-slate-800 pb-2">
              INCIDENT POST-MORTEM REPORT
            </div>
            <div>
              <span className="text-slate-500 font-bold">1. IMPACT SUMMARY:</span>
              <p className="mt-0.5">
                On 2026-09-28 at 07:38 UTC, api-gateway-mesh experienced 14.8% error rate impacting ~42,000 req/sec across 4 microservices. Total duration: 14m 20s.
              </p>
            </div>
            <div>
              <span className="text-slate-500 font-bold">2. ROOT CAUSE:</span>
              <p className="mt-0.5">
                Commit 9bf2ad introduced an aggressive 250ms upstream gRPC keepalive ping without keepalive permit without calls.
              </p>
            </div>
            <div>
              <span className="text-slate-500 font-bold">3. AUTONOMOUS MITIGATION:</span>
              <p className="mt-0.5">
                Sentinel-SRE diverted 30% traffic to standby cluster, isolated root cause with 96.8% confidence, and orchestrated Helm rollback.
              </p>
            </div>
            <div>
              <span className="text-slate-500 font-bold">4. ACTION ITEMS:</span>
              <p className="mt-0.5">
                • Add automated Envoy keepalive linter to CI/CD pipeline.<br />
                • Update canary analysis duration from 5m to 15m.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-cosmos-border">
            <Button
              variant="gradientPill"
              size="sm"
              onClick={() => setIsPostMortemModalOpen(false)}
            >
              Export to Jira / Confluence
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
