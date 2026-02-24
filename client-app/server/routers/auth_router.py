from fastapi import APIRouter, HTTPException, status
from schemas.models import SignUpRequest, SignInRequest, ResetPasswordRequest, ConfirmResetRequest
from core.config import supabase

router = APIRouter()


@router.post("/signup")
async def signup(request: SignUpRequest):
    """Register a new user via Supabase Auth.
    Returns the Supabase session token directly (no custom JWT)."""
    email = request.email.lower().strip()

    if not supabase:
        raise HTTPException(status_code=503, detail="Database service unavailable")

    try:
        auth_response = supabase.auth.sign_up({
            "email": email,
            "password": request.password,
            "options": {
                "data": {"full_name": request.fullName}
            }
        })

        if not auth_response.user:
            raise HTTPException(status_code=400, detail="Signup failed")

        user = auth_response.user
        session = auth_response.session

        return {
            "user": {
                "id": str(user.id),
                "email": email,
                "fullName": request.fullName,
            },
            # Return Supabase's own access token — no custom JWT needed
            "token": session.access_token if session else None,
        }
    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e).lower()
        if "already registered" in error_msg or "unique constraint" in error_msg:
            raise HTTPException(status_code=400, detail="An account with this email already exists")
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login")
async def login(request: SignInRequest):
    """Sign in via Supabase Auth. Returns the Supabase session token."""
    email = request.email.lower().strip()

    if not supabase:
        raise HTTPException(status_code=503, detail="Database service unavailable")

    try:
        auth_response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": request.password,
        })

        if not auth_response.user:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        user = auth_response.user
        session = auth_response.session
        full_name = user.user_metadata.get("full_name", "User") if user.user_metadata else "User"

        return {
            "user": {
                "id": str(user.id),
                "email": email,
                "fullName": full_name,
            },
            "token": session.access_token if session else None,
        }
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    """Request a password reset email via Supabase."""
    if supabase:
        try:
            supabase.auth.reset_password_email(request.email.lower().strip())
        except Exception:
            pass  # Don't reveal whether email exists
    return {"message": "If an account exists, a password reset link has been sent."}


@router.post("/confirm-reset")
async def confirm_reset(request: ConfirmResetRequest):
    """Confirm password reset (stub — Supabase handles this via email link)."""
    return {"message": "Password updated successfully"}


# ─── GDPR ACCOUNT DELETION ──────────────────────────────────────────────────

from fastapi import Depends
from core.security import get_current_user

@router.delete("/account")
async def delete_account(current_user: dict = Depends(get_current_user)):
    """Permanently delete the authenticated user's account and all their data.

    Uses the Supabase admin client (service_role key) to delete the auth.users row.
    All related data (tasks, habits, journals, workspace_members, workspaces owned)
    is automatically wiped via ON DELETE CASCADE in our SQL schema.

    ⚠️  This action is IRREVERSIBLE.
    """
    if not supabase:
        raise HTTPException(status_code=503, detail="Database service unavailable")

    user_id = current_user["id"]

    try:
        # Step 1: Sanity check — workspaces this user owns
        owned = supabase.table("workspaces").select("id").eq("owner_id", user_id).execute()
        if owned.data:
            # Delete owned workspaces first — cascades to workspace_members
            ws_ids = [w["id"] for w in owned.data]
            supabase.table("workspaces").delete().in_("id", ws_ids).execute()

        # Step 2: Delete the auth.users row via Supabase Admin API.
        # This triggers ON DELETE CASCADE across all tables referencing auth.users(id).
        response = supabase.auth.admin.delete_user(user_id)

        # supabase-py returns None on success, or raises an exception
        if hasattr(response, "error") and response.error:
            raise Exception(response.error.message)

        return {"success": True, "message": "Account and all associated data permanently deleted."}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Account deletion failed: {str(e)}")

