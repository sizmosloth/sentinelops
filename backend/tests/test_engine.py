import pytest
from backend.ai.provider import MockProvider
from backend.orchestrator.mock_tools import MockToolExecutor
from backend.orchestrator.engine import Orchestrator
from backend.schemas.incident import IncidentStatus
from backend.schemas.actions import ActionProposal, ToolResult

def test_engine_resolved_in_1_attempt():
    provider = MockProvider()
    executor = MockToolExecutor()
    engine = Orchestrator(provider, executor)
    
    incident = engine.run("Fix it")
    
    assert incident.status == IncidentStatus.RESOLVED
    assert incident.attempt == 1
    restarts = [c for c in executor.calls if c.tool == "restart_container" and c.target == "demo-db"]
    assert len(restarts) > 0

def test_engine_emits_agent_events():
    provider = MockProvider()
    executor = MockToolExecutor()
    engine = Orchestrator(provider, executor)
    
    events = []
    engine.subscribe(lambda e: events.append(e))
    engine.run("Fix it")
    
    agents_run = {e.agent for e in events if e.agent != "orchestrator"}
    assert {"planner", "diagnostic", "remediation", "verification"}.issubset(agents_run)

def test_engine_escalated_after_max_attempts():
    class AlwaysFailExecutor(MockToolExecutor):
        def execute(self, request):
            super().execute(request)
            if request.tool == "check_health":
                return ToolResult(success=True, target=request.target, data={"healthy": False, "status_code": 503})
            return ToolResult(success=True, target=request.target, data={})
            
    class UniqueProvider(MockProvider):
        def __init__(self):
            self.counter = 0
            
        def generate_json(self, system_prompt, user_prompt, schema):
            if schema.__name__ == "ActionProposal":
                from backend.schemas.actions import RiskLevel
                self.counter += 1
                return schema(tool="restart_container", target=f"demo-db-{self.counter}", reason="mock", risk=RiskLevel.medium)
            return super().generate_json(system_prompt, user_prompt, schema)
            
    provider = UniqueProvider()
    executor = AlwaysFailExecutor()
    engine = Orchestrator(provider, executor, max_attempts=3)
    
    incident = engine.run("Fail me")
    
    assert incident.status == IncidentStatus.ESCALATED
    assert incident.attempt == 3

def test_engine_safety_gate_always_denies():
    class DenyGate:
        def check(self, proposal: ActionProposal):
            return {"decision": "deny", "reason": "No way"}
            
    provider = MockProvider()
    executor = MockToolExecutor()
    engine = Orchestrator(provider, executor, safety_gate=DenyGate())
    
    incident = engine.run("Fix it")
    
    assert incident.status == IncidentStatus.ESCALATED
    restarts = [c for c in executor.calls if c.tool == "restart_container"]
    assert len(restarts) == 0

def test_engine_safety_gate_require_approval():
    class ApprovalGate:
        def check(self, proposal: ActionProposal):
            return {"decision": "require_approval", "reason": "Please check"}
            
    provider = MockProvider()
    executor = MockToolExecutor()
    engine = Orchestrator(provider, executor, safety_gate=ApprovalGate())
    
    incident = engine.run("Fix it")
    
    assert incident.status == IncidentStatus.RESOLVED
    statuses = [h["status"] for h in incident.history]
    assert IncidentStatus.WAITING_APPROVAL.value in statuses
