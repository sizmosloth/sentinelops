from backend.agents.base import BaseAgent
from backend.schemas.incident import Plan
from backend.ai.provider import MockProvider

PLANNER_SYSTEM_PROMPT = """You are a planning agent. Create a plan for the following goal.
Your step selection is strictly constrained to the following:
check_api_health, inspect_logs, identify_dependency, propose_remediation, verify_recovery."""

class PlannerAgent(BaseAgent):
    @property
    def name(self) -> str:
        return "planner"

    def run(self, goal: str) -> Plan:
        user_prompt = f"Goal: {goal}"
        if isinstance(self.provider, MockProvider):
            system_prompt = "You are a planning agent. Create a plan for the following goal."
            return self.provider.generate_json(system_prompt, user_prompt, Plan)
        
        return self.provider.generate_json(PLANNER_SYSTEM_PROMPT, user_prompt, Plan)
