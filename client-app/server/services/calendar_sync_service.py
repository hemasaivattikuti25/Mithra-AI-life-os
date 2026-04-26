"""
Google Calendar Sync Service

Handles bidirectional synchronization between Mithra habits/tasks and Google Calendar.
Uses OAuth 2.0 for authentication and implements last-write-wins conflict resolution.
"""

import os
from datetime import datetime, timedelta
from typing import Optional, Dict, List, Any
from google.auth.transport.requests import Request
from google.oauth2.service_account import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth import default
import google.auth.transport.requests
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import logging

logger = logging.getLogger(__name__)

# OAuth scopes for calendar access
CALENDAR_SCOPES = ['https://www.googleapis.com/auth/calendar']

class GoogleCalendarService:
    """Manages Google Calendar synchronization for Mithra events."""
    
    def __init__(self, user_id: str, refresh_token: str):
        """
        Initialize Google Calendar service with user's refresh token.
        
        Args:
            user_id: Mithra user ID
            refresh_token: Google OAuth refresh token stored in DB
        """
        self.user_id = user_id
        self.refresh_token = refresh_token
        self.service = None
        self._authenticate()
    
    def _authenticate(self) -> None:
        """Authenticate using stored refresh token."""
        try:
            from google.oauth2.credentials import Credentials
            credentials = Credentials(
                token=None,
                refresh_token=self.refresh_token,
                token_uri="https://oauth2.googleapis.com/token",
                client_id=os.getenv('GOOGLE_CLIENT_ID'),
                client_secret=os.getenv('GOOGLE_CLIENT_SECRET'),
            )
            
            # Refresh to get valid access token
            request = google.auth.transport.requests.Request()
            credentials.refresh(request)
            
            self.service = build('calendar', 'v3', credentials=credentials)
            logger.info(f"Authenticated Google Calendar for user {self.user_id}")
        except Exception as e:
            logger.error(f"Failed to authenticate Google Calendar: {str(e)}")
            raise
    
    def sync_events_from_google(self) -> Dict[str, Any]:
        """
        Fetch all events from primary Google Calendar.
        Returns list of events to upsert into Mithra database.
        
        Returns:
            dict: {
                'success': bool,
                'events': List[dict] - Events ready for DB upsert,
                'error': str - Error message if failed
            }
        """
        try:
            # Get events modified after last sync (cached timestamp)
            now = datetime.utcnow().isoformat() + 'Z'
            query = f"updated >= {(datetime.utcnow() - timedelta(days=1)).isoformat() + 'Z'}"
            
            results = self.service.events().list(
                calendarId='primary',
                q=query,
                orderBy='updated',
                singleEvents=True,
                maxResults=100,
            ).execute()
            
            events = results.get('items', [])
            
            # Transform Google Calendar events to Mithra format
            mithra_events = []
            for event in events:
                if event.get('status') == 'cancelled':
                    continue
                    
                mithra_event = {
                    'id': f"gcal-{event['id']}",
                    'title': event.get('summary', 'Unnamed Event'),
                    'start': event.get('start', {}).get('dateTime', event.get('start', {}).get('date')),
                    'end': event.get('end', {}).get('dateTime', event.get('end', {}).get('date')),
                    'category': 'Google Calendar',
                    'description': event.get('description', ''),
                    'location': event.get('location', ''),
                    'source': 'google_calendar',
                    'sync_timestamp': datetime.utcnow().isoformat(),
                    'google_event_id': event['id'],
                    'modified_at': event.get('updated', datetime.utcnow().isoformat()),
                }
                mithra_events.append(mithra_event)
            
            return {
                'success': True,
                'events': mithra_events,
                'count': len(mithra_events),
            }
        
        except HttpError as e:
            logger.error(f"Google Calendar API error: {str(e)}")
            return {
                'success': False,
                'events': [],
                'error': f"Google Calendar API error: {str(e)}"
            }
        except Exception as e:
            logger.error(f"Unexpected error syncing from Google: {str(e)}")
            return {
                'success': False,
                'events': [],
                'error': str(e)
            }
    
    def push_event_to_google(self, event_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create or update event in Google Calendar from Mithra event.
        
        Args:
            event_data: {
                'id': str,
                'title': str,
                'start': datetime ISO string,
                'end': datetime ISO string,
                'description': str (optional),
                'location': str (optional),
                'google_event_id': str (optional) - if updating existing
            }
        
        Returns:
            dict: {
                'success': bool,
                'google_event_id': str,
                'error': str (if failed)
            }
        """
        try:
            google_event = {
                'summary': event_data.get('title', 'Mithra Event'),
                'description': event_data.get('description', ''),
                'location': event_data.get('location', ''),
                'start': {'dateTime': event_data['start']},
                'end': {'dateTime': event_data['end']},
            }
            
            # Check if this is an update (already has google_event_id)
            if event_data.get('google_event_id'):
                # Update existing event
                event = self.service.events().update(
                    calendarId='primary',
                    eventId=event_data['google_event_id'],
                    body=google_event
                ).execute()
                return {
                    'success': True,
                    'google_event_id': event['id'],
                    'method': 'update'
                }
            else:
                # Create new event
                event = self.service.events().insert(
                    calendarId='primary',
                    body=google_event
                ).execute()
                return {
                    'success': True,
                    'google_event_id': event['id'],
                    'method': 'create'
                }
        
        except HttpError as e:
            logger.error(f"Failed to push event to Google: {str(e)}")
            return {
                'success': False,
                'error': f"Google Calendar API error: {str(e)}"
            }
        except Exception as e:
            logger.error(f"Unexpected error pushing to Google: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def handle_conflicts(
        self,
        mithra_event: Dict[str, Any],
        google_event: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Resolve conflicts between Mithra and Google Calendar versions using last-write-wins.
        
        Args:
            mithra_event: Event as stored in Mithra
            google_event: Event from Google Calendar
        
        Returns:
            dict: Resolved event (whichever is newer)
        """
        mithra_modified = datetime.fromisoformat(
            mithra_event.get('modified_at', '2000-01-01')
        )
        google_modified = datetime.fromisoformat(
            google_event.get('updated', '2000-01-01').replace('Z', '+00:00')
        )
        
        if google_modified > mithra_modified:
            return google_event
        else:
            return mithra_event
    
    def sync_events(self) -> List[Dict[str, Any]]:
        """
        Simplified sync method that returns just the events list.
        
        Returns:
            List[dict]: List of events synced from Google Calendar
            
        Raises:
            Exception: If sync fails
        """
        result = self.sync_events_from_google()
        if not result.get('success'):
            logger.error(f"Sync failed: {result.get('error')}")
            raise Exception(result.get('error', 'Failed to sync events'))
        return result.get('events', [])
    
    def schedule_sync(self, interval_minutes: int = 15) -> None:
        """
        Schedule periodic sync between Mithra and Google Calendar.
        Should be called by background task scheduler in main.py.
        
        Args:
            interval_minutes: Sync interval in minutes (default 15)
        """
        # This will be called by APScheduler in main.py
        pass

