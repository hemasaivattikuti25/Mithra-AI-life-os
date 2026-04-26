"""
═══════════════════════════════════════════════════════════════════════════════
CHAT ROUTER — THIN HTTP handler for Dost AI chat.

This router does NO AI logic. It:
1. Validates request
2. Calls ChatEngine.process_message()
3. Returns the response

All AI logic lives in services/ai/chat_engine.py
═══════════════════════════════════════════════════════════════════════════════
"""
from fastapi import APIRouter, Depends
from schemas.models import ChatRequest
from core.security import get_current_user
from core.plan_gate import require_ai_access
from core.config import get_db
from services.ai.chat_engine import ChatEngine
import logging

logger = logging.getLogger("mithra.chat")

router = APIRouter()

# Single ChatEngine instance (stateless, so safe to share)
chat_engine = ChatEngine()


@router.post("")
async def chat_with_dost(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user),
    usage: dict = Depends(require_ai_access),
):
    """
    AI chat with Dost — stoic companion with memory, context, and history.

    This endpoint is THIN — all logic delegated to ChatEngine.
    """
    try:
        user_id = current_user["id"]
        user_name = current_user.get("fullName", "friend")
        db_pool = get_db()

        # Convert history to simple format if provided
        history = None
        if request.history:
            history = [{"role": m.role, "parts": m.parts} for m in request.history]

        # ═══ Delegate ALL logic to ChatEngine ═══
        result = await chat_engine.process_message(
            message=request.message,
            user_id=user_id,
            user_name=user_name,
            history=history,
            db_pool=db_pool,
        )

        # Add usage info to response
        result["usage"] = usage
        return result

    except Exception as e:
        logger.error(f"Chat error: {e}")
        return {
            "reply": "I hit a snag processing that. Could you rephrase? 🤔",
            "action": None,
            "actions": [],
            "memory_used": False,
            "usage": usage,
        }

