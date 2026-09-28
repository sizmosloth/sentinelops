APPROVALS = {}


def request_approval(tool, target=None, reason="", incident_id=None, risk="medium"):
    approval_id = f"approval-{len(APPROVALS) + 1}"

    APPROVALS[approval_id] = {
        "id": approval_id,
        "tool": tool,
        "target": target,
        "reason": reason,
        "risk": risk,
        "status": "pending",
        "incident_id": incident_id
    }

    return APPROVALS[approval_id]


def get_approval(approval_id):
    return APPROVALS.get(approval_id)


def list_approvals(status=None):
    if status:
        return [app for app in APPROVALS.values() if app.get("status") == status]
    return list(APPROVALS.values())


get_approvals = list_approvals


def approve_action(approval_id):
    approval = APPROVALS.get(approval_id)

    if approval is None:
        return None

    approval["status"] = "approved"

    return approval


def deny_action(approval_id):
    approval = APPROVALS.get(approval_id)

    if approval is None:
        return None

    approval["status"] = "denied"

    return approval

