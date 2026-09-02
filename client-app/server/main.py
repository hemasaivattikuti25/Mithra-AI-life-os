import asyncio
import logging
import os
from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from core.config import get_db, get_model, validate_config, init_db_pool, close_db_pool
from core.rate_limiter import RateLimitMiddleware
from migrations.runner import run_migrations
from routers import auth_router, chat_router, tasks_router, planner_router, calendar_router
from services.warmup import keep_alive

# ─── Structured logging ──────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("mithra")


# ─── Lifespan (startup / shutdown) ──────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- Startup ---
    logger.info("🚀 Mithra Backend starting up...")
    missing = validate_config()
    if missing:
        logger.warning(f"Starting in degraded mode — missing: {', '.join(missing)}")

    # Init Neon PostgreSQL connection pool
    await init_db_pool()

    # Run DB migrations (idempotent — safe on every restart)
    db_pool = get_db()
    if db_pool:
        try:
            await run_migrations(db_pool)
        except Exception as e:
            logger.error(f"❌ Migration runner failed: {e}", exc_info=True)

    # Background keep-alive worker (prevents Render free tier cold starts)
    warmup_task = asyncio.create_task(keep_alive())

    # APScheduler — empty for now, jobs added when email/payment is wired
    scheduler = AsyncIOScheduler()
    scheduler.start()
    app.state.scheduler = scheduler

    logger.info("✅ Mithra Backend ready")
    yield  # App runs here

    # --- Shutdown ---
    logger.info("🛑 Mithra Backend shutting down...")
    warmup_task.cancel()
    try:
        await warmup_task
    except asyncio.CancelledError:
        pass

    if hasattr(app.state, "scheduler") and app.state.scheduler.running:
        app.state.scheduler.shutdown()

    await close_db_pool()


# ─── App ─────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Mithra API",
    description="The Brain of Mithra Life OS",
    version="4.0.0",
    lifespan=lifespan,
)

# ─── CORS ────────────────────────────────────────────────────────────────────
_raw_origins = os.getenv("ALLOWED_ORIGINS", "")
if _raw_origins:
    origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]
else:
    _env = os.getenv("ENVIRONMENT", "development")
    if _env == "production":
        origins = [
            "https://mithra-lifeos.com",
            "https://www.mithra-lifeos.com",
            "https://mithra-life-os.vercel.app",
            "capacitor://localhost",
            "http://localhost",
        ]
    else:
        origins = [
            "http://localhost:5173",
            "http://localhost:3000",
            "http://localhost:8000",
        ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Rate Limiter ─────────────────────────────────────────────────────────────
app.add_middleware(RateLimitMiddleware)


# ─── Global Exception Handler ─────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(
        f"Unhandled error on {request.method} {request.url.path}: {exc}",
        exc_info=True,
    )
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected server error occurred. Please try again later."},
    )


# ─── Routers ──────────────────────────────────────────────────────────────────
app.include_router(auth_router.router,      prefix="/api/auth",  tags=["Auth"])
app.include_router(chat_router.router,      prefix="/api/chat",  tags=["AI Chat"])
app.include_router(planner_router.router,   prefix="/api/plan",  tags=["AI Planner"])
app.include_router(tasks_router.router,     prefix="/api",       tags=["Activity & Data"])
app.include_router(calendar_router.router,                       tags=["Google Calendar"])


# ─── Health Checks ────────────────────────────────────────────────────────────
@app.get("/")
def health_check():
    db_pool = get_db()
    return {
        "status": "online",
        "system": "Mithra Brain Active",
        "version": "4.0.0",
        "services": {
            "database": "connected" if db_pool else "unavailable",
            "ai": "available (NVIDIA NIM)" if get_model() else "disabled",
        },
        "timestamp": datetime.now().isoformat(),
    }


@app.get("/ping")
def ping():
    """Lightweight health check for Render."""
    return {"pong": True}


if __name__ == "__main__":
    import uvicorn
    print("\n🚀 Starting Mithra Backend on http://localhost:8000")
    print("📖 API Docs: http://localhost:8000/docs\n")
    uvicorn.run(app, host="0.0.0.0", port=8000)
