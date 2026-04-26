"""
Email Service — Powered by Resend
Handles all transactional emails: welcome, streak alerts, weekly digests.
Configure RESEND_API_KEY in environment.
"""
import os
import logging
import httpx
from datetime import datetime, date
from typing import Optional

logger = logging.getLogger("mithra.email")

RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
FROM_EMAIL = os.getenv("EMAIL_FROM", "Mithra <noreply@mithra-lifeos.com>")
APP_URL = os.getenv("APP_URL", "https://mithra-lifeos.com")


async def _send(to: str, subject: str, html: str) -> bool:
    """Send an email via Resend API. Returns True on success."""
    if not RESEND_API_KEY:
        logger.warning(f"[Email] RESEND_API_KEY not set — skipping email to {to}")
        return False
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                "https://api.resend.com/emails",
                headers={"Authorization": f"Bearer {RESEND_API_KEY}", "Content-Type": "application/json"},
                json={"from": FROM_EMAIL, "to": [to], "subject": subject, "html": html},
            )
            if resp.status_code == 200:
                logger.info(f"[Email] Sent '{subject}' to {to}")
                return True
            else:
                logger.error(f"[Email] Failed to send '{subject}' to {to}: {resp.status_code} {resp.text}")
                return False
    except Exception as e:
        logger.error(f"[Email] Exception sending to {to}: {e}", exc_info=True)
        return False


def _base_template(title: str, body: str, cta_url: str = "", cta_label: str = "") -> str:
    cta_block = f"""
    <div style="text-align:center;margin:32px 0;">
      <a href="{cta_url}" style="background:#7c3aed;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;font-size:15px;">{cta_label}</a>
    </div>""" if cta_url else ""

    return f"""
<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#131313;border-radius:16px;overflow:hidden;border:1px solid #222;">
    <div style="background:linear-gradient(135deg,#7c3aed,#2563eb);padding:32px 24px;text-align:center;">
      <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">Mithra Life OS</h1>
      <p style="margin:4px 0 0;color:rgba(255,255,255,0.7);font-size:13px;">Your AI-powered life companion</p>
    </div>
    <div style="padding:32px 24px;">
      <h2 style="color:#fff;font-size:20px;margin:0 0 16px;">{title}</h2>
      <div style="color:#aaa;font-size:15px;line-height:1.7;">{body}</div>
      {cta_block}
    </div>
    <div style="padding:16px 24px;border-top:1px solid #222;text-align:center;">
      <p style="color:#555;font-size:12px;margin:0;">
        © {datetime.now().year} Mithra Life OS ·
        <a href="{APP_URL}/privacy" style="color:#555;">Privacy</a> ·
        <a href="{APP_URL}/unsubscribe" style="color:#555;">Unsubscribe</a>
      </p>
    </div>
  </div>
</body></html>"""


async def send_welcome_email(email: str, name: str) -> bool:
    """Welcome email sent immediately after signup."""
    subject = f"Welcome to Mithra, {name.split()[0]} 🌟"
    body = f"""
    <p>Hey {name.split()[0]},</p>
    <p>Welcome to <strong style="color:#7c3aed;">Mithra Life OS</strong> — your personal AI-powered life companion.</p>
    <p>Here's what you can do right now:</p>
    <ul style="margin:12px 0;padding-left:20px;">
      <li style="margin:6px 0;">📝 Add your first task or habit</li>
      <li style="margin:6px 0;">🤖 Chat with <strong>Dost</strong>, your stoic AI coach</li>
      <li style="margin:6px 0;">📓 Start your first journal entry</li>
      <li style="margin:6px 0;">📅 Connect Google Calendar for AI scheduling</li>
    </ul>
    <p>Your free plan includes <strong>20 AI conversations per day</strong>. Upgrade to Pro for unlimited access.</p>"""
    html = _base_template(
        f"Welcome to Mithra, {name.split()[0]} 🌟", body,
        cta_url=f"{APP_URL}/dashboard", cta_label="Go to Dashboard →"
    )
    return await _send(email, subject, html)


