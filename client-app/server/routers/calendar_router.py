"""
Google Calendar Integration Router

API endpoints for OAuth authorization, calendar event sync, and scheduling.
All endpoints require user authentication via Firebase JWT.
Tokens are stored encrypted in the database (oauth_tokens table).
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import logging
import os
from cryptography.fernet import Fernet

from ..core.security import get_current_user
from ..core.config import get_db
from ..schemas.models import User
from ..services.calendar_sync_service import GoogleCalendarService
from google_auth_oauthlib.flow import Flow

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/calendar", tags=["calendar"])

# Simple encryption helper using Fernet (in production, use a proper KMS)
class TokenEncryption:
    def __init__(self):
        # Get encryption key from environment or use a secure default
        key = os.getenv('ENCRYPTION_KEY', Fernet.generate_key()).encode()
        self.cipher = Fernet(key if isinstance(key, bytes) else key.encode())
    
    def encrypt(self, token: str) -> str:
        """Encrypt a refresh token"""
        return self.cipher.encrypt(token.encode()).decode()
    
    def decrypt(self, encrypted: str) -> str:
        """Decrypt a refresh token"""
        return self.cipher.decrypt(encrypted.encode()).decode()

token_enc = TokenEncryption()

async def load_token(user_id: str, pool) -> Optional[str]:
    """Load and decrypt stored refresh token from database"""
    try:
        async with pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT encrypted_token FROM oauth_tokens WHERE user_id = $1 AND provider = $2",
                user_id, 'google'
            )
            if row:
                return token_enc.decrypt(row['encrypted_token'])
        return None
    except Exception as e:
        logger.error(f"Failed to load token for user {user_id}: {e}")
        return None

async def save_token(user_id: str, refresh_token: str, pool):
    """Save encrypted refresh token to database"""
    try:
        encrypted_token = token_enc.encrypt(refresh_token)
        async with pool.acquire() as conn:
            await conn.execute(
                """INSERT INTO oauth_tokens (user_id, provider, encrypted_token, token_type, authorized_at)
                   VALUES ($1, $2, $3, $4, NOW())
                   ON CONFLICT (user_id) DO UPDATE SET
                       encrypted_token = EXCLUDED.encrypted_token,
                       updated_at = NOW()""",
                user_id, 'google', encrypted_token, 'refresh_token'
            )
        logger.info(f"Saved Google Calendar token for user {user_id}")
    except Exception as e:
        logger.error(f"Failed to save token for user {user_id}: {e}")
        raise

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
    current_user: User = Depends(get_current_user),
    pool = Depends(get_db)
) -> OAuthAuthorizationResponse:
    """
    Exchange Google OAuth authorization code for refresh token.
    Stores encrypted refresh token in database for future syncs.
    
    Args:
        request: OAuth code from Google's consent screen
        current_user: Authenticated user from JWT token
        pool: Database connection pool
    
    Returns:
        OAuthAuthorizationResponse: Success/failure status
    
    Raises:
        HTTPException: 400 if OAuth code exchange fails, 503 if database unavailable
    """
    if not pool:
        raise HTTPException(status_code=503, detail="Database unavailable")
    
    try:
        # Initialize OAuth flow
        flow = Flow.from_client_secrets_file(
            os.getenv('GOOGLE_OAUTH_SECRETS_FILE', '/app/secrets/oauth_secrets.json'),
            scopes=['https://www.googleapis.com/auth/calendar.readonly'],
            redirect_uri=request.redirect_uri
        )
        
        # Exchange code for credentials
        flow.fetch_token(code=request.code)
        credentials = flow.credentials
        
        # Store refresh token encrypted in database
        if credentials.refresh_token:
            await save_token(current_user.id, credentials.refresh_token, pool)
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
    current_user: User = Depends(get_current_user),
    pool = Depends(get_db)
) -> List[CalendarEventResponse]:
    """
    List synced events from Google Calendar.
    
    Args:
        current_user: Authenticated user from JWT token
        pool: Database connection pool
    
    Returns:
        List of synced calendar events
    
    Raises:
        HTTPException: 401 if calendar not connected, 500 if sync fails
    """
    if not pool:
        raise HTTPException(status_code=503, detail="Database unavailable")
    
    try:
        # Load stored refresh token from database
        refresh_token = await load_token(current_user.id, pool)
        if not refresh_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Google Calendar not connected. Please authorize first."
            )
        
        # Initialize service and fetch events
        service = GoogleCalendarService(current_user.id, refresh_token)
        events = service.sync_events()
        
        return [
            CalendarEventResponse(
                id=event.get('id', ''),
                title=event.get('summary', 'Untitled'),
                start=event.get('start', {}).get('dateTime', event.get('start', {}).get('date', '')),
                end=event.get('end', {}).get('dateTime', event.get('end', {}).get('date', '')),
                category='work',
                description=event.get('description'),
                location=event.get('location'),
                source='google_calendar'
            )
            for event in events
        ]
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to fetch calendar events: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch calendar events: {str(e)}"
        )

@router.post("/sync", response_model=SyncResponse)
async def manual_sync_calendar(
    current_user: User = Depends(get_current_user),
    pool = Depends(get_db)
) -> SyncResponse:
    """
    Manually trigger calendar sync (normally runs every 15 minutes).
    
    Args:
        current_user: Authenticated user from JWT token
        pool: Database connection pool
    
    Returns:
        SyncResponse: Number of events synced
    
    Raises:
        HTTPException: 401 if calendar not connected, 500 if sync fails
    """
    if not pool:
        raise HTTPException(status_code=503, detail="Database unavailable")
    
    try:
        # Load stored refresh token from database
        refresh_token = await load_token(current_user.id, pool)
        if not refresh_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Google Calendar not connected. Please authorize first."
            )
        
        # Sync events
        service = GoogleCalendarService(current_user.id, refresh_token)
        events = service.sync_events()
        
        logger.info(f"Synced {len(events)} events for user {current_user.id}")
        
        return SyncResponse(success=True, synced_count=len(events))
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Manual sync failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Manual sync failed: {str(e)}"
        )

@router.get("/auth-url")
async def get_oauth_url(current_user: User = Depends(get_current_user)) -> dict:
    """
    Get Google OAuth authorization URL for frontend redirect.
    
    Args:
        current_user: Authenticated user from JWT token
    
    Returns:
        dict: {
            'auth_url': str - URL to redirect user to Google consent screen,
            'state': str - CSRF state token
        }
    """
    try:
        flow = Flow.from_client_secrets_file(
            os.getenv('GOOGLE_OAUTH_SECRETS_FILE', '/app/secrets/oauth_secrets.json'),
            scopes=['https://www.googleapis.com/auth/calendar.readonly']
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
