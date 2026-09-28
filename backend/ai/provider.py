import os
import re
from abc import ABC, abstractmethod
from typing import Type, TypeVar
from dotenv import load_dotenv

from pydantic import BaseModel
from backend.schemas.incident import Plan, Diagnosis, VerificationResult
from backend.schemas.actions import ActionProposal, RiskLevel

T = TypeVar('T', bound=BaseModel)


class AIProviderError(Exception):
    pass


def strip_json_fences(text: str) -> str:
    """Removes ```json and ``` markdown fences from the response text."""
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r'^```(?:json)?\s*', '', text, flags=re.IGNORECASE)
        text = re.sub(r'\s*```$', '', text)
    return text.strip()


class AIProvider(ABC):
    @abstractmethod
    def generate_json(self, system_prompt: str, user_prompt: str, schema: Type[T]) -> T:
        pass


class MockProvider(AIProvider):
    def generate_json(self, system_prompt: str, user_prompt: str, schema: Type[T]) -> T:
        name = schema.__name__
        if name == "Plan":
            return schema(goal="Mock Goal", strategy=["Step 1"])
        elif name == "Diagnosis":
            if "connection refused" in user_prompt.lower() or "stopped" in user_prompt.lower():
                return schema(diagnosis="database_unavailable", confidence=0.94, evidence=["mocked"])
            else:
                return schema(diagnosis="unknown_issue", confidence=0.5, evidence=["mocked"])
        elif name == "ActionProposal":
            if "SCENARIO: api_first" in user_prompt and "('restart_container', 'demo-api')" not in user_prompt:
                return schema(tool="restart_container", target="demo-api", reason="mock", risk=RiskLevel.medium)
            return schema(tool="restart_container", target="demo-db", reason="mock", risk=RiskLevel.medium)
        elif name == "VerificationResult":
            return schema(success=True, message="Mock success", evidence=["Test"])
        else:
            raise AIProviderError(f"MockProvider does not support schema {name}")


def get_provider() -> AIProvider:
    load_dotenv()
    provider_name = os.getenv("AI_PROVIDER", "").lower()
    
    if provider_name == "mock":
        return MockProvider()
    elif provider_name == "gemini":
        from backend.ai.gemini import GeminiProvider
        return GeminiProvider()
    elif provider_name == "ollama":
        from backend.ai.ollama import OllamaProvider
        return OllamaProvider()
    else:
        raise AIProviderError(f"Unknown or missing AI_PROVIDER: '{provider_name}'")
