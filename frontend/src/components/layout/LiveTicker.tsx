"use client";

import React, { useState, useEffect } from "react";
import { Radio, ShieldAlert, Cpu, CheckCircle2, Sparkles } from "lucide-react";

const tickerMessages = [
  { icon: ShieldAlert, color: "text-cyber-rose", text: "[INC-8921] API Gateway 502 spike • RCA isolated to commit 9bf2ad4 • Rollback proposed" },
  { icon: Cpu, color: "text-cyber-cyan", text: "[Sentinel-SRE] Automated blast-radius calculation complete: 42k req/sec scoped" },
  { icon: ShieldAlert, color: "text-cyber-amber", text: "[INC-8919] Aegis-SecOps generated WAF rate-limit rule • Awaiting SecOps Lead sign-off" },
  { icon: CheckCircle2, color: "text-cyber-emerald", text: "[Chronos-K8s] payment-worker memory ceiling patched • 0 restarts in last 15 mins" },
  { icon: Cpu, color: "text-cyber-magenta", text: "[TraceHound] eBPF socket telemetry streaming at 12.4k events/sec • Latency normal on us-east-1b" },
];

export function LiveTicker() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % tickerMessages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const current = tickerMessages[index];
  const Icon = current.icon;

  return (
    <div className="h-8 bg-cosmos-void/90 border-b border-cosmos-border/50 px-4 lg:px-8 flex items-center justify-between text-[11px] font-mono select-none overflow-hidden">
      <div className="flex items-center gap-3 overflow-hidden">
        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-950/50 border border-purple-500/40 text-purple-300 font-bold shrink-0 shadow-[0_0_10px_rgba(168,85,247,0.25)]">
          <span className="w-1.5 h-1.5 rounded-full bg-cyber-magenta animate-ping" />
          <Radio className="w-3 h-3 text-cyber-cyan inline" />
          TELEMETRY STREAM
        </span>

        <div className="flex items-center gap-2 truncate transition-all duration-300">
          <Icon className={`w-3.5 h-3.5 shrink-0 ${current.color}`} />
          <span className="text-slate-300 truncate">{current.text}</span>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-4 text-slate-500 shrink-0">
        <span className="flex items-center gap-1.5 text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan" />
          MESH SYNC: 100%
        </span>
        <span className="text-slate-700">|</span>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400 font-bold">
          AUTONOMOUS DEFENSE v3.8
        </span>
      </div>
    </div>
  );
}
