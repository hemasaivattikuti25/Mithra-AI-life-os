from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import logging
import uuid
import hashlib

from core.config import get_db
from core.security import get_current_user

logger = logging.getLogger("workspace_router")
router = APIRouter()

class WorkspaceCreate(BaseModel):
    name: str

class JoinWorkspaceReq(BaseModel):
    hash: str

def generate_share_hash(workspace_id: str) -> str:
    """Generate a deterministic 8-character hash for sharing."""
    return hashlib.sha256(workspace_id.encode('utf-8')).hexdigest()[:8]

@router.get("/workspaces")
async def list_workspaces(current_user: dict = Depends(get_current_user)):
    """List all workspaces the user is a part of (owner or member)."""
    pool = get_db()
    if not pool:
        raise HTTPException(status_code=503, detail="Database unavailable")

    user_id = current_user["id"]
    try:
        async with pool.acquire() as conn:
            # Get all memberships for the user with their role
            memberships = await conn.fetch(
                "SELECT workspace_id, role FROM workspace_members WHERE user_id = $1",
                user_id
            )

            if not memberships:
                return {"workspaces": []}

            roles_map = {str(m["workspace_id"]): m["role"] for m in memberships}
            ws_ids = list(roles_map.keys())

            # Fetch workspace details
            workspaces = await conn.fetch(
                "SELECT * FROM workspaces WHERE id = ANY($1::uuid[])",
                ws_ids
            )

            # Fetch member counts for all these workspaces
            counts_result = await conn.fetch(
                "SELECT workspace_id, COUNT(*) as cnt FROM workspace_members WHERE workspace_id = ANY($1::uuid[]) GROUP BY workspace_id",
                ws_ids
            )
            counts = {str(c["workspace_id"]): c["cnt"] for c in counts_result}

        results = []
        for ws in workspaces:
            ws_id = str(ws["id"])
            results.append({
                "id": ws_id,
                "name": ws["name"],
                "owner_id": ws["owner_id"],
                "share_link_hash": ws.get("share_link_hash") or generate_share_hash(ws_id),
                "userRole": roles_map.get(ws_id, "member"),
                "memberCount": counts.get(ws_id, 1),
                "created_at": ws["created_at"].isoformat() if ws.get("created_at") else None
            })

        return {"workspaces": results}
    except Exception as e:
        logger.error(f"Error listing workspaces: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/workspaces")
async def create_workspace(req: WorkspaceCreate, current_user: dict = Depends(get_current_user)):
    """Create a new shared workspace (Mithra Blend)."""
    pool = get_db()
    if not pool:
        raise HTTPException(status_code=503, detail="Database unavailable")

    user_id = current_user["id"]
    if not req.name or not req.name.strip():
        raise HTTPException(status_code=422, detail="Workspace name is required")
    if len(req.name.strip()) > 80:
        raise HTTPException(status_code=422, detail="Workspace name too long (max 80 chars)")

    try:
        ws_id = str(uuid.uuid4())
        share_hash = generate_share_hash(ws_id)

        async with pool.acquire() as conn:
            # Atomic: workspace row + owner membership in one transaction
            async with conn.transaction():
                await conn.execute(
                    """INSERT INTO workspaces (id, name, owner_id, share_link_hash)
                       VALUES ($1, $2, $3, $4)""",
                    ws_id, req.name.strip(), user_id, share_hash
                )
                await conn.execute(
                    """INSERT INTO workspace_members (workspace_id, user_id, role)
                       VALUES ($1, $2, 'owner')""",
                    ws_id, user_id
                )

        return {"workspace": {
            "id": ws_id,
            "name": req.name.strip(),
            "owner_id": user_id,
            "share_link_hash": share_hash,
            "userRole": "owner"
        }}
    except Exception as e:
        logger.error(f"Error creating workspace: {e}")
        raise HTTPException(status_code=500, detail="Failed to create workspace")

