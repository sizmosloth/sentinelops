"""
SentinelOps Orchestrator
Member 2 - Autonomous Incident Recovery & Workflow Controller

Responsibilities:
    Detect -> Collect Evidence -> Member 1 Diagnosis -> Member 1 Remediation ->
    Safety Gate -> Approval (if required) -> Execute -> Verify -> Recovered
    Adaptive Recovery on Verification Failure.
"""

import datetime
import inspect
import time
from typing import Any, Dict, List, Optional

from backend.agents.diagnostic_agent import diagnose
from backend.agents.remediation_agent import create_remediation
from backend.agents.verification_agent import verify_recovery
from backend.execution.executor import execute_action, execute_approved_action
from backend.safety.permissions import (
    get_approval,
    approve_action as perms_approve_action,
    deny_action as perms_deny_action,
    list_approvals
)
from backend.tools.registry import get_tool

# Standard Recovery States
STATE_IDLE = "IDLE"
STATE_DETECTING = "DETECTING"
STATE_DIAGNOSING = "DIAGNOSING"
STATE_PLANNING = "PLANNING"
STATE_SAFETY_CHECK = "SAFETY_CHECK"
STATE_AWAITING_APPROVAL = "AWAITING_APPROVAL"
STATE_EXECUTING = "EXECUTING"
STATE_VERIFYING = "VERIFYING"
STATE_RE_DIAGNOSING = "RE_DIAGNOSING"
STATE_REPLANNING = "REPLANNING"
STATE_RECOVERED = "RECOVERED"
STATE_FAILED = "FAILED"
STATE_BLOCKED = "BLOCKED"

# Default recovery constraints
MAX_RECOVERY_ATTEMPTS = 3

# In-memory storage for active recovery sessions and incident tracking
RECOVERY_SESSIONS: Dict[str, Dict[str, Any]] = {}
INCIDENTS: Dict[str, Dict[str, Any]] = {}
_INCIDENT_COUNTER = 0


def _get_utc_timestamp() -> str:
    """Returns current ISO-8601 UTC timestamp."""
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


def generate_incident_id() -> str:
    """Generates a stable incident identifier (e.g. INC-001)."""
    global _INCIDENT_COUNTER
    _INCIDENT_COUNTER += 1
    return f"INC-{_INCIDENT_COUNTER:03d}"


