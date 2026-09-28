import pytest
from backend.ai.provider import MockProvider
from backend.orchestrator.mock_tools import MockToolExecutor
from backend.agents.planner import PlannerAgent
from backend.agents.diagnostic import DiagnosticAgent
from backend.agents.remediation import RemediationAgent, RemediationError
from backend.agents.verification import VerificationAgent
from backend.schemas.incident import Diagnosis

def test_planner_agent():
    provider = MockProvider()
    planner = PlannerAgent(provider)
    assert planner.name == "planner"
    plan = planner.run("Fix the world")
    assert plan.goal == "Mock Goal"

def test_diagnostic_agent():
    provider = MockProvider()
    executor = MockToolExecutor() # db_running is False
    agent = DiagnosticAgent(provider, executor)
    assert agent.name == "diagnostic"
    
    diagnosis = agent.run({"verification_evidence": ["previous check failed"]})
    assert diagnosis.diagnosis == "database_unavailable"
    assert "check_health demo-api: status 503" in diagnosis.evidence
    assert "container_status demo-db: stopped" in diagnosis.evidence
    assert "read_logs demo-api: database connection refused" in diagnosis.evidence
    assert "previous check failed" in diagnosis.evidence

def test_remediation_agent():
    provider = MockProvider()
    agent = RemediationAgent(provider)
    assert agent.name == "remediation"
    
    diag = Diagnosis(diagnosis="database_unavailable", confidence=0.9, evidence=[])
    
    proposal = agent.run(diag, [])
    assert proposal.tool == "restart_container"
    assert proposal.target == "demo-db"
    
    diag_api = Diagnosis(diagnosis="SCENARIO: api_first", confidence=0.9, evidence=[])
    proposal2 = agent.run(diag_api, [])
    assert proposal2.tool == "restart_container"
    assert proposal2.target == "demo-api"
    
    with pytest.raises(RemediationError, match="repeatedly proposed"):
        agent.run(diag, [("restart_container", "demo-db")])

def test_verification_agent():
    provider = MockProvider()
    executor = MockToolExecutor()
    agent = VerificationAgent(provider, executor)
    assert agent.name == "verification"
    
    res1 = agent.run({})
    assert res1.success is False
    assert any("Status code: 503" in e for e in res1.evidence)
    
    executor.db_running = True
    res2 = agent.run({})
    assert res2.success is True

def test_diagnostic_evidence_has_raw_tool_strings():
    provider = MockProvider()
    executor = MockToolExecutor()
    agent = DiagnosticAgent(provider, executor)
    diagnosis = agent.run({})
    
    assert any("check_health demo-api" in e for e in diagnosis.evidence)
    assert any("503" in e for e in diagnosis.evidence)

def test_verification_success_is_decided_by_code():
    from backend.schemas.incident import VerificationResult
    class StubProvider(MockProvider):
        def generate_json(self, system_prompt, user_prompt, schema):
            return VerificationResult(success=True, message="Looks good", evidence=[])
            
    provider = StubProvider()
    executor = MockToolExecutor()
    agent = VerificationAgent(provider, executor)
    
    result = agent.run({})
    
    assert result.success is False
    assert any("503" in e for e in result.evidence)
