"""
═══════════════════════════════════════════════════════════════════════════════
AI GATEWAY — The SINGLE entry point for ALL Gemini AI calls in Mithra.

No other file should import google.generativeai directly — only this file.
This centralizes:
  • Model configuration
  • Token counting & logging
  • Error handling
  • Response caching
  • Cost control
═══════════════════════════════════════════════════════════════════════════════
"""
import os
import json
import hashlib
import time
import logging
from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class ActionResponse(BaseModel):
    action: str
    data: Dict[str, Any]

class DostResponseSchema(BaseModel):
    reply: str
    action: Optional[ActionResponse]

logger = logging.getLogger("mithra.ai_gateway")

# ─── Configuration ───────────────────────────────────────────────────────────
# Use stable gemini-1.5-flash and gemini-1.5-pro aliases via latest tags
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# Model names
FLASH_MODEL = "gemini-flash-latest"  # Fast, cheap — stable alias
PRO_MODEL = "gemini-pro-latest"      # Better reasoning — stable alias

# ─── Lazy Model Initialization ───────────────────────────────────────────────
_models = {}
_genai_configured = False


def _ensure_configured():
    """Configure genai only once, lazily."""
    global _genai_configured
    if _genai_configured:
        return True
    if not GEMINI_API_KEY or "your-" in GEMINI_API_KEY:
        logger.warning("⚠️  Gemini API key missing — AI features disabled")
        return False
    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        _genai_configured = True
        logger.info("✅ AI Gateway: Gemini configured")
        return True
    except Exception as e:
        logger.error(f"⚠️  AI Gateway: Gemini config failed: {e}")
        return False


def _get_model(model_name: str = FLASH_MODEL):
    """Get or create a Gemini model instance."""
    if not _ensure_configured():
        return None
    if model_name not in _models:
        try:
            import google.generativeai as genai
            _models[model_name] = genai.GenerativeModel(model_name)
            logger.info(f"✅ AI Gateway: Loaded {model_name}")
        except Exception as e:
            logger.error(f"⚠️  AI Gateway: Failed to load {model_name}: {e}")
            return None
    return _models.get(model_name)


# ─── Simple In-Memory Cache ──────────────────────────────────────────────────
_cache: dict = {}


def _cache_key(prefix: str, *args) -> str:
    """Generate a hash-based cache key."""
    content = f"{prefix}:" + ":".join(str(a) for a in args)
    return hashlib.md5(content.encode()).hexdigest()


def get_cached(key: str) -> Optional[str]:
    """Retrieve a cached value if not expired."""
    if key not in _cache:
        return None
    entry = _cache[key]
    if time.time() > entry["expires"]:
        del _cache[key]
        return None
    return entry["value"]


def set_cached(key: str, value: str, ttl_seconds: int = 3600):
    """Store a value in cache with TTL."""
    _cache[key] = {
        "value": value,
        "expires": time.time() + ttl_seconds,
    }


def clear_cache():
    """Clear all cached entries."""
    global _cache
    _cache = {}


# ─── Token Estimation & Logging ──────────────────────────────────────────────
def _estimate_tokens(text: str) -> int:
    """Rough token estimate: ~4 chars per token for English."""
    return len(text) // 4


def _log_ai_call(func_name: str, model: str, input_tokens: int, output_tokens: int = 0):
    """Log AI gateway calls for monitoring."""
    total = input_tokens + output_tokens
    logger.info(f"[AI Gateway] {func_name} | ~{total} tokens | {model}")


# ─── AI Gateway Functions ────────────────────────────────────────────────────

