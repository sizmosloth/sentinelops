from backend.agents.base import BaseAgent
from backend.schemas.incident import Diagnosis
from backend.schemas.actions import ToolRequest

class DiagnosticAgent(BaseAgent):
    @property
    def name(self) -> str:
        return "diagnostic"

    def run(self, context: dict) -> Diagnosis:
        evidence = []
        if self.executor:
            req1 = ToolRequest(tool="check_health", target="demo-api")
            res1 = self.executor.execute(req1)
            is_healthy = res1.data.get("healthy", False)
            evidence.append(f"check_health demo-api: status {res1.data.get('status_code', 'unknown')}")

            if not is_healthy:
                req2 = ToolRequest(tool="read_logs", target="demo-api")
                res2 = self.executor.execute(req2)
                evidence.append(f"read_logs demo-api: {res2.data.get('logs', '')}")
            
            req3 = ToolRequest(tool="container_status", target="demo-db")
            res3 = self.executor.execute(req3)
            evidence.append(f"container_status demo-db: {res3.data.get('status', 'unknown')}")

        prev_evidence = context.get("verification_evidence", [])
        evidence.extend(prev_evidence)

        system_prompt = "You are a diagnostic agent. Based on the evidence provided, diagnose the issue."
        user_prompt = "Evidence collected:\n" + "\n".join(evidence)
        
        diagnosis: Diagnosis = self.provider.generate_json(system_prompt, user_prompt, Diagnosis)
        diagnosis.evidence = evidence
        return diagnosis
