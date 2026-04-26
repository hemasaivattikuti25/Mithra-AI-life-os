"""
Stripe Payments Router
Handles: checkout session creation, webhook processing, subscription management.
"""
import os
import logging
import stripe
from fastapi import APIRouter, Depends, HTTPException, Request, Header
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from core.security import get_current_user
from core.config import get_db
from services.email_service import send_upgrade_confirmation_email

logger = logging.getLogger("mithra.payments")
router = APIRouter()

stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")
APP_URL = os.getenv("APP_URL", "https://mithra-lifeos.com")

# Plan ID → Stripe Price ID mapping
PLAN_PRICE_MAP = {
    "pro_monthly": os.getenv("STRIPE_PRICE_PRO_MONTHLY", ""),
    "pro_annual": os.getenv("STRIPE_PRICE_PRO_ANNUAL", ""),
}


class CheckoutRequest(BaseModel):
    plan: str = "pro_monthly"   # 'pro_monthly' | 'pro_annual'
    referral_code: Optional[str] = None


@router.post("/checkout")
async def create_checkout_session(
    req: CheckoutRequest,
    current_user: dict = Depends(get_current_user)
):
    """Create a Stripe Checkout session for plan upgrade."""
    if not stripe.api_key:
        raise HTTPException(status_code=503, detail="Payment system not configured")

    price_id = PLAN_PRICE_MAP.get(req.plan)
    if not price_id:
        raise HTTPException(status_code=400, detail=f"Unknown plan: {req.plan}")

    pool = get_db()
    user_id = current_user["id"]
    email = current_user.get("email", "")

    try:
        # Get or create Stripe customer
        customer_id = None
        if pool:
            async with pool.acquire() as conn:
                row = await conn.fetchrow(
                    "SELECT stripe_customer_id FROM user_plans WHERE user_id = $1", user_id
                )
                if row and row["stripe_customer_id"]:
                    customer_id = row["stripe_customer_id"]

        if not customer_id:
            customer = stripe.Customer.create(
                email=email,
                metadata={"mithra_user_id": user_id}
            )
            customer_id = customer.id

        session = stripe.checkout.Session.create(
            customer=customer_id,
            mode="subscription",
            line_items=[{"price": price_id, "quantity": 1}],
            success_url=f"{APP_URL}/settings?upgrade=success&session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{APP_URL}/settings?upgrade=cancelled",
            metadata={"mithra_user_id": user_id, "plan": req.plan, "referral_code": req.referral_code or ""},
            allow_promotion_codes=True,
        )

        logger.info(f"Checkout session created for user {user_id} → plan {req.plan}")
        return {"checkout_url": session.url, "session_id": session.id}

    except stripe.error.StripeError as e:
        logger.error(f"Stripe error for {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Payment initialization failed. Please try again.")


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: Optional[str] = Header(None, alias="stripe-signature")
):
    """
    Stripe webhook endpoint.
    Processes: checkout.session.completed, customer.subscription.deleted
    """
    if not STRIPE_WEBHOOK_SECRET:
        raise HTTPException(status_code=503, detail="Webhook not configured")

    body = await request.body()
    try:
        event = stripe.Webhook.construct_event(body, stripe_signature, STRIPE_WEBHOOK_SECRET)
    except stripe.error.SignatureVerificationError:
        logger.warning("Invalid Stripe webhook signature")
        raise HTTPException(status_code=400, detail="Invalid signature")

    pool = get_db()
    event_type = event["type"]
    logger.info(f"Stripe webhook received: {event_type}")

    if event_type == "checkout.session.completed":
        session = event["data"]["object"]
        await _handle_checkout_completed(session, pool)

    elif event_type == "customer.subscription.deleted":
        subscription = event["data"]["object"]
        await _handle_subscription_cancelled(subscription, pool)

    elif event_type == "invoice.payment_failed":
        invoice = event["data"]["object"]
        await _handle_payment_failed(invoice, pool)

    return {"received": True}


