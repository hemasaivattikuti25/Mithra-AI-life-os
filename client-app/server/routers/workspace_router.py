from fastapi import APIRouter, Depends, HTTPException, Body
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
import logging
import uuid
import hashlib

from core.config import supabase
from routers.auth_router import get_current_user

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
        # Get workspaces where user is owner
        owned = supabase.table("workspaces").select("*").eq("owner_id", user_id).execute()
        
        # Get workspaces where user is a member
        memberships = supabase.table("workspace_members").select("workspace_id").eq("user_id", user_id).execute()
        member_ids = [m["workspace_id"] for m in memberships.data]
        
        member_workspaces = []
        if member_ids:
            member_workspaces = supabase.table("workspaces").select("*").in_("id", member_ids).execute().data

        # Combine and deduplicate
        all_workspaces = {ws["id"]: ws for ws in owned.data + member_workspaces}
        
        # Add the share hash to each workspace
        results = []
        for ws in all_workspaces.values():
            ws["share_link_hash"] = generate_share_hash(ws["id"])
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
        data = {
            "name": req.name,
            "owner_id": user_id
        }
        res = supabase.table("workspaces").insert(data).select().execute()
        if not res.data:
            raise HTTPException(status_code=500, detail="Failed to create workspace")
            
        workspace = res.data[0]
        
        # Auto-add the owner as a member with 'owner' role for easier querying later
        supabase.table("workspace_members").insert({
            "workspace_id": workspace["id"],
            "user_id": user_id,
            "role": "owner"
        }).select().execute()
        
        workspace["share_link_hash"] = generate_share_hash(workspace["id"])
        
        return {"workspace": workspace}
    except Exception as e:
        logger.error(f"Error creating workspace: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/workspaces/join")
async def join_workspace(req: JoinWorkspaceReq, current_user: dict = Depends(get_current_user)):
    """Join a workspace using a share hash."""
    user_id = current_user["id"]
    try:
        # 1. Find the workspace ID that matches the hash
        # We have to fetch all workspaces to check the hash since it's computed on the fly
        all_wsResponse = supabase.table("workspaces").select("id").execute()
        
        target_ws_id = None
        for ws in all_wsResponse.data:
            if generate_share_hash(ws["id"]) == req.hash.strip():
                target_ws_id = ws["id"]
                break
                
        if not target_ws_id:
            raise HTTPException(status_code=404, detail="Invalid invite link")

        # 2. Check if already a member
        existing = supabase.table("workspace_members").select("*").eq("workspace_id", target_ws_id).eq("user_id", user_id).execute()
        if existing.data:
            return {"success": True, "alreadyMember": True, "workspaceId": target_ws_id}

        # 3. Join
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


@router.get("/workspaces/{workspace_id}/members")
async def get_workspace_members(workspace_id: str, current_user: dict = Depends(get_current_user)):
    """Get members of a workspace, including their profile details."""
    try:
        # First verify the current user has access to this workspace
        # (RLS should handle this, but it's good practice to double check)
        memberships_raw = supabase.table("workspace_members").select("user_id, role").eq("workspace_id", workspace_id).execute()
        member_user_ids = [m["user_id"] for m in memberships_raw.data]
        
        if current_user["id"] not in member_user_ids:
            # Check if they are the owner
            ws_check = supabase.table("workspaces").select("owner_id").eq("id", workspace_id).execute()
            if not ws_check.data or ws_check.data[0]["owner_id"] != current_user["id"]:
                 raise HTTPException(status_code=403, detail="Access denied")
            if current_user["id"] not in member_user_ids:
                 member_user_ids.append(current_user["id"])

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
