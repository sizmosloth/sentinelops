import os
import time
import json
from typing import Type

import httpx
from pydantic import BaseModel, ValidationError

from backend.ai.provider import AIProvider, AIProviderError, strip_json_fences

class OllamaProvider(AIProvider):
    def __init__(self, max_retries: int = 3, backoff_factor: float = 1.0):
        self.model = os.getenv("OLLAMA_MODEL")
        self.base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        if not self.model:
            raise AIProviderError("OLLAMA_MODEL environment variable is missing")
            
        self.max_retries = max_retries
        self.backoff_factor = backoff_factor
        self.client = httpx.Client(base_url=self.base_url, timeout=120.0)

    def generate_json(self, system_prompt: str, user_prompt: str, schema: Type[BaseModel]) -> BaseModel:
        full_system_prompt = f"{system_prompt}\n\nRespond with a JSON object that strictly adheres to the following JSON schema:\n{json.dumps(schema.model_json_schema())}"
        
        payload = {
            "model": self.model,
            "format": "json",
            "stream": False,
            "messages": [
                {"role": "system", "content": full_system_prompt},
                {"role": "user", "content": user_prompt}
            ]
        }
        
        last_error = None
        for attempt in range(self.max_retries):
            try:
                response = self.client.post("/api/chat", json=payload)
                response.raise_for_status()
                data = response.json()
                text = strip_json_fences(data["message"]["content"])
                return schema.model_validate_json(text)
            except ValidationError as e:
                last_error = e
            except Exception as e:
                last_error = e
                
            if attempt < self.max_retries - 1:
                time.sleep(self.backoff_factor * (2 ** attempt))
                
        raise AIProviderError(f"Failed to generate JSON after {self.max_retries} retries. Last error: {last_error}")
