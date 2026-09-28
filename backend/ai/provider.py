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
            return schema(diagnosis="Mock diagnosis", confidence=0.9, evidence=["Log"])
        elif name == "ActionProposal":
            return schema(tool="mock_tool", target="mock_target", reason="mock_reason", risk=RiskLevel.low)
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
