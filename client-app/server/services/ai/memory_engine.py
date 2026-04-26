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


async def save_journal_memory(
    user_id: str,
    journal_text: str,
    journal_date: str,
    mood_score: int,
    db_pool,
) -> bool:
    """
    Save a journal entry with its embedding for RAG retrieval.

    Args:
        user_id: User's unique ID
        journal_text: The journal content
        journal_date: Date of the entry (YYYY-MM-DD)
        mood_score: Mood score (1-5 or 1-10)
        db_pool: asyncpg connection pool

    Returns:
        True on success, False on failure
    """
    if not db_pool:
        logger.warning("[Memory] No DB pool available")
        return False

    try:
        # Truncate text to save tokens
        truncated_text = journal_text[:500] if len(journal_text) > 500 else journal_text

        # Generate embedding
        embedding = await ai_gateway.create_embedding(truncated_text)

        # Convert embedding list to pgvector format
        embedding_str = str(embedding)

        async with db_pool.acquire() as conn:
            # Update the journal entry with embedding
            await conn.execute(
                """UPDATE journal_entries
                   SET embedding = $1::vector
                   WHERE user_id = $2 AND date = $3""",
                embedding_str.replace("[", "{").replace("]", "}"),
                user_id,
                journal_date,
            )

        logger.info(f"[Memory] Saved embedding for journal {journal_date}")
        return True

    except Exception as e:
        logger.warning(f"[Memory] Failed to save journal embedding: {e}")
        return False


async def retrieve_relevant_memories(
    user_id: str,
    query: str,
    limit: int = 3,
    db_pool = None,
) -> list[dict]:
    """
    Retrieve journal entries most relevant to the query using vector similarity.

    Args:
        user_id: User's unique ID
        query: The search query (user's message)
        limit: Max number of results
        db_pool: asyncpg connection pool

    Returns:
        List of relevant journal snippets with date and mood
    """
    if not db_pool:
        return []

    try:
        # Generate embedding for the query
        query_embedding = await ai_gateway.create_embedding(query)

        async with db_pool.acquire() as conn:
            # pgvector cosine similarity search (<=> operator)
            rows = await conn.fetch(
                """SELECT content, date, mood
                   FROM journal_entries
                   WHERE user_id = $1 AND embedding IS NOT NULL
                   ORDER BY embedding <=> $2::vector
                   LIMIT $3""",
                user_id,
                str(query_embedding).replace("[", "{").replace("]", "}"),
                limit,
            )

        results = []
        for row in rows:
            results.append({
                "content": row.get("content", "")[:200],  # Truncate for context
                "date": row.get("date"),
                "mood": row.get("mood"),
            })

        logger.debug(f"[Memory] Retrieved {len(results)} memories for query")
        return results

    except Exception as e:
        logger.debug(f"[Memory] RAG retrieval failed (graceful fallback): {e}")
        return []


async def build_memory_context(
    user_id: str,
    current_message: str,
    db_pool = None,
) -> str:
    """
    Build a memory context string to inject into the system prompt.

    Args:
        user_id: User's unique ID
        current_message: The user's current message (used as query)
        db_pool: asyncpg connection pool

    Returns:
        Formatted memory context string (under 200 tokens)
        Empty string if no memories found.
    """
    memories = await retrieve_relevant_memories(
        user_id=user_id,
        query=current_message,
        limit=3,
        db_pool=db_pool,
    )

    if not memories:
        return ""

    # Format memories for the prompt
    lines = ["From your past journal entries:"]

    mood_labels = {
        1: "very rough", 2: "rough", 3: "low", 4: "okay",
        5: "neutral", 6: "good", 7: "quite good", 8: "great",
        9: "amazing", 10: "best day",
    }

    for mem in memories:
        date_str = mem.get("date", "Unknown date")
        content = mem.get("content", "")[:150]  # Truncate
        mood = mem.get("mood")
        mood_text = f" (mood: {mood_labels.get(mood, mood)}/10)" if mood else ""

        lines.append(f"- {date_str}: {content}{mood_text}")

    result = "\n".join(lines)

    # Enforce token budget (roughly 200 tokens = 800 chars)
    if len(result) > 800:
        result = result[:800] + "..."

    return result


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
