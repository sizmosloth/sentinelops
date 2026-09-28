from datetime import datetime, timezone
from enum import Enum
from typing import Optional, Dict, Any

from pydantic import BaseModel, Field


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


class RiskLevel(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class ActionProposal(BaseModel):
    tool: str
    target: str
    reason: str
    risk: RiskLevel


class ToolRequest(BaseModel):
    tool: str
    target: str
    params: Dict[str, Any] = Field(default_factory=dict)


class ToolResult(BaseModel):
    success: bool
    target: str
    data: Dict[str, Any]
    error: Optional[str] = None


class AgentState(str, Enum):
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class AgentEvent(BaseModel):
    incident_id: str
    agent: str
    state: AgentState
    message: str
    timestamp: datetime = Field(default_factory=now_utc)
