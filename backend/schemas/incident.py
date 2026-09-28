import secrets
from datetime import datetime, timezone
from enum import Enum
from typing import Optional, List, Dict, Any

from pydantic import BaseModel, Field


def generate_incident_id() -> str:
    return f"INC-{secrets.token_hex(4)}"


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


class IncidentStatus(str, Enum):
    CREATED = "CREATED"
    PLANNING = "PLANNING"
    DIAGNOSING = "DIAGNOSING"
    ACTION_PROPOSED = "ACTION_PROPOSED"
    WAITING_APPROVAL = "WAITING_APPROVAL"
    EXECUTING = "EXECUTING"
    VERIFYING = "VERIFYING"
    RESOLVED = "RESOLVED"
    FAILED = "FAILED"
    RE_DIAGNOSING = "RE_DIAGNOSING"
    ESCALATED = "ESCALATED"


class Incident(BaseModel):
    id: str = Field(default_factory=generate_incident_id)
    goal: str
    status: IncidentStatus
    attempt: int
    diagnosis: Optional[str] = None
    root_cause: Optional[str] = None
    evidence: List[str]
    history: List[Dict[str, Any]]
    created_at: datetime = Field(default_factory=now_utc)


class Plan(BaseModel):
    goal: str
    strategy: List[str]


class Diagnosis(BaseModel):
    diagnosis: str
    confidence: float = Field(ge=0, le=1)
    evidence: List[str]
    next_tool: Optional[str] = None
    next_target: Optional[str] = None


class VerificationResult(BaseModel):
    success: bool
    status_code: Optional[int] = None
    message: str
    evidence: List[str]
