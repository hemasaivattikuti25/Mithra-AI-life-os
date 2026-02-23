from fastapi import APIRouter, Depends, HTTPException
from schemas.models import ChatRequest
from core.security import get_current_user
from core.plan_gate import require_ai_access
from core.config import model, supabase, get_embedding
import json

router = APIRouter()


@router.post("")
async def chat_with_dost(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user),
    usage: dict = Depends(require_ai_access),  # Atomic check + increment
):
    """AI chat with Dost — stoic companion with memory. Gated by plan limits."""
    try:
        user_msg = request.message
        user_id = current_user["id"]

        if not model:
            return {
                "reply": f"I hear you, {current_user['fullName']}. But I need my Gemini keys to speak fully.",
                "action": None,
                "memory_used": False,
                "usage": usage,
            }

        # --- RAG Memory Retrieval ---
        memory_context = ""
        try:
            msg_embedding = get_embedding(user_msg)
            related_data = supabase.rpc(
                'match_journal_entries',
                {
                    'query_embedding': msg_embedding,
                    'match_threshold': 0.5,
                    'match_count': 5,
                    'filter_user_id': user_id
                }
            ).execute()

            if related_data.data:
                memory_context = "\n".join([
                    f"- {item['content']} (Mood: {item.get('mood_score', 'N/A')})"
                    for item in related_data.data
                ])
        except Exception as e:
            print(f"RAG Error: {e}")

        system_prompt = f"""
        You are Dost, a stoic digital companion for {current_user['fullName']}.
        
        ### Context from Journal (RAG):
        {memory_context if memory_context else "No recent journal entries found."}

        ### Style Guidelines:
        1. **Tone**: Calm, reflective, insightful, and stoic. 
        2. **Format**: Use **Markdown** effectively. Use bold for emphasis, bullet points for lists, and quote blocks for wisdom.
        3. **Brevity**: Be concise but meaningful. Avoid flowery language.

        ### Functionality:
        - If the user asks to *create* a specific task or habit, and strict details are provided, output a JSON action block at the END.
        - Format: ||JSON||{{"action": "create_task", "task": {{"title": "...", "priority": "medium", "due_date": "tomorrow"}}}}
        - Only output JSON if the intent is clear and actionable. Otherwise, just guide them.

        User: {user_msg}
        Dost:
        """

        response = model.generate_content(system_prompt)
        text_response = response.text

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
                print(f"Failed to parse JSON action from: {parts[1]}")

        return {
            "reply": text_response,
            "action": action_data,
            "memory_used": bool(memory_context),
            "usage": usage,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
