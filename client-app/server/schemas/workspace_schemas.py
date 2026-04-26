from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class WorkspaceCreate(BaseModel):
    name: str
    user_id: str

class WorkspaceJoin(BaseModel):
    join_code: str
    user_id: str

class WorkspaceResponse(BaseModel):
    id: str
    name: str
    join_code: str
    share_link_hash: str
    created_at: datetime
    user_role: Optional[str] = None
