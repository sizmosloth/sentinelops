from typing import Optional
from backend.ai.provider import AIProvider
from backend.orchestrator.interfaces import ToolExecutor

class BaseAgent:
    def __init__(self, provider: AIProvider, executor: Optional[ToolExecutor] = None):
        self.provider = provider
        self.executor = executor

    @property
    def name(self) -> str:
        raise NotImplementedError
