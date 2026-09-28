"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface TabsProps {
  tabs: { id: string; label: string; count?: number; icon?: React.ReactNode }[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 border-b border-control-border bg-control-subpanel/20 p-1 rounded-lg",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150 relative",
              isActive
                ? "bg-control-panel text-white border border-control-border shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            )}
          >
            {tab.icon && (
              <span
                className={cn(
                  isActive ? "text-cyber-cyan" : "text-slate-400"
                )}
              >
                {tab.icon}
              </span>
            )}
            <span>{tab.label}</span>
            {typeof tab.count === "number" && (
              <span
                className={cn(
                  "px-1.5 py-0.2 rounded-full text-[10px] font-mono",
                  isActive
                    ? "bg-cyber-cyan/20 text-cyber-cyan font-bold"
                    : "bg-slate-800 text-slate-400"
                )}
              >
                {tab.count}
              </span>
            )}
            {isActive && (
              <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-cyber-cyan rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}
