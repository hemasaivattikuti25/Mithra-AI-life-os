"""
Plan Gate — enforces daily AI usage limits based on user's real subscription plan.

Fixed from original:
- Removed FastAPI Depends dependency chain bug (get_plan_info was called as plain function)
- Now uses direct DB queries with explicit pool + user_id params
- Gracefully degrades to free limits if plans table or DB is unavailable
"""
from fastapi import Depends, HTTPException
from datetime import date
from core.security import get_current_user
from core.config import get_db
import logging

logger = logging.getLogger("mithra.plan_gate")

FREE_DAILY_LIMIT = 20
FREE_PLAN_ID = "free"


async def _get_user_plan(user_id: str, pool) -> dict:
    """Fetch user's plan limits from DB. Falls back to free plan on any error."""
    try:
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT p.id AS plan_id, p.daily_ai_limit
                FROM plans p
                JOIN user_plans up ON p.id = up.plan_id
                WHERE up.user_id = $1
                  AND (up.expires_at IS NULL OR up.expires_at > NOW())
                ORDER BY p.daily_ai_limit DESC
                LIMIT 1
            """, user_id)
            if row:
                return {"plan_id": row["plan_id"], "daily_ai_limit": row["daily_ai_limit"]}
    except Exception as e:
        logger.warning(f"Could not fetch plan for user {user_id}: {e}. Using free defaults.")
    return {"plan_id": FREE_PLAN_ID, "daily_ai_limit": FREE_DAILY_LIMIT}


async def _get_today_calls(user_id: str, pool) -> int:
    """Get today's AI call count without incrementing."""
    today = date.today().isoformat()
    try:
        async with pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT calls_today FROM ai_usage WHERE user_id = $1 AND usage_date = $2",
                user_id, today
            )
            return row["calls_today"] if row else 0
    except Exception as e:
        logger.warning(f"Could not fetch AI usage for {user_id}: {e}")
        return 0


async def _increment_and_check(user_id: str, pool, daily_limit: int) -> int:
    """Atomically increment today's call count and return the new total."""
    today = date.today().isoformat()
    async with pool.acquire() as conn:
        row = await conn.fetchrow("""
            INSERT INTO ai_usage (user_id, usage_date, calls_today)
            VALUES ($1, $2, 1)
            ON CONFLICT (user_id, usage_date)
            DO UPDATE SET calls_today = ai_usage.calls_today + 1
            RETURNING calls_today
        """, user_id, today)
        return row["calls_today"] if row else 1


async def require_ai_access(current_user: dict = Depends(get_current_user)) -> dict:
    """
    FastAPI dependency: verify the user can make an AI call.
    - Checks the user's plan limit from DB
    - Atomically increments the counter
    - Raises 429 if limit exceeded
    """
    pool = get_db()
    user_id = current_user["id"]

    # If DB is unavailable, allow access (degraded mode) — better UX than hard block
    if not pool:
        logger.warning(f"DB unavailable — allowing AI access for {user_id} in degraded mode")
        return {"allowed": True, "current": 0, "limit": None, "plan": FREE_PLAN_ID}

    try:
        plan = await _get_user_plan(user_id, pool)
        daily_limit = plan["daily_ai_limit"]
        plan_id = plan["plan_id"]

        current_calls = await _increment_and_check(user_id, pool, daily_limit)

        usage = {
            "allowed": current_calls <= daily_limit,
            "current": current_calls,
            "limit": daily_limit,
            "plan": plan_id,
        }

        if not usage["allowed"]:
            raise HTTPException(
                status_code=429,
                detail={
                    "error": "daily_limit_exceeded",
                    "message": f"You've used all {daily_limit} AI messages for today on the {plan_id.title()} plan.",
                    "upgrade_url": "/settings#plan",
                    "usage": usage,
                },
            )

        return usage

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Plan gate error for {user_id}: {e}", exc_info=True)
        # Fail open — don't block users on infrastructure errors
        return {"allowed": True, "current": 0, "limit": FREE_DAILY_LIMIT, "plan": FREE_PLAN_ID}


async def get_plan_info(current_user: dict) -> dict:
    """Fetch current user plan details and today's AI usage count."""
    pool = get_db()
    user_id = current_user.get("id") if current_user else None
    if not pool or not user_id:
        return {
            "plan_id": FREE_PLAN_ID,
            "daily_ai_limit": FREE_DAILY_LIMIT,
            "today_ai_calls": 0,
        }

    try:
        plan = await _get_user_plan(user_id, pool)
        today_calls = await _get_today_calls(user_id, pool)
        return {
            "plan_id": plan["plan_id"],
            "daily_ai_limit": plan["daily_ai_limit"],
            "today_ai_calls": today_calls,
        }
    except Exception as e:
        logger.warning(f"Failed to get plan info for {user_id}: {e}")
        return {
            "plan_id": FREE_PLAN_ID,
            "daily_ai_limit": FREE_DAILY_LIMIT,
            "today_ai_calls": 0,
        }
