from pydantic import BaseModel
from typing import Optional, Any, Dict

class ErrorResponse(BaseModel):
    detail: str
    error_code: Optional[str] = None

class HealthResponse(BaseModel):
    status: str
    version: str
    services: Dict[str, str]
    timestamp: str
