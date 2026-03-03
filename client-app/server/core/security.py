from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import logging
from core.config import ENVIRONMENT

logger = logging.getLogger("mithra.security")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """Verify Firebase ID token and extract user info.
    
    The frontend sends: Authorization: Bearer <firebase_id_token>
    We verify it using Firebase Admin SDK.
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        from firebase_admin import auth as firebase_auth
        decoded = firebase_auth.verify_id_token(token)
        
        user_id = decoded.get("uid")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload — no uid")
        
        return {
            "id": user_id,
            "email": decoded.get("email", ""),
            "fullName": decoded.get("name", decoded.get("email", "User").split("@")[0]),
        }
    except ImportError:
        # Firebase Admin not installed or not initialized
        if ENVIRONMENT == "production":
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Server auth misconfigured — Firebase Admin not available",
            )
        # Dev fallback: decode JWT without verification (INSECURE)
        logger.warning("Firebase Admin not available — using fallback decode (dev only)")
        try:
            import jwt
            payload = jwt.decode(token, options={"verify_signature": False})
            return {
                "id": payload.get("sub") or payload.get("user_id") or "dev-user",
                "email": payload.get("email", "dev@example.com"),
                "fullName": payload.get("name", "Dev User"),
            }
        except Exception:
            raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        error_msg = str(e)
        if "expired" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired",
                headers={"WWW-Authenticate": "Bearer"},
            )
        logger.warning(f"Firebase token verification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
