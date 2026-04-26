"""
Google Calendar Integration Router (Simplified)

Currently provides stub endpoints for Google Calendar sync.
Full OAuth integration will be enabled once Google OAuth verification is complete.
All event CRUD is handled by tasks_router.py (/api/events).
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import logging

from core.security import get_current_user
from core.config import get_db

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/calendar", tags=["calendar"])


# ─── Response Models ─────────────────────────────────────────────────────────
class CalendarStatusResponse(BaseModel):
    connected: bool
    provider: str = "google"
    message: str


class SyncResponse(BaseModel):
    success: bool
    synced_count: int
    error: Optional[str] = None


# ─── Endpoints ───────────────────────────────────────────────────────────────

@router.get("/sync-status")
async def get_sync_status(
    current_user: dict = Depends(get_current_user),
) -> CalendarStatusResponse:
    """Check if Google Calendar is connected for this user."""
    # Google OAuth is not yet verified for production scopes.
    # Return a clean "not connected" status so the UI can display the right state.
    return CalendarStatusResponse(
        connected=False,
        provider="google",
        message="Google Calendar sync will be available after OAuth verification is complete.",
    )


@router.post("/sync")
async def sync_calendar(
    current_user: dict = Depends(get_current_user),
) -> SyncResponse:
    """Trigger a Google Calendar sync (stub — returns 0 events until OAuth is live)."""
    return SyncResponse(
        success=True,
        synced_count=0,
        error=None,
    )


@router.get("/auth-url")
async def get_oauth_url(
    current_user: dict = Depends(get_current_user),
) -> dict:
    """Get Google OAuth URL. Currently returns a placeholder until OAuth verification."""
    return {
        "auth_url": None,
        "state": None,
        "message": "Google Calendar OAuth is pending verification. Events can be created directly in the app.",
    }
