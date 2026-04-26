import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { paymentsService } from '../services/payments.service';
import { useAuth } from './AuthContext';

const PlanContext = createContext(null);

export function PlanProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [subscription, setSubscription] = useState({
    plan: 'free',
    planName: 'Free Forever',
    status: 'active',
    limits: { dailyAiLimit: 20, maxTasks: 100, maxHabits: 20, maxWorkspaces: 1 },
    priceCents: 0,
  });
  const [loading, setLoading] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState('');

  const isPro = subscription.plan === 'pro';

  const loadSubscription = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const data = await paymentsService.getSubscription();
      setSubscription(data);
    } catch (e) {
      console.error('[Plan] Failed to load subscription:', e);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) loadSubscription();
  }, [isAuthenticated, loadSubscription]);

  // Check URL params for post-checkout success/cancel
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('upgrade') === 'success') {
      // Small delay to let Stripe webhook process
      setTimeout(() => loadSubscription(), 2000);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [loadSubscription]);

  const promptUpgrade = useCallback((reason = '') => {
    setUpgradeReason(reason);
    setUpgradeModalOpen(true);
  }, []);

  const startCheckout = useCallback(async (plan = 'pro_monthly') => {
    try {
      const { checkout_url } = await paymentsService.createCheckout(plan);
      window.location.href = checkout_url;
    } catch (e) {
      console.error('[Plan] Checkout failed:', e);
    }
  }, []);

  return (
    <PlanContext.Provider value={{
      subscription, isPro, loading,
      upgradeModalOpen, upgradeReason,
      loadSubscription, promptUpgrade, startCheckout,
      closeUpgradeModal: () => setUpgradeModalOpen(false),
    }}>
      {children}
    </PlanContext.Provider>
  );
}

export const usePlan = () => {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error('usePlan must be used within PlanProvider');
  return ctx;
};
