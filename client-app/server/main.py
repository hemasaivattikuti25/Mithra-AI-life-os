
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

# --- Security Checks ---
import sys
if os.getenv("ENVIRONMENT") == "production":
    if not supabase:
        print("FATAL: Supabase credentials missing in production.")
        raise RuntimeError("Supabase credentials missing in production.")

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


# --- In-Memory Stores (Demo Fallback) ---
_users_store: Dict[str, dict] = {}
_tasks_store: Dict[str, dict] = {}
_journal_store: List[dict] = []
_notification_settings_store: Dict[str, dict] = {} 
_reset_tokens: Dict[str, str] = {}

# Only use stores if NOT in production or specific demo flag
USE_MEMORY_STORE = (os.getenv("ENVIRONMENT") != "production") and (not supabase)


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
    
    # In production with Supabase, trust the token (stateless auth)
    # OR optionally fetch profile to ensure user still exists/is active
    if supabase:
        # Just return the payload info to avoid extra DB hit, or fetch basics
        return {
            "id": user_id,
            "email": payload.get("email"),
            "fullName": payload.get("fullName", "User") 
        }

    # Fallback for demo mode
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
        "version": "2.2.0 (Supabase Native)",
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
    
    if supabase:
        try:
            # 1. Create auth user
            auth_response = supabase.auth.sign_up({
                "email": email,
                "password": request.password,
                "options": {
                    "data": { "full_name": request.fullName }
                }
            })
            
            if not auth_response.user:
                raise HTTPException(status_code=400, detail="Signup failed")
                
            user_id = auth_response.user.id
            
            # 2. Use ID to issue our OWN token (keeping existing contract)
            access_token = create_access_token(data={"sub": user_id, "email": email, "fullName": request.fullName})
            
            return {
                "user": {"id": user_id, "email": email, "fullName": request.fullName},
                "token": access_token
            }
        except Exception as e:
            # Check for existing user error
            if "already registered" in str(e).lower() or "unique constraint" in str(e).lower():
                 raise HTTPException(status_code=400, detail="An account with this email already exists")
            raise HTTPException(status_code=400, detail=str(e))
    
    # Demo Mode Fallback
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
    
    access_token = create_access_token(data={"sub": user_id, "email": email, "fullName": request.fullName})
    
    return {
        "user": {"id": user_id, "email": email, "fullName": request.fullName},
        "token": access_token
    }

