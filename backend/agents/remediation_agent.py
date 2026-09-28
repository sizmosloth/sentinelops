def create_remediation(diagnosis, demo_mode=False, attempt=1):
    if diagnosis == "database_down":
        if demo_mode and attempt == 1:
            return {
                "success": True,
                "tool": "restart_container",
                "target": "demo-api",
                "reason": "Testing API recovery hypothesis"
            }

        return {
            "success": True,
            "tool": "restart_container",
            "target": "demo-db",
            "reason": "Database is down"
        }

    if diagnosis == "api_or_dependency_failure":
        return {
            "success": True,
            "tool": "restart_container",
            "target": "demo-api",
            "reason": "API or dependency failure detected"
        }

    return {
        "success": False,
        "error": "No remediation available for this diagnosis"
    }
