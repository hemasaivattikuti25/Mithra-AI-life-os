"""
Mithra OS — FastAPI Backend
The Brain of Mithra Life OS

Endpoints:
  GET  /                     → Health check
  POST /api/auth/signup      → Register new user
  POST /api/auth/login       → Sign in
  POST /api/auth/reset-password → Request password reset
  POST /api/auth/confirm-reset  → Set new password
  POST /api/chat             → Dost AI chat (RAG)
  POST /api/parse-schedule   → Natural language → calendar events
  GET  /api/tasks            → List all tasks
  POST /api/tasks            → Create a task
  PUT  /api/tasks/{id}       → Update a task
  DELETE /api/tasks/{id}     → Delete a task
  GET  /api/journal          → Get journal entries
  POST /api/journal          → Add journal entry
  GET  /api/notifications    → Get notification settings
  POST /api/notifications    → Update notification settings

Run: uvicorn api:app --reload --port 8000
"""

from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import json
from datetime import datetime, date
import uuid
import hashlib
import secrets

# Import clients (gracefully handles missing credentials)
from config import supabase, model, get_embedding

app = FastAPI(
    title="Mithra API",
    description="The Brain of Mithra Life OS — Auth, Tasks, AI Chat, Schedule",
    version="2.0.0",
)

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- In-Memory Stores (for demo mode without Supabase) ---
_users_store: Dict[str, dict] = {}
_tasks_store: Dict[str, dict] = {}
_journal_store: List[dict] = []
_notification_settings: dict = {"enabled": False, "reminderMinutes": 15}
_reset_tokens: Dict[str, str] = {}  # token -> email

# --- Utility ---
def _hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

# --- Data Models ---
class SignUpRequest(BaseModel):
    fullName: str
    email: str
    password: str

class SignInRequest(BaseModel):
    email: str
    password: str

class ResetPasswordRequest(BaseModel):
    email: str

class ConfirmResetRequest(BaseModel):
    email: str
    newPassword: str
    token: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    user_id: str = "default"
    context_window: int = 5

class ScheduleRequest(BaseModel):
    text: str

class TaskCreate(BaseModel):
    title: str
    details: str = ""
    listId: str = "default"
    priority: str = "medium"
    completed: bool = False
    starred: bool = False
    dueDate: Optional[str] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    details: Optional[str] = None
    listId: Optional[str] = None
    priority: Optional[str] = None
    completed: Optional[bool] = None
    starred: Optional[bool] = None
    dueDate: Optional[str] = None

class JournalCreate(BaseModel):
    content: str
    mood: Optional[str] = None
    tags: Optional[str] = ""
    date: Optional[str] = None

class NotificationSettings(BaseModel):
    enabled: bool = False
    reminderMinutes: int = 15

# ═══════════════════════════════════════════════
#  ENDPOINTS
# ═══════════════════════════════════════════════

@app.get("/")
def health_check():
    """Health check endpoint."""
    return {
        "status": "online",
        "system": "Mithra Brain Active",
        "version": "2.0.0",
        "services": {
            "supabase": "connected" if supabase else "demo mode",
            "gemini": "connected" if model else "demo mode",
        },
        "timestamp": datetime.now().isoformat(),
    }