@app.post("/api/auth/login")
async def login(request: SignInRequest):
    """Sign in an existing user."""
    email = request.email.lower().strip()
    
    if supabase:
        try:
            # Verify against Supabase Auth
            auth_response = supabase.auth.sign_in_with_password({
                "email": email, 
                "password": request.password
            })
            
            if not auth_response.user:
                raise HTTPException(status_code=401, detail="Invalid credentials")
                
            user = auth_response.user
            full_name = user.user_metadata.get("full_name", "User")
            
            # Issue our OWN token
            access_token = create_access_token(data={"sub": user.id, "email": email, "fullName": full_name})
            
            return {
                "user": {"id": user.id, "email": email, "fullName": full_name},
                "token": access_token
            }
        except Exception:
             raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

    # Demo Mode Fallback
    user = _users_store.get(email)
    if not user or not verify_password(request.password, user["passwordHash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user["id"], "email": user["email"], "fullName": user.get("fullName")})
    return {
        "user": {"id": user["id"], "email": user["email"], "fullName": user.get("fullName")},
        "token": access_token
    }

# (Password reset endpoints omitted for brevity/unchanged - keeping demo logic acceptable for now)
@app.post("/api/auth/reset-password")
async def reset_password(request: ResetPasswordRequest):
    # Stub for now
    return {"message": "If an account exists, a password reset link has been sent."}

@app.post("/api/auth/confirm-reset")
async def confirm_reset(request: ConfirmResetRequest):
    # Stub for now
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

        memory_context = ""
        if supabase:
            try:
                msg_embedding = get_embedding(user_msg)
                related_data = supabase.rpc(
                    'match_journal_entries',
                    {
                        'query_embedding': msg_embedding, 
                        'match_threshold': 0.5, 
                        'match_count': 5,
                        'filter_user_id': current_user['id']
                    }
                ).execute()
                
                if related_data.data:
                    memory_context = "\n".join([
                        f"- {item['content']} (Mood: {item.get('mood_score', 'N/A')})"
                        for item in related_data.data
                    ])
            except Exception:
                pass 

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
    # Unchanged
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
    
    if supabase:
        try:
            # Fetch tasks converting snake_case DB fields to camelCase output if needed
            # OR just return as is and frontend handles it (frontend expects specific format?)
            # Frontend expects: id, userId, title, details, listId, priority, completed, starred, dueDate, recurrence
            response = supabase.table("tasks").select("*").eq("user_id", user_id).execute()
            
            # Map DB to Frontend format
            tasks = []
            for t in response.data:
                tasks.append({
                    "id": t["id"],
                    "userId": t["user_id"],
                    "title": t["title"],
                    "details": t.get("details", ""),
                    "listId": t.get("list_id", "default"),
                    "priority": t.get("priority", "medium"),
                    "completed": t.get("completed", False),
                    "starred": t.get("starred", False),
                    "dueDate": t.get("due_date"),
                    "recurrence": t.get("recurrence", "none"),
                    "subtasks": t.get("subtasks", [])
                })
            return {"tasks": tasks}
        except Exception as e:
             raise HTTPException(status_code=500, detail=str(e))

    # Demo Fallback
    user_tasks = [t for t in _tasks_store.values() if t.get("userId") == user_id]
    return {"tasks": user_tasks}

@app.post("/api/tasks")
async def create_task(task: TaskCreate, current_user: dict = Depends(get_current_user)):
    """Create a new task."""
    user_id = current_user["id"]
    task_id = str(uuid.uuid4())
    
    if supabase:
        try:
            task_db_data = {
                "id": task_id,
                "user_id": user_id,
                "title": task.title,
                "details": task.details,
                "list_id": task.listId,
                "priority": task.priority,
                "completed": task.completed,
                "starred": task.starred,
                "due_date": task.dueDate,
                "subtasks": []
            }
            supabase.table("tasks").insert(task_db_data).execute()
            
            # Return frontend format
            auth_task_data = {
                "id": task_id,
                "userId": user_id,
                **task.dict(),
                "createdAt": datetime.now().isoformat(),
                "subtasks": []
            }
            return {"task": auth_task_data}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    # Demo Fallback
    task_id = str(uuid.uuid4())[:8]
    task_data = {
        "id": task_id,
        "userId": user_id, 
        **task.dict(),
        "createdAt": datetime.now().isoformat(),
        "subtasks": [],
    }
    _tasks_store[task_id] = task_data
    return {"task": task_data}

@app.put("/api/tasks/{task_id}")
async def update_task(task_id: str, updates: TaskUpdate, current_user: dict = Depends(get_current_user)):
    """Update an existing task."""
    user_id = current_user["id"]
    
    if supabase:
        try:
            # Convert fields to snake_case
            db_updates = {}
            if updates.title is not None: db_updates["title"] = updates.title
            if updates.details is not None: db_updates["details"] = updates.details
            if updates.listId is not None: db_updates["list_id"] = updates.listId
            if updates.priority is not None: db_updates["priority"] = updates.priority
            if updates.completed is not None: db_updates["completed"] = updates.completed
            if updates.starred is not None: db_updates["starred"] = updates.starred
            if updates.dueDate is not None: db_updates["due_date"] = updates.dueDate
            
            response = supabase.table("tasks").update(db_updates).eq("id", task_id).eq("user_id", user_id).execute()
            if not response.data:
                 raise HTTPException(status_code=404, detail="Task not found")
                 
            # Re-fetch or simplistic mapping
            updated_task = response.data[0]
            mapped = {
                "id": updated_task["id"],
                "userId": updated_task["user_id"],
                "title": updated_task["title"],
                "details": updated_task.get("details", ""),
                "listId": updated_task.get("list_id", "default"),
                "priority": updated_task.get("priority", "medium"),
                "completed": updated_task.get("completed", False),
                "starred": updated_task.get("starred", False),
                "dueDate": updated_task.get("due_date"),
                "recurrence": updated_task.get("recurrence", "none"),
                "subtasks": updated_task.get("subtasks", [])
            }
            return {"task": mapped}
        except Exception as e:
            raise HTTPException(status_code=404, detail=str(e))

    # Demo Fallback
    task = _tasks_store.get(task_id)
    if not task or task.get("userId") != user_id:
        raise HTTPException(status_code=404, detail="Task not found")
        
    for key, value in updates.dict(exclude_unset=True).items():
        task[key] = value
    task["updatedAt"] = datetime.now().isoformat()
    return {"task": task}

@app.delete("/api/tasks/{task_id}")
async def delete_task(task_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a task."""
    user_id = current_user["id"]
    
    if supabase:
        try:
            response = supabase.table("tasks").delete().eq("id", task_id).eq("user_id", user_id).execute()
            if not response.data:
                 raise HTTPException(status_code=404, detail="Task not found")
            return {"deleted": response.data[0]}
        except Exception as e:
             raise HTTPException(status_code=500, detail=str(e))

    # Demo Fallback
    task = _tasks_store.get(task_id)
    if not task or task.get("userId") != user_id:
        raise HTTPException(status_code=404, detail="Task not found")
        
    deleted = _tasks_store.pop(task_id)
    return {"deleted": deleted}

# ─── NOTIFICATION SETTINGS ───
@app.get("/api/notifications")
async def get_notifications(current_user: dict = Depends(get_current_user)):
    """Get notification settings."""
    user_id = current_user["id"]
    
    if supabase:
        try:
            # Check for notification_settings table
            response = supabase.table("notification_settings").select("*").eq("user_id", user_id).execute()
            if response.data:
                data = response.data[0]
                return {"settings": {"enabled": data.get("enabled", False), "reminderMinutes": data.get("reminder_minutes", 15)}}
            else:
                return {"settings": {"enabled": False, "reminderMinutes": 15}}
        except Exception:
             return {"settings": {"enabled": False, "reminderMinutes": 15}}

    # Demo Fallback
    return {"settings": _notification_settings_store.get(user_id, {"enabled": False, "reminderMinutes": 15})}

@app.post("/api/notifications")
async def update_notifications(settings: NotificationSettings, current_user: dict = Depends(get_current_user)):
    """Update notification settings."""
    user_id = current_user["id"]
    
    if supabase:
        try:
            upsert_data = {
                "user_id": user_id,
                "enabled": settings.enabled,
                "reminder_minutes": settings.reminderMinutes
            }
            supabase.table("notification_settings").upsert(upsert_data).execute()
            return {"settings": settings.dict()}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    # Demo Fallback
    current = _notification_settings_store.get(user_id, {"enabled": False, "reminderMinutes": 15})
    current.update(settings.dict())
    _notification_settings_store[user_id] = current
    return {"settings": current}

# ─── JOURNAL ───
@app.get("/api/journal")
async def list_journal(current_user: dict = Depends(get_current_user)):
    """Get journal entries."""
    user_id = current_user["id"]
    
    if supabase:
        try:
            # Map fields back if necessary, but journal entry looks consistent
            # DB: user_id, content, mood, tags, date, embedding
            response = supabase.table("journal_entries").select("id, user_id, content, mood, tags, date, created_at").eq("user_id", user_id).order("date", desc=True).execute()
            
            entries = []
            for e in response.data:
                entries.append({
                    "id": e["id"],
                    "userId": e["user_id"],
                    "content": e["content"],
                    "mood": e["mood"],
                    "tags": e["tags"],
                    "date": e["date"],
                    "createdAt": e["created_at"]
                })
            return {"entries": entries}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    # Demo Fallback
    entries = [e for e in _journal_store if e.get("userId") == user_id]
    return {"entries": entries}

@app.post("/api/journal")
async def create_journal(entry: JournalCreate, current_user: dict = Depends(get_current_user)):
    """Create a journal entry."""
    user_id = current_user["id"]
    encoded_id = str(uuid.uuid4())
    
    if supabase:
        try:
            # Generate Embedding
            embedding = get_embedding(entry.content)
            
            db_entry = {
                "id": encoded_id,
                "user_id": user_id,
                "content": entry.content,
                "mood": entry.mood,
                "tags": entry.tags,
                "date": entry.date or date.today().isoformat(),
                "embedding": embedding
            }
            supabase.table("journal_entries").insert(db_entry).execute()
            
            return_entry = {
                "id": encoded_id,
                "userId": user_id,
                "content": entry.content,
                "mood": entry.mood,
                "tags": entry.tags,
                "date": entry.date or date.today().isoformat(),
                "createdAt": datetime.now().isoformat()
            }
            return {"entry": return_entry}
        except Exception as e:
             raise HTTPException(status_code=500, detail=str(e))

    # Demo Fallback
    entry_data = {
        "id": encoded_id[:8],
        "userId": user_id,
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
    user_id = current_user["id"]
    
    if supabase:
        # Full sync pull
        try:
            tasks_res = supabase.table("tasks").select("*").eq("user_id", user_id).execute()
            journal_res = supabase.table("journal_entries").select("*").eq("user_id", user_id).execute()
            notif_res = supabase.table("notification_settings").select("*").eq("user_id", user_id).execute()
            
            # Use raw DB format for sync endpoint? Or mapped?
            # Sync endpoint usually expects simple structure.
            # We'll return roughly raw structure but camelCase keys for consistency with frontend?
            # Frontend SyncEngine expects what? It expects list of items.
            
            return {
                "tasks": tasks_res.data,
                "journal": journal_res.data,
                "notifications": notif_res.data[0] if notif_res.data else {},
                "syncedAt": datetime.now().isoformat(),
            }
        except Exception:
            return {} # Or raise

    # Demo Fallback
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
