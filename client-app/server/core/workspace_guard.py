"""
Workspace Access Guard — Backend validation for workspace membership.

Usage:
    from core.workspace_guard import require_workspace_member, require_workspace_owner

    @router.get("/workspaces/{workspace_id}/tasks")
    async def get_tasks(
        workspace_id: str,
        member=Depends(require_workspace_member),
        current_user=Depends(get_current_user),
    ):
        ...
"""

from fastapi import Depends, HTTPException, Path
from core.security import get_current_user
from core.config import get_db


async def require_workspace_member(
    workspace_id: str = Path(...),
    current_user: dict = Depends(get_current_user),
) -> dict:
    """Verify the current user is a member of the given workspace.
    Returns membership info { workspace_id, user_id, role }.
    Raises 403 if not a member.
    """
    pool = get_db()
    if not pool:
        raise HTTPException(status_code=503, detail="Database not configured")

    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT workspace_id, user_id, role FROM workspace_members WHERE workspace_id = $1 AND user_id = $2",
            workspace_id, current_user["id"]
        )

    if not row:
        raise HTTPException(
            status_code=403,
            detail="You are not a member of this workspace.",
        )

    return dict(row)


async def require_workspace_owner(
    workspace_id: str = Path(...),
    current_user: dict = Depends(get_current_user),
) -> dict:
    """Verify the current user is the OWNER of the given workspace.
    Returns membership info.
    Raises 403 if not an owner.
    """
    member = await require_workspace_member(workspace_id, current_user)

    if member.get("role") != "owner":
        raise HTTPException(
            status_code=403,
            detail="Only workspace owners can perform this action.",
        )

    return member
