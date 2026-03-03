from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from datetime import datetime, date
import uuid
import json

from schemas.models import ScheduleRequest, TaskCreate, NotificationSettings, JournalCreate
from core.security import get_current_user
from core.config import get_db, get_model, get_embedding

router = APIRouter()

# ─── SCHEDULE PARSER ───
@router.post("/parse-schedule")
async def parse_schedule(request: ScheduleRequest, current_user: dict = Depends(get_current_user)):
    try:
        model = get_model()
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
    pool = get_db()
    if not pool:
        raise HTTPException(status_code=503, detail="Database unavailable")
    
    try:
        async with pool.acquire() as conn:
            if workspace_id:
                rows = await conn.fetch(
                    "SELECT * FROM tasks WHERE workspace_id = $1 ORDER BY created_at DESC",
                    workspace_id
                )
            else:
                # Personal tasks (no workspace) + workspace tasks where user is member
                rows = await conn.fetch(
                    """SELECT t.* FROM tasks t
                       LEFT JOIN workspace_members wm ON t.workspace_id = wm.workspace_id
                       WHERE t.user_id = $1 OR wm.user_id = $1
                       ORDER BY t.created_at DESC""",
                    current_user["id"]
                )
        
        tasks = []
        for t in rows:
            tasks.append({
                "id": str(t["id"]),
                "userId": t["user_id"],
                "title": t["title"],
                "details": t.get("details", ""),
                "listId": t.get("list_id", "default"),
                "priority": t.get("priority", "medium"),
                "completed": t.get("completed", False),
                "starred": t.get("starred", False),
                "dueDate": t["due_date"].isoformat() if t.get("due_date") else None,
                "recurrence": t.get("recurrence", "none"),
                "subtasks": t.get("subtasks", []),
                "workspaceId": str(t["workspace_id"]) if t.get("workspace_id") else None
            })
        return {"tasks": tasks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tasks")
async def create_task(task: TaskCreate, current_user: dict = Depends(get_current_user)):
    """Create a new task."""
    pool = get_db()
    if not pool:
        raise HTTPException(status_code=503, detail="Database unavailable")
    
    user_id = current_user["id"]
    task_id = str(uuid.uuid4())
    
    try:
        async with pool.acquire() as conn:
            await conn.execute(
                """INSERT INTO tasks (id, user_id, title, details, list_id, priority, 
                   completed, starred, due_date, recurrence, subtasks, workspace_id)
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)""",
                task_id, user_id, task.title, task.details, task.listId, task.priority,
                task.completed, task.starred, task.dueDate, task.recurrence,
                json.dumps(task.subtasks), task.workspaceId
            )
        return {"task": {**task.dict(), "id": task_id, "userId": user_id}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/tasks/{task_id}")
async def update_task(task_id: str, task: TaskCreate, current_user: dict = Depends(get_current_user)):
    """Update a task."""
    pool = get_db()
    if not pool:
        raise HTTPException(status_code=503, detail="Database unavailable")
    
    try:
        async with pool.acquire() as conn:
            result = await conn.execute(
                """UPDATE tasks SET title=$1, details=$2, list_id=$3, priority=$4,
                   completed=$5, starred=$6, due_date=$7, recurrence=$8, subtasks=$9,
                   workspace_id=$10, updated_at=NOW()
                   WHERE id=$11 AND (user_id=$12 OR workspace_id IN (
                       SELECT workspace_id FROM workspace_members WHERE user_id=$12
                   ))""",
                task.title, task.details, task.listId, task.priority,
                task.completed, task.starred, task.dueDate, task.recurrence,
                json.dumps(task.subtasks), task.workspaceId, task_id, current_user["id"]
            )
            if result == "UPDATE 0":
                raise HTTPException(status_code=404, detail="Task not found or access denied")
            
        return {"task": {**task.dict(), "id": task_id, "userId": current_user["id"]}}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/tasks/{task_id}")
async def delete_task(task_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a task (if owned or permitted by workspace)."""
    pool = get_db()
    if not pool:
        raise HTTPException(status_code=503, detail="Database unavailable")
    
    try:
        async with pool.acquire() as conn:
            result = await conn.execute(
                """DELETE FROM tasks WHERE id=$1 AND (user_id=$2 OR workspace_id IN (
                   SELECT workspace_id FROM workspace_members WHERE user_id=$2
                ))""",
                task_id, current_user["id"]
            )
            if result == "DELETE 0":
                raise HTTPException(status_code=404, detail="Task not found or access denied")
        return {"deleted": task_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── NOTIFICATION SETTINGS ───
@router.get("/notifications")
async def get_notifications(current_user: dict = Depends(get_current_user)):
    """Get notification settings."""
    pool = get_db()
    if not pool:
        return {"settings": {"enabled": False, "reminderMinutes": 15}}
    
    try:
        async with pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT * FROM notification_settings WHERE user_id = $1",
                current_user["id"]
            )
        if row:
            return {"settings": {"enabled": row.get("push_enabled", False), "reminderMinutes": 15}}
        return {"settings": {"enabled": False, "reminderMinutes": 15}}
    except Exception:
        return {"settings": {"enabled": False, "reminderMinutes": 15}}

@router.post("/notifications")
async def update_notifications(settings: NotificationSettings, current_user: dict = Depends(get_current_user)):
    """Update notification settings."""
    pool = get_db()
    if not pool:
        raise HTTPException(status_code=503, detail="Database unavailable")
    
    try:
        async with pool.acquire() as conn:
            await conn.execute(
                """INSERT INTO notification_settings (user_id, push_enabled, updated_at)
                   VALUES ($1, $2, NOW())
                   ON CONFLICT (user_id) DO UPDATE SET push_enabled=$2, updated_at=NOW()""",
                current_user["id"], settings.enabled
            )
        return {"settings": settings.dict()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── JOURNAL ───
@router.get("/journal")
async def list_journal(workspace_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    """Get journal entries (including workspace shared journals)."""
    pool = get_db()
    if not pool:
        raise HTTPException(status_code=503, detail="Database unavailable")
    
    try:
        async with pool.acquire() as conn:
            if workspace_id:
                rows = await conn.fetch(
                    """SELECT id, user_id, content, mood, tags, date, workspace_id, created_at
                       FROM journal_entries WHERE workspace_id = $1 ORDER BY date DESC""",
                    workspace_id
                )
            else:
                rows = await conn.fetch(
                    """SELECT id, user_id, content, mood, tags, date, workspace_id, created_at
                       FROM journal_entries WHERE user_id = $1 ORDER BY date DESC""",
                    current_user["id"]
                )
        
        entries = []
        for e in rows:
            entries.append({
                "id": str(e["id"]),
                "userId": e["user_id"],
                "content": e["content"],
                "mood": e["mood"],
                "tags": e["tags"] or [],
                "date": e["date"],
                "workspaceId": str(e["workspace_id"]) if e.get("workspace_id") else None,
                "createdAt": e["created_at"].isoformat() if e.get("created_at") else None
            })
        return {"entries": entries}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/journal")
async def create_journal(entry: JournalCreate, current_user: dict = Depends(get_current_user)):
    """Create a journal entry."""
    pool = get_db()
    if not pool:
        raise HTTPException(status_code=503, detail="Database unavailable")
    
    user_id = current_user["id"]
    entry_id = str(uuid.uuid4())
    entry_date = entry.date or date.today().isoformat()
    
    try:
        embedding = get_embedding(entry.content)
        
        async with pool.acquire() as conn:
            await conn.execute(
                """INSERT INTO journal_entries (id, user_id, content, mood, tags, date, embedding, workspace_id)
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8)""",
                entry_id, user_id, entry.content, entry.mood, entry.tags, entry_date,
                str(embedding), entry.workspaceId
            )
        
        return_entry = {
            "id": entry_id,
            "userId": user_id,
            "content": entry.content,
            "mood": entry.mood,
            "tags": entry.tags,
            "date": entry_date,
            "workspaceId": entry.workspaceId,
            "createdAt": datetime.now().isoformat()
        }
        return {"entry": return_entry}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── HABITS CRUD ───
@router.get("/habits")
async def list_habits(workspace_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    """Get habits for the user."""
    pool = get_db()
    if not pool:
        raise HTTPException(status_code=503, detail="Database unavailable")
    
    try:
        async with pool.acquire() as conn:
            if workspace_id:
                rows = await conn.fetch(
                    "SELECT * FROM habits WHERE workspace_id = $1",
                    workspace_id
                )
            else:
                rows = await conn.fetch(
                    "SELECT * FROM habits WHERE user_id = $1 AND workspace_id IS NULL",
                    current_user["id"]
                )
        
        habits = []
        for h in rows:
            habits.append({
                "id": str(h["id"]),
                "userId": h["user_id"],
                "title": h["title"],
                "category": h.get("category", "Personal"),
                "color": h.get("color"),
                "streak": h.get("streak", 0),
                "longestStreak": h.get("longest_streak", 0),
                "completedDates": h.get("completed_dates", []),
                "repeatDays": h.get("repeat_days", [0,1,2,3,4,5,6]),
                "frequency": h.get("frequency", 1),
                "reminder": h.get("reminder", False),
                "scheduleTime": h.get("schedule_time", "08:00"),
                "streakGoal": h.get("streak_goal", 30),
                "streakUnit": h.get("streak_unit", "Day"),
                "focusDuration": h.get("focus_duration", 25),
                "workspaceId": str(h["workspace_id"]) if h.get("workspace_id") else None
            })
        return {"habits": habits}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── DATA SYNC ───
@router.get("/sync")
async def sync_data(current_user: dict = Depends(get_current_user)):
    """Get all data for offline sync."""
    pool = get_db()
    if not pool:
        return {"tasks": [], "journal": [], "notifications": {}, "habits": []}
    
    user_id = current_user["id"]
    
    try:
        async with pool.acquire() as conn:
            tasks = await conn.fetch("SELECT * FROM tasks WHERE user_id = $1", user_id)
            journal = await conn.fetch("SELECT * FROM journal_entries WHERE user_id = $1", user_id)
            habits = await conn.fetch("SELECT * FROM habits WHERE user_id = $1", user_id)
            notif = await conn.fetchrow("SELECT * FROM notification_settings WHERE user_id = $1", user_id)
        
        return {
            "tasks": [dict(t) for t in tasks],
            "journal": [dict(j) for j in journal],
            "habits": [dict(h) for h in habits],
            "notifications": dict(notif) if notif else {},
            "syncedAt": datetime.now().isoformat(),
        }
    except Exception:
        return {"tasks": [], "journal": [], "habits": [], "notifications": {}}
 