async def _handle_checkout_completed(session: dict, pool):
    """Provision Pro plan when checkout succeeds."""
    if not pool:
        return

    user_id = session.get("metadata", {}).get("mithra_user_id")
    customer_id = session.get("customer")
    subscription_id = session.get("subscription")

    if not user_id:
        logger.error("Webhook: checkout.session.completed missing mithra_user_id in metadata")
        return

    try:
        async with pool.acquire() as conn:
            # Upsert user_plans with Pro
            await conn.execute("""
                INSERT INTO user_plans (user_id, plan_id, stripe_customer_id, stripe_subscription_id, status, started_at)
                VALUES ($1, 'pro', $2, $3, 'active', NOW())
                ON CONFLICT (user_id) DO UPDATE SET
                    plan_id = 'pro',
                    stripe_customer_id = EXCLUDED.stripe_customer_id,
                    stripe_subscription_id = EXCLUDED.stripe_subscription_id,
                    status = 'active',
                    started_at = NOW(),
                    expires_at = NULL
            """, user_id, customer_id, subscription_id)

            # Mark referral as converted
            referral_code = session.get("metadata", {}).get("referral_code", "")
            if referral_code:
                await conn.execute("""
                    UPDATE referrals SET status='converted', referred_id=$1, converted_at=NOW()
                    WHERE referral_code=$2 AND status='pending'
                """, user_id, referral_code)

            # Get user email for confirmation
            profile = await conn.fetchrow(
                "SELECT email, display_name FROM profiles WHERE id = $1", user_id
            )

        if profile:
            await send_upgrade_confirmation_email(
                profile["email"],
                profile["display_name"] or "there"
            )
        logger.info(f"Pro plan provisioned for user {user_id}")

    except Exception as e:
        logger.error(f"Error provisioning plan for {user_id}: {e}", exc_info=True)


async def _handle_subscription_cancelled(subscription: dict, pool):
    """Downgrade to free plan when subscription is cancelled."""
    if not pool:
        return

    customer_id = subscription.get("customer")
    try:
        async with pool.acquire() as conn:
            await conn.execute("""
                UPDATE user_plans SET plan_id='free', status='cancelled', expires_at=NOW()
                WHERE stripe_customer_id = $1
            """, customer_id)
        logger.info(f"Subscription cancelled for Stripe customer {customer_id} — downgraded to free")
    except Exception as e:
        logger.error(f"Error downgrading plan: {e}", exc_info=True)


async def _handle_payment_failed(invoice: dict, pool):
    """Log payment failure — subscription stays active until Stripe retries exhaust."""
    customer_id = invoice.get("customer")
    logger.warning(f"Payment failed for Stripe customer {customer_id}")


@router.get("/subscription")
async def get_subscription(current_user: dict = Depends(get_current_user)):
    """Get current user's subscription status."""
    pool = get_db()
    user_id = current_user["id"]

    if not pool:
        return {"plan": "free", "status": "active"}

    try:
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT up.plan_id, up.status, up.expires_at, p.name, p.daily_ai_limit,
                       p.max_tasks, p.max_habits, p.max_workspaces, p.price_cents
                FROM user_plans up
                JOIN plans p ON p.id = up.plan_id
                WHERE up.user_id = $1
            """, user_id)

        if row:
            return {
                "plan": row["plan_id"],
                "planName": row["name"],
                "status": row["status"],
                "expiresAt": row["expires_at"].isoformat() if row["expires_at"] else None,
                "limits": {
                    "dailyAiLimit": row["daily_ai_limit"],
                    "maxTasks": row["max_tasks"],
                    "maxHabits": row["max_habits"],
                    "maxWorkspaces": row["max_workspaces"],
                },
                "priceCents": row["price_cents"],
            }
        return {"plan": "free", "status": "active"}
    except Exception as e:
        logger.error(f"Error fetching subscription: {e}")
        return {"plan": "free", "status": "active"}


@router.post("/portal")
async def create_billing_portal(current_user: dict = Depends(get_current_user)):
    """Create a Stripe Billing Portal session for subscription management."""
    if not stripe.api_key:
        raise HTTPException(status_code=503, detail="Payment system not configured")

    pool = get_db()
    user_id = current_user["id"]

    try:
        customer_id = None
        if pool:
            async with pool.acquire() as conn:
                row = await conn.fetchrow(
                    "SELECT stripe_customer_id FROM user_plans WHERE user_id = $1", user_id
                )
                customer_id = row["stripe_customer_id"] if row else None

        if not customer_id:
            raise HTTPException(status_code=400, detail="No active subscription found")

        portal = stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=f"{APP_URL}/settings",
        )
        return {"portal_url": portal.url}
    except HTTPException:
        raise
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=500, detail="Could not open billing portal")
