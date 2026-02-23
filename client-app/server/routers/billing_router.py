"""
Stripe Webhook Handler + Subscription Management

This is a SCAFFOLD — wire up your Stripe keys to activate.

Setup:
  1. pip install stripe
  2. Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET in .env
  3. Create a Stripe webhook pointing to /api/billing/webhook

Events handled:
  - checkout.session.completed → Create subscription
  - customer.subscription.updated → Plan change / renewal
  - customer.subscription.deleted → Downgrade to free
  - invoice.payment_failed → Mark as past_due
"""

from fastapi import APIRouter, Request, HTTPException, Depends
from core.config import supabase
from core.security import get_current_user
from datetime import datetime, timedelta
import os
import json

router = APIRouter()

STRIPE_SECRET = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")

# Grace period after cancellation (days)
GRACE_PERIOD_DAYS = 3


def _stripe_available():
    return bool(STRIPE_SECRET) and "sk_" in STRIPE_SECRET


# ─── Webhook Endpoint ───
@router.post("/webhook")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook events."""
    if not _stripe_available():
        raise HTTPException(status_code=503, detail="Stripe not configured")

    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    try:
        import stripe
        stripe.api_key = STRIPE_SECRET
        event = stripe.Webhook.construct_event(payload, sig_header, STRIPE_WEBHOOK_SECRET)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Webhook error: {e}")

    event_type = event["type"]
    data = event["data"]["object"]

    print(f"[Stripe] Event: {event_type}")

    if event_type == "checkout.session.completed":
        await _handle_checkout_completed(data)
    elif event_type == "customer.subscription.updated":
        await _handle_subscription_updated(data)
    elif event_type == "customer.subscription.deleted":
        await _handle_subscription_deleted(data)
    elif event_type == "invoice.payment_failed":
        await _handle_payment_failed(data)

    return {"status": "ok"}


async def _handle_checkout_completed(session):
    """New subscription created via Checkout."""
    if not supabase:
        return

    user_id = session.get("client_reference_id")  # Set during checkout creation
    customer_id = session.get("customer")
    subscription_id = session.get("subscription")

    if not user_id or not subscription_id:
        return

    # Get subscription details from Stripe
    try:
        import stripe
        stripe.api_key = STRIPE_SECRET
        sub = stripe.Subscription.retrieve(subscription_id)
        plan_id = _map_stripe_price_to_plan(sub["items"]["data"][0]["price"]["id"])

        supabase.table("subscriptions").upsert({
            "user_id": user_id,
            "plan_id": plan_id,
            "status": "active",
            "stripe_customer_id": customer_id,
            "stripe_subscription_id": subscription_id,
            "current_period_start": datetime.fromtimestamp(sub["current_period_start"]).isoformat(),
            "current_period_end": datetime.fromtimestamp(sub["current_period_end"]).isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        }, on_conflict="user_id").execute()

        # Also update profile plan for fast lookups
        supabase.table("profiles").update({"plan": plan_id}).eq("id", user_id).execute()
    except Exception as e:
        print(f"[Stripe] Checkout handler error: {e}")


async def _handle_subscription_updated(sub):
    """Plan change or renewal."""
    if not supabase:
        return

    sub_id = sub.get("id")
    status = sub.get("status")
    plan_id = _map_stripe_price_to_plan(sub["items"]["data"][0]["price"]["id"])

    try:
        supabase.table("subscriptions").update({
            "plan_id": plan_id,
            "status": _map_stripe_status(status),
            "current_period_start": datetime.fromtimestamp(sub["current_period_start"]).isoformat(),
            "current_period_end": datetime.fromtimestamp(sub["current_period_end"]).isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        }).eq("stripe_subscription_id", sub_id).execute()
    except Exception as e:
        print(f"[Stripe] Update handler error: {e}")


async def _handle_subscription_deleted(sub):
    """Subscription canceled — apply grace period."""
    if not supabase:
        return

    sub_id = sub.get("id")
    grace_end = (datetime.utcnow() + timedelta(days=GRACE_PERIOD_DAYS)).isoformat()

    try:
        supabase.table("subscriptions").update({
            "status": "canceled",
            "grace_period_end": grace_end,
            "updated_at": datetime.utcnow().isoformat(),
        }).eq("stripe_subscription_id", sub_id).execute()
    except Exception as e:
        print(f"[Stripe] Delete handler error: {e}")


async def _handle_payment_failed(invoice):
    """Payment failed — mark subscription as past_due."""
    if not supabase:
        return

    sub_id = invoice.get("subscription")
    if not sub_id:
        return

    try:
        supabase.table("subscriptions").update({
            "status": "past_due",
            "updated_at": datetime.utcnow().isoformat(),
        }).eq("stripe_subscription_id", sub_id).execute()
    except Exception as e:
        print(f"[Stripe] Payment failed handler error: {e}")


# ─── Create Checkout Session ───
@router.post("/create-checkout")
async def create_checkout(current_user: dict = Depends(get_current_user)):
    """Create a Stripe Checkout session for Pro upgrade."""
    if not _stripe_available():
        raise HTTPException(status_code=503, detail="Stripe not configured. Set STRIPE_SECRET_KEY in .env")

    try:
        import stripe
        stripe.api_key = STRIPE_SECRET

        session = stripe.checkout.Session.create(
            client_reference_id=current_user["id"],
            customer_email=current_user.get("email"),
            payment_method_types=["card"],
            line_items=[{
                "price": os.getenv("STRIPE_PRO_PRICE_ID", ""),
                "quantity": 1,
            }],
            mode="subscription",
            success_url=os.getenv("FRONTEND_URL", "https://mithra-life-os.vercel.app") + "/#/settings?upgrade=success",
            cancel_url=os.getenv("FRONTEND_URL", "https://mithra-life-os.vercel.app") + "/#/settings?upgrade=canceled",
        )

        return {"checkout_url": session.url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Get User Plan Info ───
@router.get("/plan")
async def get_plan(current_user: dict = Depends(get_current_user)):
    """Get current user's plan, limits, and usage."""
    if not supabase:
        return {"plan_id": "free", "daily_ai_limit": 20, "today_ai_calls": 0, "status": "active"}

    try:
        result = supabase.rpc("get_user_plan_limits", {"p_user_id": current_user["id"]}).execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Helpers ───
def _map_stripe_price_to_plan(price_id: str) -> str:
    """Map Stripe price IDs to plan names. Update with your actual IDs."""
    mapping = {
        os.getenv("STRIPE_PRO_PRICE_ID", ""): "pro",
        os.getenv("STRIPE_TEAM_PRICE_ID", ""): "team",
    }
    return mapping.get(price_id, "pro")


def _map_stripe_status(status: str) -> str:
    """Map Stripe subscription status to our status enum."""
    mapping = {
        "active": "active",
        "trialing": "trialing",
        "past_due": "past_due",
        "canceled": "canceled",
        "unpaid": "past_due",
        "incomplete": "past_due",
        "incomplete_expired": "expired",
    }
    return mapping.get(status, "active")