async def generate_chat_response(
    system_prompt: str,
    user_message: str,
    max_tokens: int = 300,
    temperature: float = 0.7,
    model_name: str = FLASH_MODEL,
    response_schema: Optional[Any] = None,
) -> str:
    """
    Generate a chat response from Gemini.
    Used for Dost AI conversation.
    """
    model = _get_model(model_name)
    if not model:
        raise RuntimeError("AI Gateway: Gemini not available")

    try:
        # Build the full prompt
        full_prompt = f"{system_prompt}\n\nUser: {user_message}\nDost:"

        # Estimate and log tokens
        input_tokens = _estimate_tokens(full_prompt)

        # Generate response
        generation_config = {
            "max_output_tokens": max_tokens,
            "temperature": temperature,
        }
        if response_schema:
            generation_config["response_mime_type"] = "application/json"
            generation_config["response_schema"] = response_schema

        response = model.generate_content(
            full_prompt,
            generation_config=generation_config,
        )

        result = response.text.strip()
        output_tokens = _estimate_tokens(result)
        _log_ai_call("chat_response", model_name, input_tokens, output_tokens)

        return result

    except Exception as e:
        logger.error(f"[AI Gateway] chat_response failed: {e}")
        raise RuntimeError(f"AI Gateway: chat_response failed — {str(e)}")


async def generate_chat_with_history(
    system_prompt: str,
    user_message: str,
    history: list,
    max_tokens: int = 300,
    temperature: float = 0.7,
    model_name: str = FLASH_MODEL,
    response_schema: Optional[Any] = None,
) -> str:
    """
    Generate a chat response with conversation history.
    History format: [{"role": "user"|"model", "parts": "..."}]
    """
    model = _get_model(model_name)
    if not model:
        raise RuntimeError("AI Gateway: Gemini not available")

    try:
        # Truncate history to save tokens
        trimmed_history = []
        for msg in history[-6:]:  # Last 6 messages max
            parts = msg.get("parts", "")
            if isinstance(parts, list):
                parts = " ".join(parts)
            # Truncate each message to 200 chars
            if len(parts) > 200:
                parts = parts[:200] + "..."
            trimmed_history.append({
                "role": msg.get("role", "user"),
                "parts": [parts],
            })

        # Start chat with history
        chat = model.start_chat(history=trimmed_history)

        # Send the system prompt + user message
        full_prompt = f"{system_prompt}\n\nUser: {user_message}"
        input_tokens = _estimate_tokens(full_prompt) + sum(_estimate_tokens(str(m)) for m in trimmed_history)

        generation_config = {
            "max_output_tokens": max_tokens,
            "temperature": temperature,
        }
        if response_schema:
            generation_config["response_mime_type"] = "application/json"
            generation_config["response_schema"] = response_schema

        response = chat.send_message(full_prompt, generation_config=generation_config)
        result = response.text.strip()

        output_tokens = _estimate_tokens(result)
        _log_ai_call("chat_with_history", model_name, input_tokens, output_tokens)

        return result

    except Exception as e:
        logger.error(f"[AI Gateway] chat_with_history failed: {e}")
        raise RuntimeError(f"AI Gateway: chat_with_history failed — {str(e)}")


