from backend.agents.base import BaseAgent
from backend.schemas.incident import Plan

class PlannerAgent(BaseAgent):
    @property
    def name(self) -> str:
        return "planner"

    def run(self, goal: str) -> Plan:
        system_prompt = "You are a planning agent. Create a plan for the following goal."
        user_prompt = f"Goal: {goal}"
        return self.provider.generate_json(system_prompt, user_prompt, Plan)
