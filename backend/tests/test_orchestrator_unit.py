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

    @patch("backend.orchestrator.orchestrator.diagnose")
    @patch("backend.orchestrator.orchestrator.create_remediation")
    @patch("backend.orchestrator.orchestrator.execute_action")
    def test_database_stopped_flow(self, mock_exec, mock_remed, mock_diag):
        mock_diag.return_value = {
            "success": True,
            "diagnosis": "database_down",
            "evidence": {"demo-db": {"status": "exited"}}
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
                "id": "approval-db",
                "tool": "restart_container",
                "target": "demo-db",
                "risk": "medium",
                "reason": "Database is down",
                "status": "pending",
                "incident_id": "INC-001"
            }
        }

        result = run_recovery()

        self.assertFalse(result["success"])
        self.assertEqual(result["status"], "approval_required")
        self.assertEqual(result["stage"], "awaiting_approval")
        self.assertEqual(result["remediation"]["target"], "demo-db")
        self.assertEqual(result["approval"]["risk"], "medium")
        self.assertTrue(result["incident_id"].startswith("INC-"))
        self.assertTrue(len(result["timeline"]) > 0)

    @patch("backend.orchestrator.orchestrator.diagnose")
    @patch("backend.orchestrator.orchestrator.create_remediation")
    @patch("backend.orchestrator.orchestrator.execute_action")
    def test_api_stopped_flow(self, mock_exec, mock_remed, mock_diag):
        mock_diag.return_value = {
            "success": True,
            "diagnosis": "api_or_dependency_failure",
            "evidence": {"demo-api": {"status": "exited"}}
        }
        mock_remed.return_value = {
            "success": True,
            "tool": "restart_container",
            "target": "demo-api",
            "reason": "API container stopped"
        }
        mock_exec.return_value = {
            "success": False,
            "stage": "approval",
            "decision": "approval_required",
            "risk": "medium",
            "approval": {
                "id": "approval-api",
                "tool": "restart_container",
                "target": "demo-api",
                "risk": "medium",
                "status": "pending"
            }
        }

        result = run_recovery()

        self.assertFalse(result["success"])
        self.assertEqual(result["status"], "approval_required")
        self.assertEqual(result["remediation"]["target"], "demo-api")

    @patch("backend.orchestrator.orchestrator.diagnose")
    @patch("backend.orchestrator.orchestrator.create_remediation")
    @patch("backend.orchestrator.orchestrator.handle_execution")
    @patch("backend.orchestrator.orchestrator.verify_recovery_status")
    def test_verification_failure_exceeds_max_attempts(
        self, mock_verify, mock_handle_exec, mock_remed, mock_diag
    ):
        mock_diag.return_value = {
            "success": True,
            "diagnosis": "database_down",
            "evidence": {}
        }
        mock_remed.return_value = {
            "success": True,
            "tool": "restart_container",
            "target": "demo-db",
            "reason": "Restart db"
        }
        mock_handle_exec.return_value = {
            "success": True,
            "stage": "execution",
            "decision": "allow",
            "result": {"success": True}
        }
        mock_verify.return_value = {
            "success": True,
            "verified": False,
            "status": "still_unhealthy"
        }

        result = run_recovery(max_attempts=2)

        self.assertFalse(result["success"])
        self.assertEqual(result["status"], "recovery_failed")
        self.assertEqual(result["total_attempts"], 2)
        self.assertEqual(result["current_stage"], "FAILED")

    @patch("backend.orchestrator.orchestrator.diagnose")
    @patch("backend.orchestrator.orchestrator.create_remediation")
    def test_unknown_tool_safety_denial(self, mock_remed, mock_diag):
        mock_diag.return_value = {
            "success": True,
            "diagnosis": "database_down",
            "evidence": {}
        }
        mock_remed.return_value = {
            "success": True,
            "tool": "arbitrary_bash_command",
            "target": "demo-db",
            "reason": "Try unsafe command"
        }

        result = run_recovery()

        self.assertFalse(result["success"])
        self.assertEqual(result["status"], "safety_denied")
        self.assertEqual(result["current_stage"], "BLOCKED")
        self.assertIn("Tool is not allowed", result["error"])

    @patch("backend.orchestrator.orchestrator.diagnose")
    @patch("backend.orchestrator.orchestrator.create_remediation")
    def test_unauthorized_target_safety_denial(self, mock_remed, mock_diag):
        mock_diag.return_value = {
            "success": True,
            "diagnosis": "database_down",
            "evidence": {}
        }
        mock_remed.return_value = {
            "success": True,
            "tool": "restart_container",
            "target": "production-db-unauthorized",
            "reason": "Try modifying unmanaged resource"
        }

        result = run_recovery()

        self.assertFalse(result["success"])
        self.assertEqual(result["status"], "safety_denied")
        self.assertEqual(result["current_stage"], "BLOCKED")
        self.assertIn("Target container is not allowed", result["error"])

    @patch("backend.orchestrator.orchestrator.diagnose")
    def test_timeline_recording(self, mock_diag):
        mock_diag.return_value = {
            "success": True,
            "diagnosis": "service_healthy",
            "evidence": {}
        }

        result = run_recovery()

        timeline = result.get("timeline", [])
        self.assertTrue(len(timeline) >= 2)
        stages = [event["stage"] for event in timeline]
        self.assertIn("IDLE", stages)
        self.assertIn("RECOVERED", stages)
        for event in timeline:
            self.assertIn("timestamp", event)
            self.assertIn("message", event)

    @patch("backend.orchestrator.orchestrator.diagnose")
    @patch("backend.orchestrator.orchestrator.create_remediation")
    @patch("backend.orchestrator.orchestrator.execute_approved_action")
    @patch("backend.orchestrator.orchestrator.verify_recovery_status")
    def test_member3_interfaces(self, mock_verify, mock_exec_approved, mock_remed, mock_diag):
        from backend.orchestrator.orchestrator import (
            start_recovery,
            get_incident,
            get_incident_timeline,
            list_incidents,
            get_approvals,
            resume_recovery
        )

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

        # 1. Start recovery
        res = start_recovery()
        inc_id = res["incident_id"]
        app_id = res["approval"]["id"]

        # 2. Get incident and timeline
        incident = get_incident(inc_id)
        self.assertIsNotNone(incident)
        self.assertEqual(incident["incident_id"], inc_id)

        timeline = get_incident_timeline(inc_id)
        self.assertTrue(len(timeline) > 0)

        # 3. List incidents
        all_incidents = list_incidents()
        self.assertTrue(any(i["incident_id"] == inc_id for i in all_incidents))

        # 4. Approvals & Approve Action
        approvals = get_approvals(status="pending")
        self.assertTrue(any(a["id"] == app_id for a in approvals))

        approve_action(app_id)

        # 5. Resume recovery
        mock_exec_approved.return_value = {
            "success": True,
            "stage": "execution",
            "decision": "approved",
            "approval_id": app_id,
            "result": {"success": True}
        }
        mock_verify.return_value = {
            "success": True,
            "verified": True,
            "status": "recovered"
        }

        resume_res = resume_recovery(app_id)
        self.assertTrue(resume_res["success"])
        self.assertEqual(resume_res["status"], "recovered")

    def test_safety_gate_tool_decisions(self):
        from backend.safety.gate import check_action
        from backend.safety.risk import get_risk

        # Low risk tools: auto-allowed
        for tool in ["container_status", "container_health"]:
            res = check_action(tool, target="demo-api")
            self.assertTrue(res["allowed"])
            self.assertEqual(res["decision"], "allow")
            self.assertEqual(res["risk"], "low")

        for tool in ["health_check", "port_check", "http_check", "database_health"]:
            res = check_action(tool)
            self.assertTrue(res["allowed"])
            self.assertEqual(res["decision"], "allow")
            self.assertEqual(res["risk"], "low")

        # Medium risk tool: requires approval
        restart_res = check_action("restart_container", target="demo-db")
        self.assertFalse(restart_res["allowed"])
        self.assertEqual(restart_res["decision"], "approval_required")
        self.assertEqual(restart_res["risk"], "medium")

        # High risk / unlisted tool: denied
        denied_res = check_action("arbitrary_bash", target="demo-db")
        self.assertFalse(denied_res["allowed"])
        self.assertEqual(denied_res["decision"], "deny")
        self.assertEqual(get_risk("arbitrary_bash"), "high")

    @patch("backend.orchestrator.orchestrator.get_tool")
    def test_collect_evidence_structure(self, mock_get_tool):
        from backend.orchestrator.orchestrator import collect_evidence

        mock_tool = MagicMock()
        mock_tool.return_value = {"success": True, "healthy": True}
        mock_get_tool.return_value = mock_tool

        evidence = collect_evidence()
        self.assertIn("health", evidence)
        self.assertIn("demo-api", evidence)
        self.assertIn("demo-db", evidence)
        self.assertIn("demo-api_health", evidence)
        self.assertIn("demo-db_health", evidence)


if __name__ == "__main__":
    unittest.main()


