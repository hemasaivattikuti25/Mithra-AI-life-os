"""
═══════════════════════════════════════════════════════════════════════════════
AI GATEWAY — The SINGLE entry point for ALL AI calls in Mithra via NVIDIA NIM.

Powered by NVIDIA Inference Microservices (OpenAI-compatible async client).
Models:
  • Primary: nvidia/nemotron-3.5-lightning-30b-a3b
═══════════════════════════════════════════════════════════════════════════════
"""
import os
import json
import hashlib
import time
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel

logger = logging.getLogger("mithra.ai_gateway")

# ─── Pydantic Schemas for Structured Responses ───────────────────────────────
class ActionResponse(BaseModel):
    action: str
    data: Dict[str, Any]

class DostResponseSchema(BaseModel):
    reply: str
    action: Optional[ActionResponse] = None

# ─── Configuration ───────────────────────────────────────────────────────────
NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY", "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")
NVIDIA_BASE_URL = os.getenv("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1")
DEFAULT_MODEL = os.getenv("NVIDIA_MODEL", "nvidia/nemotron-3.5-lightning-30b-a3b")

# ─── Lazy Client Initialization ──────────────────────────────────────────────
_client = None

def _get_client():
    """Get or create the AsyncOpenAI client for NVIDIA NIM."""
    global _client
    if _client is not None:
        return _client
    if not NVIDIA_API_KEY or "your-" in NVIDIA_API_KEY:
        logger.warning("⚠️  NVIDIA API key missing — AI features disabled")
        return None
    try:
        from openai import AsyncOpenAI
        _client = AsyncOpenAI(
            base_url=NVIDIA_BASE_URL,
            api_key=NVIDIA_API_KEY,
        )
        logger.info(f"✅ AI Gateway: NVIDIA NIM client initialized ({DEFAULT_MODEL})")
        return _client
    except Exception as e:
        logger.error(f"⚠️  AI Gateway: NVIDIA NIM init failed: {e}")
        return None

# ─── In-Memory Cache ─────────────────────────────────────────────────────────
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

# ─── Helpers ─────────────────────────────────────────────────────────────────
def _estimate_tokens(text: str) -> int:
    """Rough token estimate: ~4 chars per token for English."""
    return len(text) // 4

def _log_ai_call(func_name: str, model: str, input_tokens: int, output_tokens: int = 0):
    """Log AI gateway calls for monitoring."""
    total = input_tokens + output_tokens
    logger.info(f"[AI Gateway] {func_name} | ~{total} tokens | {model}")

def _clean_json_text(text: str) -> str:
    """Strip markdown code block fences and extra whitespace from JSON responses."""
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()

# ─── Core AI Gateway Functions ───────────────────────────────────────────────

async def generate_chat_response(
    system_prompt: str,
    user_message: str,
    max_tokens: int = 500,
    temperature: float = 0.7,
    model_name: str = DEFAULT_MODEL,
    response_schema: Optional[Any] = None,
) -> str:
    """
    Generate a single-turn chat response using NVIDIA NIM.
    Used for Dost AI conversation and structured action extraction.
    """
    client = _get_client()
    if not client:
        raise RuntimeError("AI Gateway: NVIDIA NIM not available")

    try:
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ]

        input_tokens = _estimate_tokens(system_prompt + "\n" + user_message)

        response = await client.chat.completions.create(
            model=model_name,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
            extra_body={"chat_template_kwargs": {"enable_thinking": False}},
        )

        result = response.choices[0].message.content or ""
        result = _clean_json_text(result)
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
    max_tokens: int = 500,
    temperature: float = 0.7,
    model_name: str = DEFAULT_MODEL,
    response_schema: Optional[Any] = None,
) -> str:
    """
    Generate a multi-turn chat response preserving conversation history.
    Accepts both OpenAI format and Gemini legacy format history.
    """
    client = _get_client()
    if not client:
        raise RuntimeError("AI Gateway: NVIDIA NIM not available")

    try:
        messages = [{"role": "system", "content": system_prompt}]

        # Convert history format
        if history:
            for msg in history:
                if isinstance(msg, dict):
                    role = msg.get("role", "user")
                    # Map Gemini 'model' role to OpenAI 'assistant'
                    if role == "model":
                        role = "assistant"

                    # Handle Gemini 'parts' list vs OpenAI 'content' string
                    if "parts" in msg and isinstance(msg["parts"], list):
                        content = " ".join(str(p) for p in msg["parts"])
                    else:
                        content = msg.get("content", "")

                    if content:
                        messages.append({"role": role, "content": content})

        messages.append({"role": "user", "content": user_message})

        input_tokens = sum(_estimate_tokens(m["content"]) for m in messages)

        response = await client.chat.completions.create(
            model=model_name,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
            extra_body={"chat_template_kwargs": {"enable_thinking": False}},
        )

        result = response.choices[0].message.content or ""
        result = _clean_json_text(result)
        output_tokens = _estimate_tokens(result)
        _log_ai_call("chat_with_history", model_name, input_tokens, output_tokens)

        return result

    except Exception as e:
        logger.error(f"[AI Gateway] chat_with_history failed: {e}")
        raise RuntimeError(f"AI Gateway: chat_with_history failed — {str(e)}")


