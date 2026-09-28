import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "SentinelOps | AI/SRE Cybersecurity Control Room",
  description: "Next-generation autonomous AI control deck for cyber incident triage, SRE mitigation, and human-in-the-loop approvals.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#06080d] text-slate-200">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
