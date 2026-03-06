"""
Centralized Plan Enforcement Middleware

Checks user plan and usage BEFORE any gated endpoint runs.
Used as a FastAPI dependency, not as middleware — gives per-route control.

Usage:
    from core.plan_gate import require_ai_access

    @router.post("/chat")
    async def chat(current_user = Depends(get_current_user), usage = Depends(require_ai_access)):
        # usage = {'allowed': True, 'current': 5, 'limit': 20, 'plan': 'free'}
        ...
"""

from fastapi import Depends, HTTPException
from datetime import date
from core.security import get_current_user
from core.config import get_db


async def get_plan_info(current_user: dict = Depends(get_current_user)) -> dict:
    """Get user's plan info without enforcing limits."""
    pool = get_db()
    if not pool:
        return {"plan_id": "free", "daily_ai_limit": 20, "today_ai_calls": 0, "status": "active"}

    try:
        async with pool.acquire() as conn:
            # Check ai_usage for today
            today = date.today().isoformat()
            row = await conn.fetchrow(
                "SELECT calls_today FROM ai_usage WHERE user_id = $1 AND usage_date = $2",
                current_user["id"], today
            )
            today_calls = row["calls_today"] if row else 0

        return {
            "plan_id": "free",
            "daily_ai_limit": 20,
            "today_ai_calls": today_calls,
            "status": "active"
        }
    except Exception:
        return {"plan_id": "free", "daily_ai_limit": 20, "today_ai_calls": 0}


async def require_ai_access(current_user: dict = Depends(get_current_user)) -> dict:
    """
    Dependency that atomically checks AND increments AI usage.
    Raises 429 if the user has exceeded their daily limit.
    Returns usage info dict on success.
    """
    pool = get_db()
    if not pool:
        return {"allowed": True, "current": 0, "limit": None, "plan": "free"}

    daily_limit = 20  # Free plan limit
    today = date.today().isoformat()

    try:
        async with pool.acquire() as conn:
            # Upsert and increment in one query
            row = await conn.fetchrow(
                """INSERT INTO ai_usage (user_id, usage_date, calls_today)
                   VALUES ($1, $2, 1)
                   ON CONFLICT (user_id, usage_date) DO UPDATE SET
                       calls_today = ai_usage.calls_today + 1
                   RETURNING calls_today""",
                current_user["id"], today
            )
            current_calls = row["calls_today"] if row else 1

        usage = {
            "allowed": current_calls <= daily_limit,
            "current": current_calls,
            "limit": daily_limit,
            "plan": "free"
        }

        if not usage["allowed"]:
            raise HTTPException(
                status_code=429,
                detail={
                    "error": "daily_limit_exceeded",
                    "message": f"You've used all {daily_limit} AI messages for today on the Free plan.",
                    "upgrade_url": "/settings#plan",
                    "usage": usage,
                },
            )

        return usage

    except HTTPException:
        raise  # Re-raise our 429
    except Exception:
        return {"allowed": True, "current": 0, "limit": 20, "plan": "free"}
