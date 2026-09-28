"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, ShieldAlert, Cpu, Wrench, CheckCircle, ArrowRight, CornerDownLeft } from "lucide-react";
import { mockIncidents, mockAgents, mockTools } from "@/lib/mockData";
import { cn } from "@/lib/utils";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredIncidents = mockIncidents.filter(
    (inc) =>
      inc.title.toLowerCase().includes(query.toLowerCase()) ||
      inc.id.toLowerCase().includes(query.toLowerCase()) ||
      inc.severity.toLowerCase().includes(query.toLowerCase())
  );

  const filteredAgents = mockAgents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(query.toLowerCase()) ||
      agent.role.toLowerCase().includes(query.toLowerCase()) ||
      agent.codename.toLowerCase().includes(query.toLowerCase())
  );

  const filteredTools = mockTools.filter(
    (tool) =>
      tool.name.toLowerCase().includes(query.toLowerCase()) ||
      tool.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (url: string) => {
    router.push(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4">
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-cosmos-panel border border-cosmos-border rounded-2xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-2xl">
        {/* Search input bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-cosmos-border bg-cosmos-subpanel/50">
          <Search className="w-5 h-5 text-cyber-cyan shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search incidents, AI agents, tools, or press Esc to close..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none font-mono"
            autoFocus
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 rounded border border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results Area */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4">
          {/* Quick Navigations */}
          <div>
            <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500 px-3 py-1">
              Navigation
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mt-1">
              <button
                onClick={() => handleSelect("/")}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono text-slate-300 hover:text-white hover:bg-cosmos-subpanel text-left transition-colors border border-transparent hover:border-purple-500/40"
              >
                <span>/ Command Deck</span>
                <CornerDownLeft className="w-3 h-3 text-slate-500" />
              </button>
              <button
                onClick={() => handleSelect("/incidents")}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono text-slate-300 hover:text-white hover:bg-cosmos-subpanel text-left transition-colors border border-transparent hover:border-purple-500/40"
              >
                <span>/incidents Outages</span>
                <CornerDownLeft className="w-3 h-3 text-slate-500" />
              </button>
              <button
                onClick={() => handleSelect("/approvals")}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono text-slate-300 hover:text-white hover:bg-cosmos-subpanel text-left transition-colors border border-transparent hover:border-purple-500/40"
              >
                <span>/approvals HITL</span>
                <CornerDownLeft className="w-3 h-3 text-slate-500" />
              </button>
              <button
                onClick={() => handleSelect("/agents")}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono text-slate-300 hover:text-white hover:bg-cosmos-subpanel text-left transition-colors border border-transparent hover:border-purple-500/40"
              >
                <span>/agents Studio</span>
                <CornerDownLeft className="w-3 h-3 text-slate-500" />
              </button>
              <button
                onClick={() => handleSelect("/tools")}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono text-slate-300 hover:text-white hover:bg-cosmos-subpanel text-left transition-colors border border-transparent hover:border-purple-500/40"
              >
                <span>/tools Permissions</span>
                <CornerDownLeft className="w-3 h-3 text-slate-500" />
              </button>
            </div>
          </div>

          {/* Incidents */}
          {filteredIncidents.length > 0 && (
            <div>
              <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500 px-3 py-1 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-cyber-rose" />
                Active Incidents
              </div>
              <div className="space-y-1 mt-1">
                {filteredIncidents.slice(0, 3).map((inc) => (
                  <button
                    key={inc.id}
                    onClick={() => handleSelect(`/incidents/${inc.id}`)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-800/70 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="font-mono text-xs font-bold text-cyber-cyan">
                        {inc.id}
                      </span>
                      <span className="text-xs text-slate-300 truncate">
                        {inc.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={cn(
                          "text-[10px] font-mono px-2 py-0.5 rounded",
                          inc.severity === "SEV-0"
                            ? "bg-rose-500/20 text-rose-400"
                            : "bg-amber-500/20 text-amber-400"
                        )}
                      >
                        {inc.severity}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Agents */}
          {filteredAgents.length > 0 && (
            <div>
              <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500 px-3 py-1 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyber-cyan" />
                AI Agents
              </div>
              <div className="space-y-1 mt-1">
                {filteredAgents.slice(0, 3).map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => handleSelect("/agents")}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-800/70 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="font-mono text-xs font-semibold text-white">
                        {agent.name}
                      </span>
                      <span className="text-xs text-slate-400 truncate">
                        {agent.role}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-cyber-cyan bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded">
                      {agent.autonomyLevel.replace("_", " ")}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tools */}
          {filteredTools.length > 0 && (
            <div>
              <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500 px-3 py-1 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-slate-400" />
                Tools & Capabilities
              </div>
              <div className="space-y-1 mt-1">
                {filteredTools.slice(0, 2).map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => handleSelect("/tools")}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-800/70 text-left transition-colors"
                  >
                    <span className="font-mono text-xs text-slate-300">
                      {tool.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {tool.category}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer instructions */}
        <div className="px-4 py-2 border-t border-control-border bg-control-subpanel/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <div className="flex items-center gap-3">
            <span>Navigation: [Enter] to open</span>
            <span>Close: [Esc]</span>
          </div>
          <span className="text-cyber-cyan">SentinelOps OS</span>
        </div>
      </div>
    </div>
  );
}