def add_timeline_event(
    session: Dict[str, Any],
    stage: str,
    message: str,
    details: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Appends an event to the incident timeline and updates current_stage."""
    event = {
        "timestamp": _get_utc_timestamp(),
        "stage": stage,
        "message": message,
        "details": details or {}
    }
    if "timeline" not in session:
        session["timeline"] = []
    session["timeline"].append(event)
    session["current_stage"] = stage
    return event


def collect_evidence() -> Dict[str, Any]:
    """
    Safely collects initial or updated observations across infrastructure
    using registered, safe inspection tools.
    """
    evidence: Dict[str, Any] = {}

    # 1. API Health Check
    health_tool = get_tool("health_check")
    if health_tool:
        try:
            evidence["health"] = health_tool()
        except Exception as exc:
            evidence["health"] = {"success": False, "healthy": False, "error": str(exc)}

    # 2. Container Status & Health
    status_tool = get_tool("container_status")
    health_status_tool = get_tool("container_health")
    for container in ["demo-api", "demo-db"]:
        if status_tool:
            try:
                evidence[container] = status_tool(container)
            except Exception as exc:
                evidence[container] = {"success": False, "error": str(exc)}
        if health_status_tool:
            try:
                evidence[f"{container}_health"] = health_status_tool(container)
            except Exception as exc:
                evidence[f"{container}_health"] = {"success": False, "error": str(exc)}

    # 3. Port & Database Checks
    port_tool = get_tool("port_check")
    if port_tool:
        try:
            evidence["port_api"] = port_tool("localhost:8000")
            evidence["port_db"] = port_tool("localhost:5432")
        except Exception as exc:
            evidence["ports"] = {"success": False, "error": str(exc)}

    return evidence


def run_diagnosis(observations: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Executes the Diagnostic Agent to inspect system health.
    Safe integration point for Member 1 AI/agent enhancements.
    Supports both diagnose() and diagnose(observations) signatures.
    """
    try:
        sig = inspect.signature(diagnose)
        if len(sig.parameters) > 0 and observations is not None:
            return diagnose(observations)
        return diagnose()
    except TypeError:
        try:
            return diagnose(observations)  # type: ignore
        except TypeError:
            return diagnose()
    except Exception as exc:
        return {
            "success": False,
            "diagnosis": "unknown",
            "error": f"Diagnosis failed: {str(exc)}",
            "evidence": observations or {}
        }


def plan_remediation(
    diagnosis: Any,
    observations: Optional[Dict[str, Any]] = None,
    demo_mode: bool = False,
    attempt: int = 1
) -> Dict[str, Any]:
    """
    Consults the Remediation Agent to determine appropriate corrective action.
    Safe integration point for Member 1 reasoning.
    Supports both Round 1 (diagnosis, demo_mode, attempt) and
    Round 2 (diagnosis, observations, attempt) signatures.
    """
    try:
        sig = inspect.signature(create_remediation)
        params = sig.parameters
        if "observations" in params:
            return create_remediation(diagnosis, observations=observations, attempt=attempt)
        return create_remediation(diagnosis, demo_mode=demo_mode, attempt=attempt)
    except TypeError:
        try:
            return create_remediation(diagnosis, demo_mode=demo_mode, attempt=attempt)
        except TypeError:
            try:
                return create_remediation(diagnosis)  # type: ignore
            except Exception as exc:
                return {"success": False, "error": f"Remediation planning failed: {str(exc)}"}
    except Exception as exc:
        return {
            "success": False,
            "error": f"Remediation planning failed: {str(exc)}"
        }


def handle_execution(remediation: Dict[str, Any], incident_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Submits a remediation action proposal to the Executor.
    The Executor routes through the Safety Gate, enforcing permission policies.
    """
    tool_name = remediation.get("tool")
    target = remediation.get("target")
    reason = remediation.get("reason", "")

    if not tool_name:
        return {
            "success": False,
            "stage": "execution",
            "decision": "deny",
            "error": "Missing tool name in remediation plan"
        }

    try:
        return execute_action(tool_name, target=target, reason=reason, incident_id=incident_id)
    except Exception as exc:
        return {
            "success": False,
            "stage": "execution",
            "decision": "error",
            "error": f"Execution error: {str(exc)}"
        }


def verify_recovery_status(
    max_retries: int = 2, delay: float = 1.5
) -> Dict[str, Any]:
    """
    Verifies system recovery using the Verification Agent.
    Includes a brief polling window to allow restarted containers / services
    to establish readiness. Never fakes recovery without verified evidence.
    """
    time.sleep(delay)

    for i in range(max_retries):
        try:
            result = verify_recovery()
        except Exception as exc:
            result = {
                "success": False,
                "verified": False,
                "status": "error",
                "error": f"Verification error: {str(exc)}"
            }

        if result.get("verified"):
            return result

        if i < max_retries - 1:
            time.sleep(delay)

    return result


def _run_recovery_loop(
    session: Dict[str, Any],
    start_attempt: int,
    max_attempts: int,
    demo_mode: bool
) -> Dict[str, Any]:
    """
    Internal driver for the autonomous & adaptive recovery loop.
    Iterates through attempts: Detect -> Diagnose -> Plan -> Safety Gate -> Execute -> Verify.
    Halts cleanly if approval is required.
    """
    attempts: List[Dict[str, Any]] = session.setdefault("attempts", [])
    incident_id: str = session["incident_id"]

    for attempt in range(start_attempt, max_attempts + 1):
        session["attempt"] = attempt
        current_state = STATE_DIAGNOSING if attempt == 1 else STATE_RE_DIAGNOSING
        stage_compat = "diagnosing" if attempt == 1 else "re_diagnosing"

        print(f"\n[SentinelOps] === Stage: {stage_compat.upper()} (Attempt {attempt}/{max_attempts}) ===")
        add_timeline_event(
            session,
            current_state,
            f"Starting diagnosis for attempt {attempt}/{max_attempts}"
        )

        attempt_record: Dict[str, Any] = {
            "attempt": attempt,
            "stage": stage_compat,
            "diagnosis": None,
            "remediation": None,
            "execution": None,
            "verification": None
        }
        attempts.append(attempt_record)

        # 1. Detection & Evidence Collection
        add_timeline_event(session, STATE_DETECTING, "Collecting infrastructure telemetry")
        observations = collect_evidence()

        # 2. Diagnosis (Member 1)
        diagnosis_result = run_diagnosis(observations=observations)
        attempt_record["diagnosis"] = diagnosis_result
        session["diagnosis"] = diagnosis_result
        diag_name = diagnosis_result.get("diagnosis", "unknown")
        print(f"[SentinelOps] Diagnosis: {diag_name}")

        add_timeline_event(
            session,
            current_state,
            f"Diagnosis identified: {diag_name}",
            details={"diagnosis": diag_name}
        )

        if diag_name == "service_healthy":
            if attempt == 1:
                attempt_record["stage"] = "already_healthy"
                session["status"] = "already_healthy"
                add_timeline_event(session, STATE_RECOVERED, "System verified already healthy")
                return {
                    "success": True,
                    "status": "already_healthy",
                    "stage": "already_healthy",
                    "current_stage": STATE_RECOVERED,
                    "incident_id": incident_id,
                    "total_attempts": attempt,
                    "diagnosis": diagnosis_result,
                    "attempts": attempts,
                    "timeline": session.get("timeline", [])
                }
            else:
                attempt_record["stage"] = "recovered"
                session["status"] = "recovered"
                add_timeline_event(session, STATE_RECOVERED, "System successfully recovered")
                return {
                    "success": True,
                    "status": "recovered",
                    "stage": "recovered",
                    "current_stage": STATE_RECOVERED,
                    "incident_id": incident_id,
                    "total_attempts": attempt,
                    "final_verification": {
                        "verified": True,
                        "status": "recovered",
                        "evidence": diagnosis_result.get("evidence")
                    },
                    "attempts": attempts,
                    "timeline": session.get("timeline", [])
                }

        # 3. Planning Remediation (Member 1)
        plan_state = STATE_PLANNING if attempt == 1 else STATE_REPLANNING
        stage_compat = "planning_remediation" if attempt == 1 else "replanning"
        attempt_record["stage"] = stage_compat
        print(f"[SentinelOps] Stage: {stage_compat}...")

        add_timeline_event(
            session,
            plan_state,
            f"Requesting remediation proposal for {diag_name}"
        )

        remediation = plan_remediation(
            diag_name,
            observations=observations,
            demo_mode=demo_mode,
            attempt=attempt
        )
        attempt_record["remediation"] = remediation
        session["proposed_action"] = remediation
        print(f"[SentinelOps] Remediation proposed: {remediation}")

        if not remediation.get("success"):
            attempt_record["stage"] = "failed"
            session["status"] = "remediation_unavailable"
            add_timeline_event(session, STATE_FAILED, "No viable remediation plan found")
            return {
                "success": False,
                "status": "remediation_unavailable",
                "stage": stage_compat,
                "current_stage": STATE_FAILED,
                "incident_id": incident_id,
                "error": remediation.get("error", "No remediation available"),
                "total_attempts": attempt,
                "attempts": attempts,
                "timeline": session.get("timeline", [])
            }

        # 4. Safety Gate & Execution
        add_timeline_event(
            session,
            STATE_SAFETY_CHECK,
            f"Evaluating proposed action '{remediation.get('tool')}' via Safety Gate",
            details=remediation
        )
        print("[SentinelOps] Executing remediation through Safety Gate...")

        execution = handle_execution(remediation, incident_id=incident_id)
        attempt_record["execution"] = execution
        session["execution"] = execution
        print(f"[SentinelOps] Execution decision: {execution.get('decision')}")

        # Safety policy: Denied
        if execution.get("decision") == "deny":
            attempt_record["stage"] = "executing"
            session["status"] = "safety_denied"
            add_timeline_event(
                session,
                STATE_BLOCKED,
                f"Action denied by Safety Gate: {execution.get('error')}"
            )
            return {
                "success": False,
                "status": "safety_denied",
                "stage": "executing",
                "current_stage": STATE_BLOCKED,
                "incident_id": incident_id,
                "error": execution.get("error", "Action denied by safety gate"),
                "total_attempts": attempt,
                "attempts": attempts,
                "timeline": session.get("timeline", [])
            }

        # Safety policy: Approval required (pause autonomous loop)
        if execution.get("decision") == "approval_required":
            stage_compat = "awaiting_approval"
            attempt_record["stage"] = stage_compat
            approval_info = execution.get("approval", {})
            approval_id = approval_info.get("id")

            session["approval"] = approval_info
            session["status"] = "approval_required"
            add_timeline_event(
                session,
                STATE_AWAITING_APPROVAL,
                f"Action requires operator approval ({approval_id})",
                details=approval_info
            )

            # Persist session state for continuation
            if approval_id:
                RECOVERY_SESSIONS[approval_id] = session

            print(f"[SentinelOps] Paused: Approval required ({approval_id})")
            return {
                "success": False,
                "status": "approval_required",
                "stage": "awaiting_approval",
                "current_stage": STATE_AWAITING_APPROVAL,
                "incident_id": incident_id,
                "diagnosis": diagnosis_result,
                "remediation": remediation,
                "approval": approval_info,
                "attempt": attempt,
                "attempts": attempts,
                "timeline": session.get("timeline", [])
            }

        if not execution.get("success"):
            attempt_record["stage"] = "failed"
            session["status"] = "execution_failed"
            add_timeline_event(session, STATE_FAILED, f"Execution failed: {execution.get('error')}")
            return {
                "success": False,
                "status": "execution_failed",
                "stage": "executing",
                "current_stage": STATE_FAILED,
                "incident_id": incident_id,
                "error": execution.get("error", "Execution failed"),
                "total_attempts": attempt,
                "attempts": attempts,
                "timeline": session.get("timeline", [])
            }

        # 5. Verification
        attempt_record["stage"] = "verifying"
        add_timeline_event(session, STATE_VERIFYING, "Verifying infrastructure post-execution")
        print("[SentinelOps] Verifying system recovery...")

        verification = verify_recovery_status()
        attempt_record["verification"] = verification
        session["verification"] = verification
        print(f"[SentinelOps] Verification result: {verification.get('status')}")

        if verification.get("verified"):
            attempt_record["stage"] = "recovered"
            session["status"] = "recovered"
            add_timeline_event(session, STATE_RECOVERED, "System verified successfully recovered!")
            print("[SentinelOps] Recovery confirmed!")
            return {
                "success": True,
                "status": "recovered",
                "stage": "recovered",
                "current_stage": STATE_RECOVERED,
                "incident_id": incident_id,
                "total_attempts": attempt,
                "final_verification": verification,
                "attempts": attempts,
                "timeline": session.get("timeline", [])
            }

        # Verification failed — proceed to adapt if attempts remain
        attempt_record["stage"] = "adaptation_required"
        add_timeline_event(
            session,
            STATE_VERIFYING,
            f"Verification failed on attempt {attempt}. Adapting..."
        )
        print(f"[SentinelOps] Verification failed for attempt {attempt}.")

    # Exceeded max attempts
    session["status"] = "recovery_failed"
    add_timeline_event(
        session,
        STATE_FAILED,
        f"Exceeded maximum recovery attempts ({max_attempts})"
    )
    print(f"[SentinelOps] Max recovery attempts ({max_attempts}) reached without recovery.")
    return {
        "success": False,
        "status": "recovery_failed",
        "stage": "failed",
        "current_stage": STATE_FAILED,
        "incident_id": incident_id,
        "error": f"Exceeded maximum recovery attempts ({max_attempts})",
        "total_attempts": max_attempts,
        "attempts": attempts,
        "timeline": session.get("timeline", [])
    }


def run_recovery(
    demo_mode: bool = False,
    max_attempts: int = MAX_RECOVERY_ATTEMPTS,
    incident_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Main entry point for starting an autonomous recovery workflow.
    """
    print("\n=== SENTINELOPS AUTONOMOUS RECOVERY STARTED ===")
    inc_id = incident_id or generate_incident_id()

    session: Dict[str, Any] = {
        "incident_id": inc_id,
        "status": "active",
        "current_stage": STATE_IDLE,
        "demo_mode": demo_mode,
        "max_attempts": max_attempts,
        "attempt": 1,
        "diagnosis": None,
        "proposed_action": None,
        "approval": None,
        "execution": None,
        "verification": None,
        "timeline": [],
        "attempts": []
    }
    INCIDENTS[inc_id] = session

    add_timeline_event(session, STATE_IDLE, f"Incident {inc_id} initialized")
    return _run_recovery_loop(
        session=session,
        start_attempt=1,
        max_attempts=max_attempts,
        demo_mode=demo_mode
    )


# Member 3 Entry Point Alias
start_recovery = run_recovery


def continue_recovery(approval_id: str) -> Dict[str, Any]:
    """
    Resumes the recovery workflow after an operator has approved or rejected the pending action.
    Executes the approved action and triggers verification / adaptive recovery.
    """
    print(f"\n=== SENTINELOPS RESUMING AFTER APPROVAL ({approval_id}) ===")

    approval = get_approval(approval_id)
    if approval is None:
        return {
            "success": False,
            "status": "error",
            "stage": "awaiting_approval",
            "current_stage": STATE_AWAITING_APPROVAL,
            "error": f"Approval request '{approval_id}' not found",
            "attempts": []
        }

    status = approval.get("status")
    if status == "pending":
        return {
            "success": False,
            "status": "approval_pending",
            "stage": "awaiting_approval",
            "current_stage": STATE_AWAITING_APPROVAL,
            "approval": approval,
            "error": f"Approval request '{approval_id}' is still pending decision"
        }

    if status == "denied":
        return {
            "success": False,
            "status": "approval_denied",
            "stage": "awaiting_approval",
            "current_stage": STATE_BLOCKED,
            "approval": approval,
            "error": f"Approval request '{approval_id}' was denied by operator"
        }

    if status == "executed":
        return {
            "success": False,
            "status": "already_executed",
            "stage": "executing",
            "current_stage": STATE_EXECUTING,
            "approval": approval,
            "error": f"Approval request '{approval_id}' has already been executed"
        }

    if status != "approved":
        return {
            "success": False,
            "status": "error",
            "stage": "awaiting_approval",
            "current_stage": STATE_AWAITING_APPROVAL,
            "approval": approval,
            "error": f"Approval request '{approval_id}' has invalid status: {status}"
        }

    # Retrieve recovery context
    session = RECOVERY_SESSIONS.pop(approval_id, None)
    if session is None:
        # Check INCIDENTS fallback
        inc_id = approval.get("incident_id")
        if inc_id and inc_id in INCIDENTS:
            session = INCIDENTS[inc_id]

    if session:
        demo_mode = session.get("demo_mode", False)
        attempt = session.get("attempt", 1)
        max_attempts = session.get("max_attempts", MAX_RECOVERY_ATTEMPTS)
        attempts = session.setdefault("attempts", [])
        incident_id = session.get("incident_id", approval.get("incident_id") or generate_incident_id())
        session["incident_id"] = incident_id
    else:
        # Graceful fallback if session was not in memory
        demo_mode = False
        attempt = 1
        max_attempts = MAX_RECOVERY_ATTEMPTS
        attempts = []
        incident_id = approval.get("incident_id") or generate_incident_id()
        session = {
            "incident_id": incident_id,
            "status": "active",
            "current_stage": STATE_EXECUTING,
            "demo_mode": demo_mode,
            "max_attempts": max_attempts,
            "attempt": attempt,
            "timeline": [],
            "attempts": attempts
        }
        INCIDENTS[incident_id] = session

    add_timeline_event(
        session,
        STATE_EXECUTING,
        f"Approved action '{approval.get('tool')}' on '{approval.get('target')}' received; executing..."
    )

    # Find or initialize the attempt record
    attempt_record = None
    for rec in attempts:
        if rec.get("attempt") == attempt:
            attempt_record = rec
            break
    if attempt_record is None:
        attempt_record = {
            "attempt": attempt,
            "stage": "executing",
            "diagnosis": None,
            "remediation": {
                "tool": approval.get("tool"),
                "target": approval.get("target"),
                "reason": approval.get("reason")
            },
            "execution": None,
            "verification": None
        }
        attempts.append(attempt_record)

    attempt_record["stage"] = "executing"
    print(f"[SentinelOps] Executing approved action ({approval.get('tool')} on {approval.get('target')})...")

    execution_result = execute_approved_action(approval_id)
    attempt_record["execution"] = execution_result
    session["execution"] = execution_result

    if not execution_result.get("success"):
        attempt_record["stage"] = "failed"
        session["status"] = "execution_failed"
        add_timeline_event(
            session,
            STATE_FAILED,
            f"Approved execution failed: {execution_result.get('error')}"
        )
        return {
            "success": False,
            "status": "execution_failed",
            "stage": "executing",
            "current_stage": STATE_FAILED,
            "incident_id": incident_id,
            "error": execution_result.get("error", "Approved execution failed"),
            "execution": execution_result,
            "attempts": attempts,
            "timeline": session.get("timeline", [])
        }

    # Verify recovery post-execution
    attempt_record["stage"] = "verifying"
    add_timeline_event(session, STATE_VERIFYING, "Verifying recovery post-execution...")
    print("[SentinelOps] Verifying recovery post-execution...")

    verification = verify_recovery_status()
    attempt_record["verification"] = verification
    session["verification"] = verification
    print(f"[SentinelOps] Post-execution verification: {verification.get('status')}")

    if verification.get("verified"):
        attempt_record["stage"] = "recovered"
        session["status"] = "recovered"
        add_timeline_event(session, STATE_RECOVERED, "System verified successfully recovered!")
        print("[SentinelOps] Service successfully recovered!")
        return {
            "success": True,
            "status": "recovered",
            "stage": "recovered",
            "current_stage": STATE_RECOVERED,
            "incident_id": incident_id,
            "total_attempts": attempt,
            "final_verification": verification,
            "attempts": attempts,
            "timeline": session.get("timeline", [])
        }

    # Verification failed: Trigger adaptive recovery
    attempt_record["stage"] = "adaptation_required"
    add_timeline_event(
        session,
        STATE_VERIFYING,
        f"Verification failed on attempt {attempt}. Adapting..."
    )
    print(f"[SentinelOps] Verification failed on attempt {attempt}. Adapting...")

    if attempt < max_attempts:
        return _run_recovery_loop(
            session=session,
            start_attempt=attempt + 1,
            max_attempts=max_attempts,
            demo_mode=demo_mode
        )

    session["status"] = "recovery_failed"
    add_timeline_event(
        session,
        STATE_FAILED,
        f"Exceeded maximum recovery attempts ({max_attempts})"
    )
    return {
        "success": False,
        "status": "recovery_failed",
        "stage": "failed",
        "current_stage": STATE_FAILED,
        "incident_id": incident_id,
        "error": f"Exceeded maximum recovery attempts ({max_attempts})",
        "total_attempts": attempt,
        "attempts": attempts,
        "timeline": session.get("timeline", [])
    }


# Convenience alias for Member 3
continue_after_approval = continue_recovery


def resume_recovery(incident_id_or_approval_id: str) -> Dict[str, Any]:
    """
    Member 3 resume entry point. Resolves either an incident ID or approval ID
    and continues execution after operator review.
    """
    if incident_id_or_approval_id.startswith("INC-"):
        incident = get_incident(incident_id_or_approval_id)
        if incident and incident.get("approval"):
            app_id = incident["approval"].get("id")
            if app_id:
                return continue_recovery(app_id)
        # Search approvals matching incident
        for app in list_approvals():
            if app.get("incident_id") == incident_id_or_approval_id:
                return continue_recovery(app["id"])
        return {
            "success": False,
            "status": "error",
            "error": f"No pending approval associated with incident {incident_id_or_approval_id}"
        }

    return continue_recovery(incident_id_or_approval_id)


def get_recovery_session(approval_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve active session state for a pending approval."""
    return RECOVERY_SESSIONS.get(approval_id)


def list_recovery_sessions() -> Dict[str, Any]:
    """List all pending recovery sessions."""
    return dict(RECOVERY_SESSIONS)


# Member 3 Integration Interface
def get_incident(incident_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve complete incident session data by incident ID."""
    return INCIDENTS.get(incident_id)


def get_incident_timeline(incident_id: str) -> List[Dict[str, Any]]:
    """Retrieve chronologically ordered events for an incident."""
    incident = INCIDENTS.get(incident_id)
    if incident:
        return incident.get("timeline", [])
    return []


def list_incidents() -> List[Dict[str, Any]]:
    """List all incidents known to SentinelOps."""
    return list(INCIDENTS.values())


def get_approvals(status: Optional[str] = None) -> List[Dict[str, Any]]:
    """List all approval requests."""
    return list_approvals(status=status)


def approve_action(approval_id: str) -> Optional[Dict[str, Any]]:
    """Approve a pending action request."""
    return perms_approve_action(approval_id)


def deny_action(approval_id: str) -> Optional[Dict[str, Any]]:
    """Deny a pending action request."""
    return perms_deny_action(approval_id)
