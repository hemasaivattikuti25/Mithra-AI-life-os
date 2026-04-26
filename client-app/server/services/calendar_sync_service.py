"""
Google Calendar Sync Service (Stub)

This service will handle bidirectional sync once Google OAuth verification is complete.
Currently, all event management is done via the tasks_router /events endpoints
which store events in our own Neon PostgreSQL database.
"""

import logging

logger = logging.getLogger(__name__)


class GoogleCalendarService:
    """Placeholder for future Google Calendar sync integration."""

    def __init__(self, user_id: str, refresh_token: str):
        self.user_id = user_id
        self.refresh_token = refresh_token
        self.service = None

    def sync_events(self):
        """Stub: returns empty list until OAuth is verified."""
        logger.info(f"Calendar sync requested for user {self.user_id} — OAuth not yet configured")
        return []

    def sync_events_from_google(self):
        return {"success": False, "events": [], "error": "OAuth not configured"}

    def push_event_to_google(self, event_data):
        return {"success": False, "error": "OAuth not configured"}
