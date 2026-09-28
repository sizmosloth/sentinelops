from backend.tools.docker_tools import container_status, restart_container
from backend.tools.health_tools import health_check


TOOLS = {
    "container_status": container_status,
    "restart_container": restart_container,
    "health_check": health_check
}


def get_tool(name):
    return TOOLS.get(name)


def list_tools():
    return list(TOOLS.keys())
