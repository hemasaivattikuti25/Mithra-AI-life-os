"""
Google Calendar Integration Router

API endpoints for OAuth authorization, calendar event sync, and scheduling.
All endpoints require user authentication via Firebase JWT.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import logging
import os

from ..core.security import get_current_user
from ..schemas.models import User
from ..services.calendar_sync_service import GoogleCalendarService
from google_auth_oauthlib.flow import Flow

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/calendar", tags=["calendar"])

# Request/Response models
class OAuthCodeRequest(BaseModel):
    code: str
    redirect_uri: str

class OAuthAuthorizationResponse(BaseModel):
    success: bool
    message: str
    error: Optional[str] = None

class CalendarEventResponse(BaseModel):
    id: str
    title: str
    start: str
    end: str
    category: str
    description: Optional[str] = None
    location: Optional[str] = None
    source: str

class SyncResponse(BaseModel):
    success: bool
    synced_count: int
    error: Optional[str] = None

@router.post("/authorize", response_model=OAuthAuthorizationResponse)
async def authorize_google_calendar(
    request: OAuthCodeRequest,
    current_user: User = Depends(get_current_user)
) -> OAuthAuthorizationResponse:
    """
    Exchange Google OAuth authorization code for refresh token.
    Stores encrypted refresh token in database for future syncs.
    
    Args:
        request: OAuth code from Google's consent screen
        current_user: Authenticated user from JWT token
    
    Returns:
        OAuthAuthorizationResponse: Success/failure status
    
    Raises:
        HTTPException: 400 if OAuth code exchange fails
    """
    try:
        # Initialize OAuth flow
        flow = Flow.from_client_secrets_file(
            os.getenv('GOOGLE_OAUTH_SECRETS_FILE', '/app/secrets/oauth_secrets.json'),
            scopes=['https://www.googleapis.com/auth/calendar'],
            redirect_uri=request.redirect_uri
        )
        
        # Exchange code for credentials
        flow.fetch_token(code=request.code)
        credentials = flow.credentials
        
        # Store refresh token in database (encrypted)
        # TODO: Implement database storage with encryption
        # db_user.google_calendar_refresh_token = encrypt(credentials.refresh_token)
        # db_user.google_calendar_authorized_at = datetime.utcnow()
        # db.commit()
        
        logger.info(f"Google Calendar authorized for user {current_user.id}")
        
        return OAuthAuthorizationResponse(
            success=True,
            message="Google Calendar connected successfully"
        )
    
    except Exception as e:
        logger.error(f"OAuth authorization failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"OAuth authorization failed: {str(e)}"
        )

@router.get("/events", response_model=List[CalendarEventResponse])
async def get_calendar_events(
    current_user: User = Depends(get_current_user)
) -> List[CalendarEventResponse]:
    """
    List synced events from Google Calendar.
    
    Args:
        current_user: Authenticated user from JWT token
    
    Returns:
        List of synced calendar events
    
    Raises:
        HTTPException: 401 if calendar not connected, 500 if sync fails
    """
    try:
        # TODO: Fetch refresh token from database
        # refresh_token = db_user.google_calendar_refresh_token
        # if not refresh_token:
        #     raise HTTPException(
        #         status_code=status.HTTP_401_UNAUTHORIZED,
        #         detail="Google Calendar not connected"
        #     )
        
        # Initialize service and fetch events
        # service = GoogleCalendarService(current_user.id, refresh_token)
        # result = service.sync_events_from_google()
        
        # if not result['success']:
        #     raise HTTPException(
        #         status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        #         detail=result['error']
        #     )
        
        # return result['events']
        
        return []  # Placeholder until DB integration
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to fetch calendar events: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch calendar events"
        )

@router.post("/sync", response_model=SyncResponse)
async def manual_sync_calendar(
    current_user: User = Depends(get_current_user)
) -> SyncResponse:
    """
    Manually trigger calendar sync (normally runs every 15 minutes).
    
    Args:
        current_user: Authenticated user from JWT token
    
    Returns:
        SyncResponse: Number of events synced
    
    Raises:
        HTTPException: 401 if calendar not connected, 500 if sync fails
    """
    try:
        # TODO: Fetch refresh token from database
        # refresh_token = db_user.google_calendar_refresh_token
        # if not refresh_token:
        #     raise HTTPException(
        #         status_code=status.HTTP_401_UNAUTHORIZED,
        #         detail="Google Calendar not connected"
        #     )
        
        # Sync events
        # service = GoogleCalendarService(current_user.id, refresh_token)
        # result = service.sync_events_from_google()
        
        # if not result['success']:
        #     raise HTTPException(
        #         status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        #         detail=result['error']
        #     )
        
        # Upsert events to database
        # for event in result['events']:
        #     upsert_calendar_event(current_user.id, event)
        
        # logger.info(f"Synced {result['count']} events for user {current_user.id}")
        
        # return SyncResponse(success=True, synced_count=result['count'])
        
        return SyncResponse(success=True, synced_count=0)  # Placeholder
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Manual sync failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Manual sync failed"
        )

@router.get("/auth-url")
async def get_oauth_url(current_user: User = Depends(get_current_user)) -> dict:
    """
    Get Google OAuth authorization URL for frontend redirect.
    
    Args:
        current_user: Authenticated user from JWT token
    
    Returns:
        dict: {
            'auth_url': str - URL to redirect user to Google consent screen
        }
    """
    try:
        flow = Flow.from_client_secrets_file(
            os.getenv('GOOGLE_OAUTH_SECRETS_FILE', '/app/secrets/oauth_secrets.json'),
            scopes=['https://www.googleapis.com/auth/calendar']
        )
        
        flow.redirect_uri = os.getenv('GOOGLE_OAUTH_REDIRECT_URI', 'http://localhost:5173/calendar/callback')
        
        auth_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true'
        )
        
        return {'auth_url': auth_url, 'state': state}
    
    except Exception as e:
        logger.error(f"Failed to generate OAuth URL: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate OAuth URL"
        )
