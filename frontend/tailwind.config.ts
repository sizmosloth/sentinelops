import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        cosmos: {
          void: "#020308",
          bg: "#040714",
          panel: "#080d22",
          subpanel: "#0e1538",
          card: "#0a102a",
          border: "#1a244d",
          "border-subtle": "#141c3d",
          "border-bright": "#2d3c7a",
          muted: "#7c8ba1",
          text: "#e5ecf6",
          bright: "#ffffff",
        },
        cyber: {
          cyan: "#00f0ff",
          cyanDim: "#0284c7",
          emerald: "#10b981",
          emeraldDim: "#047857",
          amber: "#f59e0b",
          amberDim: "#b45309",
          rose: "#ff2a6d",
          roseDim: "#be123c",
          purple: "#9d4edd",
          purpleDim: "#7e22ce",
          magenta: "#ec4899",
          blue: "#3b82f6",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      boxShadow: {
        glowCyan: "0 0 25px -2px rgba(0, 240, 255, 0.4)",
        glowMagenta: "0 0 25px -2px rgba(236, 72, 153, 0.45)",
        glowPurple: "0 0 25px -2px rgba(157, 78, 221, 0.45)",
        glowEmerald: "0 0 25px -2px rgba(16, 185, 129, 0.4)",
        glowRose: "0 0 25px -2px rgba(255, 42, 109, 0.45)",
        glowAmber: "0 0 25px -2px rgba(245, 158, 11, 0.4)",
        pillGradient: "0 0 25px rgba(168, 85, 247, 0.45), 0 0 10px rgba(236, 72, 153, 0.35)",
        panelCosmos: "0 12px 40px 0 rgba(2, 4, 15, 0.8)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "nebula-glow":
          "radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.18), rgba(6, 182, 212, 0.08) 50%, transparent 80%)",
        "cosmic-pill":
          "linear-gradient(135deg, #7928ca 0%, #a855f7 40%, #ec4899 100%)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "radar-sweep": "radar 5s linear infinite",
        "float-slow": "float 6s ease-in-out infinite",
        "spin-slow": "spin 25s linear infinite",
      },
      keyframes: {
        radar: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
