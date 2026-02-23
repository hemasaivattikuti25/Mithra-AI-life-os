from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import os

from core.config import supabase, model
from routers import auth_router, chat_router, tasks_router

app = FastAPI(
    title="Mithra API",
    description="The Brain of Mithra Life OS — Clean Architecture",
    version="3.0.0",
)

# --- Security Checks ---
if os.getenv("ENVIRONMENT") == "production":
    if not supabase:
        print("WARNING: Supabase credentials missing. Endpoints relying on DB will fail.")

# --- CORS ---
origins = [
    "https://mithra-lifeos.com",
    "https://www.mithra-lifeos.com",
    "https://mithra-life-os.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Routers ---
app.include_router(auth_router.router, prefix="/api/auth", tags=["Auth"])
app.include_router(chat_router.router, prefix="/api/chat", tags=["AI Chat"])
app.include_router(tasks_router.router, prefix="/api", tags=["Activity & Data"])

# --- Health Check ---
@app.get("/")
def health_check():
    """Health check endpoint."""
    return {
        "status": "online",
        "system": "Mithra Brain Active (Clean Architecture)",
        "version": "3.0.0",
        "services": {
            "supabase": "connected" if supabase else "ERROR",
            "gemini": "connected" if model else "disabled",
        },
        "timestamp": datetime.now().isoformat(),
    }

if __name__ == "__main__":
    import uvicorn
    print("\n🚀 Starting Mithra Backend on http://localhost:8000")
    print("📖 API Docs: http://localhost:8000/docs\n")
    uvicorn.run(app, host="0.0.0.0", port=8000)
