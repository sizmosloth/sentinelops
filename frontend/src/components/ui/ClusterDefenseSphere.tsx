"use client";

import React from "react";
import { Shield, Radio, Activity, Cpu } from "lucide-react";

export function ClusterDefenseSphere() {
  return (
    <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center select-none group">
      {/* Background radial glow halo */}
      <div className="absolute inset-0 bg-gradient-radial from-purple-600/25 via-pink-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-8 bg-gradient-radial from-cyan-500/20 to-transparent rounded-full blur-2xl pointer-events-none" />

      {/* SVG Geometric Polyhedral Wireframe Mesh */}
      <svg
        viewBox="0 0 400 400"
        className="w-full h-full relative z-10 animate-float-slow overflow-visible"
      >
        <defs>
          {/* Neon Gradients */}
          <linearGradient id="cyberGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.9" />
          </linearGradient>

          <linearGradient id="cyberGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
          </linearGradient>

          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Radiating Light Particles from Center */}
        <g stroke="url(#cyberGrad1)" strokeWidth="1" strokeDasharray="3 4" opacity="0.65">
          <line x1="200" y1="200" x2="60" y2="140" />
          <line x1="200" y1="200" x2="340" y2="120" />
          <line x1="200" y1="200" x2="330" y2="280" />
          <line x1="200" y1="200" x2="70" y2="270" />
          <line x1="200" y1="200" x2="200" y2="50" />
          <line x1="200" y1="200" x2="200" y2="350" />
          <line x1="200" y1="200" x2="120" y2="70" />
          <line x1="200" y1="200" x2="280" y2="330" />
        </g>

        {/* Outer Polyhedral Geometric Wireframe */}
        {/* Outer polygons */}
        <polygon
          points="200,60 320,130 340,240 250,330 150,330 60,240 80,130"
          fill="none"
          stroke="url(#cyberGrad1)"
          strokeWidth="1.8"
          filter="url(#neonGlow)"
        />

        {/* Inner Facets & Cross Braces */}
        <line x1="200" y1="60" x2="200" y2="200" stroke="url(#cyberGrad2)" strokeWidth="1.2" />
        <line x1="320" y1="130" x2="200" y2="200" stroke="url(#cyberGrad2)" strokeWidth="1.2" />
        <line x1="340" y1="240" x2="200" y2="200" stroke="url(#cyberGrad2)" strokeWidth="1.2" />
        <line x1="250" y1="330" x2="200" y2="200" stroke="url(#cyberGrad2)" strokeWidth="1.2" />
        <line x1="150" y1="330" x2="200" y2="200" stroke="url(#cyberGrad2)" strokeWidth="1.2" />
        <line x1="60" y1="240" x2="200" y2="200" stroke="url(#cyberGrad2)" strokeWidth="1.2" />
        <line x1="80" y1="130" x2="200" y2="200" stroke="url(#cyberGrad2)" strokeWidth="1.2" />

        {/* Secondary Polyhedral Sub-facets */}
        <polygon
          points="200,100 280,150 260,260 140,260 120,150"
          fill="rgba(147, 51, 234, 0.04)"
          stroke="#00f0ff"
          strokeWidth="1"
          strokeDasharray="2 2"
          opacity="0.75"
        />

        {/* Tertiary Triangles */}
        <line x1="80" y1="130" x2="320" y2="130" stroke="#ec4899" strokeWidth="0.8" opacity="0.4" />
        <line x1="60" y1="240" x2="340" y2="240" stroke="#8b5cf6" strokeWidth="0.8" opacity="0.4" />
        <line x1="120" y1="150" x2="250" y2="330" stroke="#06b6d4" strokeWidth="0.8" opacity="0.35" />
        <line x1="280" y1="150" x2="150" y2="330" stroke="#06b6d4" strokeWidth="0.8" opacity="0.35" />

        {/* Glowing Polyhedral Vertices (Nodes) */}
        <circle cx="200" cy="60" r="4" fill="#00f0ff" filter="url(#neonGlow)" />
        <circle cx="320" cy="130" r="4.5" fill="#ec4899" filter="url(#neonGlow)" />
        <circle cx="340" cy="240" r="4" fill="#a855f7" filter="url(#neonGlow)" />
        <circle cx="250" cy="330" r="3.5" fill="#00f0ff" filter="url(#neonGlow)" />
        <circle cx="150" cy="330" r="4" fill="#3b82f6" filter="url(#neonGlow)" />
        <circle cx="60" cy="240" r="4" fill="#ec4899" filter="url(#neonGlow)" />
        <circle cx="80" cy="130" r="3.5" fill="#a855f7" filter="url(#neonGlow)" />

        {/* Center Quantum Autonomous Core */}
        <circle cx="200" cy="200" r="7" fill="#ffffff" filter="url(#neonGlow)" />
        <circle cx="200" cy="200" r="14" fill="none" stroke="#ec4899" strokeWidth="1.5" className="animate-ping" opacity="0.5" />
      </svg>

      {/* Floating Status Badges around the Sphere */}
      <div className="absolute top-4 right-0 px-3 py-1.5 rounded-full bg-cosmos-subpanel/80 border border-purple-500/50 backdrop-blur-xl shadow-glowPurple text-[10px] font-mono text-white flex items-center gap-1.5 z-20">
        <span className="w-2 h-2 rounded-full bg-cyber-magenta animate-pulse" />
        <span>CLUSTER MESH v3.8</span>
      </div>

      <div className="absolute bottom-6 left-0 px-3 py-1.5 rounded-full bg-cosmos-subpanel/80 border border-cyan-500/40 backdrop-blur-xl shadow-glowCyan text-[10px] font-mono text-cyan-300 flex items-center gap-1.5 z-20">
        <Cpu className="w-3 h-3 text-cyber-cyan" />
        <span>AUTONOMOUS QUORUM: 5 AGENTS</span>
      </div>
    </div>
  );
}