async def parse_natural_language(
    text: str,
    parse_type: str,  # "task" | "event" | "habit"
    today: Optional[str] = None,
    max_tokens: int = 150,
) -> dict:
    """
    Parse natural language into structured data.
    Always returns valid JSON or raises ValueError.
    """
    model = _get_model(FLASH_MODEL)
    if not model:
        raise RuntimeError("AI Gateway: Gemini not available")

    today = today or datetime.now().strftime("%Y-%m-%d")

    prompts = {
        "task": f"""Parse this into a task. Today is {today}.
Input: "{text}"
Return ONLY valid JSON (no markdown):
{{"title": "...", "due_date": "YYYY-MM-DD or null", "due_time": "HH:MM or null", "priority": "low|medium|high", "confidence": 0.0-1.0}}""",

        "event": f"""Parse this into a calendar event. Today is {today}.
Input: "{text}"
Return ONLY valid JSON (no markdown):
{{"title": "...", "start": "YYYY-MM-DDTHH:MM:SS", "end": "YYYY-MM-DDTHH:MM:SS", "category": "Work|Personal|Meeting|Other"}}""",

        "habit": f"""Parse this into a habit definition.
Input: "{text}"
Return ONLY valid JSON (no markdown):
{{"name": "...", "frequency": "daily|weekly", "time_of_day": "morning|afternoon|evening|anytime", "duration_minutes": number, "category": "Health|Productivity|Mindfulness|Learning|Other"}}""",
    }

    if parse_type not in prompts:
        raise ValueError(f"Unknown parse_type: {parse_type}")

    try:
        prompt = prompts[parse_type]
        input_tokens = _estimate_tokens(prompt)

        response = model.generate_content(
            prompt,
            generation_config={"max_output_tokens": max_tokens, "temperature": 0.1},
        )

        result_text = response.text.strip()
        # Clean up potential markdown formatting
        if result_text.startswith("```json"):
            result_text = result_text[7:]
        if result_text.startswith("```"):
            result_text = result_text[3:]
        if result_text.endswith("```"):
            result_text = result_text[:-3]
        result_text = result_text.strip()

        output_tokens = _estimate_tokens(result_text)
        _log_ai_call(f"parse_{parse_type}", FLASH_MODEL, input_tokens, output_tokens)

        return json.loads(result_text)

    except json.JSONDecodeError as e:
        logger.warning(f"[AI Gateway] parse_natural_language JSON error: {e}")
        raise ValueError(f"Failed to parse response as JSON: {e}")
    except Exception as e:
        logger.error(f"[AI Gateway] parse_natural_language failed: {e}")
        raise RuntimeError(f"AI Gateway: parse failed — {str(e)}")


async def generate_daily_plan(
    tasks: list,
    habits: list,
    energy_level: str = "medium",
    work_start: str = "09:00",
    work_end: str = "18:00",
    user_name: str = "friend",
    max_tokens: int = 500,
) -> dict:
    """
    Generate an AI-powered daily plan with time blocks.
    Results are cached for 12 hours.
    """
    # Generate cache key
    today = datetime.now().strftime("%Y-%m-%d")
    task_ids = "-".join([t.get("id", "")[:8] for t in tasks[:5]])
    cache_key = _cache_key("daily-plan", today, energy_level, task_ids)

    # Check cache first
    cached = get_cached(cache_key)
    if cached:
        logger.info("[AI Gateway] daily_plan cache hit")
        return json.loads(cached)

    model = _get_model(FLASH_MODEL)
    if not model:
        raise RuntimeError("AI Gateway: Gemini not available")

    # Build task list (max 8, today/overdue only)
    task_list = "\n".join([
        f"- {t.get('title', 'Task')} (Priority: {t.get('priority', 'medium')}, Due: {t.get('due_date', 'none')})"
        for t in tasks[:8]
    ]) or "No pending tasks"

    # Build habit list (max 6)
    habit_list = "\n".join([
        f"- {h.get('title', 'Habit')} ({h.get('focus_duration', 25)} min)"
        for h in habits[:6]
    ]) or "No habits"

    prompt = f"""You are a productivity coach creating a day plan for {user_name}.

TODAY: {today}
ENERGY LEVEL: {energy_level}
WORK HOURS: {work_start} - {work_end}

TASKS:
{task_list}

HABITS:
{habit_list}

Create a realistic time-blocked schedule. Return ONLY valid JSON (no markdown):
{{
  "greeting": "Good morning {user_name}! Here's your plan.",
  "time_blocks": [
    {{"time": "09:00 - 10:30", "type": "deep_work|meeting|habit|break|admin", "label": "...", "task_id": "uuid or null"}}
  ],
  "habit_reminders": [
    {{"time": "07:00", "habit": "..."}}
  ],
  "daily_tip": "One motivational sentence",
  "estimated_workload": "light|moderate|heavy"
}}

Rules:
- Include 5-10 min breaks between focus blocks
- Prioritize high-priority and due-today tasks
- Place habits at appropriate times (morning habits early, etc.)
- Be realistic for {energy_level} energy"""

    try:
        input_tokens = _estimate_tokens(prompt)

        response = model.generate_content(
            prompt,
            generation_config={"max_output_tokens": max_tokens, "temperature": 0.3},
        )

        result_text = response.text.strip()
        # Clean markdown
        if result_text.startswith("```json"):
            result_text = result_text[7:]
        if result_text.startswith("```"):
            result_text = result_text[3:]
        if result_text.endswith("```"):
            result_text = result_text[:-3]
        result_text = result_text.strip()

        output_tokens = _estimate_tokens(result_text)
        _log_ai_call("daily_plan", FLASH_MODEL, input_tokens, output_tokens)

        result = json.loads(result_text)

        # Cache for 12 hours
        set_cached(cache_key, json.dumps(result), ttl_seconds=43200)

        return result

    except json.JSONDecodeError as e:
        logger.warning(f"[AI Gateway] daily_plan JSON error: {e}")
        # Return a fallback plan
        return {
            "greeting": f"Hey {user_name}! I couldn't generate a detailed plan, but here's a simple one.",
            "time_blocks": [
                {"time": "09:00 - 12:00", "type": "deep_work", "label": "Focus on top priority tasks", "task_id": None},
                {"time": "12:00 - 13:00", "type": "break", "label": "Lunch break", "task_id": None},
                {"time": "13:00 - 17:00", "type": "admin", "label": "Continue with remaining tasks", "task_id": None},
            ],
            "habit_reminders": [],
            "daily_tip": "Focus on progress, not perfection.",
            "estimated_workload": "moderate",
        }
    except Exception as e:
        logger.error(f"[AI Gateway] daily_plan failed: {e}")
        raise RuntimeError(f"AI Gateway: daily_plan failed — {str(e)}")


