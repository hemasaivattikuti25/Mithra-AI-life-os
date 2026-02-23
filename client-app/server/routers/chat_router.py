from fastapi import APIRouter, Depends, HTTPException
from schemas.models import ChatRequest
from core.security import get_current_user
from core.plan_gate import require_ai_access
from core.config import get_model, supabase, get_embedding
from datetime import date, datetime
import json
import logging

logger = logging.getLogger("mithra.chat")

router = APIRouter()


def _fetch_user_context(user_id: str) -> dict:
    """Fetch live tasks, habits, and today's mood for the user.
    Returns a dict with structured context for the system prompt."""
    context = {
        "pending_tasks": [],
        "habits": [],
        "today_mood": None,
    }

    if not supabase:
        return context

    try:
        # Pending tasks — top 10 by priority + due date
        tasks_res = (
            supabase.table("tasks")
            .select("title, priority, due_date, starred, completed")
            .eq("user_id", user_id)
            .eq("completed", False)
            .order("starred", desc=True)
            .order("due_date", desc=False)
            .limit(10)
            .execute()
        )
        if tasks_res.data:
            context["pending_tasks"] = tasks_res.data
    except Exception as e:
        logger.debug(f"Failed to fetch tasks: {e}")

    try:
        # Active habits with streak info
        habits_res = (
            supabase.table("habits")
            .select("title, category, streak, longest_streak, completed_dates")
            .eq("user_id", user_id)
            .limit(15)
            .execute()
        )
        if habits_res.data:
            today_str = date.today().isoformat()
            for h in habits_res.data:
                completed_dates = h.get("completed_dates", [])
                h["today_done"] = today_str in completed_dates if completed_dates else False
            context["habits"] = habits_res.data
    except Exception as e:
        logger.debug(f"Failed to fetch habits: {e}")

    try:
        # Today's journal mood
        journal_res = (
            supabase.table("journal_entries")
            .select("mood, content")
            .eq("user_id", user_id)
            .eq("date", date.today().isoformat())
            .limit(1)
            .execute()
        )
        if journal_res.data:
            context["today_mood"] = journal_res.data[0].get("mood")
    except Exception as e:
        logger.debug(f"Failed to fetch mood: {e}")

    return context


def _build_context_block(ctx: dict) -> str:
    """Format the user context into a readable text block for the prompt."""
    parts = []

    # Tasks
    if ctx["pending_tasks"]:
        task_lines = []
        for t in ctx["pending_tasks"]:
            star = "⭐ " if t.get("starred") else ""
            due = t.get("due_date", "no due date")
            if due and due != "no due date":
                try:
                    due = datetime.fromisoformat(due.replace("Z", "+00:00")).strftime("%b %d")
                except Exception:
                    pass
            task_lines.append(f"  - {star}{t['title']} (Priority: {t.get('priority', 'med')}, Due: {due})")
        parts.append(f"### Pending Tasks ({len(ctx['pending_tasks'])}):\n" + "\n".join(task_lines))
    else:
        parts.append("### Pending Tasks: None — all caught up! 🎉")

    # Habits
    if ctx["habits"]:
        habit_lines = []
        for h in ctx["habits"]:
            status = "✅" if h.get("today_done") else "⬜"
            habit_lines.append(
                f"  - {status} {h['title']} — {h.get('streak', 0)} day streak "
                f"(best: {h.get('longest_streak', 0)})"
            )
        done_count = sum(1 for h in ctx["habits"] if h.get("today_done"))
        parts.append(
            f"### Habits ({done_count}/{len(ctx['habits'])} done today):\n" + "\n".join(habit_lines)
        )

    # Mood
    if ctx["today_mood"] is not None:
        mood_labels = {1: "Rough", 2: "Low", 3: "Neutral", 4: "Good", 5: "Great"}
        parts.append(f"### Today's Mood: {ctx['today_mood']}/5 ({mood_labels.get(ctx['today_mood'], 'Unknown')})")

    return "\n\n".join(parts) if parts else "No user data available."


def _is_day_plan_request(message: str) -> bool:
    """Detect if the user wants a day plan / schedule."""
    triggers = [
        "plan my day", "plan today", "day architect", "schedule my day",
        "what should i do today", "what should i focus on", "daily plan",
        "today's plan", "create a schedule", "time block", "plan my schedule",
    ]
    lower = message.lower().strip()
    return any(t in lower for t in triggers)


