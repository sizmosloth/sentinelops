"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Shield,
  Activity,
  Cpu,
  Clock,
  CheckSquare,
  ArrowRight,
  Zap,
  Server,
  Terminal,
  AlertTriangle,
  Play,
  RotateCcw,
  Radio,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Filter,
  Layers,
  Flame,
  Globe,
  RefreshCw,
  X,
  Check,
} from "lucide-react";
import { MetricCard } from "@/components/ui/MetricCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { SeverityBadge, StatusBadge, RiskBadge, AutonomyBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { CodeViewer } from "@/components/ui/CodeViewer";
import { ClusterDefenseSphere } from "@/components/ui/ClusterDefenseSphere";
import {
  mockSystemHealth,
  mockIncidents,
  mockAgents,
  mockApprovals,
  mockActivityEvents,
  mockRecoveryStats,
} from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { ApprovalRequest, ActivityEvent } from "@/types";

export default function CommandCenterPage() {
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRequest | null>(null);
  const [approvalsList, setApprovalsList] = useState(mockApprovals);
  const [activityList, setActivityList] = useState<ActivityEvent[]>(mockActivityEvents);
  const [activityFilter, setActivityFilter] = useState<string>("ALL");
  const [serviceFilter, setServiceFilter] = useState<string>("ALL");
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleApprove = (id: string) => {
    setApprovalsList((prev) =>
      prev.map((app) =>
        app.id === id ? { ...app, status: "approved" as const } : app
      )
    );
    // Add to activity stream
    const approvedItem = approvalsList.find((a) => a.id === id);
    if (approvedItem) {
      const newEvent: ActivityEvent = {
        id: `act-${Date.now()}`,
        timestamp: "Just now",
        category: "approval",
        agentName: approvedItem.agentName,
        agentRole: "Incident Mitigator",
        summary: `Approval ${approvedItem.id} confirmed by Commander: ${approvedItem.title}`,
        status: "success",
        targetResource: approvedItem.toolName,
      };
      setActivityList([newEvent, ...activityList]);
    }
    setSelectedApproval(null);
    setActionNotice(`Action ${id} successfully approved and dispatched to agent!`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleReject = (id: string) => {
    setApprovalsList((prev) =>
      prev.map((app) =>
        app.id === id ? { ...app, status: "rejected" as const } : app
      )
    );
    const rejectedItem = approvalsList.find((a) => a.id === id);
    if (rejectedItem) {
      const newEvent: ActivityEvent = {
        id: `act-${Date.now()}`,
        timestamp: "Just now",
        category: "approval",
        agentName: rejectedItem.agentName,
        agentRole: "Incident Mitigator",
        summary: `Approval ${rejectedItem.id} rejected by Commander. Mitigation halted.`,
        status: "failed",
        targetResource: rejectedItem.toolName,
      };
      setActivityList([newEvent, ...activityList]);
    }
    setSelectedApproval(null);
    setActionNotice(`Action ${id} rejected. Agent instructed to hold.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const filteredServices = mockSystemHealth.services.filter((svc) => {
    if (serviceFilter === "CRITICAL") return svc.status === "critical";
    if (serviceFilter === "DEGRADED") return svc.status === "critical" || svc.status === "warning";
    if (serviceFilter === "HEALTHY") return svc.status === "healthy";
    return true;
  });

  const filteredActivity = activityList.filter((act) => {
    if (activityFilter === "ALL") return true;
    return act.category === activityFilter.toLowerCase();
  });

  return (
    <div className="space-y-8">
      {/* Toast Notification Banner */}
      {actionNotice && (
        <div className="p-3.5 rounded-full bg-emerald-950/50 border border-emerald-500/50 text-emerald-400 text-xs font-mono flex items-center justify-between shadow-glowEmerald animate-in fade-in duration-200 px-6">
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            {actionNotice}
          </span>
          <button
            onClick={() => setActionNotice(null)}
            className="text-emerald-400 hover:text-white font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. HERO OPERATIONS COCKPIT (Visual Hierarchy inspired by reference) */}
      <div className="relative rounded-3xl p-6 sm:p-10 bg-gradient-to-br from-cosmos-panel/95 via-cosmos-card/85 to-cosmos-bg border border-cosmos-border backdrop-blur-2xl shadow-panelCosmos overflow-hidden">
        {/* Ambient Nebula Light Cones */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-pink-600/10 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute -top-10 -left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left Column (7 cols): High Impact Headline & Glowing Pill CTAs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3.5 py-1 rounded-full text-[11px] font-mono font-bold bg-rose-950/60 text-cyber-rose border border-rose-500/50 shadow-glowRose flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyber-rose animate-ping" />
                DEFCON 2 ALERT ACTIVE
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-mono bg-purple-950/40 text-purple-300 border border-purple-500/30">
                MESH K8S • US-EAST-1 PRIMARY
              </span>
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                <Radio className="w-3 h-3 text-cyber-cyan animate-pulse" />
                Live eBPF Telemetry Sync: 100%
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.12]">
              Autonomous Cyber Defense &{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-300">
                SRE Mitigation
              </span>{" "}
              Engine.
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 font-mono leading-relaxed max-w-xl">
              SentinelOps multi-agent control room actively monitoring 8 production services. 
              Real-time threat triage underway for 1 critical outage and 1 credential stuffing alert with zero-downtime rollback guards.
            </p>

            <div className="text-[11px] font-mono text-slate-400 flex items-center gap-3 flex-wrap">
              <span>Powered by <strong className="text-white">Gemini 1.5 Pro & Claude 3.5 Sonnet</strong></span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 84.6% Auto-Healed
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-cyber-cyan font-bold">28ms Mesh Latency</span>
            </div>

            {/* Glowing Pill CTAs matching reference */}
            <div className="flex items-center gap-3.5 flex-wrap pt-2">
              <Link href="/incidents/INC-8921">
                <Button variant="gradientPill" size="lg" className="font-mono text-xs">
                  <ShieldAlert className="w-4 h-4 mr-1" />
                  Enter Live War Room (INC-8921)
                </Button>
              </Link>
              <Link href="/approvals">
                <Button variant="gradientOutlinePill" size="lg" className="font-mono text-xs">
                  <Zap className="w-4 h-4 mr-1 text-cyber-amber" />
                  Review 2 Pending Approvals
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column (5 cols): 3D Wireframe Polyhedral Mesh */}
          <div className="lg:col-span-5 flex items-center justify-center lg:justify-end">
            <ClusterDefenseSphere />
          </div>
        </div>
      </div>

      {/* 2. RECOVERY STATISTICS & SRE PERFORMANCE METRICS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyber-emerald" />
            Recovery & Reliability Telemetry
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            Audit Period: Last 24 Hours
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <MetricCard
            label="Mean Detect (MTTD)"
            value={mockRecoveryStats.mttd}
            subtext="Automated eBPF trigger"
            trend="down"
            trendValue="-14%"
            trendPositive={true}
            statusDot="cyan"
            icon={<Clock className="w-4 h-4 text-cyber-cyan" />}
          />
          <MetricCard
            label="Mean Mitigate (MTTM)"
            value={mockRecoveryStats.mttm}
            subtext="Autonomous canary rollback"
            trend="down"
            trendValue="-26%"
            trendPositive={true}
            statusDot="emerald"
            icon={<Activity className="w-4 h-4 text-cyber-emerald" />}
          />
          <MetricCard
            label="Self-Healing Rate"
            value={`${mockRecoveryStats.autonomousResolutionRate}%`}
            subtext="312 / 368 self-resolved"
            trend="up"
            trendValue="+4.1%"
            trendPositive={true}
            statusDot="magenta"
            icon={<Cpu className="w-4 h-4 text-cyber-magenta" />}
          />
          <MetricCard
            label="Resolved Outages"
            value={mockRecoveryStats.totalIncidentsResolved}
            subtext="Zero SLA penalties"
            trend="up"
            trendValue="+18"
            trendPositive={true}
            statusDot="emerald"
            icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          />
          <MetricCard
            label="Downtime Prevented"
            value={`${mockRecoveryStats.preventedDowntimeMinutes}m`}
            subtext="Calculated via MTBF"
            trend="up"
            trendValue="+32m"
            trendPositive={true}
            statusDot="cyan"
            icon={<Shield className="w-4 h-4 text-cyan-400" />}
          />
          <MetricCard
            label="Est. Cost Saved"
            value={mockRecoveryStats.estimatedCostSaved}
            subtext="Based on revenue impact"
            trend="up"
            trendValue="+12%"
            trendPositive={true}
            statusDot="magenta"
            icon={<DollarSign className="w-4 h-4 text-pink-400" />}
          />
        </div>
      </div>

      {/* 3. CORE MULTI-PANEL OPERATIONS DECK */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Active Incidents + Service Mesh Health */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Incidents Stream */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>
                  <ShieldAlert className="w-4 h-4 text-cyber-rose" />
                  Active Threat & Outage Stream
                </CardTitle>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Real-time threat triage and autonomous agent mitigation workflows
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/incidents">
                  <Button variant="ghost" size="sm" className="text-xs font-mono">
                    All Incidents ({mockIncidents.length}) <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-cosmos-border/60">
                {mockIncidents.slice(0, 3).map((incident) => {
                  const leadAgent = mockAgents.find(
                    (a) => a.id === incident.leadAgentId
                  );

                  return (
                    <div
                      key={incident.id}
                      className="p-5 hover:bg-cosmos-subpanel/40 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <SeverityBadge severity={incident.severity} />
                          <span className="font-mono text-xs font-bold text-white">
                            {incident.id}
                          </span>
                          <StatusBadge status={incident.status} />
                          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {incident.duration} elapsed
                          </span>
                        </div>
                        <Link href={`/incidents/${incident.id}`}>
                          <Button
                            variant="cyanPill"
                            size="sm"
                            className="font-mono text-xs"
                          >
                            Open War Room
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        </Link>
                      </div>

                      <h4 className="text-sm font-semibold text-slate-100 mb-1.5 font-mono">
                        {incident.title}
                      </h4>
                      <p className="text-xs text-slate-400 mb-3 line-clamp-2 leading-relaxed font-mono">
                        {incident.summary}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-cosmos-border/50 text-xs font-mono text-slate-400">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">Lead Agent:</span>
                          <span className="text-cyan-300 font-semibold flex items-center gap-1.5">
                            <Cpu className="w-3 h-3 text-cyber-cyan" />
                            {leadAgent?.name || incident.leadAgentId}
                          </span>
                          <span className="text-slate-600">•</span>
                          <span className="text-slate-500">RCA Confidence:</span>
                          <span className="text-emerald-400 font-bold">
                            {incident.rca.confidence}%
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {incident.affectedServices.map((svc) => (
                            <span
                              key={svc}
                              className="px-2.5 py-0.5 rounded-full bg-slate-900/90 text-[10px] text-slate-300 border border-slate-700/60"
                            >
                              {svc}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Service Mesh & Service Health Grid */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>
                  <Server className="w-4 h-4 text-cyber-cyan" />
                  Service Health & Mesh Topology
                </CardTitle>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Microservice cluster health across 8 core production pods
                </p>
              </div>

              {/* Service Status Filter Pills */}
              <div className="flex items-center gap-1.5">
                {["ALL", "CRITICAL", "DEGRADED", "HEALTHY"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setServiceFilter(f)}
                    className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-mono transition-all",
                      serviceFilter === f
                        ? "bg-purple-600 text-white font-bold shadow-glowPurple border border-purple-400/40"
                        : "bg-cosmos-subpanel text-slate-400 hover:text-white border border-cosmos-border"
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {filteredServices.map((svc) => (
                  <div
                    key={svc.name}
                    className={cn(
                      "p-3.5 rounded-2xl border font-mono transition-all backdrop-blur-md relative overflow-hidden group",
                      svc.status === "critical"
                        ? "bg-rose-950/25 border-rose-500/50 shadow-[0_0_15px_rgba(255,42,109,0.2)]"
                        : svc.status === "warning"
                        ? "bg-amber-950/25 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                        : "bg-cosmos-subpanel/50 border-cosmos-border hover:border-purple-500/40"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-200 truncate font-mono">
                        {svc.name}
                      </span>
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

                    <div className="space-y-1.5 text-[11px] text-slate-400">
                      <div className="flex justify-between">
                        <span>Latency:</span>
                        <span
                          className={cn(
                            "font-bold",
                            svc.latency > 150
                              ? "text-rose-400"
                              : svc.latency > 50
                              ? "text-amber-400"
                              : "text-emerald-400"
                          )}
                        >
                          {svc.latency}ms
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Error Rate:</span>
                        <span
                          className={cn(
                            "font-bold",
                            svc.errorRate > 5
                              ? "text-rose-400"
                              : svc.errorRate > 0
                              ? "text-amber-400"
                              : "text-slate-400"
                          )}
                        >
                          {svc.errorRate}%
                        </span>
                      </div>
                      {svc.trafficRps && (
                        <div className="flex justify-between">
                          <span>Traffic:</span>
                          <span className="text-slate-300 font-bold">
                            {(svc.trafficRps / 1000).toFixed(1)}k rps
                          </span>
                        </div>
                      )}
                      <div className="text-[10px] text-slate-500 truncate pt-1 border-t border-slate-800">
                        {svc.node}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (4 cols): Pending Approvals + Agent Fleet Status */}
        <div className="lg:col-span-4 space-y-6">
          {/* Pending HITL Approvals Dock */}
          <Card variant="glowAmber">
            <CardHeader className="bg-amber-950/25 border-amber-500/30">
              <div>
                <CardTitle className="text-amber-300">
                  <Zap className="w-4 h-4 text-cyber-amber" />
                  Pending Approvals
                </CardTitle>
                <p className="text-xs text-amber-200/70 font-mono mt-0.5">
                  High-risk autonomous mitigations awaiting human sign-off
                </p>
              </div>
              <Link href="/approvals">
                <span className="text-[11px] font-mono text-cyber-amber hover:underline font-bold">
                  All ({approvalsList.filter((a) => a.status === "pending").length})
                </span>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3.5">
              {approvalsList
                .filter((app) => app.status === "pending")
                .map((approval) => (
                  <div
                    key={approval.id}
                    className="p-4 rounded-2xl bg-cosmos-subpanel/90 border border-cosmos-border space-y-2.5 font-mono text-xs shadow-panelCosmos"
                  >
                    <div className="flex items-center justify-between">
                      <RiskBadge risk={approval.riskLevel} />
                      <span className="text-[10px] text-amber-400 flex items-center gap-1 font-bold">
                        <Clock className="w-3 h-3" />
                        {approval.expiresInSeconds}s auto-reject
                      </span>
                    </div>

                    <h5 className="font-semibold text-white leading-snug">
                      {approval.title}
                    </h5>

                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Agent: <strong className="text-cyber-cyan">{approval.agentName}</strong></span>
                      <span className="text-slate-500">Tool: {approval.toolName}</span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        variant="gradientPill"
                        size="sm"
                        className="w-full font-mono text-xs"
                        onClick={() => setSelectedApproval(approval)}
                      >
                        Inspect & Sign-off
                      </Button>
                    </div>
                  </div>
                ))}

              {approvalsList.filter((a) => a.status === "pending").length === 0 && (
                <div className="py-8 text-center text-xs font-mono text-slate-500">
                  No pending approval requests. System operating in full autonomy.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Autonomous Agent Status & Fleet Telemetry */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>
                  <Cpu className="w-4 h-4 text-cyber-magenta" />
                  Autonomous Agent Fleet
                </CardTitle>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  AI fleet health, active roles, and mission execution states
                </p>
              </div>
              <Link href="/agents">
                <Button variant="ghost" size="sm" className="text-xs font-mono">
                  Studio <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-cosmos-border/60">
                {mockAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className="p-4 hover:bg-cosmos-subpanel/30 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-white">
                          {agent.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          [{agent.codename}]
                        </span>
                      </div>
                      <span
                        className={cn(
                          "px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium",
                          agent.status === "mitigating"
                            ? "bg-purple-950/80 text-purple-300 border border-purple-800/60 shadow-glowPurple"
                            : agent.status === "investigating"
                            ? "bg-cyan-950/80 text-cyan-300 border border-cyan-800/60"
                            : "bg-slate-900 text-slate-400"
                        )}
                      >
                        {agent.status.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 font-mono truncate mb-2">
                      {agent.currentTask || "Idle on standby"}
                    </p>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                      <span>Model: {agent.model.split("/")[0]}</span>
                      <span className="text-emerald-400 font-bold">
                        {agent.stats.approvalSuccessRate}% accuracy
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 4. RECENT ACTIVITY EVENT STREAM */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>
              <Activity className="w-4 h-4 text-cyber-cyan" />
              Autonomous Activity & Audit Stream
            </CardTitle>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Live chronological record of mitigation steps, security interventions, and agent tool executions
            </p>
          </div>

          {/* Activity Category Filters */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {["ALL", "MITIGATION", "SECURITY", "APPROVAL", "RECOVERY", "TELEMETRY"].map((cat) => (
              <button
                key={cat}
                onClick={() => setActivityFilter(cat)}
                className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-mono transition-all",
                  activityFilter === cat
                    ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold shadow-glowCyan border border-cyan-400/40"
                    : "bg-cosmos-subpanel text-slate-400 hover:text-white border border-cosmos-border"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-cosmos-border/50 font-mono text-xs">
            {filteredActivity.map((act) => (
              <div
                key={act.id}
                className="p-4 hover:bg-cosmos-subpanel/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full mt-1.5 shrink-0",
                      act.status === "success"
                        ? "bg-cyber-emerald shadow-glowEmerald"
                        : act.status === "warning"
                        ? "bg-cyber-amber animate-pulse shadow-glowAmber"
                        : act.status === "pending"
                        ? "bg-cyber-cyan animate-ping"
                        : "bg-cyber-rose shadow-glowRose"
                    )}
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white">
                        {act.agentName}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        [{act.agentRole}]
                      </span>
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-900 text-purple-300 border border-slate-800 uppercase">
                        {act.category}
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs mt-0.5">
                      {act.summary}
                    </p>
                    {act.details && (
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {act.details}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs shrink-0 self-end sm:self-center">
                  <span className="px-2 py-0.5 rounded-full bg-slate-900/80 border border-slate-800 text-[10px] text-slate-400">
                    {act.targetResource}
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    {act.timestamp} UTC
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Approval Review Modal */}
      {selectedApproval && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedApproval(null)}
          title={`Action Review: ${selectedApproval.id}`}
          description={`Requested by ${selectedApproval.agentName} for ${selectedApproval.incidentId}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 font-mono text-xs">
            <div className="p-4 rounded-2xl bg-cosmos-subpanel border border-cosmos-border">
              <div className="flex items-center justify-between mb-1.5">
                <RiskBadge risk={selectedApproval.riskLevel} />
                <span className="text-amber-400">
                  Target Tool: {selectedApproval.toolName}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white">
                {selectedApproval.title}
              </h4>
              <p className="text-slate-400 text-xs mt-1">
                {selectedApproval.description}
              </p>
            </div>

            {/* Blast radius */}
            <div>
              <span className="text-slate-400 font-semibold block mb-1">
                Blast Radius Impact:
              </span>
              <ul className="space-y-1">
                {selectedApproval.blastRadius.map((b, i) => (
                  <li key={i} className="text-slate-300 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyber-amber" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            {/* Safety checks */}
            <div>
              <span className="text-slate-400 font-semibold block mb-1.5">
                Automated Safety Guardrails:
              </span>
              <div className="space-y-1.5">
                {selectedApproval.safetyChecks.map((sc) => (
                  <div
                    key={sc.id}
                    className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-2"
                  >
                    <div>
                      <span className="text-white font-medium">{sc.name}</span>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        {sc.details}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] uppercase font-bold shrink-0",
                        sc.status === "passed"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                          : "bg-amber-950 text-amber-400 border border-amber-800"
                      )}
                    >
                      {sc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Diff / Action command viewer */}
            {selectedApproval.actionDiff && (
              <div>
                <span className="text-slate-400 font-semibold block mb-1">
                  Proposed Action Diff:
                </span>
                <CodeViewer
                  code={selectedApproval.actionDiff.after}
                  title="COMMAND / MANIFEST PREVIEW"
                  language={selectedApproval.actionDiff.type}
                />
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-cosmos-border">
              <Button
                variant="danger"
                size="md"
                onClick={() => handleReject(selectedApproval.id)}
                className="rounded-full"
              >
                Reject & Halt
              </Button>
              <Button
                variant="gradientPill"
                size="md"
                onClick={() => handleApprove(selectedApproval.id)}
              >
                Approve & Execute Action
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
