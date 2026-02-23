from fastapi import APIRouter, Depends, HTTPException, Body
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
import logging
import uuid
import hashlib

from core.config import supabase
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
    user_id = current_user["id"]
    try:
        # Step 1: Get all memberships for the user with their role
        memberships = supabase.table("workspace_members").select("workspace_id, role").eq("user_id", user_id).execute()
        
        roles_map = {m["workspace_id"]: m["role"] for m in memberships.data}
        ws_ids = list(roles_map.keys())
        
        if not ws_ids:
            return {"workspaces": []}
            
        # Step 2: Fetch workspace details
        workspaces_res = supabase.table("workspaces").select("*").in_("id", ws_ids).execute()
        
        # Step 3: Fetch member counts for all these workspaces
        all_memberships = supabase.table("workspace_members").select("workspace_id").in_("workspace_id", ws_ids).execute()
        counts = {}
        for m in all_memberships.data:
            counts[m["workspace_id"]] = counts.get(m["workspace_id"], 0) + 1
            
        results = []
        for ws in workspaces_res.data:
            ws["share_link_hash"] = generate_share_hash(ws["id"])
            ws["userRole"] = roles_map.get(ws["id"], "member")
            ws["memberCount"] = counts.get(ws["id"], 1)
            results.append(ws)
            
        return {"workspaces": results}
    except Exception as e:
        logger.error(f"Error listing workspaces: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/workspaces")
async def create_workspace(req: WorkspaceCreate, current_user: dict = Depends(get_current_user)):
    """Create a new shared workspace (Mithra Blend)."""
    user_id = current_user["id"]
    try:
        ws_id = str(uuid.uuid4())
        data = {
            "id": ws_id,
            "name": req.name,
            "owner_id": user_id,
            "share_link_hash": generate_share_hash(ws_id),
        }
        res = supabase.table("workspaces").insert(data).select().execute()
        if not res.data:
            raise HTTPException(status_code=500, detail="Failed to create workspace")
            
        workspace = res.data[0]
        
        # Auto-add the owner as a member with 'owner' role
        supabase.table("workspace_members").insert({
            "workspace_id": workspace["id"],
            "user_id": user_id,
            "role": "owner"
        }).select().execute()
        
        workspace["share_link_hash"] = generate_share_hash(workspace["id"])
        workspace["userRole"] = "owner"
        
        return {"workspace": workspace}
    except Exception as e:
        logger.error(f"Error creating workspace: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/workspaces/join")
async def join_workspace(req: JoinWorkspaceReq, current_user: dict = Depends(get_current_user)):
    """Join a workspace using a share hash."""
    user_id = current_user["id"]
    try:
        # We have to fetch all workspaces to check the hash since it's computed on the fly
        all_wsResponse = supabase.table("workspaces").select("id").execute()
        
        target_ws_id = None
        for ws in all_wsResponse.data:
            if generate_share_hash(ws["id"]) == req.hash.strip():
                target_ws_id = ws["id"]
                break
                
        if not target_ws_id:
            raise HTTPException(status_code=404, detail="Invalid invite link")

        # Check if already a member
        existing = supabase.table("workspace_members").select("*").eq("workspace_id", target_ws_id).eq("user_id", user_id).execute()
        if existing.data:
            return {"success": True, "alreadyMember": True, "workspaceId": target_ws_id}

        # Join
        supabase.table("workspace_members").insert({
            "workspace_id": target_ws_id,
            "user_id": user_id,
            "role": "member"
        }).select().execute()
        
        return {"success": True, "workspaceId": target_ws_id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error joining workspace: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/workspaces/{workspace_id}")
async def delete_workspace(workspace_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a workspace (Owner only)."""
    user_id = current_user["id"]
    try:
        ws_check = supabase.table("workspaces").select("owner_id").eq("id", workspace_id).execute()
        if not ws_check.data or ws_check.data[0]["owner_id"] != user_id:
            raise HTTPException(status_code=403, detail="Only the owner can delete this workspace.")
            
        supabase.table("workspaces").delete().eq("id", workspace_id).execute()
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting workspace: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/workspaces/{workspace_id}/leave")
async def leave_workspace(workspace_id: str, current_user: dict = Depends(get_current_user)):
    """Leave a workspace (Member only)."""
    user_id = current_user["id"]
    try:
        ws_check = supabase.table("workspaces").select("owner_id").eq("id", workspace_id).execute()
        if ws_check.data and ws_check.data[0]["owner_id"] == user_id:
            raise HTTPException(status_code=400, detail="Owner cannot leave the workspace. Delete it instead.")
            
        supabase.table("workspace_members").delete().eq("workspace_id", workspace_id).eq("user_id", user_id).execute()
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error leaving workspace: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/workspaces/{workspace_id}/members")
async def get_workspace_members(workspace_id: str, current_user: dict = Depends(get_current_user)):
    """Get members of a workspace, including their profile details."""
    try:
        # Note: If RLS is enabled on Supabase and python client uses anon key, 
        # this query relies on RLS policies to restrict visibility. 
        # Since we use service_role or anon with bypasses, we explicitly verify members here.
        memberships_raw = supabase.table("workspace_members").select("user_id, role").eq("workspace_id", workspace_id).execute()
        member_user_ids = [m["user_id"] for m in memberships_raw.data]
        
        # Verify access
        if current_user["id"] not in member_user_ids:
             raise HTTPException(status_code=403, detail="Access denied")

        if not member_user_ids:
             return {"members": []}

        # Fetch matching profiles
        profiles_res = supabase.table("profiles").select("id, display_name, avatar_url, email").in_("id", member_user_ids).execute()
        
        formatted_members = []
        for p in profiles_res.data:
            formatted_members.append({
                "userId": p["id"],
                "fullName": p.get("display_name") or p.get("email", "Unknown User").split('@')[0],
                "avatarUrl": p.get("avatar_url")
            })
            
        return {"members": formatted_members}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching workspace members: {e}")
        raise HTTPException(status_code=500, detail=str(e))
