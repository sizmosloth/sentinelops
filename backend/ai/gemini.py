import os
import time
from typing import Type

from pydantic import BaseModel, ValidationError
from google import genai
from google.genai import types

from backend.ai.provider import AIProvider, AIProviderError, strip_json_fences

class GeminiProvider(AIProvider):
    def __init__(self, max_retries: int = 3, backoff_factor: float = 1.0):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.model = os.getenv("GEMINI_MODEL")
        if not self.api_key:
            raise AIProviderError("GEMINI_API_KEY environment variable is missing")
        if not self.model:
            raise AIProviderError("GEMINI_MODEL environment variable is missing")
            
        self.client = genai.Client(api_key=self.api_key)
        self.max_retries = max_retries
        self.backoff_factor = backoff_factor

    def generate_json(self, system_prompt: str, user_prompt: str, schema: Type[BaseModel]) -> BaseModel:
        config = types.GenerateContentConfig(
            system_instruction=system_prompt,
            response_mime_type="application/json",
            response_schema=schema
        )
        
        last_error = None
        for attempt in range(self.max_retries):
            try:
                response = self.client.models.generate_content(
                    model=self.model,
                    contents=user_prompt,
                    config=config
                )
                if not response.text:
                    raise AIProviderError("Empty response from Gemini")
                text = strip_json_fences(response.text)
                return schema.model_validate_json(text)
            except ValidationError as e:
                last_error = e
            except Exception as e:
                last_error = e
                
            if attempt < self.max_retries - 1:
                time.sleep(self.backoff_factor * (2 ** attempt))
                
        raise AIProviderError(f"Failed to generate JSON after {self.max_retries} retries. Last error: {last_error}")
