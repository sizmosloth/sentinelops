from typing import Protocol, Dict, Literal, Any
from backend.schemas.actions import ToolRequest, ToolResult, ActionProposal

class ToolExecutor(Protocol):
    def execute(self, request: ToolRequest) -> ToolResult:
        ...

class SafetyGate(Protocol):
    def check(self, proposal: ActionProposal) -> Dict[str, Any]:
        """
        Returns a dictionary with at least two keys:
        - "decision": Literal["allow", "require_approval", "deny"]
        - "reason": str
        """
        ...
