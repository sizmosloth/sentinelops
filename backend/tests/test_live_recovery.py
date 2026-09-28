"""
Live Integration Tests for SentinelOps Orchestrator and Docker Recovery Loop.
Requires running Docker demo containers: demo-api and demo-db.
"""

import unittest
import subprocess
import time
from backend.orchestrator.orchestrator import run_recovery, continue_recovery
from backend.safety.permissions import approve_action


class TestSentinelOpsLiveRecovery(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        # Ensure containers are running before starting
        subprocess.run(["docker", "start", "demo-api", "demo-db"], capture_output=True)
        time.sleep(2)

    def test_a_healthy_system(self):
        """Test A: Healthy system detects service_healthy and stops without remediation."""
        subprocess.run(["docker", "start", "demo-db"], capture_output=True)
        time.sleep(1.5)
        result = run_recovery()
        self.assertTrue(result["success"])
        self.assertEqual(result["status"], "already_healthy")
        self.assertEqual(result["diagnosis"]["diagnosis"], "service_healthy")

    def test_b_c_d_single_step_recovery(self):
        """Test B, C, D: Failure detection, safety approval gate, and recovery verification."""
        subprocess.run(["docker", "stop", "demo-db"], capture_output=True, check=True)
        time.sleep(1)

        # 1. Run recovery - expect approval_required
        res1 = run_recovery(demo_mode=False)
        self.assertFalse(res1["success"])
        self.assertEqual(res1["status"], "approval_required")
        self.assertEqual(res1["stage"], "awaiting_approval")
        self.assertEqual(res1["diagnosis"]["diagnosis"], "database_down")
        self.assertEqual(res1["remediation"]["target"], "demo-db")

        app_id = res1["approval"]["id"]

        # 2. Operator approval
        approve_action(app_id)

        # 3. Continuation & verification
        res2 = continue_recovery(app_id)
        self.assertTrue(res2["success"])
        self.assertEqual(res2["status"], "recovered")
        self.assertEqual(res2["stage"], "recovered")
        self.assertTrue(res2["final_verification"]["verified"])
        self.assertTrue(res2["final_verification"]["evidence"]["healthy"])

    def test_e_adaptive_recovery_demo_mode(self):
        """Test E: Demo mode failure on attempt 1, re-diagnosis, replanning, and recovery."""
        subprocess.run(["docker", "stop", "demo-db"], capture_output=True, check=True)
        time.sleep(1)

        # 1. Run recovery in demo mode
        res1 = run_recovery(demo_mode=True)
        self.assertEqual(res1["status"], "approval_required")
        self.assertEqual(res1["attempt"], 1)
        self.assertEqual(res1["remediation"]["target"], "demo-api")

        app1_id = res1["approval"]["id"]
        approve_action(app1_id)

        # 2. Continue attempt 1 -> fails verification -> re-diagnoses -> requests demo-db approval
        res2 = continue_recovery(app1_id)
        self.assertEqual(res2["status"], "approval_required")
        self.assertEqual(res2["attempt"], 2)
        self.assertEqual(res2["remediation"]["target"], "demo-db")

        app2_id = res2["approval"]["id"]
        approve_action(app2_id)

        # 3. Continue attempt 2 -> succeeds verification -> recovered
        res3 = continue_recovery(app2_id)
        self.assertTrue(res3["success"])
        self.assertEqual(res3["status"], "recovered")
        self.assertEqual(res3["total_attempts"], 2)
        self.assertFalse(res3["attempts"][0]["verification"]["verified"])
        self.assertTrue(res3["attempts"][1]["verification"]["verified"])


if __name__ == "__main__":
    unittest.main()
