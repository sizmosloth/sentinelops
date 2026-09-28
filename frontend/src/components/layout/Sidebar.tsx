"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  ShieldAlert,
  CheckSquare,
  Cpu,
  Wrench,
  Shield,
  Layers,
  Sparkles,
  X,
  Radio,
} from "lucide-react";
import { mockSystemHealth } from "@/lib/mockData";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Command Center",
      href: "/",
      icon: Activity,
      exact: true,
    },
    {
      name: "Incidents",
      href: "/incidents",
      icon: ShieldAlert,
      badge: mockSystemHealth.activeIncidentsCount,
      badgeColor: "bg-rose-950/70 text-cyber-rose border-rose-500/50 shadow-glowRose",
      exact: false,
    },
    {
      name: "Approval Center",
      href: "/approvals",
      icon: CheckSquare,
      badge: mockSystemHealth.pendingApprovalsCount,
      badgeColor: "bg-amber-950/70 text-cyber-amber border-amber-500/50 shadow-glowAmber",
      exact: false,
    },
    {
      name: "Agent Studio",
      href: "/agents",
      icon: Cpu,
      badge: mockSystemHealth.activeAgentsCount,
      badgeColor: "bg-cyan-950/70 text-cyber-cyan border-cyan-500/50 shadow-glowCyan",
      exact: false,
    },
    {
      name: "Tools & Permissions",
      href: "/tools",
      icon: Wrench,
      exact: false,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 w-64 bg-cosmos-bg/95 border-r border-cosmos-border/70 backdrop-blur-2xl z-40 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static shadow-[10px_0_40px_rgba(2,4,15,0.7)]",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header with Glowing Multi-Color Spark Mark (Inspired by reference icon) */}
        <div className="h-16 px-5 border-b border-cosmos-border/70 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            {/* Multi-color gradient cross-spark logo */}
            <div className="relative w-8 h-8 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-400 rounded-full blur-md opacity-70 group-hover:opacity-100 transition-opacity" />
              <div className="relative w-7 h-7 rounded-xl bg-cosmos-void border border-white/20 flex items-center justify-center">
                {/* Stylized Cyber Spark */}
                <div className="w-3.5 h-3.5 relative flex items-center justify-center">
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-pink-500 via-purple-400 to-cyan-400 rounded-full" />
                  <div className="absolute inset-y-0 w-1 bg-gradient-to-b from-pink-500 via-purple-400 to-cyan-400 rounded-full" />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-sm font-extrabold tracking-wider text-white">
                  SENTINEL<span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400">OPS</span>
                </span>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-purple-950/80 text-purple-300 border border-purple-700/60">
                  AI/SRE
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-500 tracking-tight">
                Cyber Defense Room
              </p>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 py-5 px-3 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span>Control Modules</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyber-magenta animate-pulse" />
          </div>

          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-mono transition-all duration-200 group relative",
                  isActive
                    ? "bg-gradient-to-r from-purple-950/70 via-cosmos-subpanel to-cosmos-panel text-white font-semibold border border-purple-500/40 shadow-[0_0_20px_rgba(147,51,234,0.15)]"
                    : "text-slate-400 hover:text-slate-100 hover:bg-cosmos-subpanel/50 border border-transparent"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-colors",
                      isActive
                        ? "text-cyber-cyan"
                        : "text-slate-400 group-hover:text-slate-200"
                    )}
                  />
                  <span>{item.name}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border",
                      item.badgeColor
                    )}
                  >
                    {item.badge}
                  </span>
                )}

                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-pink-500 to-cyan-400 rounded-r-full" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Telemetry Performance Card */}
        <div className="p-3.5 mx-3 mb-4 rounded-2xl bg-cosmos-panel/80 border border-cosmos-border/80 shadow-panelCosmos">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-emerald animate-pulse" />
              SRE Performance
            </span>
            <span className="text-emerald-400 font-bold">
              {mockSystemHealth.autonomousRemediationRate}%
            </span>
          </div>

          <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden mb-2.5">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-emerald-400 rounded-full"
              style={{ width: `${mockSystemHealth.autonomousRemediationRate}%` }}
            />
          </div>

          <div className="space-y-1.5 text-[10px] font-mono text-slate-400">
            <div className="flex justify-between">
              <span>Mean Detect (MTTD):</span>
              <span className="text-white font-bold">
                {mockSystemHealth.mttd}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Mean Mitigate (MTTM):</span>
              <span className="text-white font-bold">
                {mockSystemHealth.mttm}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Mesh Latency:</span>
              <span className="text-cyber-cyan font-bold">
                {mockSystemHealth.systemLatencyMs}ms
              </span>
            </div>
          </div>
        </div>

        {/* Member Profile Footer */}
        <div className="p-4 border-t border-cosmos-border/70 bg-cosmos-bg flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-900 to-pink-900 border border-purple-500/40 flex items-center justify-center text-xs font-mono font-bold text-white shadow-glowPurple">
              M3
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-white">
                Member 3
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                Frontend Owner
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-[10px] font-mono text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>ONLINE</span>
          </div>
        </div>
      </aside>
    </>
  );
}
