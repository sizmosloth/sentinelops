"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Search,
  Filter,
  ArrowRight,
  Cpu,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  Activity,
  Zap,
  LayoutGrid,
  List,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  Server,
  Terminal,
} from "lucide-react";
import { SeverityBadge, StatusBadge, RiskBadge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { mockIncidents, mockAgents } from "@/lib/mockData";
import { Incident, Severity, IncidentStatus } from "@/types";
import { cn } from "@/lib/utils";

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedService, setSelectedService] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [simulationSuccess, setSimulationSuccess] = useState<string | null>(null);

  // Extract all unique affected services
  const allServices = Array.from(
    new Set(incidents.flatMap((i) => i.affectedServices))
  );

  const filteredIncidents = incidents.filter((incident) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      incident.title.toLowerCase().includes(query) ||
      incident.id.toLowerCase().includes(query) ||
      incident.rca.rootCause.toLowerCase().includes(query) ||
      incident.affectedServices.some((s) => s.toLowerCase().includes(query));

    const matchesSeverity =
      selectedSeverity === "ALL" || incident.severity === selectedSeverity;

    const matchesStatus =
      selectedStatus === "ALL"
        ? true
        : selectedStatus === "ACTIVE"
        ? incident.status !== "resolved"
        : incident.status === selectedStatus;

    const matchesService =
      selectedService === "ALL" || incident.affectedServices.includes(selectedService);

    return matchesSearch && matchesSeverity && matchesStatus && matchesService;
  });

  const handleSimulateNewIncident = (scenario: "ddos" | "memory" | "database") => {
    let newIncident: Incident;
    const nowIso = new Date().toISOString();

    if (scenario === "ddos") {
      newIncident = {
        id: `INC-${Math.floor(8900 + Math.random() * 100)}`,
        fingerprint: "sim-ddos-flood-" + Date.now(),
        title: "SYN Flood & Slowloris Attack on Ingress Gateway Node 04",
        severity: "SEV-1",
        status: "investigating",
        leadAgentId: "agent-sec-02",
        affectedServices: ["api-gateway-mesh", "auth-engine-v2"],
        blastRadius: "15,000 connection states exhausted on ingress listener",
        summary: "Simulated high-concurrency connection flood detected by eBPF probe. Aegis-SecOps assigned to deploy SYN cookies and iptables drop rules.",
        createdAt: nowIso,
        updatedAt: nowIso,
        duration: "Just now",
        rca: {
          rootCause: "Targeted layer 4/7 state-exhaustion attack bypassing front-door TCP filter.",
          confidence: 92.4,
          evidence: [
            {
              type: "metric",
              content: "TCP half-open socket count exceeded 20,000 threshold",
              timestamp: "Just now",
            },
          ],
          suggestedMitigation: "Activate TCP SYN proxy and inject edge geo-rate limiting.",
        },
        mitigationSteps: [
          {
            id: "step-sim-1",
            title: "Enable aggressive TCP syncookies in kernel",
            status: "running",
            executedBy: "Aegis-SecOps",
          },
        ],
        telemetry: [
          { timestamp: "12:00", errorRate: 0.1, latencyMs: 25, requestCount: 12000 },
          { timestamp: "12:02", errorRate: 9.8, latencyMs: 210, requestCount: 35000 },
        ],
        logs: [
          {
            id: "log-sim-1",
            timestamp: "12:02:10",
            level: "FATAL",
            source: "ebpf-watcher",
            message: "Simulated flood: Ingress backlog saturated",
          },
        ],
      };
    } else if (scenario === "memory") {
      newIncident = {
        id: `INC-${Math.floor(8900 + Math.random() * 100)}`,
        fingerprint: "sim-redis-crash-" + Date.now(),
        title: "Redis Cluster Shard-03 Eviction Storm & Cache Stampede",
        severity: "SEV-0",
        status: "mitigating",
        leadAgentId: "agent-sre-01",
        affectedServices: ["redis-sentinel-cache", "checkout-billing"],
        blastRadius: "Global product catalog latency spike to 850ms",
        summary: "Simulated key expiration wave caused massive cache miss avalanche hitting primary PostgreSQL cluster.",
        createdAt: nowIso,
        updatedAt: nowIso,
        duration: "Just now",
        rca: {
          rootCause: "Synchronous TTL expiration for 2.4M product metadata keys.",
          confidence: 97.5,
          evidence: [
            {
              type: "metric",
              content: "Redis ops/sec dropped from 120k to 14k during key eviction sweep",
              timestamp: "Just now",
            },
          ],
          suggestedMitigation: "Trigger Redis replica promotion and enable probabilistic early expiration (XFetch).",
        },
        mitigationSteps: [
          {
            id: "step-sim-1",
            title: "Promote hot replica node redis-shard-03b to primary",
            status: "running",
            executedBy: "Sentinel-SRE",
          },
        ],
        telemetry: [
          { timestamp: "12:00", errorRate: 0.0, latencyMs: 2.1, requestCount: 50000 },
          { timestamp: "12:02", errorRate: 16.4, latencyMs: 380, requestCount: 51000 },
        ],
        logs: [
          {
            id: "log-sim-2",
            timestamp: "12:02:00",
            level: "FATAL",
            source: "redis-sentinel",
            message: "Shard 03 failover triggered by cluster manager",
          },
        ],
      };
    } else {
      newIncident = {
        id: `INC-${Math.floor(8900 + Math.random() * 100)}`,
        fingerprint: "sim-iam-escalation-" + Date.now(),
        title: "Unauthorized Service Account IAM Role Assumption Detected",
        severity: "SEV-1",
        status: "approval_required",
        leadAgentId: "agent-sec-02",
        affectedServices: ["auth-engine-v2"],
        blastRadius: "CI/CD Deployment Runner Token in cluster-dev",
        summary: "Anomalous sts:AssumeRole call from unexpected external IP address targeting AdministratorAccess policy.",
        createdAt: nowIso,
        updatedAt: nowIso,
        duration: "Just now",
        rca: {
          rootCause: "Compromised ephemeral runner credential leaked in build step log.",
          confidence: 95.1,
          evidence: [
            {
              type: "log",
              content: "AWS CloudTrail Event: AssumeRole from IP 194.26.29.11 outside VPN range",
              timestamp: "Just now",
            },
          ],
          suggestedMitigation: "Revoke IAM session token immediately and isolate runner pod.",
        },
        mitigationSteps: [
          {
            id: "step-sim-1",
            title: "Revoke all active STS tokens for role CI-Runner-Admin",
            status: "requires_approval",
            executedBy: "Aegis-SecOps",
          },
        ],
        telemetry: [],
        logs: [
          {
            id: "log-sim-3",
            timestamp: "12:02:15",
            level: "FATAL",
            source: "cloudtrail",
            message: "Security Alert: AssumeRole from non-whitelisted IP",
          },
        ],
      };
    }

    setIncidents([newIncident, ...incidents]);
    setIsSimulateModalOpen(false);
    setSimulationSuccess(
      `Simulated incident ${newIncident.id} (${newIncident.severity}) injected and assigned to autonomous agent!`
    );
    setTimeout(() => setSimulationSuccess(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {simulationSuccess && (
        <div className="p-3.5 rounded-full bg-cyan-950/50 border border-cyan-500/50 text-cyber-cyan font-mono text-xs flex items-center justify-between shadow-glowCyan animate-in fade-in duration-200 px-6">
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyber-cyan" />
            {simulationSuccess}
          </span>
          <button
            onClick={() => setSimulationSuccess(null)}
            className="text-cyan-400 hover:text-white ml-4 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
            <ShieldAlert className="w-4 h-4 text-cyber-rose" />
            <span>SRE & CYBERSECURITY INCIDENT MANAGEMENT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
            Incident Operations & Triage
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Active outages, root-cause diagnoses, autonomous recovery workflows, and blast radius maps
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-cosmos-panel/90 border border-cosmos-border rounded-full p-1 shadow-panelCosmos">
            <button
              onClick={() => setViewMode("cards")}
              className={cn(
                "p-1.5 rounded-full text-xs font-mono transition-all flex items-center gap-1.5 px-3",
                viewMode === "cards"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-glowPurple"
                  : "text-slate-400 hover:text-white"
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={cn(
                "p-1.5 rounded-full text-xs font-mono transition-all flex items-center gap-1.5 px-3",
                viewMode === "table"
                  ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold shadow-glowCyan"
                  : "text-slate-400 hover:text-white"
              )}
            >
              <List className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          <Button
            variant="gradientPill"
            size="md"
            onClick={() => setIsSimulateModalOpen(true)}
            className="font-mono text-xs"
          >
            <Play className="w-3.5 h-3.5 mr-1" />
            Simulate Incident
          </Button>
        </div>
      </div>

      {/* KPI Highlights Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-cosmos-panel/80 border border-cosmos-border font-mono backdrop-blur-xl shadow-panelCosmos">
          <span className="text-[11px] text-slate-400 uppercase">Total Incidents</span>
          <div className="text-2xl font-extrabold text-white mt-1">
            {incidents.length}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Repository Total</span>
        </div>
        <div className="p-4 rounded-2xl bg-cosmos-panel/80 border border-rose-500/40 font-mono backdrop-blur-xl shadow-[0_0_20px_rgba(255,42,109,0.15)]">
          <span className="text-[11px] text-rose-400 uppercase">Critical (SEV-0/1)</span>
          <div className="text-2xl font-extrabold text-rose-400 mt-1">
            {incidents.filter((i) => i.severity === "SEV-0" || i.severity === "SEV-1").length}
          </div>
          <span className="text-[10px] text-rose-400/80 mt-0.5 block">Requires SRE Priority</span>
        </div>
        <div className="p-4 rounded-2xl bg-cosmos-panel/80 border border-amber-500/40 font-mono backdrop-blur-xl shadow-[0_0_20px_rgba(245,158,11,0.15)]">
          <span className="text-[11px] text-amber-400 uppercase">Approval Needed</span>
          <div className="text-2xl font-extrabold text-amber-400 mt-1">
            {incidents.filter((i) => i.status === "approval_required").length}
          </div>
          <span className="text-[10px] text-amber-400/80 mt-0.5 block">HITL Sign-off Pending</span>
        </div>
        <div className="p-4 rounded-2xl bg-cosmos-panel/80 border border-emerald-500/40 font-mono backdrop-blur-xl shadow-[0_0_20px_rgba(16,185,129,0.15)]">
          <span className="text-[11px] text-emerald-400 uppercase">Mitigated & Resolved</span>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1">
            {incidents.filter((i) => i.status === "resolved").length}
          </div>
          <span className="text-[10px] text-emerald-400/80 mt-0.5 block">Zero SLA Penalties</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-cosmos-panel/80 border border-cosmos-border backdrop-blur-xl space-y-3 shadow-panelCosmos">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Incident ID, Title, Diagnosis, Service..."
              className="w-full pl-10 pr-4 py-2 rounded-full bg-cosmos-subpanel/80 border border-cosmos-border text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Severity Filters */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-mono text-slate-500 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Severity:
            </span>
            {["ALL", "SEV-0", "SEV-1", "SEV-2", "SEV-3"].map((sev) => (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={cn(
                  "px-3 py-1 rounded-full text-[11px] font-mono transition-all",
                  selectedSeverity === sev
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-glowPurple border border-purple-400/40"
                    : "bg-cosmos-subpanel text-slate-400 hover:text-white border border-cosmos-border"
                )}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Filter Row: Status & Service Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-cosmos-border/50 text-xs font-mono">
          {/* Status Filters */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-500 mr-1">Status:</span>
            {["ALL", "ACTIVE", "investigating", "mitigating", "approval_required", "resolved"].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={cn(
                  "px-3 py-0.5 rounded-full text-[10px] font-mono capitalize transition-all",
                  selectedStatus === st
                    ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold shadow-glowCyan border border-cyan-400/40"
                    : "bg-cosmos-subpanel text-slate-400 hover:text-white border border-cosmos-border"
                )}
              >
                {st === "approval_required" ? "Approval Needed" : st}
              </button>
            ))}
          </div>

          {/* Service Filters */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-500 mr-1">Service:</span>
            <button
              onClick={() => setSelectedService("ALL")}
              className={cn(
                "px-2.5 py-0.5 rounded-full text-[10px] font-mono transition-all",
                selectedService === "ALL"
                  ? "bg-slate-700 text-white font-bold border border-slate-600"
                  : "bg-cosmos-subpanel text-slate-400 hover:text-white border border-cosmos-border"
              )}
            >
              All Services
            </button>
            {allServices.map((svc) => (
              <button
                key={svc}
                onClick={() => setSelectedService(svc)}
                className={cn(
                  "px-2.5 py-0.5 rounded-full text-[10px] font-mono transition-all",
                  selectedService === svc
                    ? "bg-purple-950 text-purple-300 font-bold border border-purple-600"
                    : "bg-cosmos-subpanel text-slate-400 hover:text-white border border-cosmos-border"
                )}
              >
                {svc}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: CARDS VIEW (Full Diagnostic Depth) */}
      {viewMode === "cards" && (
        <div className="space-y-4">
          {filteredIncidents.map((incident) => {
            const leadAgent = mockAgents.find((a) => a.id === incident.leadAgentId);
            const completedSteps = incident.mitigationSteps.filter(
              (s) => s.status === "completed"
            ).length;
            const totalSteps = incident.mitigationSteps.length;
            const recoveryPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

            return (
              <Card
                key={incident.id}
                variant={
                  incident.severity === "SEV-0"
                    ? "glowRose"
                    : incident.status === "approval_required"
                    ? "glowAmber"
                    : "default"
                }
              >
                <CardHeader className="bg-cosmos-subpanel/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
                    {/* Left: ID, Severity, Status, Detected Time */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <SeverityBadge severity={incident.severity} />
                      <span className="font-mono text-sm font-extrabold text-white tracking-wide">
                        {incident.id}
                      </span>
                      <StatusBadge status={incident.status} />
                      <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        Detected: {new Date(incident.createdAt).toLocaleTimeString()} UTC ({incident.duration} ago)
                      </span>
                    </div>

                    {/* Right: Recovery Progress & CTA */}
                    <div className="flex items-center gap-3">
                      <div className="hidden md:flex items-center gap-2 font-mono text-xs text-slate-400">
                        <span>Recovery:</span>
                        <span className="text-emerald-400 font-bold">
                          {recoveryPercent}% ({completedSteps}/{totalSteps} steps)
                        </span>
                      </div>
                      <Link href={`/incidents/${incident.id}`}>
                        <Button
                          variant="cyanPill"
                          size="sm"
                          className="font-mono text-xs whitespace-nowrap"
                        >
                          War Room Deck
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 font-mono text-xs">
                  {/* Title & Summary */}
                  <div>
                    <h3 className="text-base font-bold text-white mb-1">
                      {incident.title}
                    </h3>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      {incident.summary}
                    </p>
                  </div>

                  {/* Diagnosis & Root Cause Box */}
                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-300 font-bold uppercase text-[10px] flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-cyber-magenta" />
                        Current AI Diagnosis & Root Cause:
                      </span>
                      <span className="text-emerald-400 font-bold text-[10px]">
                        RCA Confidence: {incident.rca.confidence}%
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      {incident.rca.rootCause}
                    </p>
                  </div>

                  {/* Recovery Status & Step Workflow Preview */}
                  <div className="p-3 rounded-2xl bg-cosmos-subpanel/80 border border-cosmos-border space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-semibold uppercase">
                        Remediation & Recovery Workflow:
                      </span>
                      <span className="text-slate-400">
                        Assigned Lead: <strong className="text-cyber-cyan">{leadAgent?.name || incident.leadAgentId}</strong>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                      {incident.mitigationSteps.map((step, idx) => (
                        <div
                          key={step.id}
                          className={cn(
                            "p-2 rounded-xl border text-[10px] flex items-center justify-between gap-1.5",
                            step.status === "completed"
                              ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-300"
                              : step.status === "requires_approval"
                              ? "bg-amber-950/30 border-amber-500/40 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                              : step.status === "running"
                              ? "bg-cyan-950/30 border-cyan-500/40 text-cyan-300 animate-pulse"
                              : "bg-slate-900 border-slate-800 text-slate-500"
                          )}
                        >
                          <span className="truncate">
                            {idx + 1}. {step.title}
                          </span>
                          <span className="shrink-0 uppercase font-bold text-[9px]">
                            {step.status === "requires_approval" ? "Approval" : step.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer Metadata: Affected Services & Blast Radius */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-cosmos-border/50 text-[11px] text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Affected Services:</span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {incident.affectedServices.map((svc) => (
                          <span
                            key={svc}
                            className="px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-700 text-[10px]"
                          >
                            {svc}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500">Blast Radius:</span>
                      <span className="text-cyber-rose font-semibold">
                        {incident.blastRadius}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* VIEW MODE 2: COMPACT TABLE VIEW (High-Density SRE View) */}
      {viewMode === "table" && (
        <Card>
          <CardHeader>
            <CardTitle>
              <ShieldAlert className="w-4 h-4 text-cyber-cyan" />
              Incident Registry Master Table ({filteredIncidents.length} Incidents)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-cosmos-subpanel/80 border-b border-cosmos-border text-slate-400 text-[11px]">
                  <tr>
                    <th className="px-5 py-3">Incident ID</th>
                    <th className="px-5 py-3">Severity</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Title & Current Diagnosis</th>
                    <th className="px-5 py-3">Affected Services</th>
                    <th className="px-5 py-3">Time Detected</th>
                    <th className="px-5 py-3">Recovery Status</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cosmos-border/40">
                  {filteredIncidents.map((incident) => {
                    const leadAgent = mockAgents.find((a) => a.id === incident.leadAgentId);
                    const completedSteps = incident.mitigationSteps.filter(
                      (s) => s.status === "completed"
                    ).length;
                    const totalSteps = incident.mitigationSteps.length;
                    const recoveryPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

                    return (
                      <tr
                        key={incident.id}
                        className="hover:bg-cosmos-subpanel/40 transition-colors"
                      >
                        <td className="px-5 py-3.5 font-bold text-white whitespace-nowrap">
                          {incident.id}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <SeverityBadge severity={incident.severity} />
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <StatusBadge status={incident.status} />
                        </td>
                        <td className="px-5 py-3.5 max-w-sm">
                          <div className="font-semibold text-white truncate">
                            {incident.title}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate mt-0.5">
                            RCA: {incident.rca.rootCause}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="flex gap-1 flex-wrap">
                            {incident.affectedServices.map((svc) => (
                              <span
                                key={svc}
                                className="px-2 py-0.2 rounded-full bg-slate-900 text-[10px] text-slate-300 border border-slate-700"
                              >
                                {svc}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-400 whitespace-nowrap text-[11px]">
                          {new Date(incident.createdAt).toLocaleTimeString()} UTC
                          <span className="block text-[10px] text-slate-500">
                            {incident.duration} ago
                          </span>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="text-emerald-400 font-bold text-xs">
                            {recoveryPercent}% Healed
                          </div>
                          <div className="w-24 h-1.5 rounded-full bg-slate-900 overflow-hidden mt-1">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full"
                              style={{ width: `${recoveryPercent}%` }}
                            />
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          <Link href={`/incidents/${incident.id}`}>
                            <Button
                              variant="cyanPill"
                              size="sm"
                              className="font-mono text-xs"
                            >
                              War Room
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {filteredIncidents.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-cosmos-panel/80 border border-cosmos-border backdrop-blur-xl">
          <CheckCircle2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-mono text-slate-400">
            No incidents match your search query or active filter settings.
          </p>
        </div>
      )}

      {/* Simulate Incident Modal */}
      <Modal
        isOpen={isSimulateModalOpen}
        onClose={() => setIsSimulateModalOpen(false)}
        title="Simulate Control Room Incident Scenario"
        description="Inject synthetic high-severity operational anomalies into SentinelOps to test autonomous triage"
        maxWidth="lg"
      >
        <div className="space-y-4 font-mono text-xs">
          <p className="text-slate-400">
            Select a threat vector or operational fault scenario to trigger the autonomous AI agent fleet:
          </p>

          <div className="space-y-3">
            <button
              onClick={() => handleSimulateNewIncident("memory")}
              className="w-full p-4 rounded-2xl bg-cosmos-subpanel/80 hover:bg-cosmos-panel border border-cosmos-border hover:border-rose-500/50 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-rose-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-cyber-rose" />
                  SEV-0: Redis Cluster Eviction Storm & Cache Stampede
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-400 border border-rose-800">
                  Critical
                </span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Key expiration avalanche on product catalog triggering high p99 latency spikes and DB failover.
              </p>
            </button>

            <button
              onClick={() => handleSimulateNewIncident("ddos")}
              className="w-full p-4 rounded-2xl bg-cosmos-subpanel/80 hover:bg-cosmos-panel border border-cosmos-border hover:border-amber-500/50 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-cyber-amber" />
                  SEV-1: Ingress Gateway SYN Flood & L4/L7 DDoS Attack
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-800">
                  High Threat
                </span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                TCP half-open connection saturation on public ingress listeners requiring automated WAF rules.
              </p>
            </button>

            <button
              onClick={() => handleSimulateNewIncident("database")}
              className="w-full p-4 rounded-2xl bg-cosmos-subpanel/80 hover:bg-cosmos-panel border border-cosmos-border hover:border-cyan-500/50 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-cyber-cyan flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-cyber-cyan" />
                  SEV-1: Anomalous IAM Service Account Token Hijack
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                  SecOps Gate
                </span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                CloudTrail alert for privilege escalation outside corporate VPN range requiring credential revocation.
              </p>
            </button>
          </div>

          <div className="flex justify-end pt-3 border-t border-cosmos-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSimulateModalOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
