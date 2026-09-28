APPROVALS = {}


def request_approval(tool, target=None, reason=""):
    approval_id = f"approval-{len(APPROVALS) + 1}"

    APPROVALS[approval_id] = {
        "id": approval_id,
        "tool": tool,
        "target": target,
        "reason": reason,
        "status": "pending"
    }

    return APPROVALS[approval_id]


def get_approval(approval_id):
    return APPROVALS.get(approval_id)


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
