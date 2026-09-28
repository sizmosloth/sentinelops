import pytest
from backend.orchestrator.mock_tools import MockToolExecutor
from backend.schemas.actions import ToolRequest

def test_initial_state_is_unhealthy():
    executor = MockToolExecutor()
    
    req_health = ToolRequest(tool="check_health", target="demo-api")
    res_health = executor.execute(req_health)
    assert res_health.success is True
    assert res_health.data["status_code"] == 503
    assert res_health.data["healthy"] is False

    req_status = ToolRequest(tool="container_status", target="demo-db")
    res_status = executor.execute(req_status)
    assert res_status.success is True
    assert res_status.data["status"] == "stopped"

    req_logs = ToolRequest(tool="read_logs", target="demo-api")
    res_logs = executor.execute(req_logs)
    assert res_logs.success is True
    assert "database connection refused" in res_logs.data["logs"]


def test_restart_db_fixes_health():
    executor = MockToolExecutor()
    
    req_restart = ToolRequest(tool="restart_container", target="demo-db")
    res_restart = executor.execute(req_restart)
    assert res_restart.success is True
    
    req_health = ToolRequest(tool="check_health", target="demo-api")
    res_health = executor.execute(req_health)
    assert res_health.success is True
    assert res_health.data["status_code"] == 200
    assert res_health.data["healthy"] is True

    req_status = ToolRequest(tool="container_status", target="demo-db")
    res_status = executor.execute(req_status)
    assert res_status.success is True
    assert res_status.data["status"] == "running"


def test_restart_api_does_not_fix_health():
    executor = MockToolExecutor()
    
    req_restart = ToolRequest(tool="restart_container", target="demo-api")
    res_restart = executor.execute(req_restart)
    assert res_restart.success is True
    
    req_health = ToolRequest(tool="check_health", target="demo-api")
    res_health = executor.execute(req_health)
    assert res_health.success is True
    assert res_health.data["status_code"] == 503
    assert res_health.data["healthy"] is False


def test_unknown_tool_fails():
    executor = MockToolExecutor()
    
    req = ToolRequest(tool="format_c_drive", target="windows")
    res = executor.execute(req)
    assert res.success is False
    assert "Unknown tool" in res.error


def test_known_tool_unknown_target_fails():
    executor = MockToolExecutor()
    
    req = ToolRequest(tool="check_health", target="unknown-app")
    res = executor.execute(req)
    assert res.success is False
    assert "Unknown target" in res.error


def test_calls_recorded_in_order():
    executor = MockToolExecutor()
    
    req1 = ToolRequest(tool="check_health", target="demo-api")
    req2 = ToolRequest(tool="restart_container", target="demo-db")
    
    executor.execute(req1)
    executor.execute(req2)
    
    assert len(executor.calls) == 2
    assert executor.calls[0] == req1
    assert executor.calls[1] == req2


def test_reset():
    executor = MockToolExecutor()
    executor.execute(ToolRequest(tool="restart_container", target="demo-db"))
    
    assert executor.db_running is True
    assert len(executor.calls) == 1
    
    executor.reset()
    assert executor.db_running is False
    assert len(executor.calls) == 0
