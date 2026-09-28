"""
SentinelOps Orchestrator
Member 2 - Autonomous Incident Recovery & Workflow Controller

Coordinates:
    Diagnostic Agent -> Remediation Agent -> Executor / Safety Gate -> Verification Agent -> Adaptive Recovery
"""

import time
from typing import Any, Dict, List, Optional

from backend.agents.diagnostic_agent import diagnose
from backend.agents.remediation_agent import create_remediation
from backend.agents.verification_agent import verify_recovery
from backend.execution.executor import execute_action, execute_approved_action
from backend.safety.permissions import get_approval, approve_action, deny_action

# Default recovery constraints
MAX_RECOVERY_ATTEMPTS = 3

# In-memory storage for active recovery sessions across approval interruptions
RECOVERY_SESSIONS: Dict[str, Dict[str, Any]] = {}


def run_diagnosis() -> Dict[str, Any]:
    """
    Executes the Diagnostic Agent to inspect system health and dependencies.
    Safe integration point for Member 1 AI/agent enhancements.
    """
    try:
        return diagnose()
    except Exception as exc:
        return {
            "success": False,
            "diagnosis": "unknown",
            "error": f"Diagnosis failed: {str(exc)}",
            "evidence": {}
        }


def plan_remediation(
    diagnosis: str, demo_mode: bool = False, attempt: int = 1
) -> Dict[str, Any]:
    """
    Consults the Remediation Agent to determine appropriate corrective action.
    Safe integration point for Member 1 reasoning improvements.
    """
    try:
        return create_remediation(diagnosis, demo_mode=demo_mode, attempt=attempt)
    except Exception as exc:
        return {
            "success": False,
            "error": f"Remediation planning failed: {str(exc)}"
        }


