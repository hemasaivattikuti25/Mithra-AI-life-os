from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from datetime import datetime, date
import uuid
import json

from schemas.models import ScheduleRequest, TaskCreate, NotificationSettings, JournalCreate
from core.security import get_current_user
from core.config import supabase, model, get_embedding

router = APIRouter()

# ─── SCHEDULE PARSER ───
@router.post("/parse-schedule")
async def parse_schedule(request: ScheduleRequest, current_user: dict = Depends(get_current_user)):
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
@router.get("/tasks")
async def list_tasks(workspace_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    """List authenticated user's tasks (including shared workspace tasks)."""
    try:
        query = supabase.table("tasks").select("*")
        
        # If workspace_id provided, filter by it. 
        # Otherwise, RLS will return (own tasks + all shared tasks).
        if workspace_id:
            query = query.eq("workspace_id", workspace_id)
        
        response = query.execute()
        
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
                "subtasks": t.get("subtasks", []),
                "workspaceId": t.get("workspace_id")
            })
        return {"tasks": tasks}
    except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

@router.post("/tasks")
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
            "subtasks": task.subtasks,
            "workspace_id": task.workspaceId
        }
        supabase.table("tasks").insert(db_task).execute()
        return {"task": {**task.dict(), "id": task_id, "userId": user_id}}
    except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

@router.put("/tasks/{task_id}")
async def update_task(task_id: str, task: TaskCreate, current_user: dict = Depends(get_current_user)):
    """Update a task."""
    user_id = current_user["id"]
    
    try:
        db_task = {
            "title": task.title,
            "details": task.details,
            "list_id": task.listId,
            "priority": task.priority,
            "completed": task.completed,
            "starred": task.starred,
            "due_date": task.dueDate,
            "recurrence": task.recurrence,
            "subtasks": task.subtasks,
            "workspace_id": task.workspaceId
        }
        # Note: We filter by id. RLS ensures the user has permission to update.
        response = supabase.table("tasks").update(db_task).eq("id", task_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Task not found or access denied")
            
        return {"task": {**task.dict(), "id": task_id, "userId": user_id}}
    except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

@router.delete("/tasks/{task_id}")
async def delete_task(task_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a task (if owned or permitted by workspace)."""
    try:
        # RLS handles the permission check
        response = supabase.table("tasks").delete().eq("id", task_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Task not found or access denied")
        return {"deleted": task_id}
    except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

# ─── NOTIFICATION SETTINGS ───
@router.get("/notifications")
async def get_notifications(current_user: dict = Depends(get_current_user)):
    """Get notification settings."""
    user_id = current_user["id"]
    try:
        response = supabase.table("notification_settings").select("*").eq("user_id", user_id).execute()
        if response.data:
            data = response.data[0]
            return {"settings": {"enabled": data.get("enabled", False), "reminderMinutes": data.get("reminder_minutes", 15)}}
        else:
            return {"settings": {"enabled": False, "reminderMinutes": 15}}
    except Exception:
            return {"settings": {"enabled": False, "reminderMinutes": 15}}

@router.post("/notifications")
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
@router.get("/journal")
async def list_journal(workspace_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    """Get journal entries (including workspace shared journals)."""
    try:
        query = supabase.table("journal_entries").select("id, user_id, content, mood, tags, date, workspace_id, created_at")
        
        if workspace_id:
            query = query.eq("workspace_id", workspace_id)
            
        response = query.order("date", desc=True).execute()
        
        entries = []
        for e in response.data:
            entries.append({
                "id": e["id"],
                "userId": e["user_id"],
                "content": e["content"],
                "mood": e["mood"],
                "tags": e["tags"],
                "date": e["date"],
                "workspaceId": e.get("workspace_id"),
                "createdAt": e["created_at"]
            })
        return {"entries": entries}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/journal")
async def create_journal(entry: JournalCreate, current_user: dict = Depends(get_current_user)):
    """Create a journal entry."""
    user_id = current_user["id"]
    encoded_id = str(uuid.uuid4())
    
    try:
        embedding = get_embedding(entry.content)
        
        db_entry = {
            "id": encoded_id,
            "user_id": user_id,
            "content": entry.content,
            "mood": entry.mood,
            "tags": entry.tags,
            "date": entry.date or date.today().isoformat(),
            "embedding": embedding,
            "workspace_id": entry.workspaceId
        }
        supabase.table("journal_entries").insert(db_entry).execute()
        
        return_entry = {
            "id": encoded_id,
            "userId": user_id,
            "content": entry.content,
            "mood": entry.mood,
            "tags": entry.tags,
            "date": entry.date or date.today().isoformat(),
            "workspaceId": entry.workspaceId,
            "createdAt": datetime.now().isoformat()
        }
        return {"entry": return_entry}
    except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

# ─── DATA SYNC ───
@router.get("/sync")
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