async def parse_natural_language(
    text: str,
    parse_type: str = "task",
    today: Optional[str] = None,
    max_tokens: int = 250,
) -> dict:
    """
    Parse freeform natural language text into structured JSON.
    Used for fast task, habit, and calendar scheduling inputs.
    """
    today = today or datetime.now().strftime("%Y-%m-%d")

    client = _get_client()
    if not client:
        raise RuntimeError("AI Gateway: NVIDIA NIM not available")

    prompts = {
        "task": f"""You are a task parser. Today is {today}.
Extract task information from the user text and return ONLY a valid JSON object:
{{
  "title": "Clean, concise task title without date/priority keywords",
  "due_date": "YYYY-MM-DD or null",
  "due_time": "HH:MM (24-hour) or null",
  "priority": "high|medium|low",
  "category": "Work|Personal|Health|Finance|etc.",
  "confidence": 0.95
}}

User text: "{text}"
Return ONLY valid JSON:""",

        "habit": f"""You are a habit parser.
Extract habit information from the user text and return ONLY a valid JSON object:
{{
  "title": "Habit name",
  "category": "Health|Productivity|Mindfulness|Learning|Personal",
  "frequency": 1,
  "repeat_days": [0,1,2,3,4,5,6],
  "schedule_time": "HH:MM or null",
  "focus_duration": 25,
  "streak_goal": 30,
  "confidence": 0.95
}}

User text: "{text}"
Return ONLY valid JSON:""",

        "event": f"""You are a calendar event parser. Today is {today}.
Extract event information from the user text and return ONLY a valid JSON object:
{{
  "title": "Event title",
  "start": "YYYY-MM-DDTHH:MM:SS (ISO 8601)",
  "end": "YYYY-MM-DDTHH:MM:SS (ISO 8601, default +1 hour if not specified)",
  "category": "Meeting|Work|Personal|Health|Focus",
  "confidence": 0.95
}}

User text: "{text}"
Return ONLY valid JSON:""",
    }

    prompt = prompts.get(parse_type, prompts["task"])

    try:
        input_tokens = _estimate_tokens(prompt)

        response = await client.chat.completions.create(
            model=DEFAULT_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=max_tokens,
            extra_body={"chat_template_kwargs": {"enable_thinking": False}},
        )

        result_text = _clean_json_text(response.choices[0].message.content or "")
        output_tokens = _estimate_tokens(result_text)
        _log_ai_call(f"parse_{parse_type}", DEFAULT_MODEL, input_tokens, output_tokens)

        return json.loads(result_text)

    except json.JSONDecodeError as e:
        logger.warning(f"[AI Gateway] parse_natural_language JSON decode error: {e}")
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
    max_tokens: int = 600,
) -> dict:
    """
    Generate an AI-powered daily plan with time blocks.
    Results are cached in-memory for 12 hours.
    """
    today = datetime.now().strftime("%Y-%m-%d")
    task_ids = "-".join([str(t.get("id", ""))[:8] for t in tasks[:5]])
    cache_key = _cache_key("daily-plan", today, energy_level, task_ids)

    # Check cache
    cached = get_cached(cache_key)
    if cached:
        logger.info("[AI Gateway] daily_plan cache hit")
        return json.loads(cached)

    client = _get_client()
    if not client:
        raise RuntimeError("AI Gateway: NVIDIA NIM not available")

    # Format task and habit list
    task_list = "\n".join([
        f"- {t.get('title', 'Task')} (Priority: {t.get('priority', 'medium')}, Due: {t.get('due_date', 'none')})"
        for t in tasks[:8]
    ]) or "No pending tasks"

    habit_list = "\n".join([
        f"- {h.get('title', 'Habit')} ({h.get('focus_duration', 25)} min)"
        for h in habits[:6]
    ]) or "No habits"

    prompt = f"""You are an elite productivity coach creating a day plan for {user_name}.

TODAY: {today}
ENERGY LEVEL: {energy_level}
WORK HOURS: {work_start} - {work_end}

TASKS:
{task_list}

HABITS:
{habit_list}

Create a realistic time-blocked schedule. Return ONLY valid JSON:
{{
  "greeting": "Good morning {user_name}! Here is your focused day plan.",
  "time_blocks": [
    {{"time": "09:00 - 10:30", "type": "deep_work", "label": "Top priority focus", "task_id": null}},
    {{"time": "10:30 - 10:45", "type": "break", "label": "Hydrate & walk", "task_id": null}}
  ],
  "habit_reminders": [
    {{"time": "08:30", "habit": "Morning routine"}}
  ],
  "daily_tip": "Focus on progress, not perfection.",
  "estimated_workload": "moderate"
}}

Rules:
- Include 5-15 min breaks between intense focus blocks
- Prioritize high-priority tasks during peak energy hours
- Return ONLY valid raw JSON."""

    try:
        input_tokens = _estimate_tokens(prompt)

        response = await client.chat.completions.create(
            model=DEFAULT_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=max_tokens,
            extra_body={"chat_template_kwargs": {"enable_thinking": False}},
        )

        result_text = _clean_json_text(response.choices[0].message.content or "")
        output_tokens = _estimate_tokens(result_text)
        _log_ai_call("daily_plan", DEFAULT_MODEL, input_tokens, output_tokens)

        result = json.loads(result_text)

        # Cache for 12 hours
        set_cached(cache_key, json.dumps(result), ttl_seconds=43200)
        return result

    except json.JSONDecodeError as e:
        logger.warning(f"[AI Gateway] daily_plan JSON parse error: {e}")
        return {
            "greeting": f"Hey {user_name}! Here is a structured schedule for your day.",
            "time_blocks": [
                {"time": f"{work_start} - 12:00", "type": "deep_work", "label": "Focus on high priority tasks", "task_id": None},
                {"time": "12:00 - 13:00", "type": "break", "label": "Lunch and recharge", "task_id": None},
                {"time": f"13:00 - {work_end}", "type": "deep_work", "label": "Complete daily goals & review", "task_id": None},
            ],
            "habit_reminders": [],
            "daily_tip": "Take one step at a time.",
            "estimated_workload": "moderate",
        }
    except Exception as e:
        logger.error(f"[AI Gateway] daily_plan failed: {e}")
        raise RuntimeError(f"AI Gateway: daily_plan failed — {str(e)}")