async def create_embedding(text: str) -> list:
    """
    Create a vector embedding for RAG/memory search.
    Returns a 768-dimensional vector.
    """
    if not _ensure_configured():
        logger.debug("[AI Gateway] Embedding skipped: No Gemini key")
        return [0.0] * 768

    try:
        import google.generativeai as genai

        # Truncate to save tokens
        truncated = text[:1000] if len(text) > 1000 else text
        input_tokens = _estimate_tokens(truncated)

        result = genai.embed_content(
            model="models/embedding-001",
            content=truncated,
            task_type="retrieval_document",
            title="Mithra Memory",
        )

        _log_ai_call("embedding", "embedding-001", input_tokens)
        return result["embedding"]

    except Exception as e:
        logger.warning(f"[AI Gateway] create_embedding failed: {e}")
        return [0.0] * 768


async def generate_quick_insight(
    context: str,
    insight_type: str = "general",
    max_tokens: int = 100,
) -> str:
    """
    Generate a quick insight for UI widgets (weekly summary, etc.).
    """
    model = _get_model(FLASH_MODEL)
    if not model:
        return "Keep up the great work! 💪"

    prompts = {
        "weekly_summary": f"Based on this data, give a 1-2 sentence weekly insight:\n{context}",
        "habit_tip": f"Based on these habits, give a quick tip:\n{context}",
        "motivation": f"Give a short motivational message based on:\n{context}",
        "general": f"Give a brief insight:\n{context}",
    }

    prompt = prompts.get(insight_type, prompts["general"])

    try:
        input_tokens = _estimate_tokens(prompt)

        response = model.generate_content(
            prompt,
            generation_config={"max_output_tokens": max_tokens, "temperature": 0.7},
        )

        result = response.text.strip()
        output_tokens = _estimate_tokens(result)
        _log_ai_call("quick_insight", FLASH_MODEL, input_tokens, output_tokens)

        return result

    except Exception as e:
        logger.warning(f"[AI Gateway] quick_insight failed: {e}")
        return "Keep up the great work! 💪"
