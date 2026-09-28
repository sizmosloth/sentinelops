"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Search,
  Bell,
  Cpu,
  Clock,
  Server,
  ChevronDown,
  Menu,
  Zap,
  Globe,
  Radio,
  ExternalLink,
} from "lucide-react";
import { mockSystemHealth } from "@/lib/mockData";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onOpenCommandPalette: () => void;
  onToggleSidebar: () => void;
}

export function Header({
  onOpenCommandPalette,
  onToggleSidebar,
}: HeaderProps) {
  const [time, setTime] = useState("");
  const [cluster, setCluster] = useState("prod-us-east-1");
  const [showClusterDropdown, setShowClusterDropdown] = useState(false);
  const [lang, setLang] = useState("EN");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toUTCString().split(" ").slice(4, 5)[0] + " UTC"
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 border-b border-cosmos-border/70 bg-cosmos-bg/85 backdrop-blur-2xl px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-[0_4px_30px_rgba(2,4,15,0.7)]">
      {/* Left Section: Mobile toggle + Brand spark & Region */}
      <div className="flex items-center gap-3 lg:gap-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-cosmos-subpanel transition-colors"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Region & Protocol Indicator (Like EN ▾ in reference) */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cosmos-panel/90 border border-cosmos-border text-[11px] font-mono text-slate-300">
          <Globe className="w-3.5 h-3.5 text-cyber-cyan" />
          <span>{lang}</span>
          <ChevronDown className="w-3 h-3 text-slate-500" />
        </div>

        {/* DEFCON Status Pill with Neon Glow */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/40 border border-rose-500/50 shadow-[0_0_15px_rgba(255,42,109,0.3)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-rose opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-rose" />
          </span>
          <span className="font-mono text-xs font-bold text-cyber-rose tracking-wider">
            DEFCON {mockSystemHealth.defconLevel}
          </span>
          <span className="hidden sm:inline text-[11px] font-mono text-pink-300/80 uppercase">
            • {mockSystemHealth.defconLabel}
          </span>
        </div>

        {/* Cluster Selector Pill */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setShowClusterDropdown(!showClusterDropdown)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cosmos-subpanel/80 border border-cosmos-border hover:border-purple-500/50 text-xs font-mono text-slate-300 hover:text-white transition-all"
          >
            <Server className="w-3 h-3 text-cyber-cyan" />
            <span>{cluster}</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {showClusterDropdown && (
            <div className="absolute left-0 mt-2 w-48 rounded-2xl bg-cosmos-panel border border-cosmos-border-bright shadow-2xl p-1.5 z-40 font-mono text-xs animate-in fade-in zoom-in-95 duration-100">
              {["prod-us-east-1", "prod-eu-central", "staging-k8s-mesh"].map(
                (c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setCluster(c);
                      setShowClusterDropdown(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-colors",
                      cluster === c
                        ? "bg-gradient-to-r from-purple-900/50 to-pink-900/50 text-white font-bold border border-purple-500/40"
                        : "text-slate-300 hover:bg-cosmos-subpanel"
                    )}
                  >
                    <span>{c}</span>
                    {cluster === c && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyber-magenta" />
                    )}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Section: Quick Search + Agent Pill + Pending Approvals Pill + CTA */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Quick Search Pill */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cosmos-panel/80 border border-cosmos-border text-xs text-slate-400 hover:text-white hover:border-purple-500/50 transition-all"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline font-mono">Search Control Deck...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.2 text-[10px] font-mono text-slate-400 bg-slate-900 rounded-md border border-slate-800">
            ⌘K
          </kbd>
        </button>

        {/* Active Agents Pill */}
        <Link
          href="/agents"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/40 text-xs font-mono text-cyan-300 hover:bg-cyan-900/40 shadow-glowCyan transition-all"
        >
          <Cpu className="w-3.5 h-3.5 text-cyber-cyan animate-pulse" />
          <span>{mockSystemHealth.activeAgentsCount} Agents Online</span>
        </Link>

        {/* Live Clock Pill */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-cosmos-panel border border-cosmos-border text-xs font-mono text-slate-400">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>{time || "00:00:00 UTC"}</span>
        </div>

        {/* Primary Glowing Gradient Pill CTA (Inspired by "Download App" button in reference) */}
        <Link href="/approvals">
          <button className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#6d28d9] via-[#9333ea] to-[#ec4899] text-white font-mono text-xs font-bold shadow-pill hover:shadow-[0_0_30px_rgba(236,72,153,0.65)] hover:brightness-110 active:scale-95 transition-all border border-white/20">
            <Zap className="w-3.5 h-3.5" />
            <span>Approval Gate ({mockSystemHealth.pendingApprovalsCount})</span>
          </button>
        </Link>
      </div>
    </header>
  );
}
