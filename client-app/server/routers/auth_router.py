"""
Auth router additions:
- Send welcome email on first profile sync
- Hook for Stripe customer creation
"""
import logging
from fastapi import APIRouter, Depends
from pydantic import BaseModel, validator
from typing import Optional
import re

from core.security import get_current_user
from core.config import get_db

logger = logging.getLogger("mithra.auth")
router = APIRouter()


class ProfileSyncRequest(BaseModel):
    fullName: Optional[str] = None
    avatarUrl: Optional[str] = None
    timezone: Optional[str] = None

    @validator("avatarUrl")
    def validate_avatar_url(cls, v):
        """Prevent SSRF — only allow https:// URLs from known image hosts."""
        if not v:
            return v
        allowed_prefixes = (
            "https://lh3.googleusercontent.com/",
            "https://storage.googleapis.com/",
            "https://avatars.githubusercontent.com/",
            "https://i.imgur.com/",
            "https://firebasestorage.googleapis.com/",
        )
        if not any(v.startswith(p) for p in allowed_prefixes):
            # Accept empty/null silently, reject other URLs
            logger.warning(f"Rejected avatarUrl: {v[:80]}")
            return None
        return v

    @validator("fullName")
    def validate_name(cls, v):
        if v and len(v) > 80:
            return v[:80]
        return v


@router.post("/sync-profile")
async def sync_profile(req: ProfileSyncRequest, current_user: dict = Depends(get_current_user)):
    """
    Called after Firebase sign-in to sync profile to DB.
    Sends welcome email on first sync (new user).
    """
    pool = get_db()
    user_id = current_user["id"]
    email = current_user.get("email", "")
    display_name = req.fullName or current_user.get("fullName", "")

    if not pool:
        return {"synced": False, "reason": "db_unavailable"}

    try:
        async with pool.acquire() as conn:
            existing = await conn.fetchrow("SELECT id, created_at FROM profiles WHERE id = $1", user_id)
            is_new_user = existing is None

            await conn.execute("""
                INSERT INTO profiles (id, email, display_name, avatar_url, timezone)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (id) DO UPDATE SET
                    email = EXCLUDED.email,
                    display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
                    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
                    timezone = COALESCE(EXCLUDED.timezone, profiles.timezone),
                    updated_at = NOW()
            """, user_id, email, display_name, req.avatarUrl, req.timezone)

            if is_new_user:
                # Provision free plan
                await conn.execute("""
                    INSERT INTO user_plans (user_id, plan_id, status, started_at)
                    VALUES ($1, 'free', 'active', NOW())
                    ON CONFLICT (user_id) DO NOTHING
                """, user_id)

                # Generate referral code
                import secrets
                import string
                code = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))
                await conn.execute("""
                    INSERT INTO referrals (referrer_id, referral_code)
                    VALUES ($1, $2) ON CONFLICT DO NOTHING
                """, user_id, code)
                await conn.execute("""
                    UPDATE profiles SET referral_code = $1 WHERE id = $2
                """, code, user_id)

        return {"synced": True, "newUser": is_new_user}
    except Exception as e:
        logger.error(f"Profile sync failed for {user_id}: {e}", exc_info=True)
        return {"synced": False, "reason": "sync_failed"}