async def send_streak_alert_email(email: str, name: str, habit_name: str, streak: int) -> bool:
    """Sent when a user is at risk of losing a habit streak."""
    subject = f"⚡ {streak}-day streak at risk — Complete {habit_name} today"
    body = f"""
    <p>Hey {name.split()[0]},</p>
    <p>Your <strong style="color:#f59e0b;">{streak}-day streak</strong> on <strong>{habit_name}</strong> is at risk!</p>
    <p>You haven't logged it yet today. Don't let your hard work disappear — it only takes a moment.</p>
    <p style="color:#555;font-size:13px;">Consistent effort, even imperfect, beats inaction every time. — Dost</p>"""
    html = _base_template(
        f"⚡ {streak}-day streak at risk!", body,
        cta_url=f"{APP_URL}/habits", cta_label="Complete Habit Now →"
    )
    return await _send(email, subject, html)


async def send_weekly_digest_email(email: str, name: str, stats: dict) -> bool:
    """Weekly life summary email with key stats."""
    tasks_done = stats.get("tasks_completed", 0)
    habits_streak = stats.get("best_streak", 0)
    mood_avg = stats.get("avg_mood", "neutral")
    journal_entries = stats.get("journal_entries", 0)
    subject = f"📊 Your Mithra week in review — {date.today().strftime('%b %d')}"
    body = f"""
    <p>Hey {name.split()[0]},</p>
    <p>Here's your life OS summary for the past 7 days:</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr>
        <td style="padding:12px;background:#1a1a1a;border-radius:8px;text-align:center;width:25%;">
          <div style="font-size:24px;font-weight:700;color:#22d3ee;">{tasks_done}</div>
          <div style="font-size:12px;color:#666;margin-top:4px;">Tasks done</div>
        </td>
        <td style="width:4%;"></td>
        <td style="padding:12px;background:#1a1a1a;border-radius:8px;text-align:center;width:25%;">
          <div style="font-size:24px;font-weight:700;color:#a78bfa;">{habits_streak}</div>
          <div style="font-size:12px;color:#666;margin-top:4px;">Best streak</div>
        </td>
        <td style="width:4%;"></td>
        <td style="padding:12px;background:#1a1a1a;border-radius:8px;text-align:center;width:25%;">
          <div style="font-size:24px;font-weight:700;color:#f472b6;">{journal_entries}</div>
          <div style="font-size:12px;color:#666;margin-top:4px;">Journal entries</div>
        </td>
      </tr>
    </table>
    <p>Keep up the momentum. Every consistent day compounds over time.</p>"""
    html = _base_template("Your Week in Review 📊", body,
        cta_url=f"{APP_URL}/dashboard", cta_label="View Full Dashboard →")
    return await _send(email, subject, html)


async def send_upgrade_confirmation_email(email: str, name: str) -> bool:
    """Sent when user successfully upgrades to Pro."""
    subject = "🚀 Welcome to Mithra Pro!"
    body = f"""
    <p>Hey {name.split()[0]},</p>
    <p>You're now on <strong style="color:#7c3aed;">Mithra Pro</strong>! Here's what just unlocked:</p>
    <ul style="margin:12px 0;padding-left:20px;">
      <li style="margin:8px 0;">🤖 <strong>1,000 AI conversations/day</strong> with Dost</li>
      <li style="margin:8px 0;">✅ <strong>10,000 tasks</strong> and <strong>100 habits</strong></li>
      <li style="margin:8px 0;">👥 <strong>10 collaborative workspaces</strong></li>
      <li style="margin:8px 0;">📧 Weekly AI life report emails</li>
      <li style="margin:8px 0;">⚡ Priority support</li>
    </ul>
    <p>Thank you for supporting Mithra. You're making this journey possible.</p>"""
    html = _base_template("Welcome to Mithra Pro 🚀", body,
        cta_url=f"{APP_URL}/dashboard", cta_label="Start Using Pro →")
    return await _send(email, subject, html)
