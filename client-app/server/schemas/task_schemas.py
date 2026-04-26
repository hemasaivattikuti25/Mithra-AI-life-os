from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TaskCreate(BaseModel):
    title: str
    completed: bool = False
    priority: str = "medium"
    duration: Optional[int] = None
    ai_suggested: bool = False
    workspaceId: Optional[str] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    completed: Optional[bool] = None
    priority: Optional[str] = None
    duration: Optional[int] = None

class TaskResponse(BaseModel):
    id: int
    user_id: str
    title: str
    completed: bool
    priority: str
    duration: Optional[int]
    ai_suggested: bool
    workspace_id: Optional[str]
    created_at: datetime
    updated_at: datetime
