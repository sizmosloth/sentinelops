from backend.safety.risk import get_risk
from backend.safety.policies import get_decision


ALLOWED_TOOLS = {
    "container_status",
    "container_health",
    "restart_container",
    "health_check",
    "port_check",
    "http_check",
    "database_health"
}

ALLOWED_CONTAINERS = {
    "demo-api",
    "demo-db"
}


def check_action(tool, target=None):
    if tool not in ALLOWED_TOOLS:
        return {
            "allowed": False,
            "decision": "deny",
            "reason": "Tool is not allowed"
        }

    if tool in {"container_status", "container_health", "restart_container"}:
        if target not in ALLOWED_CONTAINERS:
            return {
                "allowed": False,
                "decision": "deny",
                "reason": "Target container is not allowed"
            }


    risk = get_risk(tool)
    policy = get_decision(tool)

    if policy["decision"] == "deny":
        return {
            "allowed": False,
            "decision": "deny",
            "risk": risk,
            "reason": "Action is denied by safety policy"
        }

    if policy["approval_required"]:
        return {
            "allowed": False,
            "decision": "approval_required",
            "risk": risk,
            "reason": "Human approval is required"
        }

    return {
        "allowed": True,
        "decision": "allow",
        "risk": risk,
        "reason": "Action is allowed"
    }
