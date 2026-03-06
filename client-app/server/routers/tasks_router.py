from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from datetime import datetime, date
import uuid
import json

from schemas.models import ScheduleRequest, TaskCreate, NotificationSettings, JournalCreate, HabitCreate, MoodLogCreate, FocusSessionCreate
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
            raw_subtasks = t.get("subtasks", [])
            if isinstance(raw_subtasks, str):
                try:
                    raw_subtasks = json.loads(raw_subtasks)
                except (json.JSONDecodeError, TypeError):
                    raw_subtasks = []
            if not isinstance(raw_subtasks, list):
                raw_subtasks = []
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
                "subtasks": raw_subtasks,
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

@router.put("/journal/{entry_id}")
async def update_journal(entry_id: str, entry: JournalCreate, current_user: dict = Depends(get_current_user)):
    """Update a journal entry."""
    pool = get_db()
    if not pool:
        raise HTTPException(status_code=503, detail="Database unavailable")
    
    try:
        async with pool.acquire() as conn:
            result = await conn.execute(
                """UPDATE journal_entries SET content=$1, mood=$2, tags=$3, date=$4, updated_at=NOW()
                   WHERE id=$5 AND user_id=$6""",
                entry.content, entry.mood, entry.tags, entry.date or date.today().isoformat(),
                entry_id, current_user["id"]
            )
            if result == "UPDATE 0":
                raise HTTPException(status_code=404, detail="Journal entry not found")
        
        return {"entry": {
            "id": entry_id,
            "content": entry.content,
            "mood": entry.mood,
            "tags": entry.tags,
            "date": entry.date or date.today().isoformat(),
        }}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/journal/{entry_id}")
