from typing import List
from backend.schemas.actions import ToolRequest, ToolResult
from backend.orchestrator.interfaces import ToolExecutor

class MockToolExecutor(ToolExecutor):
    def __init__(self) -> None:
        self.db_running: bool = False
        self.calls: List[ToolRequest] = []

    def reset(self) -> None:
        self.db_running = False
        self.calls.clear()

    def execute(self, request: ToolRequest) -> ToolResult:
        self.calls.append(request)
        tool = request.tool
        target = request.target

        if tool == "check_health":
            if target == "demo-api":
                if self.db_running:
                    return ToolResult(success=True, target=target, data={"status_code": 200, "healthy": True})
                else:
                    return ToolResult(success=True, target=target, data={"status_code": 503, "healthy": False})
            else:
                return ToolResult(success=False, target=target, data={}, error=f"Unknown target '{target}' for tool '{tool}'")

        elif tool == "read_logs":
            if target == "demo-api":
                if self.db_running:
                    return ToolResult(success=True, target=target, data={"logs": "API running smoothly. Database connection successful."})
                else:
                    return ToolResult(success=True, target=target, data={"logs": "database connection refused"})
            else:
                return ToolResult(success=False, target=target, data={}, error=f"Unknown target '{target}' for tool '{tool}'")

        elif tool == "container_status":
            if target == "demo-db":
                status = "running" if self.db_running else "stopped"
                return ToolResult(success=True, target=target, data={"status": status})
            else:
                return ToolResult(success=False, target=target, data={}, error=f"Unknown target '{target}' for tool '{tool}'")

        elif tool == "restart_container":
            if target == "demo-db":
                self.db_running = True
                return ToolResult(success=True, target=target, data={"message": "Container restarted successfully"})
            elif target == "demo-api":
                return ToolResult(success=True, target=target, data={"message": "Container restarted successfully"})
            else:
                return ToolResult(success=False, target=target, data={}, error=f"Unknown target '{target}' for tool '{tool}'")

        else:
            return ToolResult(success=False, target=target, data={}, error=f"Unknown tool '{tool}'")
