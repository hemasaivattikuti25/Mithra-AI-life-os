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
