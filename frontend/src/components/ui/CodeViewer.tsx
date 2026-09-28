"use client";

import React, { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeViewerProps {
  code: string;
  language?: string;
  title?: string;
  className?: string;
  showLineNumbers?: boolean;
}

export function CodeViewer({
  code,
  language = "bash",
  title,
  className,
  showLineNumbers = false,
}: CodeViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.trim().split("\n");

  return (
    <div
      className={cn(
        "rounded-xl border border-control-border bg-[#080c14] overflow-hidden font-mono text-xs shadow-inner",
        className
      )}
    >
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-control-border/60 bg-control-subpanel/50">
        <div className="flex items-center gap-2 text-slate-400">
          <Terminal className="w-3.5 h-3.5 text-cyber-cyan" />
          <span className="font-semibold text-slate-300">
            {title || language.toUpperCase()}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-[11px]"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body */}
      <div className="p-4 overflow-x-auto text-slate-300 leading-relaxed">
        {showLineNumbers ? (
          <div className="grid grid-cols-[auto_1fr] gap-x-4">
            <div className="select-none text-slate-600 text-right pr-2 border-r border-slate-800">
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            <div>
              {lines.map((line, i) => (
                <div
                  key={i}
                  className={cn(
                    line.startsWith("+")
                      ? "text-emerald-400 bg-emerald-950/20 -mx-2 px-2"
                      : line.startsWith("-")
                      ? "text-rose-400 bg-rose-950/20 -mx-2 px-2"
                      : line.startsWith("#")
                      ? "text-slate-500 italic"
                      : line.startsWith("$")
                      ? "text-cyber-cyan font-bold"
                      : ""
                  )}
                >
                  {line || "\u00A0"}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <pre className="whitespace-pre-wrap break-all">
            {lines.map((line, i) => (
              <span
                key={i}
                className={cn(
                  "block",
                  line.startsWith("+")
                    ? "text-emerald-400 bg-emerald-950/20 -mx-2 px-2"
                    : line.startsWith("-")
                    ? "text-rose-400 bg-rose-950/20 -mx-2 px-2"
                    : line.startsWith("#")
                    ? "text-slate-500 italic"
                    : line.startsWith("$")
                    ? "text-cyber-cyan font-bold"
                    : ""
                )}
              >
                {line || "\u00A0"}
              </span>
            ))}
          </pre>
        )}
      </div>
    </div>
  );
}
