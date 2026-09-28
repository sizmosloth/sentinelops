from backend.tools.docker_tools import container_status, restart_container, container_health
from backend.tools.health_tools import health_check, port_check, http_check, database_health


TOOLS = {
    "container_status": container_status,
    "restart_container": restart_container,
    "health_check": health_check,
    "container_health": container_health,
    "port_check": port_check,
    "http_check": http_check,
    "database_health": database_health
}


def get_tool(name):
    return TOOLS.get(name)


def list_tools():
    return list(TOOLS.keys())

