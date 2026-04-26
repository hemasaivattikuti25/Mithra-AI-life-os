from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class HabitCreate(BaseModel):
    title: str
    category: str = "Personal"
    streak: int = 0
    completed_dates: List[str] = []
    workspaceId: Optional[str] = None

class HabitUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    streak: Optional[int] = None
    completed_dates: Optional[List[str]] = None

class HabitResponse(BaseModel):
    id: int
    user_id: str
    title: str
    category: str
    streak: int
    completed_dates: List[str]
    workspace_id: Optional[str]
    created_at: datetime
    updated_at: datetime
