import logging
import pytest

from backend.orchestrator.state import IncidentStateMachine, InvalidTransitionError
from backend.schemas.incident import IncidentStatus
from backend.schemas.actions import AgentEvent, AgentState


def test_valid_path():
    sm = IncidentStateMachine("inc-1")
    assert sm.status == IncidentStatus.CREATED
    
    assert sm.transition_to(IncidentStatus.PLANNING) == IncidentStatus.PLANNING
    assert sm.transition_to(IncidentStatus.DIAGNOSING) == IncidentStatus.DIAGNOSING
    assert sm.transition_to(IncidentStatus.ACTION_PROPOSED) == IncidentStatus.ACTION_PROPOSED
    assert sm.transition_to(IncidentStatus.WAITING_APPROVAL) == IncidentStatus.WAITING_APPROVAL
    assert sm.transition_to(IncidentStatus.EXECUTING) == IncidentStatus.EXECUTING
    assert sm.transition_to(IncidentStatus.VERIFYING) == IncidentStatus.VERIFYING
    assert sm.transition_to(IncidentStatus.RESOLVED) == IncidentStatus.RESOLVED


def test_illegal_transition():
    sm = IncidentStateMachine("inc-2")
    with pytest.raises(InvalidTransitionError, match="Cannot transition from CREATED to EXECUTING"):
        sm.transition_to(IncidentStatus.EXECUTING)


def test_escalation_from_active_state():
    sm = IncidentStateMachine("inc-3", status=IncidentStatus.DIAGNOSING)
    assert sm.transition_to(IncidentStatus.ESCALATED) == IncidentStatus.ESCALATED


def test_no_escalation_from_resolved_or_escalated():
    sm1 = IncidentStateMachine("inc-4", status=IncidentStatus.RESOLVED)
    with pytest.raises(InvalidTransitionError):
        sm1.transition_to(IncidentStatus.ESCALATED)
        
    sm2 = IncidentStateMachine("inc-5", status=IncidentStatus.ESCALATED)
    with pytest.raises(InvalidTransitionError):
        sm2.transition_to(IncidentStatus.ESCALATED)


def test_subscribers_receive_event(caplog):
    sm = IncidentStateMachine("inc-6", status=IncidentStatus.VERIFYING)
    
    received_events = []
    def working_sub(event: AgentEvent):
        received_events.append(event)
        
    def failing_sub(event: AgentEvent):
        raise ValueError("I failed")
        
    sm.subscribe(working_sub)
    sm.subscribe(failing_sub)
    
    with caplog.at_level(logging.ERROR):
        new_status = sm.transition_to(IncidentStatus.RESOLVED)
    
    assert new_status == IncidentStatus.RESOLVED
    assert len(received_events) == 1
    
    event = received_events[0]
    assert event.incident_id == "inc-6"
    assert event.agent == "orchestrator"
    assert event.state == AgentState.COMPLETED
    assert event.message == "VERIFYING -> RESOLVED"
    
    # Check that error was logged
    assert "Subscriber" in caplog.text
    assert "failed: I failed" in caplog.text


def test_failed_state_transition():
    sm = IncidentStateMachine("inc-7", status=IncidentStatus.VERIFYING)
    received = []
    sm.subscribe(lambda e: received.append(e))
    sm.transition_to(IncidentStatus.FAILED)
    
    event = received[0]
    assert event.state == AgentState.FAILED


def test_normal_state_transition():
    sm = IncidentStateMachine("inc-8", status=IncidentStatus.CREATED)
    received = []
    sm.subscribe(lambda e: received.append(e))
    sm.transition_to(IncidentStatus.PLANNING)
    
    event = received[0]
    assert event.state == AgentState.RUNNING
