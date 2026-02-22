
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

# --- Security ---
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


# --- In-Memory Stores REMOVED ---
# Strict Supabase Persistence Enforced

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
    
    # Stateless Auth: Trust the signed JWT
    return {
        "id": user_id,
        "email": payload.get("email"),
        "fullName": payload.get("fullName", "User") 
    }

# ═══════════════════════════════════════════════
#  ENDPOINTS
# ═══════════════════════════════════════════════

@app.get("/")
def health_check():
    """Health check endpoint."""
    return {
        "status": "online",
        "system": "Mithra Brain Active (Production)",
        "version": "3.0.0 (Supabase Only)",
        "services": {
            "supabase": "connected" if supabase else "ERROR",
            "gemini": "connected" if model else "disabled",
        },
        "timestamp": datetime.now().isoformat(),
    }

# ─── AUTHENTICATION ───
@app.post("/api/auth/signup")
async def signup(request: SignUpRequest):
    """Register a new user directly in Supabase."""
    email = request.email.lower().strip()
    
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

@app.post("/api/auth/login")
async def login(request: SignInRequest):
    """Sign in an existing user via Supabase."""
    email = request.email.lower().strip()
    
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

# (Password reset endpoints omitted for brevity/unchanged)
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
                "demo_mode": False,
            }

        memory_context = ""
        try:
            msg_embedding = get_embedding(user_msg)
            # Ensure we match against THIS user's data
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
        except Exception as e:
            print(f"RAG Error: {e}") 

        system_prompt = f"""
        You are Dost, a stoic digital companion for {current_user['fullName']}.
        
        ### Context from Journal (RAG):
        {memory_context if memory_context else "No recent journal entries found."}

        ### Style Guidelines:
        1. **Tone**: Calm, reflective, insightful, and stoic. 
        2. **Format**: Use **Markdown** effectively. Use bold for emphasis, bullet points for lists, and quote blocks for wisdom.
        3. **Brevity**: Be concise but meaningful. Avoid flowery language.

        ### Functionality:
        - If the user asks to *create* a specific task or habit, and strict details are provided, output a JSON action block at the END.
        - Format: ||JSON||{{"action": "create_task", "task": {{"title": "...", "priority": "medium", "due_date": "tomorrow"}}}}
        - Only output JSON if the intent is clear and actionable. Otherwise, just guide them.

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
                # Clean up any potential markdown code blocks around the JSON
                json_str = parts[1].strip()
                if json_str.startswith('```json'): json_str = json_str[7:]
                if json_str.startswith('```'): json_str = json_str[3:]
                if json_str.endswith('```'): json_str = json_str[:-3]
                action_data = json.loads(json_str.strip())
            except Exception:
                print(f"Failed to parse JSON action from: {parts[1]}")
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
        
        CRITICAL RULES FOR "end":
        1. If the user says "for 3 hours" or specifies a duration, you MUST add exactly that duration to the "start" time to calculate the "end" time. Do not default to 1 hour!
        2. If the user says until a specific time (e.g. "until 5pm"), calculate the exact "end" ISO timestamp.
        3. Only default to 1 hour if the user has absolutely not mentioned any length of time.
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
    try:
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

@app.post("/api/tasks")
async def create_task(task: TaskCreate, current_user: dict = Depends(get_current_user)):
    """Create a new task."""
    user_id = current_user["id"]
    task_id = str(uuid.uuid4())
    
    try:
        db_task = {
            "id": task_id,
            "user_id": user_id,
            "title": task.title,
            "details": task.details,
            "list_id": task.listId,
            "priority": task.priority,
            "completed": task.completed,
            "starred": task.starred,
            "due_date": task.dueDate,
            "recurrence": task.recurrence,
            "subtasks": task.subtasks
        }
        supabase.table("tasks").insert(db_task).execute()
        return {"task": {**task.dict(), "id": task_id, "userId": user_id}}
    except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/tasks/{task_id}")
async def update_task(task_id: str, task: TaskCreate, current_user: dict = Depends(get_current_user)):
    """Update a task."""
    user_id = current_user["id"]
    
    try:
        # Verify ownership via RLS or explicit check? RLS is safer but let's be implicit
        db_task = {
            "title": task.title,
            "details": task.details,
            "list_id": task.listId,
            "priority": task.priority,
            "completed": task.completed,
            "starred": task.starred,
            "due_date": task.dueDate,
            "recurrence": task.recurrence,
            "subtasks": task.subtasks
        }
        response = supabase.table("tasks").update(db_task).eq("id", task_id).eq("user_id", user_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Task not found or owned by another user")
            
        return {"task": {**task.dict(), "id": task_id, "userId": user_id}}
    except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/tasks/{task_id}")
async def delete_task(task_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a task."""
    user_id = current_user["id"]
    
    try:
        response = supabase.table("tasks").delete().eq("id", task_id).eq("user_id", user_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Task not found")
        return {"deleted": task_id}
    except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

# ─── NOTIFICATION SETTINGS ───
@app.get("/api/notifications")
async def get_notifications(current_user: dict = Depends(get_current_user)):
    """Get notification settings."""
    user_id = current_user["id"]
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

@app.post("/api/notifications")
async def update_notifications(settings: NotificationSettings, current_user: dict = Depends(get_current_user)):
    """Update notification settings."""
    user_id = current_user["id"]
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

# ─── JOURNAL ───
@app.get("/api/journal")
async def list_journal(current_user: dict = Depends(get_current_user)):
    """Get journal entries."""
    user_id = current_user["id"]
    try:
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

@app.post("/api/journal")
async def create_journal(entry: JournalCreate, current_user: dict = Depends(get_current_user)):
    """Create a journal entry."""
    user_id = current_user["id"]
    encoded_id = str(uuid.uuid4())
    
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

# ─── DATA SYNC ───
@app.get("/api/sync")
async def sync_data(current_user: dict = Depends(get_current_user)):
    """Get all data for offline sync."""
    user_id = current_user["id"]
    
    try:
        tasks_res = supabase.table("tasks").select("*").eq("user_id", user_id).execute()
        journal_res = supabase.table("journal_entries").select("*").eq("user_id", user_id).execute()
        notif_res = supabase.table("notification_settings").select("*").eq("user_id", user_id).execute()
        
        return {
            "tasks": tasks_res.data,
            "journal": journal_res.data,
            "notifications": notif_res.data[0] if notif_res.data else {},
            "syncedAt": datetime.now().isoformat(),
        }
    except Exception:
        return {} 

if __name__ == "__main__":
    import uvicorn
    print("\n🚀 Starting Mithra Backend on http://localhost:8000")
    print("📖 API Docs: http://localhost:8000/docs\n")
    uvicorn.run(app, host="0.0.0.0", port=8000)
