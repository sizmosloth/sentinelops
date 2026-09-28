import unittest
from unittest.mock import patch, MagicMock

from backend.orchestrator.orchestrator import (
    run_recovery,
    continue_recovery,
    continue_after_approval,
    run_diagnosis,
    plan_remediation,
    handle_execution,
    verify_recovery_status,
    RECOVERY_SESSIONS
)
from backend.safety.permissions import APPROVALS, approve_action, deny_action


class TestOrchestratorUnit(unittest.TestCase):

    def setUp(self):
        RECOVERY_SESSIONS.clear()
        APPROVALS.clear()

    @patch("backend.orchestrator.orchestrator.diagnose")
    def test_already_healthy_flow(self, mock_diagnose):
        mock_diagnose.return_value = {
            "success": True,
            "diagnosis": "service_healthy",
            "evidence": {"health": {"healthy": True}}
        }

        result = run_recovery()

        self.assertTrue(result["success"])
        self.assertEqual(result["status"], "already_healthy")
        self.assertEqual(result["stage"], "already_healthy")
        self.assertEqual(len(result["attempts"]), 1)
        self.assertEqual(result["attempts"][0]["stage"], "already_healthy")

    @patch("backend.orchestrator.orchestrator.diagnose")
    @patch("backend.orchestrator.orchestrator.create_remediation")
    @patch("backend.orchestrator.orchestrator.execute_action")
    def test_approval_required_flow(self, mock_exec, mock_remed, mock_diag):
        mock_diag.return_value = {
            "success": True,
            "diagnosis": "database_down",
            "evidence": {}
        }
        mock_remed.return_value = {
            "success": True,
            "tool": "restart_container",
            "target": "demo-db",
            "reason": "Database is down"
        }
        mock_exec.return_value = {
            "success": False,
            "stage": "approval",
            "decision": "approval_required",
            "risk": "medium",
            "approval": {
                "id": "approval-1",
                "tool": "restart_container",
                "target": "demo-db",
                "reason": "Database is down",
                "status": "pending"
            }
        }

        result = run_recovery()

        self.assertFalse(result["success"])
        self.assertEqual(result["status"], "approval_required")
        self.assertEqual(result["stage"], "awaiting_approval")
        self.assertEqual(result["approval"]["id"], "approval-1")
        self.assertIn("approval-1", RECOVERY_SESSIONS)

    @patch("backend.orchestrator.orchestrator.diagnose")
    @patch("backend.orchestrator.orchestrator.create_remediation")
    @patch("backend.orchestrator.orchestrator.execute_action")
    def test_safety_denied_flow(self, mock_exec, mock_remed, mock_diag):
        mock_diag.return_value = {
            "success": True,
            "diagnosis": "database_down",
            "evidence": {}
        }
        mock_remed.return_value = {
            "success": True,
            "tool": "malicious_tool",
            "target": "demo-db",
            "reason": "Unknown"
        }
        mock_exec.return_value = {
            "success": False,
            "stage": "execution",
            "decision": "deny",
            "error": "Action is denied by safety policy"
        }

        result = run_recovery()

        self.assertFalse(result["success"])
        self.assertEqual(result["status"], "safety_denied")
        self.assertEqual(result["stage"], "executing")

    def test_continue_recovery_nonexistent_approval(self):
        result = continue_recovery("approval-999")
        self.assertFalse(result["success"])
        self.assertEqual(result["status"], "error")
        self.assertIn("not found", result["error"])

    def test_continue_recovery_pending_approval(self):
        APPROVALS["approval-test"] = {
            "id": "approval-test",
            "tool": "restart_container",
            "target": "demo-db",
            "status": "pending"
        }
        result = continue_recovery("approval-test")
        self.assertFalse(result["success"])
        self.assertEqual(result["status"], "approval_pending")

    def test_continue_recovery_denied_approval(self):
        APPROVALS["approval-test"] = {
            "id": "approval-test",
            "tool": "restart_container",
            "target": "demo-db",
            "status": "denied"
        }
        result = continue_recovery("approval-test")
        self.assertFalse(result["success"])
        self.assertEqual(result["status"], "approval_denied")

    @patch("backend.orchestrator.orchestrator.execute_approved_action")
    @patch("backend.orchestrator.orchestrator.verify_recovery_status")
    def test_continue_recovery_success(self, mock_verify, mock_exec_approved):
        approval_id = "approval-1"
        APPROVALS[approval_id] = {
            "id": approval_id,
            "tool": "restart_container",
            "target": "demo-db",
            "reason": "Database is down",
            "status": "approved"
        }
        RECOVERY_SESSIONS[approval_id] = {
            "approval_id": approval_id,
            "demo_mode": False,
            "attempt": 1,
            "max_attempts": 3,
            "attempts": [
                {
                    "attempt": 1,
                    "stage": "awaiting_approval",
                    "diagnosis": {"diagnosis": "database_down"},
                    "remediation": {"tool": "restart_container", "target": "demo-db"},
                    "execution": None,
                    "verification": None
                }
            ]
        }
        mock_exec_approved.return_value = {
            "success": True,
            "stage": "execution",
            "decision": "approved",
            "approval_id": approval_id,
            "result": {"success": True}
        }
        mock_verify.return_value = {
            "success": True,
            "verified": True,
            "status": "recovered",
            "evidence": {"health": {"healthy": True}}
        }

        result = continue_recovery(approval_id)

        self.assertTrue(result["success"])
        self.assertEqual(result["status"], "recovered")
        self.assertEqual(result["stage"], "recovered")
        self.assertEqual(len(result["attempts"]), 1)
        self.assertTrue(result["final_verification"]["verified"])
        self.assertNotIn(approval_id, RECOVERY_SESSIONS)

    @patch("backend.orchestrator.orchestrator.execute_approved_action")
    @patch("backend.orchestrator.orchestrator.verify_recovery_status")
    @patch("backend.orchestrator.orchestrator.run_diagnosis")
    @patch("backend.orchestrator.orchestrator.plan_remediation")
    @patch("backend.orchestrator.orchestrator.handle_execution")
    def test_adaptive_recovery_demo_mode_loop(
        self, mock_handle_exec, mock_plan_remed, mock_run_diag, mock_verify, mock_exec_approved
    ):
        # Attempt 1 approval is approved
        app1_id = "approval-1"
        APPROVALS[app1_id] = {
            "id": app1_id,
            "tool": "restart_container",
            "target": "demo-api",
            "status": "approved"
        }
        RECOVERY_SESSIONS[app1_id] = {
            "approval_id": app1_id,
            "demo_mode": True,
            "attempt": 1,
            "max_attempts": 3,
            "attempts": [
                {
                    "attempt": 1,
                    "stage": "awaiting_approval",
                    "diagnosis": {"diagnosis": "database_down"},
                    "remediation": {"tool": "restart_container", "target": "demo-api"},
                    "execution": None,
                    "verification": None
                }
            ]
        }
        # Attempt 1 action executes
        mock_exec_approved.return_value = {
            "success": True,
            "stage": "execution",
            "decision": "approved",
            "result": {"success": True}
        }
        # Attempt 1 verification FAILS
        mock_verify.return_value = {
            "success": True,
            "verified": False,
            "status": "still_unhealthy"
        }

        # Attempt 2: Re-diagnosis runs
        mock_run_diag.return_value = {
            "success": True,
            "diagnosis": "database_down",
            "evidence": {}
        }
        # Attempt 2: Remediation plans demo-db
        mock_plan_remed.return_value = {
            "success": True,
            "tool": "restart_container",
            "target": "demo-db",
            "reason": "Database is down"
        }
        # Attempt 2: Execution requires approval-2
        mock_handle_exec.return_value = {
            "success": False,
            "stage": "approval",
            "decision": "approval_required",
            "risk": "medium",
            "approval": {
                "id": "approval-2",
                "tool": "restart_container",
                "target": "demo-db",
                "status": "pending"
            }
        }

        res = continue_recovery(app1_id)

        # Should pause at attempt 2 awaiting approval-2
        self.assertFalse(res["success"])
        self.assertEqual(res["status"], "approval_required")
        self.assertEqual(res["attempt"], 2)
        self.assertEqual(res["approval"]["id"], "approval-2")
        self.assertIn("approval-2", RECOVERY_SESSIONS)
        self.assertEqual(len(res["attempts"]), 2)
        self.assertFalse(res["attempts"][0]["verification"]["verified"])


if __name__ == "__main__":
    unittest.main()
