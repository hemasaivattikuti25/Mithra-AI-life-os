"""
═══════════════════════════════════════════════════════════════════════════════
PLANNER ROUTER — HTTP endpoints for AI Daily Planner.

Provides the "Plan My Day" killer feature.
═══════════════════════════════════════════════════════════════════════════════
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from datetime import date
from core.security import get_current_user
from core.plan_gate import require_ai_access
from core.config import get_db
from services.ai import planner_engine
import logging

logger = logging.getLogger("mithra.planner")

router = APIRouter()


class PlanRequest(BaseModel):
    energy_level: Optional[str] = "medium"  # low, medium, high
    focus_areas: Optional[list[str]] = None  # ["work", "health", etc.]
    force_refresh: bool = False


async def _fetch_tasks_and_habits(user_id: str, db_pool) -> tuple[list, list]:
    """Fetch user's tasks and habits for planning."""
    tasks = []
    habits = []
    
    if not db_pool:
        return tasks, habits
    
    try:
        async with db_pool.acquire() as conn:
            # Get pending tasks
            task_rows = await conn.fetch(
                """SELECT id, title, priority, due_date, starred, completed
                   FROM tasks WHERE user_id = $1 AND completed = false
                   ORDER BY starred DESC, due_date ASC NULLS LAST
                   LIMIT 20""",
                user_id
            )
            tasks = [dict(t) for t in task_rows] if task_rows else []
            
            # Get habits
            habit_rows = await conn.fetch(
                """SELECT id, title, category, streak, longest_streak, completed_dates
                   FROM habits WHERE user_id = $1 LIMIT 15""",
                user_id
            )
            if habit_rows:
                today_str = date.today().isoformat()
                for h in habit_rows:
                    completed_dates = h.get("completed_dates") or []
                    h_dict = dict(h)
                    h_dict["today_done"] = today_str in completed_dates if completed_dates else False
                    habits.append(h_dict)
    except Exception as e:
        logger.debug(f"Failed to fetch tasks/habits: {e}")
    
    return tasks, habits


@router.post("/today")
async def get_daily_plan(
    request: PlanRequest,
    current_user: dict = Depends(get_current_user),
    usage: dict = Depends(require_ai_access),
):
    """
    Generate or retrieve today's AI-powered daily plan.
    
    Returns a structured plan with time blocks, tasks, habits, and breaks.
    Uses 12-hour caching unless force_refresh=True.
    """
    try:
        user_id = current_user["id"]
        user_name = current_user.get("fullName", "friend")
        db_pool = get_db()
        
        # Fetch tasks and habits from DB
        tasks, habits = await _fetch_tasks_and_habits(user_id, db_pool)
        
        if request.force_refresh:
            # Regenerate ignoring cache
            plan = await planner_engine.regenerate_plan(
                user_id=user_id,
                tasks=tasks,
                habits=habits,
                energy_level=request.energy_level or "medium",
                user_name=user_name,
            )
        else:
            # Use cache if available
            plan = await planner_engine.get_or_generate_plan(
                user_id=user_id,
                tasks=tasks,
                habits=habits,
                energy_level=request.energy_level or "medium",
                user_name=user_name,
            )
        
        return {
            "plan": plan,
            "energy_level": request.energy_level,
            "usage": usage,
        }
        
    except Exception as e:
        logger.error(f"Planner error: {e}")
        return {
            "plan": {
                "blocks": [],
                "summary": "Unable to generate plan. Please try again.",
                "tip": "Try refreshing in a moment.",
            },
            "energy_level": request.energy_level,
            "usage": usage,
        }


@router.get("/today")
async def get_cached_plan(
    current_user: dict = Depends(get_current_user),
    usage: dict = Depends(require_ai_access),
):
    """
    Get today's plan from cache (no-regenerate).
    
    Quick endpoint for loading existing plans.
    """
    try:
        user_id = current_user["id"]
        user_name = current_user.get("fullName", "friend")
        db_pool = get_db()
        
        # Fetch tasks and habits
        tasks, habits = await _fetch_tasks_and_habits(user_id, db_pool)
        
        plan = await planner_engine.get_or_generate_plan(
            user_id=user_id,
            tasks=tasks,
            habits=habits,
            energy_level="medium",
            user_name=user_name,
        )
        
        return {
            "plan": plan,
            "usage": usage,
        }
        
    except Exception as e:
        logger.error(f"Planner GET error: {e}")
        return {
            "plan": None,
            "usage": usage,
        }


@router.get("/usage")
async def get_plan_usage(
    current_user: dict = Depends(get_current_user),
):
    """
    Get current user's AI usage info (for AIUsageDashboard).
    """
    from core.plan_gate import get_plan_info
    info = await get_plan_info(current_user)
    return info
