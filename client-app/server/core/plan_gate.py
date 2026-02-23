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
from core.security import get_current_user
from core.config import supabase


async def get_plan_info(current_user: dict = Depends(get_current_user)) -> dict:
    """Get user's plan info without enforcing limits."""
    if not supabase:
        return {"plan_id": "free", "daily_ai_limit": 20, "today_ai_calls": 0, "status": "active"}

    try:
        result = supabase.rpc("get_user_plan_limits", {"p_user_id": current_user["id"]}).execute()
        return result.data if result.data else {"plan_id": "free", "daily_ai_limit": 20, "today_ai_calls": 0}
    except Exception as e:
        print(f"[PlanGate] Failed to get plan info: {e}")
        return {"plan_id": "free", "daily_ai_limit": 20, "today_ai_calls": 0}


async def require_ai_access(current_user: dict = Depends(get_current_user)) -> dict:
    """
    Dependency that atomically checks AND increments AI usage.
    Raises 429 if the user has exceeded their daily limit.
    Returns usage info dict on success.
    """
    if not supabase:
        return {"allowed": True, "current": 0, "limit": None, "plan": "free"}

    try:
        result = supabase.rpc(
            "increment_and_check_ai_usage",
            {"p_user_id": current_user["id"], "p_tokens": 0}
        ).execute()

        usage = result.data if result.data else {"allowed": True, "current": 0, "limit": 20, "plan": "free"}

        if not usage.get("allowed", True):
            raise HTTPException(
                status_code=429,
                detail={
                    "error": "daily_limit_exceeded",
                    "message": f"You've used all {usage.get('limit', 20)} AI messages for today on the {usage.get('plan', 'Free').title()} plan.",
                    "upgrade_url": "/settings#plan",
                    "usage": usage,
                },
            )

        return usage

    except HTTPException:
        raise  # Re-raise our 429
    except Exception as e:
        print(f"[PlanGate] Usage check failed: {e}")
        return {"allowed": True, "current": 0, "limit": 20, "plan": "free"}
