from backend.tools.registry import get_tool
from backend.safety.gate import check_action
from backend.safety.permissions import request_approval, get_approval


def execute_action(tool_name, target=None, reason=""):
    safety_result = check_action(tool_name, target)

    if safety_result["decision"] == "deny":
        return {
            "success": False,
            "stage": "safety",
            "decision": "deny",
            "error": safety_result["reason"]
        }

    if safety_result["decision"] == "approval_required":
        approval = request_approval(
            tool_name,
            target,
            reason
        )

        return {
            "success": False,
            "stage": "approval",
            "decision": "approval_required",
            "risk": safety_result["risk"],
            "approval": approval
        }

    tool = get_tool(tool_name)

    if tool is None:
        return {
            "success": False,
            "stage": "registry",
            "error": "Tool is not registered"
        }

    if target is not None:
        result = tool(target)
    else:
        result = tool()

    return {
        "success": result.get("success", False),
        "stage": "execution",
        "decision": "allow",
        "result": result
    }


def execute_approved_action(approval_id):
    approval = get_approval(approval_id)

    if approval is None:
        return {
            "success": False,
            "stage": "approval",
            "error": "Approval request not found"
        }

    if approval["status"] == "executed":
        return {
            "success": False,
            "stage": "approval",
            "error": "Action has already been executed"
        }

    if approval["status"] != "approved":
        return {
            "success": False,
            "stage": "approval",
            "error": "Action has not been approved"
        }

    tool_name = approval["tool"]
    target = approval["target"]

    tool = get_tool(tool_name)

    if tool is None:
        return {
            "success": False,
            "stage": "registry",
            "error": "Tool is not registered"
        }

    if target is not None:
        result = tool(target)
    else:
        result = tool()

    if result.get("success", False):
        approval["status"] = "executed"

    return {
        "success": result.get("success", False),
        "stage": "execution",
        "decision": "approved",
        "approval_id": approval_id,
        "result": result,
        "approval_status": approval["status"]
    }
