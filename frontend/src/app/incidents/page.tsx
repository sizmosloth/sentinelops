"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Search,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Server,
  Layers,
} from "lucide-react";
import { SeverityBadge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { mockIncidents } from "@/lib/mockData";
import { Incident } from "@/types";
import { cn } from "@/lib/utils";

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filteredIncidents = incidents.filter((inc) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      inc.title.toLowerCase().includes(query) ||
      inc.id.toLowerCase().includes(query) ||
      inc.affectedServices.some((s) => s.toLowerCase().includes(query));

    const matchesStatus =
      statusFilter === "ALL"
        ? true
        : statusFilter === "ACTIVE"
        ? inc.status !== "resolved"
        : inc.status === "resolved";

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-2">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-mono flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-cyber-rose" />
            Incident Management
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Real-time multi-agent triage, root-cause isolation, and autonomous recovery logs
          </p>
        </div>

        {/* Search & Filter bar */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search incidents or services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 rounded-full bg-cosmos-card border border-cosmos-border text-white text-xs font-mono placeholder:text-slate-500 focus:outline-none focus:border-purple-500/60 transition-all w-64"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-cosmos-card p-1 rounded-full border border-cosmos-border">
            {["ALL", "ACTIVE", "RESOLVED"].map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-mono font-medium transition-all",
                  statusFilter === filter
                    ? "bg-purple-600 text-white shadow-glowPurple"
                    : "text-slate-400 hover:text-white"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Clean Incident Cards List */}
      <div className="space-y-4">
        {filteredIncidents.map((incident) => (
          <div
            key={incident.id}
            className="p-6 rounded-3xl bg-cosmos-card/70 border border-cosmos-border/80 hover:border-purple-500/40 backdrop-blur-xl transition-all shadow-panelCosmos space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <SeverityBadge severity={incident.severity} />
                <span className="font-mono text-sm font-bold text-white">{incident.id}</span>
                <StatusBadge status={incident.status} />
                <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {incident.duration} ago
                </span>
              </div>

              <Link href={`/incidents/${incident.id}`}>
                <Button variant="gradientPill" size="sm" className="font-mono text-xs">
                  Open Investigation War Room
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-100 font-mono">{incident.title}</h3>
              <p className="text-xs sm:text-sm text-slate-300 font-mono leading-relaxed">
                {incident.summary}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-cosmos-border/50 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Root Cause:</span>
                <span className="text-cyan-300 truncate max-w-lg">{incident.rca.rootCause}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-500">Services:</span>
                {incident.affectedServices.map((svc) => (
                  <span
                    key={svc}
                    className="px-2.5 py-0.5 rounded-full bg-slate-900/80 text-[11px] text-slate-300 border border-slate-700/60"
                  >
                    {svc}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}

        {filteredIncidents.length === 0 && (
          <div className="py-16 text-center text-xs font-mono text-slate-500 bg-cosmos-card/40 rounded-3xl border border-cosmos-border">
            No incidents found matching current filter criteria.
          </div>
        )}
      </div>
    </div>
  );
}
