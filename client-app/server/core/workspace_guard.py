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
from core.config import supabase


async def require_workspace_member(
    workspace_id: str = Path(...),
    current_user: dict = Depends(get_current_user),
) -> dict:
    """Verify the current user is a member of the given workspace.
    Returns membership info { workspace_id, user_id, role }.
    Raises 403 if not a member.
    """
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not configured")

    result = supabase.table("workspace_members") \
        .select("workspace_id, user_id, role") \
        .eq("workspace_id", workspace_id) \
        .eq("user_id", current_user["id"]) \
        .maybe_single() \
        .execute()

    if not result.data:
        raise HTTPException(
            status_code=403,
            detail="You are not a member of this workspace.",
        )

    return result.data


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


async def check_workspace_access(user_id: str, workspace_id: str) -> bool:
    """Non-throwing check: returns True if user is a member of workspace."""
    if not supabase or not workspace_id:
        return False

    try:
        result = supabase.table("workspace_members") \
            .select("workspace_id") \
            .eq("workspace_id", workspace_id) \
            .eq("user_id", user_id) \
            .maybe_single() \
            .execute()
        return bool(result.data)
    except Exception:
        return False