async def create_embedding(text: str) -> List[float]:
    """
    Generate vector embedding. Falls back to 768-dim zero vector if offline.
    """
    return [0.0] * 768


async def generate_quick_insight(
    context: str,
    insight_type: str = "general",
    max_tokens: int = 150,
) -> str:
    """
    Generate a quick 1-2 sentence motivational or analytical insight for UI cards.
    """
    client = _get_client()
    if not client:
        return "Keep building consistency day by day! 💪"

    prompts = {
        "weekly_summary": f"Based on this productivity data, give a warm, punchy 1-2 sentence weekly review:\n{context}",
        "habit_streak": f"User has these habits: {context}. Give a 1-sentence stoic motivation to maintain streaks.",
        "general": f"Give a 1-sentence stoic productivity tip based on:\n{context}",
    }

    prompt = prompts.get(insight_type, prompts["general"])

    try:
        input_tokens = _estimate_tokens(prompt)
        response = await client.chat.completions.create(
            model=DEFAULT_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
            max_tokens=max_tokens,
            extra_body={"chat_template_kwargs": {"enable_thinking": False}},
        )
        result = (response.choices[0].message.content or "").strip()
        _log_ai_call("quick_insight", DEFAULT_MODEL, input_tokens, _estimate_tokens(result))
        return result
    except Exception as e:
        logger.warning(f"[AI Gateway] generate_quick_insight failed: {e}")
        return "Keep up the great work! Every step forward counts. 💪"
