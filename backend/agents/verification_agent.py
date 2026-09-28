from backend.tools.registry import get_tool


def verify_recovery():
    health_check = get_tool("health_check")

    result = health_check()

    if result.get("healthy"):
        return {
            "success": True,
            "verified": True,
            "status": "recovered",
            "evidence": result
        }

    return {
        "success": True,
        "verified": False,
        "status": "still_unhealthy",
        "evidence": result
    }
