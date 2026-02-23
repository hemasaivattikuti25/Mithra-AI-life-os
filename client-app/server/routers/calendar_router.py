"""
Google Calendar Router — Clean endpoints, no inline logic.

All calendar business logic lives in services/calendar_service.py.
This file only handles HTTP request/response mapping.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from core.security import get_current_user
from services.calendar_service import calendar_service, CalendarError
import os

router = APIRouter()


# ─── OAuth Flow ───

@router.get("/auth-url")
async def get_auth_url(current_user: dict = Depends(get_current_user)):
    """Generate Google OAuth consent URL."""
    client_id = os.getenv("GOOGLE_CLIENT_ID", "")
    redirect_uri = os.getenv("GOOGLE_REDIRECT_URI", "")

    if not client_id or not redirect_uri:
        raise HTTPException(status_code=503, detail="Google Calendar not configured on server.")

    scopes = "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly"

    url = (
        f"https://accounts.google.com/o/oauth2/v2/auth"
        f"?client_id={client_id}"
        f"&redirect_uri={redirect_uri}"
        f"&response_type=code"
        f"&scope={scopes}"
        f"&access_type=offline"
        f"&prompt=consent"
        f"&state={current_user['id']}"
    )

    return {"auth_url": url}


@router.post("/callback")
async def oauth_callback(code: str, current_user: dict = Depends(get_current_user)):
    """Exchange OAuth code for tokens and store them."""
    import httpx

    client_id = os.getenv("GOOGLE_CLIENT_ID", "")
    client_secret = os.getenv("GOOGLE_CLIENT_SECRET", "")
    redirect_uri = os.getenv("GOOGLE_REDIRECT_URI", "")

    if not client_id or not client_secret:
        raise HTTPException(status_code=503, detail="Google Calendar not configured.")

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post("https://oauth2.googleapis.com/token", data={
                "code": code,
                "client_id": client_id,
                "client_secret": client_secret,
                "redirect_uri": redirect_uri,
                "grant_type": "authorization_code",
            })

        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to exchange authorization code.")

        data = response.json()

        await calendar_service.store_tokens(
            user_id=current_user["id"],
            access_token=data["access_token"],
            refresh_token=data.get("refresh_token", ""),
            expires_in=data.get("expires_in", 3600),
            scope=data.get("scope", ""),
        )

        return {"status": "connected", "message": "Google Calendar linked successfully!"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Calendar Operations ───

@router.get("/events")
async def list_events(
    time_min: Optional[str] = Query(None, description="ISO 8601 start time"),
    time_max: Optional[str] = Query(None, description="ISO 8601 end time"),
    max_results: int = Query(50, ge=1, le=250),
    current_user: dict = Depends(get_current_user),
):
    """List calendar events within a time range."""
    try:
        events = await calendar_service.list_events(
            user_id=current_user["id"],
            time_min=time_min,
            time_max=time_max,
            max_results=max_results,
        )
        return {"events": events, "count": len(events)}
    except CalendarError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.post("/events")
async def create_event(
    event: dict,
    current_user: dict = Depends(get_current_user),
):
    """Create a new calendar event."""
    try:
        created = await calendar_service.create_event(
            user_id=current_user["id"],
            event_data=event,
        )
        return {"event": created, "message": "Event created"}
    except CalendarError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.delete("/events/{event_id}")
async def delete_event(
    event_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Delete a calendar event."""
    try:
        deleted = await calendar_service.delete_event(
            user_id=current_user["id"],
            event_id=event_id,
        )
        if not deleted:
            raise HTTPException(status_code=404, detail="Event not found")
        return {"message": "Event deleted"}
    except CalendarError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


# ─── Connection Management ───

@router.get("/status")
async def connection_status(current_user: dict = Depends(get_current_user)):
    """Check if Google Calendar is connected."""
    try:
        await calendar_service.get_valid_token(current_user["id"])
        return {"connected": True}
    except CalendarError:
        return {"connected": False}


@router.delete("/disconnect")
async def disconnect(current_user: dict = Depends(get_current_user)):
    """Disconnect Google Calendar."""
    await calendar_service.revoke_tokens(current_user["id"])
    return {"message": "Google Calendar disconnected"}
