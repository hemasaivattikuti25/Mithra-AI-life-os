"""
Mithra OS — Backend Configuration
Gracefully handles missing credentials so the server can start in demo mode.
"""
import os
from dotenv import load_dotenv

load_dotenv()

# --- Configuration ---
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# --- Clients (lazy init — only created if credentials exist) ---
supabase = None
model = None

def _init_supabase():
    global supabase
    if SUPABASE_URL and SUPABASE_KEY and "your-" not in SUPABASE_URL:
        try:
            from supabase import create_client
            supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
            print("✅ Supabase connected")
        except Exception as e:
            print(f"⚠️  Supabase init failed: {e}")
            if os.getenv("ENVIRONMENT") == "production":
                raise RuntimeError(f"Supabase init failed in production: {e}")
    else:
        if os.getenv("ENVIRONMENT") == "production":
            raise RuntimeError("Supabase credentials missing in production.")
        print("ℹ️  Supabase not configured — running in demo mode")

def _init_gemini():
    global model
    if GEMINI_API_KEY and "your-" not in GEMINI_API_KEY:
        try:
            import google.generativeai as genai
            genai.configure(api_key=GEMINI_API_KEY)
            model = genai.GenerativeModel('gemini-1.5-flash')
            print("✅ Gemini AI connected")
        except Exception as e:
            print(f"⚠️  Gemini init failed: {e}")
    else:
        print("ℹ️  Gemini API not configured — AI features in demo mode")

def get_embedding(text: str):
    """Generates vector embedding for RAG memory using Gemini."""
    if not GEMINI_API_KEY or "your-" in GEMINI_API_KEY:
        return [0.0] * 768  # dummy embedding
    try:
        import google.generativeai as genai
        result = genai.embed_content(
            model="models/embedding-001",
            content=text,
            task_type="retrieval_document",
            title="Mithra Memory"
        )
        return result['embedding']
    except Exception:
        return [0.0] * 768

# Initialize on import
_init_supabase()
_init_gemini()
