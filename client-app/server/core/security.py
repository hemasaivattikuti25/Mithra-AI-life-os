from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from jwt.exceptions import PyJWTError as JWTError
import logging
from core.config import SUPABASE_JWT_SECRET, ENVIRONMENT

logger = logging.getLogger("mithra.security")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """Verify Supabase JWT and extract user info.
    
    The frontend sends: Authorization: Bearer <supabase_access_token>
    We verify it against SUPABASE_JWT_SECRET.
    This works for ALL auth methods (email/password, Google OAuth, etc.)
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    jwt_secret = SUPABASE_JWT_SECRET
    if not jwt_secret:
        if ENVIRONMENT == "production":
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Server auth misconfigured — SUPABASE_JWT_SECRET missing",
            )
        # Dev fallback: try to decode without verification
        logger.warning("No SUPABASE_JWT_SECRET — decoding JWT without verification (dev only)")
        try:
            payload = jwt.decode(token, options={"verify_signature": False})
        except JWTError:
            raise HTTPException(status_code=401, detail="Invalid token")
    else:
        try:
            payload = jwt.decode(
                token,
                jwt_secret,
                algorithms=["HS256"],
                audience="authenticated",
            )
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired",
                headers={"WWW-Authenticate": "Bearer"},
            )
        except JWTError as e:
            logger.warning(f"JWT verification failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

    # Extract user info from Supabase JWT claims
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload — no sub claim")

    email = payload.get("email", "")
    user_metadata = payload.get("user_metadata", {})
    full_name = user_metadata.get("full_name", user_metadata.get("name", "User"))

    return {
        "id": user_id,
        "email": email,
        "fullName": full_name,
    }
