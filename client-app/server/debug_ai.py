"""
Quick test of Dost AI chain end-to-end.
Run: python debug_ai.py
"""
import asyncio
import os
import sys

# Load .env
from dotenv import load_dotenv
load_dotenv()

async def main():
    print("=" * 60)
    print("MITHRA AI GATEWAY DEBUG TEST")
    print("=" * 60)

    gemini_key = os.getenv("GEMINI_API_KEY", "")
    print(f"GEMINI_API_KEY present: {bool(gemini_key)}")
    print(f"GEMINI_API_KEY starts with: {gemini_key[:8]}..." if gemini_key else "❌ MISSING")

    print("\n--- Test 1: Raw Gemini Call ---")
    try:
        import google.generativeai as genai
        genai.configure(api_key=gemini_key)
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content("Say: I am working correctly.")
        print(f"✅ Raw Gemini works: {response.text.strip()}")
    except Exception as e:
        print(f"❌ Raw Gemini FAILED: {e}")
        return

    print("\n--- Test 2: AI Gateway generate_chat_response ---")
    try:
        from services.ai.ai_gateway import generate_chat_response
        result = await generate_chat_response(
            system_prompt="You are Dost, a helpful AI companion.",
            user_message="Hello! Are you working?",
            max_tokens=100,
        )
        print(f"✅ AI Gateway works: {result}")
    except Exception:
        import traceback
        print("❌ AI Gateway FAILED:")
        traceback.print_exc()

    print("\n--- Test 3: AI Gateway with DostResponseSchema ---")
    try:
        from services.ai.ai_gateway import generate_chat_response, DostResponseSchema
        result = await generate_chat_response(
            system_prompt="You are Dost. Reply with the schema provided.",
            user_message="Why have I been feeling stressed lately?",
            max_tokens=300,
            response_schema=DostResponseSchema,
        )
        print(f"✅ Schema call works: {result[:200]}")
    except Exception:
        import traceback
        print("❌ Schema call FAILED:")
        traceback.print_exc()

    print("\n--- Test 4: Memory Engine embedding ---")
    try:
        from services.ai.ai_gateway import create_embedding
        vec = await create_embedding("I feel stressed about work")
        print(f"✅ Embedding works: vector length = {len(vec)}")
    except Exception:
        import traceback
        print("❌ Embedding FAILED:")
        traceback.print_exc()

    print("\n" + "=" * 60)
    print("DEBUG COMPLETE")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(main())
