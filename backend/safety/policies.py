from backend.safety.risk import get_risk


def get_decision(tool):
    risk = get_risk(tool)

    if risk == "low":
        return {
            "risk": risk,
            "decision": "allow",
            "approval_required": False
        }

    if risk == "medium":
        return {
            "risk": risk,
            "decision": "approval_required",
            "approval_required": True
        }

    return {
        "risk": risk,
        "decision": "deny",
        "approval_required": False
    }
