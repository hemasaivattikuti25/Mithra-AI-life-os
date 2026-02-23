"""
Google Calendar Service — Clean, production-safe integration.

Handles:
  - Token storage & auto-refresh
  - Event listing, creation, deletion
  - Structured logging for every API call

Tokens are stored in Supabase `google_calendar_tokens` table.
"""

import os
import logging
from datetime import datetime, timedelta
from typing import Optional
import httpx

from core.config import supabase

logger = logging.getLogger("mithra.calendar")

# Google OAuth constants
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3"
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")


class CalendarError(Exception):
    """Structured error with user-friendly message and internal detail."""
    def __init__(self, message: str, detail: str = "", status_code: int = 500):
        self.message = message
        self.detail = detail
        self.status_code = status_code
        super().__init__(message)


class GoogleCalendarService:
    """Handles all Google Calendar API interactions."""

    def __init__(self):
        self._client = httpx.AsyncClient(timeout=10.0)

    # ─── Token Management ───

    async def get_valid_token(self, user_id: str) -> str:
        """Get a valid access token, refreshing if expired."""
        if not supabase:
            raise CalendarError("Database not configured", status_code=503)

        logger.info(f"[token] Fetching token for user={user_id[:8]}...")

        result = supabase.table("google_calendar_tokens") \
            .select("*") \
            .eq("user_id", user_id) \
            .maybe_single() \
            .execute()

        tokens = result.data
        if not tokens:
            raise CalendarError(
                "Google Calendar not connected. Please link your account in Settings.",
                detail="No tokens found",
                status_code=401,
            )

        expires_at = datetime.fromisoformat(tokens["expires_at"].replace("Z", "+00:00"))

        # Refresh if expired or expiring within 5 minutes
        if expires_at <= datetime.now(expires_at.tzinfo) + timedelta(minutes=5):
            logger.info(f"[token] Token expired, refreshing for user={user_id[:8]}...")
            return await self._refresh_token(user_id, tokens["refresh_token"])

        logger.info(f"[token] Token valid for user={user_id[:8]}")
        return tokens["access_token"]

    async def _refresh_token(self, user_id: str, refresh_token: str) -> str:
        """Refresh an expired Google access token."""
        if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
            raise CalendarError(
                "Google Calendar not configured on server.",
                detail="Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET",
                status_code=503,
            )

        try:
            response = await self._client.post(GOOGLE_TOKEN_URL, data={
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "refresh_token": refresh_token,
                "grant_type": "refresh_token",
            })

            if response.status_code != 200:
                logger.error(f"[token] Refresh failed: {response.status_code} {response.text}")
                # If refresh fails, token is revoked
                raise CalendarError(
                    "Google Calendar session expired. Please reconnect in Settings.",
                    detail=f"Refresh failed: {response.status_code}",
                    status_code=401,
                )

            data = response.json()
            new_access_token = data["access_token"]
            expires_in = data.get("expires_in", 3600)
            expires_at = (datetime.utcnow() + timedelta(seconds=expires_in)).isoformat()

            # Store refreshed token
            supabase.table("google_calendar_tokens").update({
                "access_token": new_access_token,
                "expires_at": expires_at,
                "updated_at": datetime.utcnow().isoformat(),
            }).eq("user_id", user_id).execute()

            logger.info(f"[token] Token refreshed for user={user_id[:8]}, expires_in={expires_in}s")
            return new_access_token

        except CalendarError:
            raise
        except Exception as e:
            logger.error(f"[token] Refresh error: {e}")
            raise CalendarError("Failed to refresh Google Calendar token.", detail=str(e))

    async def store_tokens(self, user_id: str, access_token: str, refresh_token: str,
                           expires_in: int = 3600, scope: str = ""):
        """Store OAuth tokens after initial authorization."""
        if not supabase:
            raise CalendarError("Database not configured", status_code=503)

        expires_at = (datetime.utcnow() + timedelta(seconds=expires_in)).isoformat()

        supabase.table("google_calendar_tokens").upsert({
            "user_id": user_id,
            "access_token": access_token,
            "refresh_token": refresh_token,
            "expires_at": expires_at,
            "scope": scope,
            "updated_at": datetime.utcnow().isoformat(),
        }, on_conflict="user_id").execute()

        logger.info(f"[token] Stored tokens for user={user_id[:8]}")

    async def revoke_tokens(self, user_id: str):
        """Remove stored tokens (disconnect)."""
        if not supabase:
            return
        supabase.table("google_calendar_tokens") \
            .delete().eq("user_id", user_id).execute()
        logger.info(f"[token] Revoked tokens for user={user_id[:8]}")

    # ─── Calendar Operations ───

    async def list_events(self, user_id: str, time_min: Optional[str] = None,
                          time_max: Optional[str] = None, max_results: int = 50) -> list:
        """List calendar events within a time range."""
        token = await self.get_valid_token(user_id)

        params = {
            "maxResults": max_results,
            "singleEvents": "true",
            "orderBy": "startTime",
        }
        if time_min:
            params["timeMin"] = time_min
        if time_max:
            params["timeMax"] = time_max

        logger.info(f"[events] Listing events for user={user_id[:8]}, range={time_min} to {time_max}")

        response = await self._client.get(
            f"{GOOGLE_CALENDAR_API}/calendars/primary/events",
            headers={"Authorization": f"Bearer {token}"},
            params=params,
        )

        if response.status_code == 401:
            raise CalendarError("Calendar session expired. Please reconnect.", status_code=401)
        if response.status_code != 200:
            logger.error(f"[events] List failed: {response.status_code} {response.text[:200]}")
            raise CalendarError("Failed to fetch calendar events.", detail=response.text[:200])

        data = response.json()
        events = data.get("items", [])
        logger.info(f"[events] Found {len(events)} events for user={user_id[:8]}")
        return events

    async def create_event(self, user_id: str, event_data: dict) -> dict:
        """Create a new calendar event."""
        token = await self.get_valid_token(user_id)

        logger.info(f"[events] Creating event for user={user_id[:8]}: {event_data.get('summary', 'untitled')}")

        response = await self._client.post(
            f"{GOOGLE_CALENDAR_API}/calendars/primary/events",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
            },
            json=event_data,
        )

        if response.status_code not in (200, 201):
            logger.error(f"[events] Create failed: {response.status_code} {response.text[:200]}")
            raise CalendarError("Failed to create calendar event.", detail=response.text[:200])

        created = response.json()
        logger.info(f"[events] Created event id={created.get('id', 'unknown')}")
        return created

    async def delete_event(self, user_id: str, event_id: str) -> bool:
        """Delete a calendar event."""
        token = await self.get_valid_token(user_id)

        logger.info(f"[events] Deleting event={event_id} for user={user_id[:8]}")

        response = await self._client.delete(
            f"{GOOGLE_CALENDAR_API}/calendars/primary/events/{event_id}",
            headers={"Authorization": f"Bearer {token}"},
        )

        if response.status_code == 204:
            logger.info(f"[events] Deleted event={event_id}")
            return True
        if response.status_code == 404:
            logger.warning(f"[events] Event not found: {event_id}")
            return False

        logger.error(f"[events] Delete failed: {response.status_code}")
        raise CalendarError("Failed to delete calendar event.")

    async def close(self):
        """Close the HTTP client."""
        await self._client.aclose()


# Singleton instance
calendar_service = GoogleCalendarService()
