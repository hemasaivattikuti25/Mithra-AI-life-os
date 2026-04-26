"""
Weekly digest background job — APScheduler task, runs every Sunday at 9AM.
Collects stats for every active user and dispatches digest emails.
"""
import logging
from datetime import date, timedelta
from services.email_service import send_weekly_digest_email, send_streak_alert_email

logger = logging.getLogger("mithra.scheduler")


async def send_weekly_digests(pool):
    """Query all users who have activity in the past 7 days and email them a digest."""
    if not pool:
        return
    try:
        week_ago = (date.today() - timedelta(days=7)).isoformat()
        async with pool.acquire() as conn:
            users = await conn.fetch("""
                SELECT DISTINCT p.id, p.email, p.display_name
                FROM profiles p
                WHERE p.email IS NOT NULL AND p.email != ''
                  AND EXISTS (
                      SELECT 1 FROM tasks t WHERE t.user_id = p.id AND t.updated_at > $1::date
                      UNION ALL
                      SELECT 1 FROM journal_entries j WHERE j.user_id = p.id AND j.date >= $1::date
                  )
            """, week_ago)

            for user in users:
                uid = user["id"]
                # Gather stats
                tasks_done = await conn.fetchval(
                    "SELECT COUNT(*) FROM tasks WHERE user_id=$1 AND completed=TRUE AND updated_at > $2::date",
                    uid, week_ago) or 0
                journal_count = await conn.fetchval(
                    "SELECT COUNT(*) FROM journal_entries WHERE user_id=$1 AND date >= $2::date",
                    uid, week_ago) or 0
                best_streak = await conn.fetchval(
                    "SELECT COALESCE(MAX(streak), 0) FROM habits WHERE user_id=$1", uid) or 0

                stats = {
                    "tasks_completed": tasks_done,
                    "journal_entries": journal_count,
                    "best_streak": best_streak,
                }

                # Skip email if already sent this week
                already_sent = await conn.fetchrow("""
                    SELECT id FROM email_events
                    WHERE user_id=$1 AND event_type='weekly_digest'
                    AND sent_at > NOW() - INTERVAL '6 days'
                """, uid)
                if already_sent:
                    continue

                sent = await send_weekly_digest_email(
                    user["email"], user["display_name"] or "there", stats
                )
                if sent:
                    await conn.execute("""
                        INSERT INTO email_events (user_id, event_type)
                        VALUES ($1, 'weekly_digest')
                        ON CONFLICT (user_id, event_type) DO UPDATE SET sent_at = NOW()
                    """, uid)

        logger.info("Weekly digest job complete")
    except Exception as e:
        logger.error(f"Weekly digest job failed: {e}", exc_info=True)


async def send_streak_alerts(pool):
    """Send streak-at-risk alerts for habits not completed today (runs at 7PM daily)."""
    if not pool:
        return
    today = date.today().isoformat()
    try:
        async with pool.acquire() as conn:
            at_risk = await conn.fetch("""
                SELECT h.id, h.user_id, h.name, h.streak, p.email, p.display_name
                FROM habits h
                JOIN profiles p ON p.id = h.user_id
                WHERE h.streak >= 3
                  AND $1 != ALL(h.completed_dates)
                  AND p.email IS NOT NULL
                  AND h.deleted_at IS NULL
                LIMIT 500
            """, today)

            for habit in at_risk:
                # Don't send if already alerted today
                already = await conn.fetchrow("""
                    SELECT id FROM email_events
                    WHERE user_id=$1 AND event_type='streak_alert'
                    AND sent_at > NOW() - INTERVAL '20 hours'
                """, habit["user_id"])
                if already:
                    continue
                sent = await send_streak_alert_email(
                    habit["email"],
                    habit["display_name"] or "there",
                    habit["name"],
                    habit["streak"]
                )
                if sent:
                    await conn.execute("""
                        INSERT INTO email_events (user_id, event_type)
                        VALUES ($1, 'streak_alert')
                        ON CONFLICT (user_id, event_type) DO UPDATE SET sent_at = NOW()
                    """, habit["user_id"])

        logger.info(f"Streak alert job complete — {len(at_risk)} checked")
    except Exception as e:
        logger.error(f"Streak alert job failed: {e}", exc_info=True)
