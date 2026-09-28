import os
from typing import Callable, List, Tuple
from backend.ai.provider import AIProvider, AIProviderError
from backend.orchestrator.interfaces import ToolExecutor, SafetyGate
from backend.schemas.incident import Incident, IncidentStatus
from backend.schemas.actions import ActionProposal, ToolRequest, AgentEvent, AgentState
from backend.orchestrator.state import IncidentStateMachine
from backend.agents.planner import PlannerAgent
from backend.agents.diagnostic import DiagnosticAgent
from backend.agents.remediation import RemediationAgent, RemediationError
from backend.agents.verification import VerificationAgent

class DefaultSafetyGate(SafetyGate):
    def check(self, proposal: ActionProposal) -> dict:
        return {"decision": "allow", "reason": ""}

class Orchestrator:
    def __init__(self, provider: AIProvider, tool_executor: ToolExecutor, safety_gate: SafetyGate = None, max_attempts: int = None):
        self.provider = provider
        self.tool_executor = tool_executor
        self.safety_gate = safety_gate or DefaultSafetyGate()
        if max_attempts is None:
            self.max_attempts = int(os.environ.get("MAX_ATTEMPTS", "3"))
        else:
            self.max_attempts = max_attempts
            
        self.subscribers: List[Callable[[AgentEvent], None]] = []
        
        self.planner = PlannerAgent(provider, tool_executor)
        self.diagnostic = DiagnosticAgent(provider, tool_executor)
        self.remediation = RemediationAgent(provider, tool_executor)
        self.verification = VerificationAgent(provider, tool_executor)

    def subscribe(self, callback: Callable[[AgentEvent], None]):
        self.subscribers.append(callback)

    def _emit(self, event: AgentEvent):
        for sub in self.subscribers:
            try:
                sub(event)
            except Exception:
                pass

    def run(self, goal: str) -> Incident:
        incident = Incident(
            goal=goal,
            status=IncidentStatus.CREATED,
            attempt=0,
            evidence=[],
            history=[]
        )
        
        sm = IncidentStateMachine(incident.id)
        for sub in self.subscribers:
            sm.subscribe(sub)
            
        def sync_state():
            incident.status = sm.status
            incident.history.append({"status": sm.status.value, "attempt": incident.attempt})
            
        def run_agent(agent, *args, **kwargs):
            self._emit(AgentEvent(
                incident_id=incident.id,
                agent=agent.name,
                message=f"Running {agent.name}",
                state=AgentState.RUNNING
            ))
            res = agent.run(*args, **kwargs)
            self._emit(AgentEvent(
                incident_id=incident.id,
                agent=agent.name,
                message=f"Completed {agent.name}",
                state=AgentState.COMPLETED
            ))
            return res
            
        try:
            sm.transition_to(IncidentStatus.PLANNING)
            sync_state()
            plan = run_agent(self.planner, goal)
            
            failed_actions: List[Tuple[str, str]] = []
            context = {"verification_evidence": []}
            
            for attempt in range(1, self.max_attempts + 1):
                incident.attempt = attempt
                
                if attempt == 1:
                    sm.transition_to(IncidentStatus.DIAGNOSING)
                else:
                    sm.transition_to(IncidentStatus.RE_DIAGNOSING)
                    sync_state()
                    sm.transition_to(IncidentStatus.DIAGNOSING)
                sync_state()
                
                diagnosis = run_agent(self.diagnostic, context)
                incident.diagnosis = diagnosis.diagnosis
                incident.evidence = diagnosis.evidence
                incident.root_cause = diagnosis.diagnosis
                
                sm.transition_to(IncidentStatus.ACTION_PROPOSED)
                sync_state()
                
                denials = 0
                proposal = None
                while True:
                    proposal = run_agent(self.remediation, diagnosis, failed_actions)
                    decision_dict = self.safety_gate.check(proposal)
                    decision = decision_dict.get("decision", "allow")
                    reason = decision_dict.get("reason", "")
                    
                    if decision == "allow":
                        break
                    elif decision == "require_approval":
                        sm.transition_to(IncidentStatus.WAITING_APPROVAL)
                        sync_state()
                        break
                    elif decision == "deny":
                        denials += 1
                        msg = f"Denied {proposal.tool} on {proposal.target}: {reason}"
                        context["verification_evidence"].append(msg)
                        diagnosis.diagnosis += f"\nSafety check denied {proposal.tool}: {reason}"
                        if denials >= 3:
                            sm.transition_to(IncidentStatus.ESCALATED)
                            sync_state()
                            return incident
                
                sm.transition_to(IncidentStatus.EXECUTING)
                sync_state()
                req = ToolRequest(tool=proposal.tool, target=proposal.target)
                self.tool_executor.execute(req)
                
                sm.transition_to(IncidentStatus.VERIFYING)
                sync_state()
                verification = run_agent(self.verification, context)
                
                if verification.success:
                    sm.transition_to(IncidentStatus.RESOLVED)
                    sync_state()
                    return incident
                else:
                    failed_actions.append((proposal.tool, proposal.target))
                    context["verification_evidence"].extend(verification.evidence)
                    sm.transition_to(IncidentStatus.FAILED)
                    sync_state()
            
            sm.transition_to(IncidentStatus.ESCALATED)
            sync_state()
            
        except (RemediationError, AIProviderError):
            if sm.status not in (IncidentStatus.ESCALATED, IncidentStatus.RESOLVED):
                sm.transition_to(IncidentStatus.ESCALATED)
                sync_state()
                
        return incident