@router.post("")
async def chat_with_dost(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user),
    usage: dict = Depends(require_ai_access),
):
    """AI chat with Dost — stoic companion with memory, context, and history."""
    try:
        user_msg = request.message
        user_id = current_user["id"]
        user_name = current_user.get("fullName", "friend")

        model = get_model()
        if not model:
            return {
                "reply": f"I hear you, {user_name}. But I need my Gemini keys to speak fully.",
                "action": None,
                "memory_used": False,
                "usage": usage,
            }

        # --- Fetch Live User Context (Problem 4) ---
        user_ctx = _fetch_user_context(user_id)
        context_block = _build_context_block(user_ctx)

        # --- RAG Memory Retrieval ---
        memory_context = ""
        try:
            if supabase:
                msg_embedding = get_embedding(user_msg)
                related_data = supabase.rpc(
                    'match_journal_entries',
                    {
                        'query_embedding': msg_embedding,
                        'match_threshold': 0.5,
                        'match_count': 5,
                        'p_user_id': user_id,
                    }
                ).execute()

                if related_data.data:
                    memory_context = "\n".join([
                        f"- {item['content']} (Date: {item.get('date', 'N/A')})"
                        for item in related_data.data
                    ])
        except Exception as e:
            logger.debug(f"RAG Error: {e}")

        # --- Build System Prompt ---
        is_day_plan = _is_day_plan_request(user_msg)

        if is_day_plan:
            system_prompt = f"""You are Dost, a stoic productivity architect for {user_name}.

The user wants you to **plan their day**. Use their ACTUAL tasks and habits below to create a realistic, time-blocked schedule.

{context_block}

### Journal Memory (RAG):
{memory_context if memory_context else "No recent journal entries."}

### Day Planning Rules:
1. Start from the current time and plan until end of day
2. Include ALL pending tasks, prioritized by urgency and due date
3. Include incomplete habits at appropriate times
4. Add breaks (5-10 min) between focus blocks
5. Mark high-priority items with 🔴
6. Format as a clean time-blocked schedule using Markdown
7. Add a brief motivational note at the end
8. Be realistic — don't overpack the schedule

User: {user_msg}
Dost (Day Architect):
"""
        else:
            system_prompt = f"""You are Dost, a stoic digital companion for {user_name}.

### User's Current Data:
{context_block}

### Context from Journal (RAG):
{memory_context if memory_context else "No recent journal entries found."}

### Style Guidelines:
1. **Tone**: Calm, reflective, insightful, and stoic.
2. **Format**: Use **Markdown** effectively. Bold for emphasis, bullet points, quote blocks for wisdom.
3. **Brevity**: Be concise but meaningful.
4. **Context-Aware**: Reference the user's actual tasks, habits, and streaks when relevant. Don't give generic advice — use their real data.

### Functionality:
- If the user asks to *create* a specific task or habit, output a JSON action block at the END.
- Format: ||JSON||{{"action": "create_task", "task": {{"title": "...", "priority": "medium", "due_date": "tomorrow"}}}}
- Only output JSON if the intent is clear and actionable.

User: {user_msg}
Dost:
"""

        # --- Use Chat History (Problem 3) ---
        if request.history:
            # Convert history to Gemini format and use start_chat
            gemini_history = []
            for msg in request.history[-20:]:  # Last 20 messages max
                gemini_history.append({
                    "role": msg.role,
                    "parts": msg.parts,
                })

            chat = model.start_chat(history=gemini_history)
            response = chat.send_message(system_prompt)
        else:
            # No history — single-shot generation
            response = model.generate_content(system_prompt)

        text_response = response.text

        # --- Parse action JSON from response ---
        action_data = None
        if "||JSON||" in text_response:
            parts = text_response.split("||JSON||")
            text_response = parts[0].strip()
            try:
                json_str = parts[1].strip()
                if json_str.startswith('```json'): json_str = json_str[7:]
                if json_str.startswith('```'): json_str = json_str[3:]
                if json_str.endswith('```'): json_str = json_str[:-3]
                action_data = json.loads(json_str.strip())
            except Exception:
                logger.debug(f"Failed to parse JSON action from response")

        return {
            "reply": text_response,
            "action": action_data,
            "memory_used": bool(memory_context),
            "context_used": bool(user_ctx["pending_tasks"] or user_ctx["habits"]),
            "usage": usage,
        }

    except Exception as e:
        logger.error(f"Chat error: {e}")
        return {
            "reply": "I hit a snag processing that. Could you rephrase? 🤔",
            "action": None,
            "memory_used": False,
            "usage": usage if 'usage' in dir() else {},
        }
