from pydantic import BaseModel
from typing import List, Optional

class SignUpRequest(BaseModel):
    email: str
    password: str
    fullName: str

class SignInRequest(BaseModel):
    email: str
    password: str

class ResetPasswordRequest(BaseModel):
    email: str

class ConfirmResetRequest(BaseModel):
    email: str
    token: str
    newPassword: str

class ChatRequest(BaseModel):
    message: str

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
