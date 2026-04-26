from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import logging

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
        # Firebase Admin SDK not importable — server is misconfigured. Never silently accept tokens.
        logger.critical("Firebase Admin SDK not importable — rejecting all auth requests")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server authentication is misconfigured. Contact support.",
        )
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


# ─── Authorization Helpers ───────────────────────────────────
async def check_resource_ownership(
    resource_owner_id: str,
    current_user: dict,
    resource_type: str = "resource"
):
    """
    Verify that current user owns the requested resource.

    Raises 403 Forbidden if user doesn't own resource.
    """
    if current_user["id"] != resource_owner_id:
        logger.warning(
            f"Access denied: User {current_user['id']} tried to access {resource_type} owned by {resource_owner_id}"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"You don't have permission to access this {resource_type}",
        )


async def check_workspace_membership(
    workspace_id: str,
    current_user: dict,
    pool = None  # database pool
):
    """
    Verify that current user is a member of the workspace.

    Requires database access to check membership.
    """
    if not pool:
        raise HTTPException(status_code=503, detail="Database unavailable")

    try:
        async with pool.acquire() as conn:
            result = await conn.fetchval(
                """
                SELECT id FROM workspace_members
                WHERE workspace_id = $1 AND user_id = $2
                LIMIT 1
                """,
                workspace_id,
                current_user["id"]
            )

            if not result:
                logger.warning(
                    f"Access denied: User {current_user['id']} is not member of workspace {workspace_id}"
                )
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You're not a member of this workspace",
                )
    except Exception as e:
        if isinstance(e, HTTPException):
            raise
        logger.error(f"Error checking workspace membership: {e}")
        raise HTTPException(status_code=500, detail="Failed to verify permissions")


async def check_workspace_admin(
    workspace_id: str,
    current_user: dict,
    pool = None  # database pool
):
    """
    Verify that current user is an admin of the workspace.
    """
    if not pool:
        raise HTTPException(status_code=503, detail="Database unavailable")

    try:
        async with pool.acquire() as conn:
            result = await conn.fetchval(
                """
                SELECT role FROM workspace_members
                WHERE workspace_id = $1 AND user_id = $2
                """,
                workspace_id,
                current_user["id"]
            )

            if result != "admin":
                logger.warning(
                    f"Access denied: User {current_user['id']} is not admin of workspace {workspace_id}"
                )
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You need admin permissions for this action",
                )
    except Exception as e:
        if isinstance(e, HTTPException):
            raise
        logger.error(f"Error checking workspace admin: {e}")
        raise HTTPException(status_code=500, detail="Failed to verify permissions")
