from datetime import datetime, timezone
import pytest
from pydantic import ValidationError

from backend.schemas.incident import (
    Incident, IncidentStatus, Plan, Diagnosis, VerificationResult
)
from backend.schemas.actions import (
    ActionProposal, RiskLevel, ToolRequest, ToolResult, AgentEvent, AgentState
)


def test_incident_schema():
    # Valid
    inc = Incident(
        goal="Fix server",
        status=IncidentStatus.CREATED,
        attempt=1,
        evidence=[],
        history=[]
    )
    assert inc.id.startswith("INC-")
    assert inc.created_at.tzinfo == timezone.utc

    # Invalid - incorrect status enum
    with pytest.raises(ValidationError):
        Incident(
            goal="Fix server",
            status="INVALID_STATUS",
            attempt=1,
            evidence=[],
            history=[]
        )


def test_plan_schema():
    # Valid
    plan = Plan(goal="Restore DB", strategy=["Check logs", "Restart service"])
    assert plan.goal == "Restore DB"

    # Invalid - strategy should be list of strings, providing dict
    with pytest.raises(ValidationError):
        Plan(goal="Restore DB", strategy={"step": "Check logs"})


def test_diagnosis_schema():
    # Valid
    diag = Diagnosis(diagnosis="DB is down", confidence=0.8, evidence=["Log error"])
    assert diag.confidence == 0.8

    # Invalid - confidence out of bounds
    with pytest.raises(ValidationError):
        Diagnosis(diagnosis="DB is down", confidence=1.5, evidence=[])


def test_verification_result_schema():
    # Valid
    vr = VerificationResult(success=True, message="All good", evidence=[])
    assert vr.success is True

    # Invalid - missing required message
    with pytest.raises(ValidationError):
        VerificationResult(success=True, evidence=[])


def test_action_proposal_schema():
    # Valid
    ap = ActionProposal(tool="restart", target="db", reason="down", risk=RiskLevel.medium)
    assert ap.risk == RiskLevel.medium

    # Invalid - invalid risk level
    with pytest.raises(ValidationError):
        ActionProposal(tool="restart", target="db", reason="down", risk="unknown")


def test_tool_request_schema():
    # Valid
    tr = ToolRequest(tool="ping", target="localhost")
    assert tr.params == {}

    # Invalid - tool is required
    with pytest.raises(ValidationError):
        ToolRequest(target="localhost")


def test_tool_result_schema():
    # Valid
    tr = ToolResult(success=True, target="localhost", data={"time": "1ms"})
    assert tr.success is True

    # Invalid - missing data
    with pytest.raises(ValidationError):
        ToolResult(success=True, target="localhost")


def test_agent_event_schema():
    # Valid
    ae = AgentEvent(incident_id="INC-1234", agent="planner", state=AgentState.RUNNING, message="Starting")
    assert ae.timestamp.tzinfo == timezone.utc

    # Invalid - invalid state
    with pytest.raises(ValidationError):
        AgentEvent(incident_id="INC-1234", agent="planner", state="SLEEPING", message="Resting")
