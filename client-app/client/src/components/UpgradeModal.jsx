import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, CheckCircle2, ArrowRight, Star } from 'lucide-react';
import { usePlan } from '../context/PlanContext';

const PRO_FEATURES = [
  '1,000 AI conversations per day with Dost',
  '10,000 tasks & 100 habits',
  '10 collaborative workspaces (Blend)',
  'Weekly AI life summary emails',
  'Streak alert notifications',
  'Priority support',
];

export default function UpgradeModal() {
  const { upgradeModalOpen, upgradeReason, closeUpgradeModal, startCheckout } = usePlan();

  return (
    <AnimatePresence>
      {upgradeModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => e.target === e.currentTarget && closeUpgradeModal()}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative w-full max-w-md rounded-2xl overflow-hidden"
            style={{ background: '#131313', border: '1px solid #222' }}
          >
            {/* Header gradient */}
            <div style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)', padding: '28px 24px' }}>
              <button
                onClick={closeUpgradeModal}
                className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
              <div className="flex items-center gap-2 mb-2">
                <Star size={16} className="text-yellow-300" fill="currentColor" />
                <span className="text-white/70 text-sm font-medium">Mithra Pro</span>
              </div>
              <h2 className="text-2xl font-bold text-white">Unlock the full Mithra experience</h2>
              {upgradeReason && (
                <p className="mt-2 text-white/70 text-sm">{upgradeReason}</p>
              )}
            </div>

            {/* Features list */}
            <div className="p-6">
              <ul className="space-y-3 mb-6">
                {PRO_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" style={{ color: '#a78bfa' }} />
                    <span className="text-sm" style={{ color: '#ccc' }}>{f}</span>
                  </li>
                ))}
              </ul>

              {/* Pricing */}
              <div
                className="rounded-xl p-4 mb-4 flex items-center justify-between"
                style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}
              >
                <div>
                  <p className="text-white font-semibold">Monthly Plan</p>
                  <p className="text-xs" style={{ color: '#666' }}>Billed monthly, cancel anytime</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">$9.99</p>
                  <p className="text-xs" style={{ color: '#666' }}>/month</p>
                </div>
              </div>

              <div
                className="rounded-xl p-4 mb-6 flex items-center justify-between cursor-pointer transition-all hover:border-purple-500/50"
                style={{ background: '#1a1a1a', border: '1px solid #7c3aed' }}
                onClick={() => startCheckout('pro_annual')}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-semibold">Annual Plan</p>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: '#7c3aed20', color: '#a78bfa' }}
                    >
                      Save 33%
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: '#666' }}>Billed once per year</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">$7.99</p>
                  <p className="text-xs" style={{ color: '#666' }}>/month</p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => startCheckout('pro_monthly')}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white transition-all"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}
              >
                <Zap size={16} />
                Upgrade to Pro
                <ArrowRight size={16} />
              </motion.button>

              <p className="text-center text-xs mt-3" style={{ color: '#555' }}>
                Secure payment via Stripe · Cancel anytime
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
