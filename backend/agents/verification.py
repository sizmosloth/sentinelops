from backend.agents.base import BaseAgent
from backend.schemas.incident import VerificationResult
from backend.schemas.actions import ToolRequest

class VerificationAgent(BaseAgent):
    @property
    def name(self) -> str:
        return "verification"

    def run(self, context: dict) -> VerificationResult:
        success = False
        status_code = None
        
        if self.executor:
            req = ToolRequest(tool="check_health", target="demo-api")
            res = self.executor.execute(req)
            is_healthy = res.data.get("healthy", False)
            status_code = res.data.get("status_code", 500)
            if is_healthy and status_code == 200:
                success = True

        system_prompt = "You are a verification agent. Create a verification message."
        user_prompt = f"Verification check run. Status code was {status_code}."
        
        result: VerificationResult = self.provider.generate_json(system_prompt, user_prompt, VerificationResult)
        result.success = success
        if not success and status_code is not None:
            result.evidence.append(f"Status code: {status_code}")
            
        return result
