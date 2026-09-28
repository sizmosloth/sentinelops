from typing import List, Tuple
from backend.agents.base import BaseAgent
from backend.schemas.actions import ActionProposal
from backend.schemas.incident import Diagnosis
from backend.ai.provider import MockProvider

REMEDIATION_SYSTEM_PROMPT = """You are a remediation agent. Propose an action to fix the diagnosed issue.
Select the safest tool available. Do not propose any action listed in the failed actions. Assign a risk level to the proposal."""

class RemediationError(Exception):
    pass

class RemediationAgent(BaseAgent):
    @property
    def name(self) -> str:
        return "remediation"

    def run(self, diagnosis: Diagnosis, failed_actions: List[Tuple[str, str]]) -> ActionProposal:
        base_user_prompt = f"Diagnosis: {diagnosis.diagnosis}\n"
        if failed_actions:
            base_user_prompt += f"Note: Do not propose any of these failed actions again: {failed_actions}\n"
            
        if isinstance(self.provider, MockProvider):
            sys_prompt = "You are a remediation agent. Propose an action to fix the diagnosed issue."
        else:
            sys_prompt = REMEDIATION_SYSTEM_PROMPT

        proposal = self.provider.generate_json(sys_prompt, base_user_prompt, ActionProposal)
        
        if (proposal.tool, proposal.target) in failed_actions:
            retry_user_prompt = base_user_prompt + f"\nWARNING: You proposed {(proposal.tool, proposal.target)} which failed before. Pick another."
            proposal = self.provider.generate_json(sys_prompt, retry_user_prompt, ActionProposal)
            if (proposal.tool, proposal.target) in failed_actions:
                raise RemediationError(f"Provider repeatedly proposed failed action {(proposal.tool, proposal.target)}")
                
        return proposal
