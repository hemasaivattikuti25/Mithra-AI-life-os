"""
═══════════════════════════════════════════════════════════════════════════════
MEMORY ENGINE — RAG-based personal memory for Dost AI.

Handles journal embeddings and retrieval for personalized conversations.
This is what makes Dost feel truly personal — it remembers past entries.
═══════════════════════════════════════════════════════════════════════════════
"""
import logging
from datetime import date
from typing import Optional

from . import ai_gateway

logger = logging.getLogger("mithra.memory_engine")


EXPANSION_SYSTEM_PROMPT = """You are a search query expander for a personal journal database.
Your task is to take a user's current message and write a search query consisting of 3-5 keywords or short phrases that are highly likely to appear in past journal entries describing similar situations, emotions, or reflections.
Do NOT reply to the user. Do NOT write a sentence. Return ONLY the search terms, separated by commas.

Example 1:
Input: "I feel stressed about work"
Output: work pressure, stressed, overwhelmed, deadline, career anxiety

Example 2:
Input: "My stomach hurts today"
Output: stomach ache, feeling sick, health issue, physically unwell, nauseous

Example 3:
Input: "had a great workout"
Output: exercise, gym, running, feeling energetic, workout success
"""


async def expand_query(query: str) -> str:
    """Use Gemini to expand the search query for better RAG retrieval.
    DISABLED: to save API costs.
    """
    return query


async def retrieve_relevant_memories(
    user_id: str,
    query: str,
    limit: int = 3,
    db_pool = None,
) -> list[dict]:
    """
    DISABLED: to save API costs.
    """
    return []


async def build_memory_context(
    user_id: str,
    current_message: str,
    db_pool = None,
) -> str:
    """
    DISABLED: to save API costs.
    """
    return ""


async def get_mood_trends(
    user_id: str,
    days: int = 7,
    db_pool = None,
) -> dict:
    """
    Get mood trends for insights.

    Returns:
        {"average": float, "trend": "up"|"down"|"stable", "entries": int}
    """
    if not db_pool:
        return {"average": None, "trend": "unknown", "entries": 0}

    try:
        async with db_pool.acquire() as conn:
            rows = await conn.fetch(
                """SELECT mood, date FROM journal_entries
                   WHERE user_id = $1 AND mood IS NOT NULL
                   ORDER BY date DESC
                   LIMIT $2""",
                user_id,
                days,
            )

        if not rows:
            return {"average": None, "trend": "unknown", "entries": 0}

        moods = [row["mood"] for row in rows if row["mood"]]

        if not moods:
            return {"average": None, "trend": "unknown", "entries": 0}

        avg = sum(moods) / len(moods)

        # Trend: compare first half vs second half
        if len(moods) >= 2:
            mid = len(moods) // 2
            recent_avg = sum(moods[:mid]) / mid
            older_avg = sum(moods[mid:]) / (len(moods) - mid)

            if recent_avg > older_avg + 0.5:
                trend = "up"
            elif recent_avg < older_avg - 0.5:
                trend = "down"
            else:
                trend = "stable"
        else:
            trend = "stable"

        return {
            "average": round(avg, 1),
            "trend": trend,
            "entries": len(moods),
        }

    except Exception as e:
        logger.debug(f"[Memory] Mood trends failed: {e}")
        return {"average": None, "trend": "unknown", "entries": 0}
