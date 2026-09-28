TOOL_RISK = {
    "container_status": "low",
    "container_health": "low",
    "health_check": "low",
    "port_check": "low",
    "http_check": "low",
    "database_health": "low",
    "restart_container": "medium"
}



def get_risk(tool):
    return TOOL_RISK.get(tool, "high")
