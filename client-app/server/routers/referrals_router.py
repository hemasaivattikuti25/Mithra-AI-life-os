"""
Referral Router
- GET  /api/referrals/my-code  — Get current user's referral code
- GET  /api/referrals/stats    — Referral conversion stats
- POST /api/referrals/validate — Validate a referral code before signup
"""
import logging
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from core.security import get_current_user
from core.config import get_db

logger = logging.getLogger("mithra.referrals")
router = APIRouter()


@router.get("/my-code")
async def get_my_referral_code(current_user: dict = Depends(get_current_user)):
    """Get the current user's unique referral code."""
    pool = get_db()
    user_id = current_user["id"]
    if not pool:
        raise HTTPException(status_code=503, detail="Database unavailable")
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT referral_code FROM profiles WHERE id = $1", user_id
        )
        if not row or not row["referral_code"]:
            # Generate one if missing (backfill)
            import secrets, string
            code = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))
            await conn.execute(
                "UPDATE profiles SET referral_code=$1 WHERE id=$2", code, user_id
            )
            await conn.execute(
                "INSERT INTO referrals (referrer_id, referral_code) VALUES ($1,$2) ON CONFLICT DO NOTHING",
                user_id, code
            )
            return {"code": code}
        return {"code": row["referral_code"]}


@router.get("/stats")
async def get_referral_stats(current_user: dict = Depends(get_current_user)):
    """Get how many users signed up via your referral code."""
    pool = get_db()
    user_id = current_user["id"]
    if not pool:
        raise HTTPException(status_code=503, detail="Database unavailable")
    async with pool.acquire() as conn:
        stats = await conn.fetchrow("""
            SELECT
                COUNT(*) FILTER (WHERE status='pending')   AS pending,
                COUNT(*) FILTER (WHERE status='converted') AS converted,
                COUNT(*) FILTER (WHERE status='rewarded')  AS rewarded
            FROM referrals WHERE referrer_id = $1
        """, user_id)
    return {
        "pending": stats["pending"] or 0,
        "converted": stats["converted"] or 0,
        "rewarded": stats["rewarded"] or 0,
        "total": (stats["pending"] or 0) + (stats["converted"] or 0) + (stats["rewarded"] or 0),
    }


class ValidateCodeReq(BaseModel):
    code: str


@router.post("/validate")
async def validate_referral_code(req: ValidateCodeReq):
    """Check if a referral code is valid (no auth required — used at signup)."""
    pool = get_db()
    if not pool:
        return {"valid": False}
    code = req.code.strip().upper()
    if len(code) != 8:
        return {"valid": False}
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT referral_code FROM referrals WHERE referral_code=$1", code
        )
    return {"valid": bool(row)}
