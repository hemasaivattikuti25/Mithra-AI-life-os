from fastapi import APIRouter, HTTPException, status
from schemas.models import SignUpRequest, SignInRequest, ResetPasswordRequest, ConfirmResetRequest
from core.config import supabase
from services.auth_service import create_access_token

router = APIRouter()

@router.post("/signup")
async def signup(request: SignUpRequest):
    """Register a new user directly in Supabase."""
    email = request.email.lower().strip()
    
    try:
        # 1. Create auth user
        auth_response = supabase.auth.sign_up({
            "email": email,
            "password": request.password,
            "options": {
                "data": { "full_name": request.fullName }
            }
        })
        
        if not auth_response.user:
            raise HTTPException(status_code=400, detail="Signup failed")
            
        user_id = auth_response.user.id
        
        # 2. Use ID to issue our OWN token (keeping existing contract)
        access_token = create_access_token(data={"sub": user_id, "email": email, "fullName": request.fullName})
        
        return {
            "user": {"id": user_id, "email": email, "fullName": request.fullName},
            "token": access_token
        }
    except Exception as e:
        # Check for existing user error
        if "already registered" in str(e).lower() or "unique constraint" in str(e).lower():
                raise HTTPException(status_code=400, detail="An account with this email already exists")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
async def login(request: SignInRequest):
    """Sign in an existing user via Supabase."""
    email = request.email.lower().strip()
    
    try:
        # Verify against Supabase Auth
        auth_response = supabase.auth.sign_in_with_password({
            "email": email, 
            "password": request.password
        })
        
        if not auth_response.user:
            raise HTTPException(status_code=401, detail="Invalid credentials")
            
        user = auth_response.user
        full_name = user.user_metadata.get("full_name", "User")
        
        # Issue our OWN token
        access_token = create_access_token(data={"sub": user.id, "email": email, "fullName": full_name})
        
        return {
            "user": {"id": user.id, "email": email, "fullName": full_name},
            "token": access_token
        }
    except Exception:
            raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    # Stub for now
    return {"message": "If an account exists, a password reset link has been sent."}

@router.post("/confirm-reset")
async def confirm_reset(request: ConfirmResetRequest):
    # Stub for now
    return {"message": "Password updated successfully"}
