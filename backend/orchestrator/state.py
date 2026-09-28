import logging
from typing import Callable, List, Set, Dict

from backend.schemas.incident import IncidentStatus
from backend.schemas.actions import AgentEvent, AgentState

logger = logging.getLogger(__name__)


class InvalidTransitionError(Exception):
    """Raised when an illegal state transition is attempted."""
    pass


class IncidentStateMachine:
    _ALLOWED_TRANSITIONS: Dict[IncidentStatus, Set[IncidentStatus]] = {
        IncidentStatus.CREATED: {IncidentStatus.PLANNING},
        IncidentStatus.PLANNING: {IncidentStatus.DIAGNOSING},
        IncidentStatus.DIAGNOSING: {IncidentStatus.ACTION_PROPOSED},
        IncidentStatus.ACTION_PROPOSED: {IncidentStatus.WAITING_APPROVAL, IncidentStatus.EXECUTING},
        IncidentStatus.WAITING_APPROVAL: {IncidentStatus.EXECUTING},
        IncidentStatus.EXECUTING: {IncidentStatus.VERIFYING},
        IncidentStatus.VERIFYING: {IncidentStatus.RESOLVED, IncidentStatus.FAILED},
        IncidentStatus.FAILED: {IncidentStatus.RE_DIAGNOSING},
        IncidentStatus.RE_DIAGNOSING: {IncidentStatus.DIAGNOSING},
        IncidentStatus.RESOLVED: set(),
        IncidentStatus.ESCALATED: set(),
    }

    def __init__(self, incident_id: str, status: IncidentStatus = IncidentStatus.CREATED):
        self._incident_id = incident_id
        self._status = status
        self._subscribers: List[Callable[[AgentEvent], None]] = []

    @property
    def status(self) -> IncidentStatus:
        return self._status

    def subscribe(self, callback: Callable[[AgentEvent], None]) -> None:
        self._subscribers.append(callback)

    def transition_to(self, new_status: IncidentStatus, reason: str | None = None) -> IncidentStatus:
        is_escalation = new_status == IncidentStatus.ESCALATED
        can_escalate = self._status not in (IncidentStatus.RESOLVED, IncidentStatus.ESCALATED)
        
        allowed_next = self._ALLOWED_TRANSITIONS.get(self._status, set())
        is_normal_transition = new_status in allowed_next

        if not (is_normal_transition or (is_escalation and can_escalate)):
            raise InvalidTransitionError(f"Cannot transition from {self._status.value} to {new_status.value}")

        old_status = self._status
        self._status = new_status

        if new_status == IncidentStatus.RESOLVED:
            agent_state = AgentState.COMPLETED
        elif new_status in (IncidentStatus.ESCALATED, IncidentStatus.FAILED):
            agent_state = AgentState.FAILED
        else:
            agent_state = AgentState.RUNNING

        message = f"{old_status.value} -> {new_status.value}"
        if reason:
            message += f": {reason}"

        event = AgentEvent(
            incident_id=self._incident_id,
            agent="orchestrator",
            state=agent_state,
            message=message
        )

        for callback in self._subscribers:
            try:
                callback(event)
            except Exception as e:
                logger.error(f"Subscriber {callback} failed: {e}", exc_info=True)

        return self._status
