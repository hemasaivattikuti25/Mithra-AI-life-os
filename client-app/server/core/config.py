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
DATABASE_URL = (
    os.getenv("SUPABASE_DATABASE_URL")
    or os.getenv("DATABASE_URL")
    or os.getenv("NEON_DATABASE_URL", "")
)
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", os.getenv("SUPABASE_ANON_KEY", ""))
FIREBASE_SERVICE_ACCOUNT_JSON = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON", "")
NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY", "")
NVIDIA_BASE_URL = os.getenv("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1")
NVIDIA_MODEL = os.getenv("NVIDIA_MODEL", "nvidia/nemotron-3.5-lightning-30b-a3b")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")


def validate_config():
    """Validates environment variables. Logs warnings for missing optional vars."""
    required = {
        "DATABASE_URL": DATABASE_URL,
        "FIREBASE_SERVICE_ACCOUNT_JSON": FIREBASE_SERVICE_ACCOUNT_JSON,
        "NVIDIA_API_KEY": NVIDIA_API_KEY,
    }
    missing = [k for k, v in required.items() if not v or "your-" in v]

    # Core vars for production
    core_vars = ["DATABASE_URL", "FIREBASE_SERVICE_ACCOUNT_JSON"]
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


# ─── Supabase / PostgreSQL Connection Pool (asyncpg) ─────────────
# Pool is created async in main.py lifespan, stored here for access
db_pool = None

async def init_db_pool():
    """Initialize the asyncpg connection pool. Call from lifespan."""
    global db_pool
    if not DATABASE_URL:
        logger.warning("⚠️  DATABASE_URL / SUPABASE_DATABASE_URL missing — DB features disabled")
        return
    try:
        import asyncpg
        # Disable prepared statement caching if connecting via PgBouncer / Transaction pooler (port 6543)
        is_pooler = ":6543" in DATABASE_URL or "pooler.supabase.com" in DATABASE_URL or "pgbouncer" in DATABASE_URL
        statement_cache_size = 0 if is_pooler else 100

        db_pool = await asyncpg.create_pool(
            DATABASE_URL,
            min_size=1,
            max_size=10,
            command_timeout=30,
            statement_cache_size=statement_cache_size,
        )
        provider = "Supabase PostgreSQL" if "supabase" in DATABASE_URL.lower() else "PostgreSQL"
        logger.info(f"✅ {provider} pool connected")
    except Exception as e:
        logger.error(f"⚠️  Database pool init failed: {e}")
        db_pool = None

async def close_db_pool():
    """Close the asyncpg connection pool. Call from lifespan shutdown."""
    global db_pool
    if db_pool:
        await db_pool.close()
        db_pool = None
        logger.info("✅ Database pool closed")

def get_db():
    """Get the asyncpg connection pool."""
    return db_pool


# ─── NVIDIA NIM AI Client (LAZY) ─────────────────────────────────
_ai_client = None
_ai_initialized = False

def get_ai_client():
    """Returns the OpenAI async client configured for NVIDIA NIM, lazily initializing on first call."""
    global _ai_client, _ai_initialized
    if _ai_initialized:
        return _ai_client
    _ai_initialized = True

    if NVIDIA_API_KEY and "your-" not in NVIDIA_API_KEY:
        try:
            from openai import AsyncOpenAI
            _ai_client = AsyncOpenAI(
                base_url=NVIDIA_BASE_URL,
                api_key=NVIDIA_API_KEY,
            )
            logger.info("✅ NVIDIA NIM AI connected (lazy init)")
        except Exception as e:
            logger.error(f"⚠️  NVIDIA NIM init failed: {e}")
            _ai_client = None
    else:
        logger.warning("⚠️  NVIDIA API key missing — AI features disabled")
        _ai_client = None
    return _ai_client

def get_model():
    """Alias for backwards compatibility."""
    return get_ai_client()

def get_embedding(text: str):
    """Generates placeholder/fallback vector embedding."""
    return [0.0] * 768
