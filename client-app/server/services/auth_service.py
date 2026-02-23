"""
Mithra OS — Auth Utilities

Password hashing utilities. JWT creation/verification has been removed — 
we now verify Supabase JWTs directly in core/security.py.
"""
import bcrypt


# --- Password Hashing (Python 3.13+ safe) ---
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash."""
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except ValueError:
        return False


def hash_password(password: str) -> str:
    """Hash a password for storage."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
