from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from services.auth_service import verify_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    payload = verify_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id: str = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    
    # Stateless Auth: Trust the signed JWT
    return {
        "id": user_id,
        "email": payload.get("email"),
        "fullName": payload.get("fullName", "User") 
    }
