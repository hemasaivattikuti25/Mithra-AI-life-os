"""
Auth Router — Minimal backend auth endpoints for Firebase Auth.

Firebase handles authentication on the frontend. This router provides:
1. Account deletion (cleans up user data from Neon DB)
2. Profile sync (ensures user exists in profiles table)
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
import logging

from core.config import get_db
from core.security import get_current_user
from core.validators import InputValidator
from core.errors import ValidationError, MithraError

router = APIRouter()
logger = logging.getLogger("auth_router")


class ProfileSync(BaseModel):
    displayName: Optional[str] = None
    avatarUrl: Optional[str] = None


@router.post("/sync-profile")
async def sync_profile(req: ProfileSync, current_user: dict = Depends(get_current_user)):
    """
    Ensure user profile exists in DB after Firebase auth.
    Creates profile if not exists, updates display_name if provided.
    """
    pool = get_db()
    if not pool:
        raise HTTPException(status_code=503, detail="Database unavailable")

    try:
        # Validate email from token
        email = current_user.get("email", "")
        InputValidator.validate_email(email)
        
        # Validate optional display name
        if req.displayName:
            display_name = InputValidator.validate_string(req.displayName, min_length=1, max_length=100)
        else:
            display_name = current_user.get("fullName", email.split("@")[0])
        
        user_id = current_user["id"]

        async with pool.acquire() as conn:
            # Upsert profile
            await conn.execute(
                """INSERT INTO profiles (id, email, display_name, avatar_url)
                   VALUES ($1, $2, $3, $4)
                   ON CONFLICT (id) DO UPDATE SET
                       display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
                       avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
                       updated_at = NOW()""",
                user_id, email, display_name, req.avatarUrl
            )
        return {"success": True, "userId": user_id}
    except ValidationError as e:
        logger.warning(f"Profile sync validation failed: {e}")
        raise HTTPException(status_code=422, detail=e.message)
    except MithraError as e:
        logger.error(f"Profile sync error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Profile sync failed: {e}")
        raise HTTPException(status_code=500, detail="Profile sync failed")


@router.delete("/account")
async def delete_account(current_user: dict = Depends(get_current_user)):
    """
    Delete all user data from the database.
    Note: The Firebase user must be deleted separately on the frontend.
    """
    pool = get_db()
    if not pool:
        raise HTTPException(status_code=503, detail="Database unavailable")

    user_id = current_user["id"]

    try:
        async with pool.acquire() as conn:
            # Delete in order respecting foreign keys
            await conn.execute("DELETE FROM ai_usage WHERE user_id = $1", user_id)
            await conn.execute("DELETE FROM focus_sessions WHERE user_id = $1", user_id)
            await conn.execute("DELETE FROM mood_logs WHERE user_id = $1", user_id)
            await conn.execute("DELETE FROM journal_entries WHERE user_id = $1", user_id)
            await conn.execute("DELETE FROM habits WHERE user_id = $1", user_id)
            await conn.execute("DELETE FROM tasks WHERE user_id = $1", user_id)
            await conn.execute("DELETE FROM notification_settings WHERE user_id = $1", user_id)
            await conn.execute("DELETE FROM workspace_members WHERE user_id = $1", user_id)
            # Delete workspaces where user is owner
            await conn.execute("DELETE FROM workspaces WHERE owner_id = $1", user_id)
            await conn.execute("DELETE FROM profiles WHERE id = $1", user_id)

        logger.info(f"Account data deleted for user {user_id}")
        return {"success": True, "message": "Account data deleted"}
    except MithraError as e:
        logger.error(f"Account deletion failed with MithraError: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Account deletion failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Account deletion failed")


@router.get("/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Return the current authenticated user's info from the token."""
    return {
        "id": current_user["id"],
        "email": current_user.get("email"),
        "fullName": current_user.get("fullName"),
    }

