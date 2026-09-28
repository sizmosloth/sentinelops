import urllib.request
import urllib.error
import json
import socket


HEALTH_URL = "http://localhost:8000/health"


def health_check():
    return http_check(HEALTH_URL)


def http_check(url: str = HEALTH_URL, timeout: float = 5.0):
    try:
        with urllib.request.urlopen(url, timeout=timeout) as response:
            body = response.read().decode()
            try:
                data = json.loads(body)
            except Exception:
                data = body
            return {
                "success": True,
                "status_code": response.status,
                "healthy": response.status == 200,
                "response": data
            }

    except urllib.error.HTTPError as error:
        body = error.read().decode()
        try:
            data = json.loads(body)
        except Exception:
            data = body
        return {
            "success": True,
            "status_code": error.code,
            "healthy": False,
            "response": data
        }

    except Exception as error:
        return {
            "success": False,
            "healthy": False,
            "error": str(error)
        }


def port_check(target: str = "localhost:8000", timeout: float = 2.0):
    """
    Checks if a port is open and reachable over TCP.
    Target can be 'host:port' or port number as string/int.
    """
    host = "localhost"
    port = 8000
    if isinstance(target, int):
        port = target
    elif isinstance(target, str):
        if ":" in target:
            parts = target.split(":")
            host = parts[0] or "localhost"
            try:
                port = int(parts[1])
            except ValueError:
                port = 8000
        else:
            try:
                port = int(target)
            except ValueError:
                port = 8000

    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(timeout)
    try:
        s.connect((host, port))
        s.close()
        return {
            "success": True,
            "host": host,
            "port": port,
            "open": True,
            "healthy": True
        }
    except Exception as exc:
        s.close()
        return {
            "success": False,
            "host": host,
            "port": port,
            "open": False,
            "healthy": False,
            "error": str(exc)
        }


def database_health(target: str = "demo-db", host: str = "localhost", port: int = 5432, timeout: float = 2.0):
    """
    Safely checks database availability without shell commands.
    """
    port_res = port_check(f"{host}:{port}", timeout=timeout)
    return {
        "success": port_res.get("success", False),
        "target": target,
        "host": host,
        "port": port,
        "healthy": port_res.get("open", False),
        "status": "reachable" if port_res.get("open") else "unreachable",
        "error": port_res.get("error")
    }

