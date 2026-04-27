"""
Mithra AI Services Module
Central AI architecture with dedicated engines for each capability.
"""
from .ai_gateway import (
    generate_chat_response,
    parse_natural_language,
    generate_daily_plan,
    create_embedding,
    generate_quick_insight,
    get_cached,
    set_cached,
)
from .chat_engine import ChatEngine
from .parser_engine import parse_task_from_text, parse_habit_from_text, parse_event_from_text
from .planner_engine import get_or_generate_plan
from .memory_engine import build_memory_context

__all__ = [
    # Gateway
    "generate_chat_response",
    "parse_natural_language",
    "generate_daily_plan",
    "create_embedding",
    "generate_quick_insight",
    "get_cached",
    "set_cached",
    # Engines
    "ChatEngine",
    "parse_task_from_text",
    "parse_habit_from_text",
    "parse_event_from_text",
    "get_or_generate_plan",
    "build_memory_context",
]
