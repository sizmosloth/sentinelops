TOOL_RISK = {
    "container_status": "low",
    "health_check": "low",
    "restart_container": "medium"
}


def get_risk(tool):
    return TOOL_RISK.get(tool, "high")
