from backend.agents.base import BaseAgent
from backend.schemas.incident import VerificationResult
from backend.schemas.actions import ToolRequest
from backend.ai.provider import MockProvider

VERIFICATION_SYSTEM_PROMPT = """You are a verification agent. Create a verification message.
Check recovery based on the evidence provided. Let the Python engine calculate final success.
You must only generate the user-facing message and cite the evidence."""

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

        user_prompt = f"Verification check run. Status code was {status_code}."
        
        if isinstance(self.provider, MockProvider):
            system_prompt = "You are a verification agent. Create a verification message."
            result: VerificationResult = self.provider.generate_json(system_prompt, user_prompt, VerificationResult)
        else:
            result: VerificationResult = self.provider.generate_json(VERIFICATION_SYSTEM_PROMPT, user_prompt, VerificationResult)
            
        result.success = success
        if not success and status_code is not None:
            result.evidence.append(f"Status code: {status_code}")
            
        return result
