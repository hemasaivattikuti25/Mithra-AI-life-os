import asyncio
import logging
import os
from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import supabase, get_model, validate_config
from core.rate_limiter import RateLimitMiddleware
from routers import auth_router, chat_router, tasks_router
from routers import calendar_router, workspace_router
from services.warmup import keep_alive

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

    # Start background warmup worker (keeps Supabase/Render alive)
    warmup_task = asyncio.create_task(keep_alive())

    logger.info("✅ Mithra Backend ready to accept requests")
    yield  # App runs here

    # --- Shutdown ---
    logger.info("🛑 Mithra Backend shutting down...")
    warmup_task.cancel()
    try:
        await warmup_task
    except asyncio.CancelledError:
        pass


# ─── App ─────────────────────────────────────────────────────────
app = FastAPI(
    title="Mithra API",
    description="The Brain of Mithra Life OS — Clean Architecture",
    version="3.1.0",
    lifespan=lifespan,
)

# ─── CORS ───────────────────────────────────────────────────────────────────
default_origins = "https://mithra-lifeos.com,https://www.mithra-lifeos.com,https://mithra-life-os.vercel.app,http://localhost:5173,http://localhost:3000"
origins = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", default_origins).split(",") if o.strip()]


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
    error_msg = str(exc)
    logger.error(f"Global Error on {request.method} {request.url.path}: {error_msg}")
    logger.error(traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected server error occurred.", "error": error_msg}
    )

# ─── Routers ─────────────────────────────────────────────────────
app.include_router(auth_router.router, prefix="/api/auth", tags=["Auth"])
app.include_router(chat_router.router, prefix="/api/chat", tags=["AI Chat"])
app.include_router(tasks_router.router, prefix="/api", tags=["Activity & Data"])
app.include_router(calendar_router.router, prefix="/api/calendar", tags=["Google Calendar"])
app.include_router(workspace_router.router, prefix="/api", tags=["Mithra Blend"])


# ─── Health Check (full — shows service statuses) ────────────────
@app.get("/")
def health_check():
    """Full health check with service statuses."""
    return {
        "status": "online",
        "system": "Mithra Brain Active (Clean Architecture)",
        "version": "3.1.0",
        "services": {
            "supabase": "connected" if supabase else "unavailable",
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
