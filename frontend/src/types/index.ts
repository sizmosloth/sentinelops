export type Severity = "SEV-0" | "SEV-1" | "SEV-2" | "SEV-3";

export type IncidentStatus = 
  | "investigating"
  | "mitigating"
  | "approval_required"
  | "resolved"
  | "escalated";

export type AutonomyLevel = "L1_ADVISORY" | "L2_HUMAN_IN_THE_LOOP" | "L3_AUTONOMOUS";

export type AgentStatus = "active" | "idle" | "investigating" | "mitigating" | "paused";

export type RiskLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type ApprovalStatus = "pending" | "approved" | "rejected" | "expired";

export interface Incident {
  id: string;
  fingerprint: string;
  title: string;
  severity: Severity;
  status: IncidentStatus;
  leadAgentId: string;
  affectedServices: string[];
  blastRadius: string;
  summary: string;
  createdAt: string;
  updatedAt: string;
  duration: string;
  rca: {
    rootCause: string;
    confidence: number;
    evidence: {
      type: "log" | "metric" | "trace" | "commit";
      content: string;
      timestamp: string;
    }[];
    suggestedMitigation: string;
  };
  mitigationSteps: {
    id: string;
    title: string;
    command?: string;
    status: "completed" | "running" | "pending" | "failed" | "requires_approval";
    executedBy: string;
    executedAt?: string;
  }[];
  telemetry: {
    timestamp: string;
    errorRate: number; // percentage
    latencyMs: number;
    requestCount: number;
  }[];
  logs: {
    id: string;
    timestamp: string;
    level: "INFO" | "WARN" | "ERROR" | "FATAL" | "AGENT";
    message: string;
    source: string;
  }[];
}

export interface Agent {
  id: string;
  name: string;
  codename: string;
  role: string;
  status: AgentStatus;
  autonomyLevel: AutonomyLevel;
  model: string;
  avatarSeed: string;
  currentTask?: string;
  currentIncidentId?: string;
  stats: {
    incidentsResolved: number;
    actionsExecuted: number;
    approvalSuccessRate: number; // %
    avgResolutionTime: string;
    tokenUsageToday: number;
  };
  allowedTools: string[];
  systemPromptSummary: string;
}

export interface ApprovalRequest {
  id: string;
  incidentId: string;
  incidentTitle: string;
  incidentSeverity: Severity;
  agentId: string;
  agentName: string;
  title: string;
  action: string;
  target: string;
  reason: string;
  expectedResult: string;
  description: string;
  riskLevel: RiskLevel;
  status: ApprovalStatus;
  createdAt: string;
  expiresInSeconds: number;
  blastRadius: string[];
  toolName: string;
  actionDiff?: {
    type: "cli" | "yaml" | "sql";
    before?: string;
    after: string;
  };
  safetyChecks: {
    id: string;
    name: string;
    status: "passed" | "warning" | "failed";
    details: string;
  }[];
  decidedAt?: string;
  decidedBy?: string;
}

export interface ToolDefinition {
  id: string;
  name: string;
  category: "kubernetes" | "cloud" | "network" | "database" | "communication";
  safetyTier: "destructive" | "high_risk" | "read_only" | "reversible";
  description: string;
  requiredApprovalRole: "None" | "SRE_Lead" | "SecOps_Lead" | "Incident_Commander";
  enabled: boolean;
  rateLimit: string;
  allowedAgents: string[];
  totalExecutions: number;
  lastExecutedAt: string;
  recentExecutions: {
    id: string;
    agentId: string;
    incidentId?: string;
    command: string;
    durationMs: number;
    exitCode: number;
    timestamp: string;
  }[];
}

export interface SystemHealthSummary {
  defconLevel: number; // 1 to 5
  defconLabel: "CRITICAL ALERT" | "ELEVATED THREAT" | "GUARDED" | "MODIFIED DEFENSE" | "NORMAL OPERATION";
  clusterHealth: "HEALTHY" | "DEGRADED" | "CRITICAL";
  activeIncidentsCount: number;
  pendingApprovalsCount: number;
  activeAgentsCount: number;
  mttd: string;
  mttm: string;
  autonomousRemediationRate: number; // %
  systemLatencyMs: number;
  services: {
    name: string;
    status: "healthy" | "warning" | "critical";
    latency: number;
    errorRate: number;
    node: string;
    trafficRps?: number;
  }[];
}

export interface ActivityEvent {
  id: string;
  timestamp: string;
  category: "mitigation" | "security" | "approval" | "telemetry" | "recovery";
  agentName: string;
  agentRole: string;
  summary: string;
  details?: string;
  status: "success" | "pending" | "warning" | "failed";
  targetResource: string;
}

export interface RecoveryStats {
  mttd: string;
  mttm: string;
  autonomousResolutionRate: number;
  totalIncidentsResolved: number;
  preventedDowntimeMinutes: number;
  estimatedCostSaved: string;
  activeCanaryVerifications: number;
  rollbackReliability: number;
}
