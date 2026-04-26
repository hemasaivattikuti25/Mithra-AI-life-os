"""
Mithra OS — Backend Configuration
Firebase Auth + Neon PostgreSQL.
Gemini is lazy-loaded on first AI request to save memory on cold start.
"""
import os
import logging
import json
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("mithra.config")

# ─── Configuration ───────────────────────────────────────────────
NEON_DATABASE_URL = os.getenv("NEON_DATABASE_URL", "")
FIREBASE_SERVICE_ACCOUNT_JSON = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")


def validate_config():
    """Validates environment variables. Logs warnings for missing optional vars."""
    required = {
        "NEON_DATABASE_URL": NEON_DATABASE_URL,
        "FIREBASE_SERVICE_ACCOUNT_JSON": FIREBASE_SERVICE_ACCOUNT_JSON,
        "GEMINI_API_KEY": GEMINI_API_KEY,
    }
    missing = [k for k, v in required.items() if not v or "your-" in v]

    # Core vars for production
    core_vars = ["NEON_DATABASE_URL", "FIREBASE_SERVICE_ACCOUNT_JSON"]
    if ENVIRONMENT == "production" and any(k in missing for k in core_vars):
        raise RuntimeError(f"Missing required env vars for production: {missing}")

    present = [k for k in required if k not in missing]
    if present:
        logger.info(f"✅ Config OK: {', '.join(present)}")
    if missing:
        logger.warning(f"⚠️  Missing env vars: {', '.join(missing)}")
    return missing


# ─── Firebase Admin SDK (for token verification) ─────────────────
_firebase_initialized = False

def _init_firebase():
    global _firebase_initialized
    if _firebase_initialized or not FIREBASE_SERVICE_ACCOUNT_JSON:
        return
    try:
        import firebase_admin
        from firebase_admin import credentials
        cred_dict = json.loads(FIREBASE_SERVICE_ACCOUNT_JSON)
        cred = credentials.Certificate(cred_dict)
        firebase_admin.initialize_app(cred)
        _firebase_initialized = True
        logger.info("✅ Firebase Admin SDK initialized")
    except Exception as e:
        logger.warning(f"⚠️  Firebase Admin init failed: {e}")

_init_firebase()


# ─── Neon PostgreSQL Connection Pool (asyncpg) ───────────────────
# Pool is created async in main.py lifespan, stored here for access
db_pool = None

async def init_db_pool():
    """Initialize the asyncpg connection pool. Call from lifespan."""
    global db_pool
    if not NEON_DATABASE_URL:
        logger.warning("⚠️  NEON_DATABASE_URL missing — DB features disabled")
        return
    try:
        import asyncpg
        db_pool = await asyncpg.create_pool(
            NEON_DATABASE_URL,
            min_size=1,
            max_size=5,
            command_timeout=30,
        )
        logger.info("✅ Neon PostgreSQL pool connected")
    except Exception as e:
        logger.error(f"⚠️  Neon DB pool init failed: {e}")
        db_pool = None

async def close_db_pool():
    """Close the asyncpg connection pool. Call from lifespan shutdown."""
    global db_pool
    if db_pool:
        await db_pool.close()
        db_pool = None
        logger.info("✅ Neon DB pool closed")

def get_db():
    """Get the asyncpg connection pool."""
    return db_pool


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
