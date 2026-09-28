from backend.tools.registry import get_tool


def diagnose():
    health_check = get_tool("health_check")
    container_status = get_tool("container_status")

    health = health_check()

    evidence = {
        "health": health
    }

    for container in ["demo-api", "demo-db"]:
        evidence[container] = container_status(container)

    diagnosis = "unknown"

    if health.get("healthy"):
        diagnosis = "service_healthy"

    else:
        db_status = evidence["demo-db"].get("status")

        if db_status != "running":
            diagnosis = "database_down"

        else:
            diagnosis = "api_or_dependency_failure"

    return {
        "success": True,
        "diagnosis": diagnosis,
        "evidence": evidence
    }
