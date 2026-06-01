"""
Quick test - list available models with this API key
"""
import asyncio
import os
from dotenv import load_dotenv
load_dotenv()

def main():
    import google.generativeai as genai
    key = os.getenv("GEMINI_API_KEY", "")
    genai.configure(api_key=key)

    print("Available models:")
    for m in genai.list_models():
        if "generateContent" in m.supported_generation_methods:
            print(f"  ✅ {m.name}")

if __name__ == "__main__":
    main()
