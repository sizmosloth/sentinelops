import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimeAgo(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

export function getSeverityColor(sev: string): {
  bg: string;
  text: string;
  border: string;
  glow: string;
} {
  switch (sev) {
    case "SEV-0":
      return {
        bg: "bg-cyber-rose/10",
        text: "text-cyber-rose",
        border: "border-cyber-rose/40",
        glow: "shadow-glowRose",
      };
    case "SEV-1":
      return {
        bg: "bg-cyber-amber/10",
        text: "text-cyber-amber",
        border: "border-cyber-amber/40",
        glow: "shadow-glowAmber",
      };
    case "SEV-2":
      return {
        bg: "bg-cyber-cyan/10",
        text: "text-cyber-cyan",
        border: "border-cyber-cyan/40",
        glow: "shadow-glowCyan",
      };
    case "SEV-3":
    default:
      return {
        bg: "bg-slate-800/40",
        text: "text-slate-400",
        border: "border-slate-700/60",
        glow: "",
      };
  }
}
