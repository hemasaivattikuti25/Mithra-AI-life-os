"""
═══════════════════════════════════════════════════════════════════════════════
CHAT ENGINE — Handles ALL chat logic for Dost AI.

The router should only handle HTTP. This engine handles:
  • System prompt construction
  • Context injection
  • Response parsing
  • Action extraction
  • Token budget enforcement
═══════════════════════════════════════════════════════════════════════════════
"""
import json
import re
import logging
from datetime import date, datetime
from typing import Optional

from . import ai_gateway

logger = logging.getLogger("mithra.chat_engine")


# ─── Token Budget Constants ──────────────────────────────────────────────────
MAX_HISTORY_MESSAGES = 6
MAX_MESSAGE_LENGTH = 200
MAX_TASKS_IN_CONTEXT = 5
MAX_HABITS_IN_CONTEXT = 8
MAX_MEMORY_TOKENS = 200


class ChatEngine:
    """
    The brain of Dost AI. Handles conversation flow, context building,
    and action extraction.
    """

    def __init__(self):
        self.logger = logging.getLogger("mithra.chat_engine")

    def build_system_prompt(
        self,
        user_context: dict,
        user_name: str = "friend",
        memory_context: str = "",
        is_day_plan: bool = False,
    ) -> str:
        """
        Build a carefully crafted system prompt with token budget in mind.

        Args:
            user_context: Dict with pending_tasks, habits, today_mood
            user_name: User's display name
            memory_context: RAG-retrieved journal snippets
            is_day_plan: Whether this is a day planning request

        Returns:
            System prompt string (under 800 tokens)
        """
        today = datetime.now()
        day_name = today.strftime("%A")
        date_str = today.strftime("%B %d, %Y")

        # Build task list (limited to top 5)
        tasks = user_context.get("pending_tasks", [])[:MAX_TASKS_IN_CONTEXT]
        if tasks:
            task_lines = []
            for t in tasks:
                star = "⭐ " if t.get("starred") else ""
                priority = t.get("priority", "medium")[0].upper()  # H/M/L
                due = t.get("due_date", "")
                if due:
                    try:
                        due = datetime.fromisoformat(due.replace("Z", "+00:00")).strftime("%b %d")
                    except Exception:
                        due = "soon"
                else:
                    due = "no date"
                task_lines.append(f"  • {star}{t['title'][:40]} [{priority}] - {due}")
            task_block = "\n".join(task_lines)
        else:
            task_block = "  (No pending tasks — all caught up! 🎉)"

        # Build habit list (limited to 8)
        habits = user_context.get("habits", [])[:MAX_HABITS_IN_CONTEXT]
        if habits:
            done_count = sum(1 for h in habits if h.get("today_done"))
            habit_lines = []
            for h in habits:
                status = "✅" if h.get("today_done") else "⬜"
                streak = h.get("streak", 0)
                habit_lines.append(f"  {status} {h['title'][:30]} ({streak} day streak)")
            habit_block = f"({done_count}/{len(habits)} done today)\n" + "\n".join(habit_lines)
        else:
            habit_block = "  (No habits set up yet)"

        # Mood
        mood = user_context.get("today_mood")
        mood_labels = {1: "Rough 😔", 2: "Low 😕", 3: "Okay 😐", 4: "Good 🙂", 5: "Great 😊"}
        mood_text = mood_labels.get(mood, "Not logged") if mood else "Not logged"

        # Memory context (truncated)
        if memory_context and len(memory_context) > MAX_MEMORY_TOKENS * 4:
            memory_context = memory_context[:MAX_MEMORY_TOKENS * 4] + "..."
        memory_block = memory_context if memory_context else "No relevant past entries."

        if is_day_plan:
            return f"""You are Dost, a stoic productivity architect for {user_name}.

📅 Today: {day_name}, {date_str}
😊 Mood: {mood_text}

### Pending Tasks:
{task_block}

### Habits:
{habit_block}

### Memory (from journal):
{memory_block}

### Instructions:
Create a realistic time-blocked schedule for today.
1. Start from current time, plan until end of day
2. Prioritize by urgency (due date) and priority level
3. Include incomplete habits at appropriate times
4. Add 5-10 min breaks between focus blocks
5. Mark high-priority items with 🔴
6. Format as clean Markdown timeline
7. End with a brief motivational note

Be realistic — don't overpack. User's energy: {user_context.get('energy_level', 'medium')}."""

        else:
            return f"""You are Dost, {user_name}'s stoic digital companion.

📅 Today: {day_name}, {date_str}
😊 Mood: {mood_text}

### {user_name}'s Tasks:
{task_block}

### Habits:
{habit_block}

### Memory:
{memory_block}

### Your Style:
- Calm, reflective, insightful, stoic
- Use **Markdown**: bold for emphasis, bullets for lists
- Be concise but meaningful
- Reference their REAL tasks/habits when relevant
- Don't give generic advice — use their actual data

### Actions:
If user wants to CREATE something, output JSON at the END:
||JSON||{{"action": "create_task|create_habit|log_mood", "data": {{...}}}}

Only output JSON for clear, actionable requests."""

    def extract_actions(self, response_text: str) -> tuple[str, list]:
        """
        Extract action JSON blocks from Gemini response.

        Returns:
            Tuple of (clean_message, actions_list)
        """
        actions = []
        clean_text = response_text

        # Look for ||JSON|| blocks
        if "||JSON||" in response_text:
            parts = response_text.split("||JSON||")
            clean_text = parts[0].strip()

            for json_part in parts[1:]:
                try:
                    # Clean up markdown
                    json_str = json_part.strip()
                    if json_str.startswith("```json"):
                        json_str = json_str[7:]
                    if json_str.startswith("```"):
                        json_str = json_str[3:]
                    if json_str.endswith("```"):
                        json_str = json_str[:-3]
                    json_str = json_str.strip()

                    # Parse JSON
                    action_data = json.loads(json_str)
                    if action_data:
                        actions.append(action_data)
                except json.JSONDecodeError as e:
                    self.logger.debug(f"Failed to parse action JSON: {e}")
                except Exception:
                    pass

        return clean_text, actions

    def is_day_plan_request(self, message: str) -> bool:
        """Detect if user wants a day plan."""
        triggers = [
            "plan my day", "plan today", "day architect", "schedule my day",
            "what should i do today", "what should i focus on", "daily plan",
            "today's plan", "create a schedule", "time block", "plan my schedule",
            "help me plan", "organize my day",
        ]
        lower = message.lower().strip()
        return any(t in lower for t in triggers)

    # ─── Token Budget Constants as class attributes ────────────────────────────
    MAX_TASKS_IN_CONTEXT = MAX_TASKS_IN_CONTEXT
    MAX_HABITS_IN_CONTEXT = MAX_HABITS_IN_CONTEXT

    def extract_casual_actions(self, message: str, habits: list, tasks: list) -> list:
        """
        Detect actions from casual conversation using NLP-style pattern matching.

        Returns a list of action dicts that should be silently executed.
        """
        actions = []
        lower = message.lower().strip()

        # Habit completion patterns
        habit_triggers = [
            # Exercise/Gym
            (r"\b(finished?|completed?|did|done with)\s+(my\s+)?(gym|workout|exercise|training|run|jog|yoga|meditation|meditate)\b", ["gym", "workout", "exercise", "training", "run", "jog", "yoga", "meditation"]),
            (r"\b(just\s+)?(back from|came from|left)\s+(the\s+)?(gym|workout|run|jog)\b", ["gym", "workout", "run", "jog"]),
            (r"\bjust\s+(ran|jogged|exercised|worked out|meditated|did yoga)\b", ["run", "jog", "exercise", "workout", "meditation", "yoga"]),
            # Reading/Learning
            (r"\b(finished?|completed?|done)\s+(reading|studying|learning|my\s+book|the\s+book)\b", ["reading", "study", "learning", "book"]),
            (r"\bread\s+(\d+\s+)?(pages?|chapters?|for\s+\d+\s+min)\b", ["reading", "book"]),
            # Morning routine
            (r"\b(woke up|got up|morning routine|brushed|showered)\b", ["morning", "wake", "routine"]),
            # Water/Hydration
            (r"\b(drank|drinking|had)\s+(\d+\s+)?(glasses?|cups?|liters?)\s+(of\s+)?water\b", ["water", "hydration", "drink"]),
            # Coding/Work
            (r"\b(finished?|done with|completed?)\s+(coding|work|project|task)\b", ["coding", "code", "work", "project"]),
        ]

        for pattern, keywords in habit_triggers:
            if re.search(pattern, lower):
                for habit in habits:
                    h_title = habit.get("title", "").lower()
                    if any(kw in h_title for kw in keywords):
                        today_done = habit.get("today_done", False)
                        if not today_done:
                            actions.append({
                                "type": "complete_habit",
                                "habit_id": habit.get("id"),
                                "habit_name": habit.get("title"),
                            })
                            break

        # Mood detection patterns
        mood_patterns = [
            (r"\b(feeling|i'?m)\s+(great|amazing|fantastic|incredible|awesome|wonderful|excited|happy|energetic)\b", 9),
            (r"\b(feeling|i'?m)\s+(good|nice|fine|okay|better|motivated|productive|focused)\b", 7),
            (r"\b(had a great|great day|awesome day|productive day)\b", 8),
            (r"\b(feeling|i'?m)\s+(okay|alright|so-so|meh|neutral|normal)\b", 5),
            (r"\b(feeling|i'?m)\s+(tired|exhausted|sleepy|drained|burnt out|burnout)\b", 4),
            (r"\b(feeling|i'?m)\s+(stressed|anxious|worried|overwhelmed)\b", 3),
            (r"\b(feeling|i'?m)\s+(sad|down|low|depressed|rough|bad|terrible|awful)\b", 2),
            (r"\b(rough|hard|tough|difficult|bad)\s+day\b", 3),
        ]

        for pattern, score in mood_patterns:
            if re.search(pattern, lower):
                actions.append({"type": "log_mood", "score": score})
                break

        # Task completion patterns
        task_triggers = [
            r"\b(finished?|completed?|done with|submitted|sent)\s+(the\s+)?(.+?)\s*(report|project|assignment|task|email|presentation|document)\b",
            r"\bjust\s+(finished?|completed?|submitted|sent)\s+(.+)\b",
        ]

        for pattern in task_triggers:
            match = re.search(pattern, lower)
            if match:
                query_parts = [g for g in match.groups() if g]
                query = " ".join(query_parts[-2:]) if len(query_parts) >= 2 else query_parts[-1] if query_parts else ""
                for task in tasks:
                    if not task.get("completed") and query.lower() in task.get("title", "").lower():
                        actions.append({
                            "type": "complete_task",
                            "task_id": task.get("id"),
                            "task_name": task.get("title"),
                        })
                        break

        return actions

    def trim_history(self, history: list) -> list:
        """
        Trim chat history to save tokens.

        - Max 6 messages
        - Each message truncated to 200 chars
        """
        trimmed = []
        for msg in history[-MAX_HISTORY_MESSAGES:]:
            parts = msg.get("parts", "")
            if isinstance(parts, list):
                parts = " ".join(str(p) for p in parts)

            # Truncate
            if len(parts) > MAX_MESSAGE_LENGTH:
                parts = parts[:MAX_MESSAGE_LENGTH] + "..."

            trimmed.append({
                "role": msg.get("role", "user"),
                "parts": parts,
            })

        return trimmed

    async def process_message(
        self,
        message: str,
        user_id: str,
        user_name: str = "friend",
        history: Optional[list] = None,
        db_pool = None,
    ) -> dict:
        """
        Process a chat message through the full pipeline.

        This is the main entry point called by the router.
        Handles fetching context, building prompts, and generating response.

        Args:
            message: The user's input
            user_id: User's unique ID
            user_name: User's display name
            history: Previous messages (list of {role, parts})
            db_pool: asyncpg connection pool

        Returns:
            {"reply": str, "action": dict, "actions": list, "memory_used": bool, "context_used": bool}
        """
        from . import memory_engine

        # Fetch user context from DB
        user_context = await self._fetch_user_context(user_id, db_pool)

        # Detect casual actions (NLP)
        casual_actions = self.extract_casual_actions(
            message,
            user_context.get("habits", []),
            user_context.get("pending_tasks", []),
        )

        # Get RAG memory context
        memory_context = ""
        try:
            memory_context = await memory_engine.build_memory_context(
                user_id=user_id,
                current_message=message,
                db_pool=db_pool,
            )
        except Exception as e:
            self.logger.debug(f"Memory context failed: {e}")

        is_day_plan = self.is_day_plan_request(message)

        # Build system prompt
        system_prompt = self.build_system_prompt(
            user_context=user_context,
            user_name=user_name,
            memory_context=memory_context,
            is_day_plan=is_day_plan,
        )

        try:
            # Generate response
            if history:
                trimmed_history = self.trim_history(history)
                response_text = await ai_gateway.generate_chat_with_history(
                    system_prompt=system_prompt,
                    user_message=message,
                    history=trimmed_history,
                    max_tokens=400 if is_day_plan else 300,
                )
            else:
                response_text = await ai_gateway.generate_chat_response(
                    system_prompt=system_prompt,
                    user_message=message,
                    max_tokens=400 if is_day_plan else 300,
                )

            # Extract structured actions from response
            clean_message, parsed_actions = self.extract_actions(response_text)

            return {
                "reply": clean_message,
                "action": parsed_actions[0] if parsed_actions else None,
                "actions": casual_actions,  # NLP-detected actions from casual text
                "memory_used": bool(memory_context),
                "context_used": bool(user_context.get("pending_tasks") or user_context.get("habits")),
            }

        except Exception as e:
            self.logger.error(f"Chat engine error: {e}")
            return {
                "reply": "I hit a snag processing that. Could you rephrase? 🤔",
                "action": None,
                "actions": [],
                "memory_used": False,
                "context_used": False,
            }

    async def _fetch_user_context(self, user_id: str, db_pool) -> dict:
        """Fetch live tasks, habits, and today's mood for the user."""

        context = {
            "pending_tasks": [],
            "habits": [],
            "today_mood": None,
        }

        if not db_pool:
            return context

        try:
            async with db_pool.acquire() as conn:
                # Pending tasks
                tasks = await conn.fetch(
                    """SELECT id, title, priority, due_date, starred, completed
                       FROM tasks WHERE user_id = $1 AND completed = false
                       ORDER BY starred DESC, due_date ASC NULLS LAST
                       LIMIT $2""",
                    user_id, self.MAX_TASKS_IN_CONTEXT + 5
                )
                if tasks:
                    context["pending_tasks"] = [dict(t) for t in tasks]

                # Active habits with streak info
                habits = await conn.fetch(
                    """SELECT id, title, category, streak, longest_streak, completed_dates
                       FROM habits WHERE user_id = $1 LIMIT $2""",
                    user_id, self.MAX_HABITS_IN_CONTEXT + 7
                )
                if habits:
                    today_str = date.today().isoformat()
                    for h in habits:
                        completed_dates = h.get("completed_dates") or []
                        h_dict = dict(h)
                        h_dict["today_done"] = today_str in completed_dates if completed_dates else False
                        context["habits"].append(h_dict)

                # Today's journal mood
                journal = await conn.fetchrow(
                    """SELECT mood FROM journal_entries
                       WHERE user_id = $1 AND date = $2 LIMIT 1""",
                    user_id, date.today().isoformat()
                )
                if journal:
                    context["today_mood"] = journal.get("mood")
        except Exception as e:
            self.logger.debug(f"Failed to fetch context: {e}")

        return context


# Singleton instance
chat_engine = ChatEngine()
