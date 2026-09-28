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

class ApiFirstProvider(MockProvider):
    def generate_json(self, system_prompt: str, user_prompt: str, schema):
        if schema.__name__ == "Diagnosis":
            diag = super().generate_json(system_prompt, user_prompt, schema)
            diag.diagnosis = "SCENARIO: api_first " + diag.diagnosis
            return diag
        return super().generate_json(system_prompt, user_prompt, schema)

class AlwaysFailExecutor(MockToolExecutor):
    def execute(self, request):
        res = super().execute(request)
        if request.tool == "check_health":
            return ToolResult(success=True, target=request.target, data={"healthy": False, "status_code": 503})
        return res

def print_history(events, executor, incident):
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
                    break
                else:
                    break
                record_idx += 1
                
        elif e.agent == "orchestrator" and "FAILED -> RE_DIAGNOSING" in e.message:
            print("[ORCHESTRATOR] Engine looping: FAILED -> RE_DIAGNOSING")

    print("==================================")
    print(f"INCIDENT {incident.status.value}")
    print("==================================")
    if incident.status != IncidentStatus.RESOLVED:
        print("Incident History:")
        for h in incident.history:
            print(f"  Attempt {h.get('attempt')}: {h.get('status')}")

def run_api_first():
    print("\n==================================")
    print("       SCENARIO: API FIRST")
    print("==================================")
    provider = ApiFirstProvider()
    base_executor = MockToolExecutor() 
    executor = RecordingExecutor(base_executor)
    engine = Orchestrator(provider, executor)
    
    events = []
    engine.subscribe(lambda e: events.append(e))
    
    incident = engine.run("Recover demo API")
    print_history(events, executor, incident)
    
    assert incident.status == IncidentStatus.RESOLVED, f"Status was {incident.status}"
    assert incident.attempt == 2, f"Attempt was {incident.attempt}"
    
    restarts = [req for req, res in executor.records if req.tool == "restart_container"]
    assert len(restarts) == 2, f"Expected 2 restarts, got {len(restarts)}"
    assert restarts[0].target == "demo-api", f"First restart target was {restarts[0].target}"
    assert restarts[1].target == "demo-db", f"Second restart target was {restarts[1].target}"
    
    messages = [e.message for e in events if e.agent == "orchestrator"]
    assert "VERIFYING -> FAILED" in messages, "No VERIFYING -> FAILED transition"
    assert "FAILED -> RE_DIAGNOSING" in messages, "No FAILED -> RE_DIAGNOSING transition"

def run_always_fail():
    print("\n==================================")
    print("      SCENARIO: ALWAYS FAIL")
    print("==================================")
    provider = ApiFirstProvider()
    base_executor = AlwaysFailExecutor()
    executor = RecordingExecutor(base_executor)
    engine = Orchestrator(provider, executor)
    
    events = []
    engine.subscribe(lambda e: events.append(e))
    
    incident = engine.run("Recover demo API")
    print_history(events, executor, incident)
    
    assert incident.status == IncidentStatus.ESCALATED, f"Status was {incident.status}"
    
    restarts = [req for req, res in executor.records if req.tool == "restart_container"]
    assert len(restarts) == 2, f"Expected 2 restarts executed, got {len(restarts)}"
    targets = [req.target for req in restarts]
    assert len(set(targets)) == len(targets), "Repeated tool/target execution"

def main():
    try:
        run_api_first()
        run_always_fail()
    except AssertionError as e:
        print(f"Assertion failed: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
    
    sys.exit(0)

if __name__ == "__main__":
    main()
