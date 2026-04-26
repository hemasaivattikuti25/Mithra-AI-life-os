from fastapi import Depends, HTTPException
from datetime import date
from core.security import get_current_user
from core.config import get_db

async def get_plan_info(current_user: dict = Depends(get_current_user)) -> dict:
    pool = get_db()
    if not pool:
        return {"plan_id": "free", "daily_ai_limit": 20, "today_ai_calls": 0, "status": "active"}

    try:
        async with pool.acquire() as conn:
            plan = await conn.fetchrow("""
                SELECT p.id, p.daily_ai_limit 
                FROM plans p 
                LEFT JOIN user_plans up ON p.id = up.plan_id AND up.user_id = $1
                ORDER BY up.started_at DESC NULLS LAST LIMIT 1
            """, current_user["id"])
            
            plan_id = plan["id"] if plan else "free"
            daily_limit = plan["daily_ai_limit"] if plan else 20
            
            today = date.today().isoformat()
            row = await conn.fetchrow(
                "SELECT calls_today FROM ai_usage WHERE user_id = $1 AND usage_date = $2",
                current_user["id"], today
            )
            today_calls = row["calls_today"] if row else 0

        return {
            "plan_id": plan_id,
            "daily_ai_limit": daily_limit,
            "today_ai_calls": today_calls,
            "status": "active"
        }
    except Exception:
        return {"plan_id": "free", "daily_ai_limit": 20, "today_ai_calls": 0}


async def require_ai_access(current_user: dict = Depends(get_current_user)) -> dict:
    pool = get_db()
    if not pool:
        return {"allowed": True, "current": 0, "limit": None, "plan": "free"}

    today = date.today().isoformat()

    try:
        plan_info = await get_plan_info(current_user=current_user)
        daily_limit = plan_info["daily_ai_limit"]
        plan_id = plan_info["plan_id"]

        async with pool.acquire() as conn:
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
            "plan": plan_id
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
    except Exception:
        return {"allowed": True, "current": 0, "limit": 20, "plan": "free"}