@router.post("/workspaces/join")
async def join_workspace(req: JoinWorkspaceReq, current_user: dict = Depends(get_current_user)):
    """Join a workspace using a share hash."""
    pool = get_db()
    if not pool:
        raise HTTPException(status_code=503, detail="Database unavailable")

    user_id = current_user["id"]
    try:
        async with pool.acquire() as conn:
            # Query directly by share_link_hash
            ws = await conn.fetchrow(
                "SELECT id FROM workspaces WHERE share_link_hash = $1",
                req.hash.strip()
            )

            if not ws:
                raise HTTPException(status_code=404, detail="Invalid invite link")

            target_ws_id = str(ws["id"])

            # Check if already a member
            existing = await conn.fetchrow(
                "SELECT * FROM workspace_members WHERE workspace_id = $1 AND user_id = $2",
                target_ws_id, user_id
            )
            if existing:
                return {"success": True, "alreadyMember": True, "workspaceId": target_ws_id}

            # Join
            await conn.execute(
                """INSERT INTO workspace_members (workspace_id, user_id, role)
                   VALUES ($1, $2, 'member')""",
                target_ws_id, user_id
            )

        return {"success": True, "workspaceId": target_ws_id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error joining workspace: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/workspaces/{workspace_id}")
async def delete_workspace(workspace_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a workspace (Owner only)."""
    pool = get_db()
    if not pool:
        raise HTTPException(status_code=503, detail="Database unavailable")

    user_id = current_user["id"]
    try:
        async with pool.acquire() as conn:
            ws = await conn.fetchrow(
                "SELECT owner_id FROM workspaces WHERE id = $1",
                workspace_id
            )
            if not ws or ws["owner_id"] != user_id:
                raise HTTPException(status_code=403, detail="Only the owner can delete this workspace.")

            await conn.execute("DELETE FROM workspaces WHERE id = $1", workspace_id)
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting workspace: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/workspaces/{workspace_id}/leave")
async def leave_workspace(workspace_id: str, current_user: dict = Depends(get_current_user)):
    """Leave a workspace (Member only)."""
    pool = get_db()
    if not pool:
        raise HTTPException(status_code=503, detail="Database unavailable")

    user_id = current_user["id"]
    try:
        async with pool.acquire() as conn:
            ws = await conn.fetchrow(
                "SELECT owner_id FROM workspaces WHERE id = $1",
                workspace_id
            )
            if ws and ws["owner_id"] == user_id:
                raise HTTPException(status_code=400, detail="Owner cannot leave the workspace. Delete it instead.")

            await conn.execute(
                "DELETE FROM workspace_members WHERE workspace_id = $1 AND user_id = $2",
                workspace_id, user_id
            )
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error leaving workspace: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/workspaces/{workspace_id}/members")
async def get_workspace_members(workspace_id: str, current_user: dict = Depends(get_current_user)):
    """Get members of a workspace, including their profile details."""
    pool = get_db()
    if not pool:
        raise HTTPException(status_code=503, detail="Database unavailable")

    try:
        async with pool.acquire() as conn:
            memberships = await conn.fetch(
                "SELECT user_id, role FROM workspace_members WHERE workspace_id = $1",
                workspace_id
            )
            member_user_ids = [m["user_id"] for m in memberships]

            # Verify access
            if current_user["id"] not in member_user_ids:
                raise HTTPException(status_code=403, detail="Access denied")

            if not member_user_ids:
                return {"members": []}

            profiles = await conn.fetch(
                "SELECT id, display_name, avatar_url, email FROM profiles WHERE id = ANY($1::text[])",
                member_user_ids
            )

        formatted_members = []
        for m in memberships:
            profile = next((p for p in profiles if p["id"] == m["user_id"]), None)
            formatted_members.append({
                "userId": m["user_id"],
                "fullName": profile.get("display_name") if profile else m["user_id"][:8],
                "avatarUrl": profile.get("avatar_url") if profile else None,
                "role": m["role"],
            })

        return {"members": formatted_members}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching workspace members: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ─── OWNERSHIP TRANSFER ─────────────────────────────────────────────────────

class TransferOwnershipReq(BaseModel):
    new_owner_id: str

@router.put("/workspaces/{workspace_id}/transfer")
async def transfer_ownership(
    workspace_id: str,
    req: TransferOwnershipReq,
    current_user: dict = Depends(get_current_user)
):
    """Transfer workspace ownership to another member."""
    pool = get_db()
    if not pool:
        raise HTTPException(status_code=503, detail="Database unavailable")

    user_id = current_user["id"]
    new_owner_id = req.new_owner_id.strip()

    if user_id == new_owner_id:
        raise HTTPException(status_code=400, detail="You are already the owner.")

    try:
        async with pool.acquire() as conn:
            # All 3 steps are atomic — no partial ownership state possible
            async with conn.transaction():
                ws = await conn.fetchrow(
                    "SELECT owner_id FROM workspaces WHERE id = $1",
                    workspace_id
                )
                if not ws or ws["owner_id"] != user_id:
                    raise HTTPException(status_code=403, detail="Only the current owner can transfer ownership.")

                member = await conn.fetchrow(
                    "SELECT user_id FROM workspace_members WHERE workspace_id = $1 AND user_id = $2",
                    workspace_id, new_owner_id
                )
                if not member:
                    raise HTTPException(status_code=404, detail="Target user is not a member of this workspace.")

                await conn.execute(
                    "UPDATE workspaces SET owner_id = $1 WHERE id = $2",
                    new_owner_id, workspace_id
                )
                await conn.execute(
                    "UPDATE workspace_members SET role = 'member' WHERE workspace_id = $1 AND user_id = $2",
                    workspace_id, user_id
                )
                await conn.execute(
                    "UPDATE workspace_members SET role = 'owner' WHERE workspace_id = $1 AND user_id = $2",
                    workspace_id, new_owner_id
                )

        logger.info(f"Ownership of workspace {workspace_id} transferred from {user_id} to {new_owner_id}")
        return {"success": True, "newOwnerId": new_owner_id}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error transferring ownership for workspace {workspace_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to transfer ownership")

