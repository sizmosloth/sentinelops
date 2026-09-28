import os
import sys

# Add the repository root to sys.path so 'backend...' imports work.
repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if repo_root not in sys.path:
    sys.path.insert(0, repo_root)

from backend.ai.provider import get_provider, AIProviderError
from backend.schemas.incident import Diagnosis

def main():
    try:
        provider = get_provider()
    except AIProviderError as e:
        print(f"{e}")
        sys.exit(1)
        
    system_prompt = "You are a diagnostic agent."
    user_prompt = "The API returns 503 and logs say database connection refused. The database container is stopped."
    
    try:
        diagnosis = provider.generate_json(system_prompt, user_prompt, Diagnosis)
        print(diagnosis)
    except AIProviderError as e:
        print(f"{e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
