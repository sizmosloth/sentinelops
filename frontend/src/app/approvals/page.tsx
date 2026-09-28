"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckSquare,
  Clock,
  ShieldAlert,
  Cpu,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Filter,
  Check,
  X,
  FileCode,
  ShieldCheck,
  ArrowRight,
  Zap,
  Layers,
  Flame,
  Search,
  CheckCircle,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Terminal,
  Server,
  Target,
  Sparkles,
  Info,
} from "lucide-react";
import { RiskBadge, SeverityBadge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CodeViewer } from "@/components/ui/CodeViewer";
import { Modal } from "@/components/ui/Modal";
import { mockApprovals } from "@/lib/mockData";
import { ApprovalRequest, RiskLevel, ApprovalStatus } from "@/types";
import { cn } from "@/lib/utils";

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>(mockApprovals);
  const [selectedRisk, setSelectedRisk] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("pending");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedDiffs, setExpandedDiffs] = useState<Record<string, boolean>>({
    "APP-401": true,
  });

  // Modal States
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    type: "approve" | "deny";
    approval: ApprovalRequest | null;
  }>({
    isOpen: false,
    type: "approve",
    approval: null,
  });

  const [denyReason, setDenyReason] = useState<string>("");
  const [toastNotification, setToastNotification] = useState<{
    message: string;
    type: "success" | "warning";
  } | null>(null);

  const showToast = (message: string, type: "success" | "warning" = "success") => {
    setToastNotification({ message, type });
    setTimeout(() => setToastNotification(null), 5000);
  };

  const handleOpenApproveModal = (approval: ApprovalRequest) => {
    setActionModal({
      isOpen: true,
      type: "approve",
      approval,
    });
  };

  const handleOpenDenyModal = (approval: ApprovalRequest) => {
    setDenyReason("");
    setActionModal({
      isOpen: true,
      type: "deny",
      approval,
    });
  };

  const handleConfirmApprove = () => {
    if (!actionModal.approval) return;
    const targetId = actionModal.approval.id;
    const targetAction = actionModal.approval.action;

    setApprovals((prev) =>
      prev.map((app) =>
        app.id === targetId
          ? {
              ...app,
              status: "approved" as ApprovalStatus,
              decidedAt: new Date().toLocaleTimeString() + " UTC",
              decidedBy: "Incident Commander (You)",
            }
          : app
      )
    );

    setActionModal({ isOpen: false, type: "approve", approval: null });
    showToast(`✓ Approved action "${targetAction}" [${targetId}]. Dispatched to cluster.`);
  };

  const handleConfirmDeny = () => {
    if (!actionModal.approval) return;
    const targetId = actionModal.approval.id;
    const targetAction = actionModal.approval.action;

    setApprovals((prev) =>
      prev.map((app) =>
        app.id === targetId
          ? {
              ...app,
              status: "rejected" as ApprovalStatus,
              decidedAt: new Date().toLocaleTimeString() + " UTC",
              decidedBy: `Incident Commander (Denied: ${denyReason || "Safety constraint"})`,
            }
          : app
      )
    );

    setActionModal({ isOpen: false, type: "deny", approval: null });
    showToast(`✕ Denied action "${targetAction}" [${targetId}]. Agent task canceled.`, "warning");
  };

  const toggleDiff = (id: string) => {
    setExpandedDiffs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Quick direct approve for inline buttons
  const handleQuickApprove = (approval: ApprovalRequest, e: React.MouseEvent) => {
    e.stopPropagation();
    handleOpenApproveModal(approval);
  };

  const handleQuickDeny = (approval: ApprovalRequest, e: React.MouseEvent) => {
    e.stopPropagation();
    handleOpenDenyModal(approval);
  };

  // Filter and search logic
  const filteredApprovals = approvals.filter((app) => {
    const matchesRisk = selectedRisk === "ALL" || app.riskLevel === selectedRisk;
    const matchesStatus =
      selectedStatus === "ALL" || app.status === selectedStatus;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      app.action.toLowerCase().includes(query) ||
      app.target.toLowerCase().includes(query) ||
      app.agentName.toLowerCase().includes(query) ||
      app.id.toLowerCase().includes(query) ||
      app.incidentId.toLowerCase().includes(query) ||
      app.reason.toLowerCase().includes(query);

    return matchesRisk && matchesStatus && matchesSearch;
  });

  // Calculate stats
  const pendingCount = approvals.filter((a) => a.status === "pending").length;
  const criticalCount = approvals.filter(
    (a) => a.riskLevel === "CRITICAL" && a.status === "pending"
  ).length;
  const highCount = approvals.filter(
    (a) => a.riskLevel === "HIGH" && a.status === "pending"
  ).length;
  const mediumCount = approvals.filter(
    (a) => a.riskLevel === "MEDIUM" && a.status === "pending"
  ).length;
  const lowCount = approvals.filter(
    (a) => a.riskLevel === "LOW" && a.status === "pending"
  ).length;

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      {toastNotification && (
        <div
          className={cn(
            "p-3.5 rounded-full font-mono text-xs flex items-center justify-between shadow-glowEmerald animate-in fade-in duration-200 px-6 backdrop-blur-xl border",
            toastNotification.type === "success"
              ? "bg-emerald-950/80 border-emerald-500/60 text-emerald-300 shadow-glowEmerald"
              : "bg-rose-950/80 border-rose-500/60 text-rose-300 shadow-glowRose"
          )}
        >
          <span className="flex items-center gap-2">
            {toastNotification.type === "success" ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-400" />
            )}
            {toastNotification.message}
          </span>
          <button
            onClick={() => setToastNotification(null)}
            className="hover:text-white ml-4 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. HEADER BANNER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyber-amber mb-1">
            <CheckSquare className="w-4 h-4" />
            <span className="font-bold tracking-wider">
              HUMAN-IN-THE-LOOP (HITL) GATEWAY
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
            Human Approval Center
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Cryptographic verification and operator sign-off for high-impact autonomous agent actions
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs text-slate-300 bg-cosmos-panel/90 px-4 py-2.5 rounded-full border border-cosmos-border shadow-panelCosmos">
          <span className="w-2 h-2 rounded-full bg-cyber-amber animate-ping" />
          <span className="text-slate-300">
            Active Quorum Policy:{" "}
            <strong className="text-white">Operator Sign-Off Required</strong>
          </span>
        </div>
      </div>

      {/* 2. RISK TIER SUMMARY TILES (CLEAR RISK LEVEL DISTINCTIONS) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 font-mono">
        {/* CRITICAL RISK */}
        <button
          onClick={() => {
            setSelectedRisk("CRITICAL");
            setSelectedStatus("pending");
          }}
          className={cn(
            "p-4 rounded-2xl border text-left transition-all duration-200 backdrop-blur-xl relative overflow-hidden group",
            selectedRisk === "CRITICAL"
              ? "bg-rose-950/40 border-rose-500 shadow-glowRose"
              : "bg-cosmos-panel/80 border-rose-500/30 hover:border-rose-500/60"
          )}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-cyber-rose animate-pulse" />
              Critical Risk
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800">
              SEV-0/1
            </span>
          </div>
          <div className="text-2xl font-extrabold text-white mt-1 flex items-baseline gap-2">
            <span>{criticalCount}</span>
            <span className="text-xs text-rose-400 font-normal">Pending Sign-off</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Production routing / Rollback vectors
          </div>
          <div className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-rose-500 to-pink-500 opacity-80" />
        </button>

        {/* HIGH RISK */}
        <button
          onClick={() => {
            setSelectedRisk("HIGH");
            setSelectedStatus("pending");
          }}
          className={cn(
            "p-4 rounded-2xl border text-left transition-all duration-200 backdrop-blur-xl relative overflow-hidden group",
            selectedRisk === "HIGH"
              ? "bg-amber-950/40 border-amber-500 shadow-glowAmber"
              : "bg-cosmos-panel/80 border-amber-500/30 hover:border-amber-500/60"
          )}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-cyber-amber" />
              High Risk
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
              Edge/WAF
            </span>
          </div>
          <div className="text-2xl font-extrabold text-white mt-1 flex items-baseline gap-2">
            <span>{highCount}</span>
            <span className="text-xs text-amber-400 font-normal">Pending Sign-off</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Security filters & subnet blocking
          </div>
          <div className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-amber-500 to-yellow-400 opacity-80" />
        </button>

        {/* MEDIUM RISK */}
        <button
          onClick={() => {
            setSelectedRisk("MEDIUM");
            setSelectedStatus("pending");
          }}
          className={cn(
            "p-4 rounded-2xl border text-left transition-all duration-200 backdrop-blur-xl relative overflow-hidden group",
            selectedRisk === "MEDIUM"
              ? "bg-cyan-950/40 border-cyan-500 shadow-glowCyan"
              : "bg-cosmos-panel/80 border-cyan-500/30 hover:border-cyan-500/60"
          )}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyber-cyan" />
              Medium Risk
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
              Scale/Replica
            </span>
          </div>
          <div className="text-2xl font-extrabold text-white mt-1 flex items-baseline gap-2">
            <span>{mediumCount}</span>
            <span className="text-xs text-cyan-400 font-normal">Pending Sign-off</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Replicas, HPA autoscaling, DB limits
          </div>
          <div className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-cyan-500 to-blue-500 opacity-80" />
        </button>

        {/* LOW RISK */}
        <button
          onClick={() => {
            setSelectedRisk("LOW");
            setSelectedStatus("pending");
          }}
          className={cn(
            "p-4 rounded-2xl border text-left transition-all duration-200 backdrop-blur-xl relative overflow-hidden group",
            selectedRisk === "LOW"
              ? "bg-emerald-950/40 border-emerald-500 shadow-glowEmerald"
              : "bg-cosmos-panel/80 border-emerald-500/30 hover:border-emerald-500/60"
          )}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyber-emerald" />
              Low Risk
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
              Cache/Flush
            </span>
          </div>
          <div className="text-2xl font-extrabold text-white mt-1 flex items-baseline gap-2">
            <span>{lowCount}</span>
            <span className="text-xs text-emerald-400 font-normal">Pending Sign-off</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Cache rebalance & telemetry tuning
          </div>
          <div className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-emerald-500 to-teal-400 opacity-80" />
        </button>
      </div>

      {/* 3. SEARCH & MULTI-FILTER BAR */}
      <div className="p-4 rounded-2xl bg-cosmos-panel/80 border border-cosmos-border backdrop-blur-xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 font-mono text-xs shadow-panelCosmos">
        {/* Search Field */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search action, target, agent, reason, or incident..."
            className="w-full pl-9 pr-4 py-2 rounded-full bg-cosmos-subpanel border border-cosmos-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Status filter */}
          <div className="flex items-center gap-1 bg-cosmos-subpanel/60 p-1 rounded-full border border-cosmos-border">
            {["pending", "approved", "rejected", "ALL"].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={cn(
                  "px-3 py-1 rounded-full capitalize text-[11px] font-mono transition-all",
                  selectedStatus === st
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-glowPurple"
                    : "text-slate-400 hover:text-white"
                )}
              >
                {st === "pending" ? `Pending (${pendingCount})` : st}
              </button>
            ))}
          </div>

          {/* Risk filter */}
          <div className="flex items-center gap-1 bg-cosmos-subpanel/60 p-1 rounded-full border border-cosmos-border">
            <span className="text-slate-500 text-[10px] px-2">Risk:</span>
            {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((risk) => (
              <button
                key={risk}
                onClick={() => setSelectedRisk(risk)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-[10px] font-mono transition-all font-semibold",
                  selectedRisk === risk
                    ? risk === "CRITICAL"
                      ? "bg-rose-600 text-white shadow-glowRose"
                      : risk === "HIGH"
                      ? "bg-amber-600 text-white shadow-glowAmber"
                      : risk === "MEDIUM"
                      ? "bg-cyan-600 text-white shadow-glowCyan"
                      : risk === "LOW"
                      ? "bg-emerald-600 text-white shadow-glowEmerald"
                      : "bg-slate-700 text-white"
                    : "text-slate-400 hover:text-white"
                )}
              >
                {risk}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. APPROVAL REQUEST CARDS LIST */}
      <div className="space-y-5">
        {filteredApprovals.map((approval) => {
          const isPending = approval.status === "pending";
          const isCritical = approval.riskLevel === "CRITICAL";
          const isHigh = approval.riskLevel === "HIGH";
          const isMedium = approval.riskLevel === "MEDIUM";
          const isLow = approval.riskLevel === "LOW";
          const isDiffExpanded = !!expandedDiffs[approval.id];

          // Dynamic Risk Card Border & Background Theme
          const cardTheme = isCritical
            ? {
                cardBg: "bg-gradient-to-br from-rose-950/20 via-cosmos-panel/90 to-cosmos-bg",
                border: "border-rose-500/50 hover:border-rose-500/80 shadow-[0_0_25px_rgba(255,42,109,0.15)]",
                headerBg: "bg-rose-950/30 border-rose-500/30",
                badgeGlow: "shadow-glowRose",
                bannerText: "CRITICAL RISK: DIRECT PRODUCTION IMPACT • ZERO-DOWNTIME ROLLBACK REQUIRED",
                bannerBg: "bg-rose-950/50 border-rose-500/40 text-rose-300",
              }
            : isHigh
            ? {
                cardBg: "bg-gradient-to-br from-amber-950/20 via-cosmos-panel/90 to-cosmos-bg",
                border: "border-amber-500/50 hover:border-amber-500/80 shadow-[0_0_25px_rgba(245,158,11,0.15)]",
                headerBg: "bg-amber-950/30 border-amber-500/30",
                badgeGlow: "shadow-glowAmber",
                bannerText: "HIGH RISK: EDGE WAF & CIDR FILTERING • RATE-LIMIT POLICY MODIFICATION",
                bannerBg: "bg-amber-950/50 border-amber-500/40 text-amber-300",
              }
            : isMedium
            ? {
                cardBg: "bg-gradient-to-br from-cyan-950/15 via-cosmos-panel/90 to-cosmos-bg",
                border: "border-cyan-500/40 hover:border-cyan-500/70 shadow-[0_0_25px_rgba(0,240,255,0.12)]",
                headerBg: "bg-cyan-950/30 border-cyan-500/30",
                badgeGlow: "shadow-glowCyan",
                bannerText: "MEDIUM RISK: REPLICA AUTO-SCALE & CONNECTION POOL RESIZING",
                bannerBg: "bg-cyan-950/50 border-cyan-500/40 text-cyan-300",
              }
            : {
                cardBg: "bg-gradient-to-br from-emerald-950/10 via-cosmos-panel/90 to-cosmos-bg",
                border: "border-emerald-500/40 hover:border-emerald-500/70 shadow-[0_0_25px_rgba(16,185,129,0.12)]",
                headerBg: "bg-emerald-950/30 border-emerald-500/30",
                badgeGlow: "shadow-glowEmerald",
                bannerText: "LOW RISK: NON-DESTRUCTIVE CACHE REBALANCE & QUERY OPTIMIZATION",
                bannerBg: "bg-emerald-950/50 border-emerald-500/40 text-emerald-300",
              };

          return (
            <div
              key={approval.id}
              className={cn(
                "rounded-3xl border backdrop-blur-2xl transition-all duration-200 overflow-hidden font-mono text-xs",
                cardTheme.cardBg,
                cardTheme.border
              )}
            >
              {/* TOP RISK BANNER */}
              <div
                className={cn(
                  "px-5 py-2 text-[10px] font-bold uppercase tracking-wider flex items-center justify-between border-b",
                  cardTheme.bannerBg
                )}
              >
                <div className="flex items-center gap-2">
                  {isCritical ? (
                    <Flame className="w-3.5 h-3.5 text-cyber-rose animate-pulse" />
                  ) : isHigh ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-cyber-amber" />
                  ) : isMedium ? (
                    <Zap className="w-3.5 h-3.5 text-cyber-cyan" />
                  ) : (
                    <ShieldCheck className="w-3.5 h-3.5 text-cyber-emerald" />
                  )}
                  <span>{cardTheme.bannerText}</span>
                </div>

                {isPending && (
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <Clock className="w-3 h-3 animate-spin" />
                    <span>Auto-hold expires in {approval.expiresInSeconds}s</span>
                  </div>
                )}
              </div>

              {/* CARD HEADER & METADATA BAR */}
              <div
                className={cn(
                  "p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cosmos-border/60",
                  cardTheme.headerBg
                )}
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <RiskBadge risk={approval.riskLevel} />
                  <span className="text-base font-extrabold text-white">
                    {approval.id}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-slate-500" />
                    Tool:{" "}
                    <strong className="text-cyber-cyan bg-slate-900/80 px-2 py-0.5 rounded-full border border-slate-800">
                      {approval.toolName}
                    </strong>
                  </span>
                  <span
                    className={cn(
                      "px-3 py-0.5 rounded-full text-[10px] font-bold uppercase border",
                      approval.status === "pending"
                        ? "bg-amber-950 text-amber-300 border-amber-500/50 shadow-glowAmber"
                        : approval.status === "approved"
                        ? "bg-emerald-950 text-emerald-300 border-emerald-500/50 shadow-glowEmerald"
                        : "bg-rose-950 text-rose-300 border-rose-500/50 shadow-glowRose"
                    )}
                  >
                    {approval.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-slate-400 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      Detected: {new Date(approval.createdAt).toLocaleTimeString()} UTC
                    </span>
                  </div>
                  {approval.incidentId && (
                    <Link
                      href={`/incidents/${approval.incidentId}`}
                      className="text-xs text-cyber-cyan hover:underline flex items-center gap-1 font-bold"
                    >
                      {approval.incidentId}
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>

              {/* CARD MAIN CONTENT (SHOWING ALL SPECIFIED FIELDS) */}
              <div className="p-6 space-y-5">
                {/* 1. ACTION & TARGET SECTION */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Action Title */}
                  <div className="md:col-span-7 space-y-2">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-cyber-magenta" />
                      Action Vector
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      {approval.action}
                    </h3>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      {approval.description}
                    </p>
                  </div>

                  {/* Target & Agent Box */}
                  <div className="md:col-span-5 p-4 rounded-2xl bg-cosmos-subpanel/70 border border-cosmos-border space-y-2.5">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                        <Target className="w-3 h-3 text-rose-400" />
                        Target Infrastructure:
                      </span>
                      <div className="text-xs font-bold text-slate-100 font-mono mt-0.5">
                        {approval.target}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-cosmos-border/60">
                      <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                        <Cpu className="w-3 h-3 text-cyber-cyan" />
                        Requested by Agent:
                      </span>
                      <div className="text-xs font-bold text-cyber-cyan font-mono mt-0.5">
                        {approval.agentName}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. REASON & EXPECTED RESULT SECTION */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Reason Box */}
                  <div className="p-4 rounded-2xl bg-cosmos-panel/90 border border-cosmos-border space-y-1.5">
                    <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-cyber-amber" />
                      Incident Reason & Trigger
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed font-mono">
                      {approval.reason}
                    </p>
                  </div>

                  {/* Expected Result Box */}
                  <div className="p-4 rounded-2xl bg-emerald-950/25 border border-emerald-500/40 space-y-1.5 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                    <div className="text-[10px] text-emerald-400 uppercase font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyber-emerald" />
                      Expected Recovery Outcome
                    </div>
                    <p className="text-xs text-slate-100 leading-relaxed font-mono">
                      {approval.expectedResult}
                    </p>
                  </div>
                </div>

                {/* 3. BLAST RADIUS & SAFETY PRE-CHECKS */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-cyber-cyan" />
                      Automated Pre-Execution Safety Verifications (
                      {approval.safetyChecks.filter((s) => s.status === "passed").length}/
                      {approval.safetyChecks.length} Passed)
                    </span>
                    {approval.actionDiff && (
                      <button
                        onClick={() => toggleDiff(approval.id)}
                        className="text-[11px] text-cyber-cyan hover:underline flex items-center gap-1 font-bold"
                      >
                        {isDiffExpanded ? (
                          <>
                            Hide Execution Script <ChevronUp className="w-3 h-3" />
                          </>
                        ) : (
                          <>
                            Inspect Execution Script <ChevronDown className="w-3 h-3" />
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {approval.safetyChecks.map((sc) => (
                      <div
                        key={sc.id}
                        className="p-3 rounded-2xl bg-cosmos-subpanel/80 border border-cosmos-border flex items-start justify-between gap-2"
                      >
                        <div className="space-y-0.5">
                          <span className="font-semibold text-slate-200 text-xs block">
                            {sc.name}
                          </span>
                          <p className="text-[10px] text-slate-400 leading-snug">
                            {sc.details}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-[9px] uppercase font-bold shrink-0",
                            sc.status === "passed"
                              ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                              : sc.status === "warning"
                              ? "bg-amber-950 text-amber-400 border border-amber-800"
                              : "bg-rose-950 text-rose-400 border border-rose-800"
                          )}
                        >
                          {sc.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. CODE DIFF / MANIFEST DRAWER */}
                {approval.actionDiff && isDiffExpanded && (
                  <div className="space-y-1.5 animate-in fade-in duration-150">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                      Executable Automation Payload:
                    </span>
                    <CodeViewer
                      code={approval.actionDiff.after}
                      language={approval.actionDiff.type}
                      title="DISPATCH VECTOR MANIFEST"
                      showLineNumbers={true}
                    />
                  </div>
                )}

                {/* 5. AUDIT INFO OR APPROVE / DENY ACTION BUTTONS */}
                <div className="pt-4 border-t border-cosmos-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs text-slate-500 font-mono">
                    {approval.decidedAt ? (
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-cyber-cyan" />
                        Decided at {approval.decidedAt} by{" "}
                        <strong className="text-white">{approval.decidedBy}</strong>
                      </span>
                    ) : (
                      <span className="text-amber-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-cyber-amber animate-ping" />
                        Awaiting operator authorization
                      </span>
                    )}
                  </div>

                  {/* APPROVE & DENY BUTTONS (FUNCTIONAL WITH LOCAL STATE) */}
                  {isPending && (
                    <div className="flex items-center gap-3">
                      <Button
                        variant="danger"
                        size="md"
                        onClick={(e) => handleQuickDeny(approval, e)}
                        className="font-mono text-xs rounded-full px-5 hover:shadow-glowRose"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Deny Action
                      </Button>

                      <Button
                        variant="gradientPill"
                        size="md"
                        onClick={(e) => handleQuickApprove(approval, e)}
                        className="font-mono text-xs px-6"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve & Dispatch
                      </Button>
                    </div>
                  )}

                  {approval.status === "approved" && (
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs bg-emerald-950/60 px-4 py-1.5 rounded-full border border-emerald-500/40">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Dispatched to Production Cluster
                    </div>
                  )}

                  {approval.status === "rejected" && (
                    <div className="flex items-center gap-2 text-rose-400 font-bold text-xs bg-rose-950/60 px-4 py-1.5 rounded-full border border-rose-500/40">
                      <XCircle className="w-4 h-4 text-rose-400" />
                      Action Canceled by Operator
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredApprovals.length === 0 && (
          <div className="p-12 text-center rounded-3xl bg-cosmos-panel/80 border border-cosmos-border font-mono text-slate-400 text-xs backdrop-blur-xl space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto opacity-70" />
            <div className="text-sm font-bold text-white">All Clear! No Pending Actions</div>
            <p className="text-slate-500 max-w-sm mx-auto">
              No approval requests match the selected risk ({selectedRisk}) and status (
              {selectedStatus}) filters.
            </p>
          </div>
        )}
      </div>

      {/* APPROVE CONFIRMATION MODAL */}
      <Modal
        isOpen={actionModal.isOpen && actionModal.type === "approve"}
        onClose={() => setActionModal({ isOpen: false, type: "approve", approval: null })}
        title="Authorize & Execute Action"
        description="Verify the target cluster blast radius before confirming autonomous dispatch."
        maxWidth="xl"
      >
        {actionModal.approval && (
          <div className="space-y-4 font-mono text-xs">
            <div className="p-4 rounded-2xl bg-cosmos-subpanel border border-cosmos-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 uppercase font-bold">
                  Action to Dispatch:
                </span>
                <RiskBadge risk={actionModal.approval.riskLevel} />
              </div>
              <div className="text-sm font-bold text-white">
                {actionModal.approval.action}
              </div>
              <div className="text-xs text-cyber-cyan">
                Target: {actionModal.approval.target}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-1 text-slate-200">
              <span className="text-[10px] text-emerald-400 uppercase font-bold block">
                Expected Result:
              </span>
              <p>{actionModal.approval.expectedResult}</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-cosmos-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setActionModal({ isOpen: false, type: "approve", approval: null })
                }
              >
                Cancel
              </Button>
              <Button
                variant="gradientPill"
                size="sm"
                onClick={handleConfirmApprove}
              >
                Confirm & Dispatch Action
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* DENY CONFIRMATION MODAL */}
      <Modal
        isOpen={actionModal.isOpen && actionModal.type === "deny"}
        onClose={() => setActionModal({ isOpen: false, type: "deny", approval: null })}
        title="Deny & Cancel Action"
        description="Provide an optional rationale for rejecting this agent-proposed mitigation."
        maxWidth="lg"
      >
        {actionModal.approval && (
          <div className="space-y-4 font-mono text-xs">
            <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/40 space-y-1.5">
              <div className="text-sm font-bold text-rose-300">
                Denying: {actionModal.approval.action}
              </div>
              <p className="text-slate-300 text-xs">
                The requesting agent ({actionModal.approval.agentName}) will be instructed to abort
                this remediation path and formulate an alternative hypothesis.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-400 text-xs font-bold block">
                Rejection Reason (Optional):
              </label>
              <input
                type="text"
                value={denyReason}
                onChange={(e) => setDenyReason(e.target.value)}
                placeholder="e.g., Standby capacity insufficient, peak trading window active..."
                className="w-full px-4 py-2.5 rounded-xl bg-cosmos-subpanel border border-cosmos-border text-white text-xs placeholder-slate-500 focus:outline-none focus:border-rose-500 font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-cosmos-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setActionModal({ isOpen: false, type: "deny", approval: null })
                }
              >
                Go Back
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirmDeny}
                className="rounded-full"
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
