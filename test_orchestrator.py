import sys
from backend.ai.provider import MockProvider
from backend.orchestrator.mock_tools import MockToolExecutor
from backend.orchestrator.engine import Orchestrator
from backend.schemas.actions import AgentEvent, AgentState, ToolRequest, ToolResult
from backend.schemas.incident import IncidentStatus
from backend.orchestrator.interfaces import ToolExecutor

class RecordingExecutor(ToolExecutor):
    def __init__(self, inner: ToolExecutor):
        self.inner = inner
        self.records = []
        
    def execute(self, request: ToolRequest) -> ToolResult:
        result = self.inner.execute(request)
        self.records.append((request, result))
        return result

def main():
    provider = MockProvider()
    base_executor = MockToolExecutor()
    executor = RecordingExecutor(base_executor)
    engine = Orchestrator(provider, executor)
    
    events = []
    engine.subscribe(lambda e: events.append(e))
    
    print("==================================")
    print("       SENTINELOPS TEST")
    print("==================================")
    
    goal = "Recover demo API"
    print(f"Goal: {goal}")
    
    incident = engine.run(goal)
    
    record_idx = 0
    for e in events:
        if e.agent == "planner" and e.state == AgentState.COMPLETED:
            print("[PLANNER] Recovery plan created")
            
        elif e.agent == "diagnostic" and e.state == AgentState.COMPLETED:
            while record_idx < len(executor.records):
                req, res = executor.records[record_idx]
                if req.tool == "check_health":
                    is_healthy = res.data.get("healthy", False)
                    if not is_healthy:
                        print("[DIAGNOSTIC] API health: FAILED")
                elif req.tool == "read_logs":
                    print("[DIAGNOSTIC] Logs collected")
                elif req.tool == "container_status":
                    pass
                else:
                    break
                record_idx += 1
                
            if incident.diagnosis:
                diag_formatted = incident.diagnosis.replace("_", " ").capitalize()
                print(f"[DIAGNOSTIC] {diag_formatted}")
                
        elif e.agent == "verification" and e.state == AgentState.COMPLETED:
            while record_idx < len(executor.records):
                req, res = executor.records[record_idx]
                if req.tool == "restart_container":
                    print(f"[REMEDIATION] Proposed: {req.tool}({req.target})")
                elif req.tool == "check_health":
                    is_healthy = res.data.get("healthy", False)
                    status_code = res.data.get("status_code", None)
                    if is_healthy and status_code == 200:
                        print("[VERIFICATION] API health: PASSED")
                    else:
                        print("[VERIFICATION] API health: FAILED")
                record_idx += 1

    print("==================================")
    print(f"INCIDENT {incident.status.value}")
    print("==================================")
    
    if incident.status == IncidentStatus.RESOLVED:
        sys.exit(0)
    else:
        print("Incident History:")
        for h in incident.history:
            print(f"  Attempt {h.get('attempt')}: {h.get('status')}")
        sys.exit(1)

if __name__ == "__main__":
    main()
