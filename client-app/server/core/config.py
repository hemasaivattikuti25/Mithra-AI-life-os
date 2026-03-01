"""
Mithra OS — Backend Configuration
Gracefully handles missing credentials so the server can start in demo mode.
Gemini is lazy-loaded on first AI request to save memory on cold start.
"""
import os
import logging
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("mithra.config")

# ─── Configuration ───────────────────────────────────────────────
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")


def validate_config():
    """Validates environment variables. Raises RuntimeError if core vars are missing."""
    required = {
        "SUPABASE_URL": SUPABASE_URL,
        "SUPABASE_KEY": SUPABASE_KEY,
        "SUPABASE_JWT_SECRET": SUPABASE_JWT_SECRET,
        "GEMINI_API_KEY": GEMINI_API_KEY,
    }
    missing = [k for k, v in required.items() if not v or "your-" in v]
    
    # If core env vars are missing, we crash instead of just warning (prevents backend failures)
    core_vars = ["SUPABASE_URL", "SUPABASE_KEY", "SUPABASE_JWT_SECRET"]
    if any(k in missing for k in core_vars):
        raise RuntimeError(f"Missing required env vars: {missing}")

    present = [k for k in required if k not in missing]
    if present:
        logger.info(f"✅ Config OK: {', '.join(present)}")
    if missing:
        logger.warning(f"⚠️  Missing optional env vars: {', '.join(missing)}")
    return missing


# ─── Supabase Client (eager — needed for health check) ───────────
supabase = None

def _init_supabase():
    global supabase
    if SUPABASE_URL and SUPABASE_KEY and "your-" not in SUPABASE_URL:
        try:
            from supabase import create_client
            supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
            logger.info("✅ Supabase connected")
        except Exception as e:
            logger.error(f"⚠️  Supabase init failed: {e}")
            supabase = None
    else:
        logger.warning("⚠️  Supabase credentials missing — DB features disabled")
        supabase = None

_init_supabase()


# ─── Supabase Admin Client (service_role — for backend operations that bypass RLS) ───
supabase_admin = None

def _init_supabase_admin():
    global supabase_admin
    if SUPABASE_URL and SUPABASE_SERVICE_KEY and "your-" not in SUPABASE_SERVICE_KEY:
        try:
            from supabase import create_client
            supabase_admin = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
            logger.info("✅ Supabase Admin (service_role) connected")
        except Exception as e:
            logger.warning(f"⚠️  Supabase Admin init failed: {e}")
            supabase_admin = None
    else:
        logger.warning("⚠️  SUPABASE_SERVICE_KEY missing — transfer_ownership will use anon key (may fail on RLS)")
        supabase_admin = None

_init_supabase_admin()


# ─── Gemini Model (LAZY — only loads on first AI request) ────────
_model_instance = None
_model_initialized = False

def get_model():
    """Returns the Gemini model, lazily initializing on first call.
    Saves ~100MB RAM on cold start for Render free tier."""
    global _model_instance, _model_initialized
    if _model_initialized:
        return _model_instance
    _model_initialized = True

    if GEMINI_API_KEY and "your-" not in GEMINI_API_KEY:
        try:
            import google.generativeai as genai
            genai.configure(api_key=GEMINI_API_KEY)
            _model_instance = genai.GenerativeModel('gemini-1.5-flash')
            logger.info("✅ Gemini AI connected (lazy init)")
        except Exception as e:
            logger.error(f"⚠️  Gemini init failed: {e}")
            _model_instance = None
    else:
        logger.warning("⚠️  Gemini API key missing — AI features disabled")
        _model_instance = None
    return _model_instance


# Backward compat: `model` still importable but is None until get_model() called
model = None


def get_embedding(text: str):
    """Generates vector embedding for RAG memory using Gemini."""
    if not GEMINI_API_KEY or "your-" in GEMINI_API_KEY:
        logger.debug("Embedding skipped: No Gemini Key")
        return [0.0] * 768
    try:
        import google.generativeai as genai
        result = genai.embed_content(
            model="models/embedding-001",
            content=text,
            task_type="retrieval_document",
            title="Mithra Memory"
        )
        return result['embedding']
    except Exception as e:
        logger.error(f"⚠️  Embedding failed: {e}")
        return [0.0] * 768
