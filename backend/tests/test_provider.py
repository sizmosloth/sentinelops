import os
from unittest import mock
import pytest

from backend.ai.provider import (
    MockProvider, get_provider, AIProviderError, strip_json_fences
)
from backend.schemas.incident import Plan, Diagnosis, VerificationResult
from backend.schemas.actions import ActionProposal


def test_mock_provider_returns_valid_schemas():
    provider = MockProvider()
    
    plan = provider.generate_json("sys", "user", Plan)
    assert isinstance(plan, Plan)
    assert plan.goal == "Mock Goal"
    
    diagnosis = provider.generate_json("sys", "user", Diagnosis)
    assert isinstance(diagnosis, Diagnosis)
    
    action = provider.generate_json("sys", "user", ActionProposal)
    assert isinstance(action, ActionProposal)
    
    vr = provider.generate_json("sys", "user", VerificationResult)
    assert isinstance(vr, VerificationResult)


@mock.patch.dict(os.environ, {"AI_PROVIDER": "mock"})
def test_get_provider_mock():
    provider = get_provider()
    assert isinstance(provider, MockProvider)


@mock.patch.dict(os.environ, {"AI_PROVIDER": "unknown"})
def test_get_provider_unknown_raises():
    with pytest.raises(AIProviderError, match="Unknown or missing AI_PROVIDER"):
        get_provider()


def test_strip_json_fences():
    # Fenced JSON
    fenced = "```json\n{\"key\": \"value\"}\n```"
    assert strip_json_fences(fenced) == '{"key": "value"}'
    
    # Fenced without json keyword
    fenced2 = "```\n{\"key\": \"value\"}\n```"
    assert strip_json_fences(fenced2) == '{"key": "value"}'
    
    # Unfenced JSON
    plain = '{"key": "value"}'
    assert strip_json_fences(plain) == '{"key": "value"}'
    
    # Fenced with whitespace
    fenced3 = "   ```json  \r\n{\"key\": \"value\"}\r\n  ```  "
    assert strip_json_fences(fenced3) == '{"key": "value"}'


# Test Gemini missing env vars
@mock.patch.dict(os.environ, clear=True)
def test_gemini_missing_env_raises():
    from backend.ai.gemini import GeminiProvider
    with pytest.raises(AIProviderError, match="GEMINI_API_KEY"):
        GeminiProvider(max_retries=1, backoff_factor=0.01)


@mock.patch.dict(os.environ, {"GEMINI_API_KEY": "test"})
def test_gemini_missing_model_raises():
    from backend.ai.gemini import GeminiProvider
    # Ensure GEMINI_MODEL is not set
    if "GEMINI_MODEL" in os.environ:
        del os.environ["GEMINI_MODEL"]
    with pytest.raises(AIProviderError, match="GEMINI_MODEL"):
        GeminiProvider(max_retries=1, backoff_factor=0.01)


# Test Ollama missing env vars
@mock.patch.dict(os.environ, clear=True)
def test_ollama_missing_env_raises():
    from backend.ai.ollama import OllamaProvider
    with pytest.raises(AIProviderError, match="OLLAMA_MODEL"):
        OllamaProvider(max_retries=1, backoff_factor=0.01)

