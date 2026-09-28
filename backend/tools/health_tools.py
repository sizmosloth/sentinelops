import urllib.request
import urllib.error
import json


HEALTH_URL = "http://localhost:8000/health"


def health_check():
    try:
        with urllib.request.urlopen(HEALTH_URL, timeout=5) as response:
            body = response.read().decode()

            return {
                "success": True,
                "status_code": response.status,
                "healthy": response.status == 200,
                "response": json.loads(body)
            }

    except urllib.error.HTTPError as error:
        body = error.read().decode()

        return {
            "success": True,
            "status_code": error.code,
            "healthy": False,
            "response": json.loads(body)
        }

    except Exception as error:
        return {
            "success": False,
            "healthy": False,
            "error": str(error)
        }
