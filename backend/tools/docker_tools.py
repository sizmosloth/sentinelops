import subprocess


ALLOWED_CONTAINERS = {
    "demo-api",
    "demo-db"
}


def container_status(container: str):
    if container not in ALLOWED_CONTAINERS:
        return {
            "success": False,
            "error": "Container is not allowed"
        }

    result = subprocess.run(
        ["docker", "inspect", "-f", "{{.State.Status}}", container],
        capture_output=True,
        text=True
    )

    if result.returncode != 0:
        return {
            "success": False,
            "error": result.stderr.strip()
        }

    return {
        "success": True,
        "container": container,
        "status": result.stdout.strip()
    }


def restart_container(container: str):
    if container not in ALLOWED_CONTAINERS:
        return {
            "success": False,
            "error": "Container is not allowed"
        }

    result = subprocess.run(
        ["docker", "restart", container],
        capture_output=True,
        text=True
    )

    if result.returncode != 0:
        return {
            "success": False,
            "error": result.stderr.strip()
        }

    return {
        "success": True,
        "container": container,
        "action": "restarted"
    }
