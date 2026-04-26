import { apiFetch } from './firebaseClient';

export const paymentsService = {
  /** Create a Stripe Checkout session → returns redirect URL */
  async createCheckout(plan = 'pro_monthly', referralCode = '') {
    return await apiFetch('/payments/checkout', {
      method: 'POST',
      body: JSON.stringify({ plan, referral_code: referralCode }),
    });
  },

  /** Get current subscription status */
  async getSubscription() {
    return await apiFetch('/payments/subscription');
  },

  /** Open Stripe Billing Portal for plan management */
  async openBillingPortal() {
    const { portal_url } = await apiFetch('/payments/portal', { method: 'POST' });
    window.location.href = portal_url;
  },
};
