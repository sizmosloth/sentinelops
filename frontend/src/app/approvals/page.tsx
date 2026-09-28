"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Check,
  X,
  FileCode,
} from "lucide-react";
import { RiskBadge, SeverityBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CodeViewer } from "@/components/ui/CodeViewer";
import { mockApprovals } from "@/lib/mockData";
import { ApprovalRequest, ApprovalStatus } from "@/types";
import { cn } from "@/lib/utils";

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>(mockApprovals);
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  const handleApprove = (id: string) => {
    setApprovals((prev) =>
      prev.map((app) =>
        app.id === id
          ? {
              ...app,
              status: "approved" as ApprovalStatus,
              decidedAt: new Date().toLocaleTimeString() + " UTC",
              decidedBy: "Commander (You)",
            }
          : app
      )
    );
    setToastNotification(`✓ Approved action ${id}. Dispatched to cluster.`);
    setTimeout(() => setToastNotification(null), 4000);
  };

  const handleDeny = (id: string) => {
    setApprovals((prev) =>
      prev.map((app) =>
        app.id === id
          ? {
              ...app,
              status: "rejected" as ApprovalStatus,
              decidedAt: new Date().toLocaleTimeString() + " UTC",
              decidedBy: "Commander (You)",
            }
          : app
      )
    );
    setToastNotification(`✕ Denied action ${id}. Task canceled.`);
    setTimeout(() => setToastNotification(null), 4000);
  };

  const pendingApprovals = approvals.filter((a) => a.status === "pending");
  const completedApprovals = approvals.filter((a) => a.status !== "pending");

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2">
      {/* Toast Notification */}
      {toastNotification && (
        <div className="p-4 rounded-full bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 font-mono text-xs flex items-center justify-between shadow-glowEmerald animate-in fade-in duration-200 px-6">
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            {toastNotification}
          </span>
          <button onClick={() => setToastNotification(null)} className="text-emerald-400 hover:text-white font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-mono flex items-center gap-2.5">
          <Zap className="w-6 h-6 text-cyber-amber" />
          Human Approval Center
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Review, inspect, and authorize high-risk autonomous mitigations and rollbacks
        </p>
      </div>

      {/* Pending Approvals List */}
      <div className="space-y-6">
        <h2 className="text-sm font-bold text-slate-300 font-mono uppercase tracking-wider">
          Awaiting Commander Confirmation ({pendingApprovals.length})
        </h2>

        {pendingApprovals.map((approval) => (
          <div
            key={approval.id}
            className="p-8 rounded-3xl bg-cosmos-card/80 border border-cosmos-border/80 backdrop-blur-2xl shadow-panelCosmos space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <RiskBadge risk={approval.riskLevel} />
                <span className="font-mono text-base font-bold text-white">{approval.id}</span>
                <span className="text-xs font-mono text-slate-400">
                  Requested by: <strong className="text-cyan-400">{approval.agentName}</strong>
                </span>
              </div>

              <div className="text-xs font-mono text-amber-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Auto-rejects in {approval.expiresInSeconds}s
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-white font-mono">{approval.title}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono text-slate-300 pt-2">
                <div className="p-3 rounded-xl bg-cosmos-subpanel/60 border border-cosmos-border">
                  <span className="text-slate-500 block mb-1">Target Service & Node:</span>
                  <span className="text-white font-semibold">{approval.target}</span>
                </div>
                <div className="p-3 rounded-xl bg-cosmos-subpanel/60 border border-cosmos-border">
                  <span className="text-slate-500 block mb-1">Proposed Action:</span>
                  <span className="text-cyan-300 font-semibold">{approval.action}</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 text-xs font-mono">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Reason:</span>
              <p className="text-slate-300 leading-relaxed">{approval.reason}</p>
            </div>

            {approval.actionDiff && (
              <div className="space-y-1.5">
                <span className="text-slate-500 font-mono font-bold uppercase text-[10px]">Execution Plan Diff:</span>
                <CodeViewer
                  title="Proposed Rollback Execution"
                  code={approval.actionDiff.after}
                  language="yaml"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-cosmos-border">
              <Button
                variant="danger"
                size="md"
                onClick={() => handleDeny(approval.id)}
                className="font-mono text-xs rounded-full px-6"
              >
                <X className="w-4 h-4 mr-1.5" />
                Deny
              </Button>
              <Button
                variant="gradientPill"
                size="md"
                onClick={() => handleApprove(approval.id)}
                className="font-mono text-xs px-8"
              >
                <Check className="w-4 h-4 mr-1.5" />
                Approve & Execute
              </Button>
            </div>
          </div>
        ))}

        {pendingApprovals.length === 0 && (
          <div className="py-16 text-center text-xs font-mono text-slate-500 bg-cosmos-card/40 rounded-3xl border border-cosmos-border">
            ✓ Zero pending approval requests. All systems verified and healthy.
          </div>
        )}
      </div>

      {/* Resolved / Decided Requests */}
      {completedApprovals.length > 0 && (
        <div className="space-y-4 pt-4">
          <h2 className="text-sm font-bold text-slate-400 font-mono uppercase tracking-wider">
            Decided Requests ({completedApprovals.length})
          </h2>

          <div className="space-y-3">
            {completedApprovals.map((app) => (
              <div
                key={app.id}
                className="p-5 rounded-2xl bg-cosmos-card/40 border border-cosmos-border font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{app.id}</span>
                    <span className="text-slate-400 font-semibold">{app.action}</span>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                        app.status === "approved"
                          ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/40"
                          : "bg-rose-950/80 text-rose-300 border border-rose-500/40"
                      )}
                    >
                      {app.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Target: {app.target} • Decided by: {app.decidedBy || "Commander"}
                  </div>
                </div>

                <span className="text-[11px] text-slate-500">{app.decidedAt}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