async def delete_journal(entry_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a journal entry."""
    pool = get_db()
    if not pool:
        raise HTTPException(status_code=503, detail="Database unavailable")
    
    try:
        async with pool.acquire() as conn:
            result = await conn.execute(
                "DELETE FROM journal_entries WHERE id=$1 AND user_id=$2",
                entry_id, current_user["id"]
            )
            if result == "DELETE 0":
                raise HTTPException(status_code=404, detail="Journal entry not found")
        return {"deleted": entry_id}
    except HTTPException:
        raise
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

@router.post("/habits")
async def create_habit(habit: HabitCreate, current_user: dict = Depends(get_current_user)):
    """Create a new habit."""
    pool = get_db()
    if not pool:
        raise HTTPException(status_code=503, detail="Database unavailable")
    
    user_id = current_user["id"]
    habit_id = str(uuid.uuid4())
    
    try:
        async with pool.acquire() as conn:
            await conn.execute(
                """INSERT INTO habits (id, user_id, title, category, color, streak, longest_streak,
                   completed_dates, repeat_days, frequency, reminder, schedule_time,
                   streak_goal, streak_unit, focus_duration, workspace_id)
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)""",
                habit_id, user_id, habit.title, habit.category, habit.color,
                habit.streak, habit.longest_streak,
                habit.completed_dates,
                json.dumps(habit.repeat_days),
                habit.frequency, habit.reminder, habit.schedule_time,
                habit.streak_goal, habit.streak_unit, habit.focus_duration,
                habit.workspaceId
            )
        return {"habit": {
            "id": habit_id,
            "userId": user_id,
            "title": habit.title,
            "category": habit.category,
            "color": habit.color,
            "streak": habit.streak,
            "longestStreak": habit.longest_streak,
            "completedDates": habit.completed_dates,
            "repeatDays": habit.repeat_days,
            "frequency": habit.frequency,
            "reminder": habit.reminder,
            "scheduleTime": habit.schedule_time,
            "streakGoal": habit.streak_goal,
            "streakUnit": habit.streak_unit,
            "focusDuration": habit.focus_duration,
            "workspaceId": habit.workspaceId,
        }}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/habits/{habit_id}")
async def update_habit(habit_id: str, habit: HabitCreate, current_user: dict = Depends(get_current_user)):
    """Update a habit."""
    pool = get_db()
    if not pool:
        raise HTTPException(status_code=503, detail="Database unavailable")
    
    try:
        async with pool.acquire() as conn:
            result = await conn.execute(
                """UPDATE habits SET title=$1, category=$2, color=$3, streak=$4, longest_streak=$5,
                   completed_dates=$6, repeat_days=$7, frequency=$8, reminder=$9, schedule_time=$10,
                   streak_goal=$11, streak_unit=$12, focus_duration=$13, workspace_id=$14, updated_at=NOW()
                   WHERE id=$15 AND (user_id=$16 OR workspace_id IN (
                       SELECT workspace_id FROM workspace_members WHERE user_id=$16
                   ))""",
                habit.title, habit.category, habit.color, habit.streak, habit.longest_streak,
                habit.completed_dates,
                json.dumps(habit.repeat_days),
                habit.frequency, habit.reminder, habit.schedule_time,
                habit.streak_goal, habit.streak_unit, habit.focus_duration,
                habit.workspaceId, habit_id, current_user["id"]
            )
            if result == "UPDATE 0":
                raise HTTPException(status_code=404, detail="Habit not found or access denied")
        return {"habit": {"id": habit_id, "title": habit.title}}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/habits/{habit_id}")
async def delete_habit(habit_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a habit."""
    pool = get_db()
    if not pool:
        raise HTTPException(status_code=503, detail="Database unavailable")
    
    try:
        async with pool.acquire() as conn:
            result = await conn.execute(
                """DELETE FROM habits WHERE id=$1 AND (user_id=$2 OR workspace_id IN (
                       SELECT workspace_id FROM workspace_members WHERE user_id=$2
                   ))""",
                habit_id, current_user["id"]
            )
            if result == "DELETE 0":
                raise HTTPException(status_code=404, detail="Habit not found")
        return {"deleted": habit_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/habits/{habit_id}/complete")
async def complete_habit(habit_id: str, current_user: dict = Depends(get_current_user)):
    """Mark a habit as completed for today."""
    pool = get_db()
    if not pool:
        raise HTTPException(status_code=503, detail="Database unavailable")
    
    today_str = date.today().isoformat()
    
    try:
        async with pool.acquire() as conn:
            row = await conn.fetchrow(
                """SELECT completed_dates, streak, longest_streak FROM habits
                   WHERE id=$1 AND (user_id=$2 OR workspace_id IN (
                       SELECT workspace_id FROM workspace_members WHERE user_id=$2
                   ))""",
                habit_id, current_user["id"]
            )
            if not row:
                raise HTTPException(status_code=404, detail="Habit not found")
            
            completed = list(row.get("completed_dates") or [])
            if today_str not in completed:
                completed.append(today_str)
            
            streak = (row.get("streak") or 0) + 1
            longest = max(row.get("longest_streak") or 0, streak)
            
            await conn.execute(
                """UPDATE habits SET completed_dates=$1, streak=$2, longest_streak=$3, updated_at=NOW()
                   WHERE id=$4 AND (user_id=$5 OR workspace_id IN (
                       SELECT workspace_id FROM workspace_members WHERE user_id=$5
                   ))""",
                completed, streak, longest, habit_id, current_user["id"]
            )
        return {"success": True, "streak": streak, "longestStreak": longest}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── MOOD LOGS ───
@router.get("/mood-logs")
async def list_mood_logs(limit: int = 30, current_user: dict = Depends(get_current_user)):
    """Get recent mood logs."""
    pool = get_db()
    if not pool:
        return {"moodLogs": []}
    
    try:
        async with pool.acquire() as conn:
            rows = await conn.fetch(
                "SELECT * FROM mood_logs WHERE user_id = $1 ORDER BY logged_at DESC LIMIT $2",
                current_user["id"], limit
            )
        
        logs = []
        for r in rows:
            logs.append({
                "id": str(r["id"]),
                "mood_value": r["mood_value"],
                "mood_label": r.get("mood_label"),
                "note": r.get("note"),
                "logged_at": r["logged_at"].isoformat() if r.get("logged_at") else None,
            })
        return {"moodLogs": logs}
    except Exception:
        return {"moodLogs": []}

@router.post("/mood-logs")
async def create_mood_log(log: MoodLogCreate, current_user: dict = Depends(get_current_user)):
    """Log a mood entry."""
    pool = get_db()
    if not pool:
        raise HTTPException(status_code=503, detail="Database unavailable")
    
    log_id = str(uuid.uuid4())
    
    try:
        async with pool.acquire() as conn:
            await conn.execute(
                """INSERT INTO mood_logs (id, user_id, mood_value, mood_label, note)
                   VALUES ($1, $2, $3, $4, $5)""",
                log_id, current_user["id"], log.mood_value, log.mood_label, log.note
            )
        return {"moodLog": {"id": log_id, "mood_value": log.mood_value, "mood_label": log.mood_label}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── FOCUS SESSIONS ───
@router.post("/focus-sessions")
async def create_focus_session(session: FocusSessionCreate, current_user: dict = Depends(get_current_user)):
    """Log a completed focus session."""
    pool = get_db()
    if not pool:
        raise HTTPException(status_code=503, detail="Database unavailable")
    
    session_id = str(uuid.uuid4())
    
    try:
        async with pool.acquire() as conn:
            await conn.execute(
                """INSERT INTO focus_sessions (id, user_id, habit_id, duration_minutes, workspace_id)
                   VALUES ($1, $2, $3, $4, $5)""",
                session_id, current_user["id"], session.habit_id, session.duration_minutes,
                session.workspaceId
            )
        return {"session": {"id": session_id, "duration_minutes": session.duration_minutes}}
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
 
