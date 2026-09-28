"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { LiveTicker } from "./LiveTicker";
import { CommandPalette } from "./CommandPalette";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-cosmos-bg text-slate-100 selection:bg-pink-500/30 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <LiveTicker />
        <Header
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="flex-1 p-4 lg:p-7 overflow-y-auto">
          <div className="max-w-[1560px] mx-auto space-y-6">{children}</div>
        </main>
      </div>

      {/* Cmd + K Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  );
}
