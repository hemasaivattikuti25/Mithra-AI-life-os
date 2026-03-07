from pydantic import BaseModel
from typing import List, Optional


class ChatMessage(BaseModel):
    """A single message in the conversation history (Gemini format)."""
    role: str  # 'user' or 'model'
    parts: List[str]

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []  # Previous conversation messages

class ScheduleRequest(BaseModel):
    text: str

class TaskCreate(BaseModel):
    title: str
    details: Optional[str] = ""
    listId: str = "default"
    priority: str = "medium"
    completed: bool = False
    starred: bool = False
    dueDate: Optional[str] = None
    recurrence: str = "none"
    subtasks: List[str] = []
    workspaceId: Optional[str] = None

class NotificationSettings(BaseModel):
    enabled: bool
    reminderMinutes: int

class JournalCreate(BaseModel):
    content: str
    mood: Optional[int] = None
    tags: List[str] = []
    date: Optional[str] = None
    workspaceId: Optional[str] = None

class HabitCreate(BaseModel):
    title: str
    category: str = "Personal"
    color: Optional[str] = None
    streak: int = 0
    longest_streak: int = 0
    completed_dates: List[str] = []
    repeat_days: List[int] = [0, 1, 2, 3, 4, 5, 6]
    frequency: int = 1
    reminder: bool = False
    schedule_time: str = "08:00"
    streak_goal: int = 30
    streak_unit: str = "Day"
    focus_duration: int = 25
    workspaceId: Optional[str] = None
    user_id: Optional[str] = None

class MoodLogCreate(BaseModel):
    mood_value: int
    mood_label: Optional[str] = None
    note: Optional[str] = None

class FocusSessionCreate(BaseModel):
    habit_id: Optional[str] = None
    duration_minutes: int = 25
    workspaceId: Optional[str] = None

class EventCreate(BaseModel):
    title: str
    start: str  # ISO datetime
    end: str    # ISO datetime
    category: str = "Personal"
    workspaceId: Optional[str] = None
