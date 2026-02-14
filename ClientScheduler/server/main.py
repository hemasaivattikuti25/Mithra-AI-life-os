
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
  GET  /api/tasks            → List user's tasks
  POST /api/tasks            → Create a task
  PUT  /api/tasks/{id}       → Update a task
  DELETE /api/tasks/{id}     → Delete a task
  GET  /api/journal          → Get journal entries
  POST /api/journal          → Add journal entry
  GET  /api/notifications    → Get notification settings
  POST /api/notifications    → Update notification settings
  GET  /api/sync             → Sync data

Run: uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI, HTTPException, Body, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import json
from datetime import datetime, date, timedelta
import uuid
import secrets
import os

# Import clients (gracefully handles missing credentials)
from config import supabase, model, get_embedding
from auth import (
    hash_password, 
    verify_password, 
    create_access_token, 
    verify_token,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

app = FastAPI(
    title="Mithra API",
    description="The Brain of Mithra Life OS — Auth, Tasks, AI Chat, Schedule",
    version="2.1.0 (Hardened)",
)

# --- CORS ---
origins = [
    "https://mithra-life-os.vercel.app",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Security ---
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# --- In-Memory Stores (for demo mode without Supabase) ---
# Format: {email: user_dict}
_users_store: Dict[str, dict] = {}
# Format: {task_id: task_dict}
_tasks_store: Dict[str, dict] = {}
# Format: List[journal_entry_dict]
_journal_store: List[dict] = []
# Format: {user_id: settings_dict}
_notification_settings_store: Dict[str, dict] = {} 
# Format: {token: email}
_reset_tokens: Dict[str, str] = {}

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
    # user_id removed, inferred from token
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

# --- Dependencies ---
async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    payload = verify_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id: str = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    
    # In a real DB, you'd fetch user by ID. 
    # Here, we have email -> user map, so we scan (inefficient but fine for demo)
    user = None
    for u in _users_store.values():
        if u["id"] == user_id:
            user = u
            break
            
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# ═══════════════════════════════════════════════
#  ENDPOINTS
# ═══════════════════════════════════════════════

@app.get("/")
def health_check():
    """Health check endpoint."""
    return {
        "status": "online",
        "system": "Mithra Brain Active (Hardened)",
        "version": "2.1.0",
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
    hashed_pw = hash_password(request.password)
    
    user_data = {
        "id": user_id,
        "email": email,
        "fullName": request.fullName,
        "passwordHash": hashed_pw,
        "createdAt": datetime.now().isoformat(),
    }
    _users_store[email] = user_data
    
    # Store in Supabase if connected
    if supabase:
        try:
            # Note: This assumes a 'users' table exists or uses auth.users via admin?
            # Usually direct insert into auth.users is not allowed via public API client.
            # Assuming 'public.profiles' or similar for custom auth demo.
            pass 
        except Exception as e:
            print(f"Supabase sync failed: {e}")

    # Generate token immediately
    access_token = create_access_token(data={"sub": user_id, "email": email})
    
    return {
        "user": {"id": user_id, "email": email, "fullName": request.fullName},
        "token": access_token
    }

@app.post("/api/auth/login")
async def login(request: SignInRequest):
    """Sign in an existing user."""
    email = request.email.lower().strip()
    user = _users_store.get(email)
    
    if not user or not verify_password(request.password, user["passwordHash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user["id"], "email": user["email"]})
    return {
        "user": {"id": user["id"], "email": user["email"], "fullName": user["fullName"]},
        "token": access_token
    }

@app.post("/api/auth/reset-password")
async def reset_password(request: ResetPasswordRequest):
    """Request a password reset."""
    email = request.email.lower().strip()
    # Always return success to prevent email enumeration
    user = _users_store.get(email)
    if user:
        token = secrets.token_urlsafe(32)
        _reset_tokens[token] = email
        # In production: send_email(email, token)
        # Here we just log for dev/demo purposes but DO NOT return it in API
        print(f"[DEV] Reset token for {email}: {token}")
        
    return {
        "message": "If an account exists, a password reset link has been sent."
    }

@app.post("/api/auth/confirm-reset")
async def confirm_reset(request: ConfirmResetRequest):
    """Set a new password after reset verification."""
    if len(request.newPassword) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    # Verify token
    if not request.token:
        raise HTTPException(status_code=400, detail="Missing reset token")
        
    email = _reset_tokens.get(request.token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    user = _users_store.get(email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found") # Should technically be generic error too

    # Update password
    user["passwordHash"] = hash_password(request.newPassword)
    del _reset_tokens[request.token]
    
    return {"message": "Password updated successfully"}

# ─── DOST CHAT (RAG Engine) ───
@app.post("/api/chat")
async def chat_with_dost(request: ChatRequest, current_user: dict = Depends(get_current_user)):
    """AI chat with Dost — stoic companion with memory."""
    try:
        user_msg = request.message

        if not model:
            return {
                "reply": f"I hear you, {current_user['fullName']}. But I need my Gemini keys to speak fully.",
                "action": None,
                "memory_used": False,
                "demo_mode": True,
            }

        # A. RETRIEVAL — Search memory (Supabase RLS handles user scoping ideally)
        # But here we pass user_id explicitly in filter if needed
        memory_context = ""
        if supabase:
            try:
                msg_embedding = get_embedding(user_msg)
                # Ensure the RPC matches ONLY this user's entries
                # This depends on how match_journal_entries is defined.
                # Usually: WHERE (auth.uid() = user_id) OR similar.
                related_data = supabase.rpc(
                    'match_journal_entries',
                    {
                        'query_embedding': msg_embedding, 
                        'match_threshold': 0.7, 
                        'match_count': 3,
                        'filter_user_id': current_user['id'] # Assuming RPC supports this or RLS handles it
                    }
                ).execute()
                
                if related_data.data:
                    memory_context = "\n".join([
                        f"- {item['content']} (Mood: {item.get('mood_score', 'N/A')})"
                        for item in related_data.data
                    ])
            except Exception:
                pass 

        # B. GENERATION
        system_prompt = f"""
        You are Dost, a digital stoic companion for {current_user['fullName']}.
        User's Context from Journal Memory:
        {memory_context if memory_context else "No previous context available."}

        Style Guide:
        - Be concise, calm, and insightful.
        - If the user seems stressed, offer a stoic perspective.
        - If the user mentions a task, output JSON action:
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
async def parse_schedule(request: ScheduleRequest, current_user: dict = Depends(get_current_user)):
    """Parse natural language text into calendar events using Gemini."""
    try:
        if not model:
            raise HTTPException(status_code=503, detail="AI Service Unavailable")

        today_str = date.today().isoformat()
        prompt = f"""
        Extract calendar events for user {current_user['fullName']}.
        Text: "{request.text}".
        Today: {today_str}.
        Return ONLY JSON array:
        [{{ "title": "...", "start": "ISO", "end": "ISO", "category": "Work|Personal|Health|Focus" }}]
        """

        response = model.generate_content(prompt)
        # simplistic cleanup
        clean_json = response.text.replace('```json', '').replace('```', '').strip()
        events = json.loads(clean_json)

        return {"events": events}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── TASK CRUD ───
@app.get("/api/tasks")
async def list_tasks(current_user: dict = Depends(get_current_user)):
    """List authenticated user's tasks."""
    user_id = current_user["id"]
    # Filter tasks by user_id
    user_tasks = [t for t in _tasks_store.values() if t.get("userId") == user_id]
    return {"tasks": user_tasks}

@app.post("/api/tasks")
async def create_task(task: TaskCreate, current_user: dict = Depends(get_current_user)):
    """Create a new task."""
    task_id = str(uuid.uuid4())[:8]
    task_data = {
        "id": task_id,
        "userId": current_user["id"], # STRICT ASSOCIATION
        **task.dict(),
        "createdAt": datetime.now().isoformat(),
        "subtasks": [],
    }
    _tasks_store[task_id] = task_data
    return {"task": task_data}

@app.put("/api/tasks/{task_id}")
async def update_task(task_id: str, updates: TaskUpdate, current_user: dict = Depends(get_current_user)):
    """Update an existing task."""
    task = _tasks_store.get(task_id)
    if not task or task.get("userId") != current_user["id"]:
        raise HTTPException(status_code=404, detail="Task not found")
        
    for key, value in updates.dict(exclude_unset=True).items():
        task[key] = value
    task["updatedAt"] = datetime.now().isoformat()
    return {"task": task}

@app.delete("/api/tasks/{task_id}")
async def delete_task(task_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a task."""
    task = _tasks_store.get(task_id)
    if not task or task.get("userId") != current_user["id"]:
        raise HTTPException(status_code=404, detail="Task not found")
        
    deleted = _tasks_store.pop(task_id)
    return {"deleted": deleted}

# ─── NOTIFICATION SETTINGS ───
@app.get("/api/notifications")
async def get_notifications(current_user: dict = Depends(get_current_user)):
    """Get notification settings."""
    uid = current_user["id"]
    return {"settings": _notification_settings_store.get(uid, {"enabled": False, "reminderMinutes": 15})}

@app.post("/api/notifications")
async def update_notifications(settings: NotificationSettings, current_user: dict = Depends(get_current_user)):
    """Update notification settings."""
    uid = current_user["id"]
    current = _notification_settings_store.get(uid, {"enabled": False, "reminderMinutes": 15})
    current.update(settings.dict())
    _notification_settings_store[uid] = current
    return {"settings": current}

# ─── JOURNAL ───
@app.get("/api/journal")
async def list_journal(current_user: dict = Depends(get_current_user)):
    """Get journal entries."""
    uid = current_user["id"]
    entries = [e for e in _journal_store if e.get("userId") == uid]
    return {"entries": entries}

@app.post("/api/journal")
async def create_journal(entry: JournalCreate, current_user: dict = Depends(get_current_user)):
    """Create a journal entry."""
    entry_data = {
        "id": str(uuid.uuid4())[:8],
        "userId": current_user["id"],
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
async def sync_data(current_user: dict = Depends(get_current_user)):
    """Get all data for offline sync."""
    uid = current_user["id"]
    return {
        "tasks": [t for t in _tasks_store.values() if t.get("userId") == uid],
        "journal": [e for e in _journal_store if e.get("userId") == uid],
        "notifications": _notification_settings_store.get(uid, {}),
        "syncedAt": datetime.now().isoformat(),
    }

if __name__ == "__main__":
    import uvicorn
    print("\n🚀 Starting Mithra Backend on http://localhost:8000")
    print("📖 API Docs: http://localhost:8000/docs\n")
    uvicorn.run(app, host="0.0.0.0", port=8000)
