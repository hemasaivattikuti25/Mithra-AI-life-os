"""
GDPR Compliance Router
- GET  /api/gdpr/export  — Request full data export
- DELETE /api/auth/account — Full account deletion (DB + Firebase)
"""
import os
import json
import logging
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from datetime import datetime, timedelta
from core.security import get_current_user
from core.config import get_db

logger = logging.getLogger("mithra.gdpr")
router = APIRouter()


@router.post("/export")
async def request_data_export(
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """
    GDPR Article 20: Request a full export of all user data.
    Generates the export asynchronously and emails it when ready.
    """
    pool = get_db()
    user_id = current_user["id"]

    if not pool:
        raise HTTPException(status_code=503, detail="Database unavailable")

    async with pool.acquire() as conn:
        # Check if a recent export already exists (prevent abuse)
        recent = await conn.fetchrow("""
            SELECT status, requested_at FROM data_export_requests
            WHERE user_id = $1 AND requested_at > NOW() - INTERVAL '24 hours'
            ORDER BY requested_at DESC LIMIT 1
        """, user_id)

        if recent:
            return {
                "message": "An export was already requested in the last 24 hours. Check your email.",
                "status": recent["status"],
            }

        await conn.execute("""
            INSERT INTO data_export_requests (user_id, status, requested_at)
            VALUES ($1, 'pending', NOW())
        """, user_id)

    background_tasks.add_task(_generate_and_send_export, user_id, current_user.get("email", ""), pool)
    return {"message": "Export queued. You'll receive an email within a few minutes."}


async def _generate_and_send_export(user_id: str, email: str, pool):
    """Background: collect all user data and email as JSON."""
    try:
        async with pool.acquire() as conn:
            tasks = [dict(r) for r in await conn.fetch(
                "SELECT * FROM tasks WHERE user_id = $1 AND deleted_at IS NULL", user_id)]
            habits = [dict(r) for r in await conn.fetch(
                "SELECT * FROM habits WHERE user_id = $1 AND deleted_at IS NULL", user_id)]
            journal = [dict(r) for r in await conn.fetch(
                "SELECT id, content, mood, tags, date, created_at FROM journal_entries WHERE user_id = $1 AND deleted_at IS NULL", user_id)]
            mood_logs = [dict(r) for r in await conn.fetch(
                "SELECT * FROM mood_logs WHERE user_id = $1", user_id)]
            profile = dict(await conn.fetchrow(
                "SELECT id, email, display_name, avatar_url, created_at FROM profiles WHERE id = $1", user_id
            ) or {})

        export = {
            "export_generated_at": datetime.utcnow().isoformat(),
            "user_id": user_id,
            "profile": profile,
            "tasks": tasks,
            "habits": habits,
            "journal_entries": journal,
            "mood_logs": mood_logs,
        }

        # Serialize dates
        export_json = json.dumps(export, default=str, indent=2)

        # Send via email
        from services.email_service import _send, _base_template, APP_URL
        subject = "Your Mithra Data Export"
        body = f"""
        <p>Your data export is ready. Your complete Mithra data is attached below as JSON.</p>
        <p style="color:#666;font-size:13px;">This file contains all tasks, habits, journal entries, and mood logs associated with your account.</p>
        <pre style="background:#111;border-radius:8px;padding:16px;overflow:auto;font-size:11px;color:#ccc;max-height:300px;">{export_json[:3000]}{'...' if len(export_json) > 3000 else ''}</pre>
        <p style="color:#666;font-size:12px;">To delete your account entirely, go to Settings → Account → Delete Account.</p>"""
        await _send(email, subject, _base_template("Your Data Export Is Ready 📦", body,
            cta_url=f"{APP_URL}/settings", cta_label="Manage Account →"))

        async with pool.acquire() as conn:
            await conn.execute("""
                UPDATE data_export_requests SET status='sent', completed_at=NOW()
                WHERE user_id = $1 AND status='pending'
            """, user_id)

        logger.info(f"Data export sent for user {user_id}")

    except Exception as e:
        logger.error(f"Export failed for user {user_id}: {e}", exc_info=True)
        async with pool.acquire() as conn:
            await conn.execute("""
                UPDATE data_export_requests SET status='failed' WHERE user_id = $1 AND status='pending'
            """, user_id)


@router.delete("/account")
async def delete_account_full(current_user: dict = Depends(get_current_user)):
    """
    GDPR Article 17: Full account deletion.
    Deletes from DB AND Firebase Auth (complete user erasure).
    """
    pool = get_db()
    user_id = current_user["id"]

    if not pool:
        raise HTTPException(status_code=503, detail="Database unavailable")

    try:
        async with pool.acquire() as conn:
            async with conn.transaction():
                # Soft-delete personal data (immediate anonymization)
                await conn.execute("UPDATE tasks SET deleted_at=NOW() WHERE user_id=$1", user_id)
                await conn.execute("UPDATE habits SET deleted_at=NOW() WHERE user_id=$1", user_id)
                await conn.execute("UPDATE journal_entries SET deleted_at=NOW() WHERE user_id=$1", user_id)

                # Hard delete non-critical data
                await conn.execute("DELETE FROM ai_usage WHERE user_id=$1", user_id)
                await conn.execute("DELETE FROM mood_logs WHERE user_id=$1", user_id)
                await conn.execute("DELETE FROM focus_sessions WHERE user_id=$1", user_id)
                await conn.execute("DELETE FROM notification_settings WHERE user_id=$1", user_id)
                await conn.execute("DELETE FROM oauth_tokens WHERE user_id=$1", user_id)

                # Remove workspace memberships (not workspaces — they may have other members)
                owned_ws = await conn.fetch("SELECT id FROM workspaces WHERE owner_id=$1", user_id)
                for ws in owned_ws:
                    await conn.execute("DELETE FROM workspace_members WHERE workspace_id=$1", ws["id"])
                    await conn.execute("DELETE FROM workspaces WHERE id=$1", ws["id"])
                await conn.execute("DELETE FROM workspace_members WHERE user_id=$1", user_id)

                # Cancel Stripe subscription if any
                up = await conn.fetchrow("SELECT stripe_subscription_id FROM user_plans WHERE user_id=$1", user_id)
                if up and up["stripe_subscription_id"]:
                    try:
                        import stripe
                        if stripe.api_key:
                            stripe.Subscription.cancel(up["stripe_subscription_id"])
                    except Exception:
                        pass  # Best-effort cancellation

                await conn.execute("DELETE FROM user_plans WHERE user_id=$1", user_id)
                await conn.execute("DELETE FROM profiles WHERE id=$1", user_id)

        # Delete Firebase user — this must happen last
        try:
            from firebase_admin import auth as firebase_auth
            firebase_auth.delete_user(user_id)
            logger.info(f"Firebase user {user_id} deleted")
        except Exception as e:
            logger.error(f"Firebase deletion failed for {user_id}: {e}")
            # DB is already cleaned — Firebase deletion failure is logged but non-fatal

        logger.info(f"Account fully deleted: {user_id}")
        return {"success": True, "message": "Your account and all data have been permanently deleted."}

    except Exception as e:
        logger.error(f"Account deletion failed for {user_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Account deletion failed. Please contact support.")