# ─── AUTHENTICATION ───
@app.post("/api/auth/signup")
async def signup(request: SignUpRequest):
    """Register a new user."""
    email = request.email.lower().strip()
    if email in _users_store:
        raise HTTPException(status_code=400, detail="An account with this email already exists")
    if len(request.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    user_id = f"user_{uuid.uuid4().hex[:12]}"
    _users_store[email] = {
        "id": user_id,
        "email": email,
        "fullName": request.fullName,
        "passwordHash": _hash_password(request.password),
        "createdAt": datetime.now().isoformat(),
    }
    return {"user": {"id": user_id, "email": email, "fullName": request.fullName}}


@app.post("/api/auth/login")
async def login(request: SignInRequest):
    """Sign in an existing user."""
    email = request.email.lower().strip()
    user = _users_store.get(email)
    if not user:
        raise HTTPException(status_code=401, detail="No account found with this email")
    if user["passwordHash"] != _hash_password(request.password):
        raise HTTPException(status_code=401, detail="Incorrect password")
    return {"user": {"id": user["id"], "email": user["email"], "fullName": user["fullName"]}}


@app.post("/api/auth/reset-password")
async def reset_password(request: ResetPasswordRequest):
    """Request a password reset. Returns a token (demo mode — in production, send via email)."""
    email = request.email.lower().strip()
    user = _users_store.get(email)
    if not user:
        raise HTTPException(status_code=404, detail="No account found with this email")
    token = secrets.token_urlsafe(32)
    _reset_tokens[token] = email
    return {
        "message": "Password reset authorized",
        "token": token,  # In production, this would be sent via email
        "email": email,
    }


@app.post("/api/auth/confirm-reset")
async def confirm_reset(request: ConfirmResetRequest):
    """Set a new password after reset verification."""
    email = request.email.lower().strip()
    user = _users_store.get(email)
    if not user:
        raise HTTPException(status_code=404, detail="No account found with this email")
    if len(request.newPassword) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    # Verify token if provided
    if request.token:
        stored_email = _reset_tokens.get(request.token)
        if stored_email != email:
            raise HTTPException(status_code=400, detail="Invalid or expired reset token")
        del _reset_tokens[request.token]

    user["passwordHash"] = _hash_password(request.newPassword)
    return {"message": "Password updated successfully"}


# ─── DOST CHAT (RAG Engine) ───
@app.post("/api/chat")
async def chat_with_dost(request: ChatRequest):
    """AI chat with Dost — stoic companion with memory."""
    try:
        user_msg = request.message

        # If Gemini isn't configured, return demo response
        if not model:
            return {
                "reply": f"I hear you. '{user_msg}' — Let me reflect on that. In demo mode, I can't generate AI responses. Please configure your Gemini API key in the .env file to unlock my full wisdom.",
                "action": None,
                "memory_used": False,
                "demo_mode": True,
            }

        # A. RETRIEVAL — Search memory
        memory_context = ""
        if supabase:
            try:
                msg_embedding = get_embedding(user_msg)
                related_data = supabase.rpc(
                    'match_journal_entries',
                    {'query_embedding': msg_embedding, 'match_threshold': 0.7, 'match_count': 3}
                ).execute()
                if related_data.data:
                    memory_context = "\n".join([
                        f"- {item['content']} (Mood: {item.get('mood_score', 'N/A')})"
                        for item in related_data.data
                    ])
            except Exception:
                pass  # Memory search failed — continue without it

        # B. GENERATION
        system_prompt = f"""
        You are Dost, a digital stoic companion for the Mithra Life OS app.
        User's Context from Journal Memory:
        {memory_context if memory_context else "No previous context available."}

        Style Guide:
        - Be concise, calm, and insightful.
        - If the user seems stressed, offer a stoic perspective.
        - If the user mentions a task like "Remind me to..." or "I need to...",
          output a JSON action at the end:
          ||JSON||{{"action": "create_task", "task": {{"title": "...", "priority": "medium"}}}}

        User: {user_msg}
        Dost:
        """

        response = model.generate_content(system_prompt)
        text_response = response.text

        # C. ACTION PARSING
        action_data = None
        if "||JSON||" in text_response:
            parts = text_response.split("||JSON||")
            text_response = parts[0].strip()
            try:
                action_data = json.loads(parts[1])
            except Exception:
                pass

        return {
            "reply": text_response,
            "action": action_data,
            "memory_used": bool(memory_context),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── SCHEDULE PARSER ───
@app.post("/api/parse-schedule")
async def parse_schedule(request: ScheduleRequest):
    """Parse natural language text into calendar events using Gemini."""
    try:
        if not model:
            return {
                "events": [],
                "demo_mode": True,
                "message": "Gemini not configured. Add GEMINI_API_KEY to .env file.",
            }

        today_str = date.today().isoformat()
        prompt = f"""
        Extract calendar events from this text: "{request.text}".
        Today's date is {today_str}.
        Return ONLY a JSON array of objects with keys:
        - title (string)
        - start (ISO timestamp)
        - end (ISO timestamp, default 1 hour after start)
        - category (one of: Work, Personal, Health, Meeting, Focus)
        """

        response = model.generate_content(prompt)
        clean_json = response.text.replace('```json', '').replace('```', '').strip()
        events = json.loads(clean_json)

        return {"events": events}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── TASK CRUD ───
@app.get("/api/tasks")
async def list_tasks():
    """List all tasks."""
    return {"tasks": list(_tasks_store.values())}


@app.post("/api/tasks")
async def create_task(task: TaskCreate):
    """Create a new task."""
    task_id = str(uuid.uuid4())[:8]
    task_data = {
        "id": task_id,
        **task.dict(),
        "createdAt": datetime.now().isoformat(),
        "subtasks": [],
    }
    _tasks_store[task_id] = task_data
    return {"task": task_data}


@app.put("/api/tasks/{task_id}")
async def update_task(task_id: str, updates: TaskUpdate):
    """Update an existing task."""
    if task_id not in _tasks_store:
        raise HTTPException(status_code=404, detail="Task not found")
    for key, value in updates.dict(exclude_unset=True).items():
        _tasks_store[task_id][key] = value
    _tasks_store[task_id]["updatedAt"] = datetime.now().isoformat()
    return {"task": _tasks_store[task_id]}


@app.delete("/api/tasks/{task_id}")
async def delete_task(task_id: str):
    """Delete a task."""
    if task_id not in _tasks_store:
        raise HTTPException(status_code=404, detail="Task not found")
    deleted = _tasks_store.pop(task_id)
    return {"deleted": deleted}


# ─── NOTIFICATION SETTINGS ───
@app.get("/api/notifications")
async def get_notifications():
    """Get notification settings."""
    return {"settings": _notification_settings}


@app.post("/api/notifications")
async def update_notifications(settings: NotificationSettings):
    """Update notification settings."""
    _notification_settings.update(settings.dict())
    return {"settings": _notification_settings}


# ─── JOURNAL ───
@app.get("/api/journal")
async def list_journal():
    """Get all journal entries."""
    return {"entries": _journal_store}


@app.post("/api/journal")
async def create_journal(entry: JournalCreate):
    """Create a journal entry."""
    entry_data = {
        "id": str(uuid.uuid4())[:8],
        "content": entry.content,
        "mood": entry.mood,
        "tags": entry.tags,
        "date": entry.date or date.today().isoformat(),
        "createdAt": datetime.now().isoformat(),
    }
    _journal_store.insert(0, entry_data)
    return {"entry": entry_data}


# ─── DATA SYNC ───
@app.get("/api/sync")
async def sync_data():
    """Get all data for offline sync."""
    return {
        "tasks": list(_tasks_store.values()),
        "journal": _journal_store,
        "notifications": _notification_settings,
        "syncedAt": datetime.now().isoformat(),
    }


# ═══════════════════════════════════════════════
#  SERVER STARTUP
# ═══════════════════════════════════════════════
if __name__ == "__main__":
    import uvicorn
    print("\n🚀 Starting Mithra Backend on http://localhost:8000")
    print("📖 API Docs: http://localhost:8000/docs\n")
    uvicorn.run(app, host="0.0.0.0", port=8000)