def handle_execution(remediation: Dict[str, Any]) -> Dict[str, Any]:
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
        return execute_action(tool_name, target=target, reason=reason)
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
    start_attempt: int,
    max_attempts: int,
    demo_mode: bool,
    attempts: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Internal driver for the adaptive recovery loop.
    Iterates through attempts, diagnosing, planning, executing, and verifying.
    Halts cleanly if approval is required.
    """
    for attempt in range(start_attempt, max_attempts + 1):
        stage = "diagnosing" if attempt == 1 else "re_diagnosing"
        print(f"\n[SentinelOps] === Stage: {stage.upper()} (Attempt {attempt}/{max_attempts}) ===")

        attempt_record: Dict[str, Any] = {
            "attempt": attempt,
            "stage": stage,
            "diagnosis": None,
            "remediation": None,
            "execution": None,
            "verification": None
        }
        attempts.append(attempt_record)

        # 1. Diagnosis
        diagnosis_result = run_diagnosis()
        attempt_record["diagnosis"] = diagnosis_result
        print(f"[SentinelOps] Diagnosis: {diagnosis_result.get('diagnosis')}")

        if diagnosis_result.get("diagnosis") == "service_healthy":
            if attempt == 1:
                attempt_record["stage"] = "already_healthy"
                return {
                    "success": True,
                    "status": "already_healthy",
                    "stage": "already_healthy",
                    "total_attempts": attempt,
                    "diagnosis": diagnosis_result,
                    "attempts": attempts
                }
            else:
                attempt_record["stage"] = "recovered"
                return {
                    "success": True,
                    "status": "recovered",
                    "stage": "recovered",
                    "total_attempts": attempt,
                    "final_verification": {
                        "verified": True,
                        "status": "recovered",
                        "evidence": diagnosis_result.get("evidence")
                    },
                    "attempts": attempts
                }

        # 2. Plan Remediation
        stage = "planning_remediation" if attempt == 1 else "replanning"
        attempt_record["stage"] = stage
        print(f"[SentinelOps] Stage: {stage}...")

        remediation = plan_remediation(
            diagnosis_result.get("diagnosis", "unknown"),
            demo_mode=demo_mode,
            attempt=attempt
        )
        attempt_record["remediation"] = remediation
        print(f"[SentinelOps] Remediation proposed: {remediation}")

        if not remediation.get("success"):
            attempt_record["stage"] = "failed"
            return {
                "success": False,
                "status": "remediation_unavailable",
                "stage": stage,
                "error": remediation.get("error", "No remediation available"),
                "total_attempts": attempt,
                "attempts": attempts
            }

        # 3. Execution & Safety Gate
        stage = "executing"
        attempt_record["stage"] = stage
        print("[SentinelOps] Executing remediation through Safety Gate...")

        execution = handle_execution(remediation)
        attempt_record["execution"] = execution
        print(f"[SentinelOps] Execution decision: {execution.get('decision')}")

        # Safety policy: Denied
        if execution.get("decision") == "deny":
            attempt_record["stage"] = "failed"
            return {
                "success": False,
                "status": "safety_denied",
                "stage": "executing",
                "error": execution.get("error", "Action denied by safety gate"),
                "total_attempts": attempt,
                "attempts": attempts
            }

        # Safety policy: Approval required (pause autonomous loop)
        if execution.get("decision") == "approval_required":
            stage = "awaiting_approval"
            attempt_record["stage"] = stage
            approval_info = execution.get("approval", {})
            approval_id = approval_info.get("id")

            # Persist session state for continuation
            if approval_id:
                RECOVERY_SESSIONS[approval_id] = {
                    "approval_id": approval_id,
                    "demo_mode": demo_mode,
                    "attempt": attempt,
                    "max_attempts": max_attempts,
                    "attempts": attempts,
                    "remediation": remediation
                }

            print(f"[SentinelOps] Paused: Approval required ({approval_id})")
            return {
                "success": False,
                "status": "approval_required",
                "stage": "awaiting_approval",
                "diagnosis": diagnosis_result,
                "remediation": remediation,
                "approval": approval_info,
                "attempt": attempt,
                "attempts": attempts
            }

        if not execution.get("success"):
            attempt_record["stage"] = "failed"
            return {
                "success": False,
                "status": "execution_failed",
                "stage": "executing",
                "error": execution.get("error", "Execution failed"),
                "total_attempts": attempt,
                "attempts": attempts
            }

        # 4. Verification
        stage = "verifying"
        attempt_record["stage"] = stage
        print("[SentinelOps] Verifying system recovery...")

        verification = verify_recovery_status()
        attempt_record["verification"] = verification
        print(f"[SentinelOps] Verification result: {verification.get('status')}")

        if verification.get("verified"):
            attempt_record["stage"] = "recovered"
            print("[SentinelOps] Recovery confirmed!")
            return {
                "success": True,
                "status": "recovered",
                "stage": "recovered",
                "total_attempts": attempt,
                "final_verification": verification,
                "attempts": attempts
            }

        # Verification failed — proceed to adapt if attempts remain
        attempt_record["stage"] = "adaptation_required"
        print(f"[SentinelOps] Verification failed for attempt {attempt}.")

    # Exceeded max attempts
    print(f"[SentinelOps] Max recovery attempts ({max_attempts}) reached without recovery.")
    return {
        "success": False,
        "status": "recovery_failed",
        "stage": "failed",
        "error": f"Exceeded maximum recovery attempts ({max_attempts})",
        "total_attempts": max_attempts,
        "attempts": attempts
    }


def run_recovery(
    demo_mode: bool = False, max_attempts: int = MAX_RECOVERY_ATTEMPTS
) -> Dict[str, Any]:
    """
    Main entry point for starting an autonomous recovery workflow.
    """
    print("\n=== SENTINELOPS AUTONOMOUS RECOVERY STARTED ===")
    attempts: List[Dict[str, Any]] = []
    return _run_recovery_loop(
        start_attempt=1,
        max_attempts=max_attempts,
        demo_mode=demo_mode,
        attempts=attempts
    )


def continue_recovery(approval_id: str) -> Dict[str, Any]:
    """
    Resumes the recovery workflow after an operator has approved the pending action.
    Executes the approved action and triggers verification / adaptive recovery.
    """
    print(f"\n=== SENTINELOPS RESUMING AFTER APPROVAL ({approval_id}) ===")

    approval = get_approval(approval_id)
    if approval is None:
        return {
            "success": False,
            "status": "error",
            "stage": "awaiting_approval",
            "error": f"Approval request '{approval_id}' not found",
            "attempts": []
        }

    status = approval.get("status")
    if status == "pending":
        return {
            "success": False,
            "status": "approval_pending",
            "stage": "awaiting_approval",
            "approval": approval,
            "error": f"Approval request '{approval_id}' is still pending decision"
        }

    if status == "denied":
        return {
            "success": False,
            "status": "approval_denied",
            "stage": "awaiting_approval",
            "approval": approval,
            "error": f"Approval request '{approval_id}' was denied by operator"
        }

    if status == "executed":
        return {
            "success": False,
            "status": "already_executed",
            "stage": "executing",
            "approval": approval,
            "error": f"Approval request '{approval_id}' has already been executed"
        }

    if status != "approved":
        return {
            "success": False,
            "status": "error",
            "stage": "awaiting_approval",
            "approval": approval,
            "error": f"Approval request '{approval_id}' has invalid status: {status}"
        }

    # Retrieve recovery context
    session = RECOVERY_SESSIONS.pop(approval_id, None)
    if session:
        demo_mode = session.get("demo_mode", False)
        attempt = session.get("attempt", 1)
        max_attempts = session.get("max_attempts", MAX_RECOVERY_ATTEMPTS)
        attempts = session.get("attempts", [])
    else:
        # Graceful fallback if session was not in memory
        demo_mode = False
        attempt = 1
        max_attempts = MAX_RECOVERY_ATTEMPTS
        attempts = []

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

    if not execution_result.get("success"):
        attempt_record["stage"] = "failed"
        return {
            "success": False,
            "status": "execution_failed",
            "stage": "executing",
            "error": execution_result.get("error", "Approved execution failed"),
            "execution": execution_result,
            "attempts": attempts
        }

    # Verify recovery
    attempt_record["stage"] = "verifying"
    print("[SentinelOps] Verifying recovery post-execution...")
    verification = verify_recovery_status()
    attempt_record["verification"] = verification
    print(f"[SentinelOps] Post-execution verification: {verification.get('status')}")

    if verification.get("verified"):
        attempt_record["stage"] = "recovered"
        print("[SentinelOps] Service successfully recovered!")
        return {
            "success": True,
            "status": "recovered",
            "stage": "recovered",
            "total_attempts": attempt,
            "final_verification": verification,
            "attempts": attempts
        }

    # Verification failed: Trigger adaptive recovery
    attempt_record["stage"] = "adaptation_required"
    print(f"[SentinelOps] Verification failed on attempt {attempt}. Adapting...")

    if attempt < max_attempts:
        return _run_recovery_loop(
            start_attempt=attempt + 1,
            max_attempts=max_attempts,
            demo_mode=demo_mode,
            attempts=attempts
        )

    return {
        "success": False,
        "status": "recovery_failed",
        "stage": "failed",
        "error": f"Exceeded maximum recovery attempts ({max_attempts})",
        "total_attempts": attempt,
        "attempts": attempts
    }


# Convenience alias for Member 3
continue_after_approval = continue_recovery


def get_recovery_session(approval_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve active session state for a pending approval."""
    return RECOVERY_SESSIONS.get(approval_id)


def list_recovery_sessions() -> Dict[str, Any]:
    """List all pending recovery sessions."""
    return dict(RECOVERY_SESSIONS)
