import asyncio
import logging
import os
from contextlib import asynccontextmanager
from datetime import datetime

import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.asyncio import AsyncioIntegration
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from core.config import get_db, get_model, validate_config, init_db_pool, close_db_pool
from core.rate_limiter import RateLimitMiddleware
from migrations.runner import run_migrations
from routers import auth_router, chat_router, tasks_router, planner_router
from routers import workspace_router, calendar_router, payments_router, gdpr_router, referrals_router
from services.warmup import keep_alive
from services.scheduler_jobs import send_weekly_digests, send_streak_alerts

# ─── Sentry Error Tracking ────────────────────────────────────────
_sentry_dsn = os.getenv("SENTRY_DSN", "")
if _sentry_dsn:
    sentry_sdk.init(
        dsn=_sentry_dsn,
        integrations=[FastApiIntegration(), AsyncioIntegration()],
        traces_sample_rate=0.1,
        profiles_sample_rate=0.1,
        environment=os.getenv("ENVIRONMENT", "development"),
    )
    logging.getLogger("mithra").info("Sentry initialized")

# ─── Structured logging ─────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("mithra")


# ─── Lifespan (startup / shutdown) ──────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Modern FastAPI lifespan handler. Runs startup logic, then
    yields control to the app, then runs shutdown cleanup."""

    # --- Startup ---
    logger.info("🚀 Mithra Backend starting up...")
    missing = validate_config()
    if missing:
        logger.warning(f"Starting in degraded mode — missing: {', '.join(missing)}")

    # Initialize Neon PostgreSQL connection pool
    await init_db_pool()

    # Run DB migrations (idempotent — safe on every restart)
    db_pool = get_db()
    if db_pool:
        try:
            await run_migrations(db_pool)
        except Exception as e:
            logger.error(f"❌ Migration runner failed: {e}", exc_info=True)
            # Do not crash — migrations may partially succeed; log and continue

    # Start background warmup worker (keeps DB/Render alive)
    warmup_task = asyncio.create_task(keep_alive())
    
    # Initialize APScheduler for background tasks
    scheduler = AsyncIOScheduler()
    db_pool = get_db()

    # Weekly digest — every Sunday at 9AM UTC
    scheduler.add_job(
        send_weekly_digests, 'cron',
        day_of_week='sun', hour=9, minute=0,
        args=[db_pool], id='weekly_digest', replace_existing=True
    )
    # Streak alert — every day at 7PM UTC
    scheduler.add_job(
        send_streak_alerts, 'cron',
        hour=19, minute=0,
        args=[db_pool], id='streak_alerts', replace_existing=True
    )

    scheduler.start()
    app.state.scheduler = scheduler

    logger.info("✅ Mithra Backend ready to accept requests")
    yield  # App runs here

    # --- Shutdown ---
    logger.info("🛑 Mithra Backend shutting down...")
    warmup_task.cancel()
    try:
        await warmup_task
    except asyncio.CancelledError:
        pass
    
    # Shutdown scheduler
    if hasattr(app.state, 'scheduler') and app.state.scheduler.running:
        app.state.scheduler.shutdown()
    
    # Close DB pool
    await close_db_pool()


# ─── App ─────────────────────────────────────────────────────────
app = FastAPI(
    title="Mithra API",
    description="The Brain of Mithra Life OS — Clean Architecture",
    version="3.1.0",
    lifespan=lifespan,
)

# ─── CORS ───────────────────────────────────────────────────────────────────
raw_origins = os.getenv("ALLOWED_ORIGINS", "")
if raw_origins:
    origins = [o.strip() for o in raw_origins.split(",") if o.strip()]
else:
    # Production fallback: only known production domains
    # localhost is NOT included here for security — set ALLOWED_ORIGINS env var for local dev
    _env = os.getenv("ENVIRONMENT", "development")
    if _env == "production":
        origins = [
            "https://mithra-lifeos.com",
            "https://www.mithra-lifeos.com",
            "https://mithra-life-os.vercel.app",
            "capacitor://localhost",
            "http://localhost",   # Capacitor Android
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
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Rate Limiter ────────────────────────────────────────────────
app.add_middleware(RateLimitMiddleware)

# ─── Global Exception Handler ────────────────────────────────────
from fastapi.responses import JSONResponse
from fastapi import Request
import traceback

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error on {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected server error occurred. Please try again later."}
    )

# ─── Routers ───────────────────────────────────────────────
app.include_router(auth_router.router,       prefix="/api/auth",      tags=["Auth"])
app.include_router(chat_router.router,       prefix="/api/chat",      tags=["AI Chat"])
app.include_router(planner_router.router,    prefix="/api/plan",      tags=["AI Planner"])
app.include_router(tasks_router.router,      prefix="/api",           tags=["Activity & Data"])
app.include_router(workspace_router.router,  prefix="/api",           tags=["Mithra Blend"])
app.include_router(calendar_router.router,                             tags=["Google Calendar"])
app.include_router(payments_router.router,   prefix="/api/payments",  tags=["Payments"])
app.include_router(gdpr_router.router,       prefix="/api/gdpr",      tags=["GDPR"])
app.include_router(referrals_router.router,  prefix="/api/referrals", tags=["Referrals"])


# ─── Health Check (full — shows service statuses) ────────────────
@app.get("/")
def health_check():
    """Full health check with service statuses."""
    db_pool = get_db()
    return {
        "status": "online",
        "system": "Mithra Brain Active (Firebase + Neon)",
        "version": "4.0.0",
        "services": {
            "database": "connected" if db_pool else "unavailable",
            "gemini": "available" if get_model() else "disabled",
        },
        "timestamp": datetime.now().isoformat(),
    }


# ─── Ping (lightweight — for Render health check) ────────────────
@app.get("/ping")
def ping():
    """Ultra-lightweight health check. No DB call, no AI call.
    Use this for Render's health check configuration."""
    return {"pong": True}


if __name__ == "__main__":
    import uvicorn
    print("\n🚀 Starting Mithra Backend on http://localhost:8000")
    print("📖 API Docs: http://localhost:8000/docs\n")
    uvicorn.run(app, host="0.0.0.0", port=8000)
