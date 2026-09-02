"""
═══════════════════════════════════════════════════════════════════════════════
PLANNER ENGINE — AI Daily Planner (Killer Feature #1)

Generates AI-powered daily schedules with:
  • Time-blocked tasks
  • Habit reminders
  • Energy-aware scheduling
  • 12-hour caching
═══════════════════════════════════════════════════════════════════════════════
"""
import logging
from datetime import date, datetime
from typing import Optional

from . import ai_gateway

logger = logging.getLogger("mithra.planner_engine")


async def get_or_generate_plan(
    user_id: str,
    tasks: list,
    habits: list,
    energy_level: str = "medium",
    user_name: str = "friend",
    work_start: str = "09:00",
    work_end: str = "18:00",
) -> dict:
    """
    Get a daily plan from cache or generate a new one.

    This is the public method that routers call.

    Args:
        user_id: User's unique ID
        tasks: List of task dicts (will be filtered to today/overdue)
        habits: List of habit dicts
        energy_level: "low" | "medium" | "high"
        user_name: User's display name
        work_start: Work hours start (HH:MM)
        work_end: Work hours end (HH:MM)

    Returns:
        Plan dict with time_blocks, habit_reminders, etc.
    """
    date.today().isoformat()

    # Filter tasks to today/overdue only
    filtered_tasks = []
    for task in tasks:
        due = task.get("due_date")
        if due:
            try:
                if isinstance(due, datetime):
                    due_date = due.date()
                elif isinstance(due, date):
                    due_date = due
                else:
                    due_date = date.fromisoformat(str(due).split("T")[0])
                if due_date <= date.today():
                    filtered_tasks.append(task)
            except Exception:
                filtered_tasks.append(task)  # Include if date parsing fails
        else:
            # No due date — include if high priority
            if task.get("priority") == "high" or task.get("starred"):
                filtered_tasks.append(task)

    # Sort by priority and due date (stringify due_date to avoid TypeError)
    priority_order = {"high": 0, "medium": 1, "low": 2}
    filtered_tasks.sort(key=lambda t: (
        priority_order.get(t.get("priority", "medium"), 1),
        str(t.get("due_date") or "9999-99-99"),
    ))

    # Filter habits to incomplete ones
    filtered_habits = [h for h in habits if not h.get("today_done", False)]

    try:
        plan = await ai_gateway.generate_daily_plan(
            tasks=filtered_tasks[:8],
            habits=filtered_habits[:6],
            energy_level=energy_level,
            work_start=work_start,
            work_end=work_end,
            user_name=user_name,
        )

        # Add metadata
        plan["generated_at"] = datetime.now().isoformat()
        plan["energy_level"] = energy_level
        plan["task_count"] = len(filtered_tasks)
        plan["habit_count"] = len(filtered_habits)

        return plan

    except Exception as e:
        logger.error(f"Plan generation failed: {e}")

        # Return a simple fallback plan
        return _generate_fallback_plan(
            tasks=filtered_tasks,
            habits=filtered_habits,
            energy_level=energy_level,
            user_name=user_name,
        )


def _generate_fallback_plan(
    tasks: list,
    habits: list,
    energy_level: str,
    user_name: str,
) -> dict:
    """
    Generate a simple fallback plan when AI fails.
    """
    now = datetime.now()
    current_hour = now.hour

    # Basic time blocks
    time_blocks = []

    if current_hour < 12:
        time_blocks.append({
            "time": "09:00 - 12:00",
            "type": "deep_work",
            "label": "Morning focus: High priority tasks",
            "task_id": tasks[0].get("id") if tasks else None,
        })

    time_blocks.append({
        "time": "12:00 - 13:00",
        "type": "break",
        "label": "Lunch break 🍽️",
        "task_id": None,
    })

    time_blocks.append({
        "time": "13:00 - 17:00",
        "type": "admin",
        "label": "Afternoon: Continue with remaining tasks",
        "task_id": None,
    })

    # Habit reminders
    habit_reminders = []
    for i, habit in enumerate(habits[:3]):
        times = ["07:00", "12:00", "18:00"]
        habit_reminders.append({
            "time": times[i % 3],
            "habit": habit.get("title", "Habit"),
        })

    # Workload based on task count
    if len(tasks) <= 2:
        workload = "light"
    elif len(tasks) <= 5:
        workload = "moderate"
    else:
        workload = "heavy"

    # Energy-aware greeting
    greetings = {
        "low": f"Take it easy today, {user_name}. Focus on just the essentials.",
        "medium": f"Good balance today, {user_name}. You've got this!",
        "high": f"High energy day, {user_name}! Let's make it count! 🚀",
    }

    return {
        "greeting": greetings.get(energy_level, greetings["medium"]),
        "time_blocks": time_blocks,
        "habit_reminders": habit_reminders,
        "daily_tip": "Focus on progress, not perfection.",
        "estimated_workload": workload,
        "generated_at": datetime.now().isoformat(),
        "energy_level": energy_level,
        "task_count": len(tasks),
        "habit_count": len(habits),
        "is_fallback": True,
    }


async def regenerate_plan(
    user_id: str,
    tasks: list,
    habits: list,
    energy_level: str = "medium",
    user_name: str = "friend",
) -> dict:
    """
    Force regenerate a plan (clears cache first).
    """
    # Clear today's cache
    today = date.today().isoformat()
    task_ids = "-".join([t.get("id", "")[:8] for t in tasks[:5]])
    cache_key = ai_gateway._cache_key("daily-plan", today, energy_level, task_ids)

    if cache_key in ai_gateway._cache:
        del ai_gateway._cache[cache_key]

    return await get_or_generate_plan(
        user_id=user_id,
        tasks=tasks,
        habits=habits,
        energy_level=energy_level,
        user_name=user_name,
    )
