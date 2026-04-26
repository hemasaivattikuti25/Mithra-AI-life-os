import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Wifi } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   API ERROR STATE — shows when a fetch fails
   ═══════════════════════════════════════════════════════════ */
export function ErrorState({ error, onRetry, compact = false }) {
  const isPlanLimit = error?.includes?.('plan_limit') || error?.includes?.('limit. Upgrade');
  const isNetwork = error?.includes?.('timed out') || error?.includes?.('network') || error?.includes?.('fetch');

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center gap-3 text-center ${compact ? 'py-8' : 'py-16'}`}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center"
        style={{ background: isPlanLimit ? '#7c3aed20' : '#ef444420' }}
      >
        {isNetwork ? (
          <Wifi size={22} style={{ color: '#f87171' }} />
        ) : (
          <AlertTriangle size={22} style={{ color: isPlanLimit ? '#a78bfa' : '#f87171' }} />
        )}
      </div>
      <div>
        <p className="font-medium" style={{ color: '#e5e5e5', fontSize: 15 }}>
          {isPlanLimit ? "You've hit your plan limit" : isNetwork ? 'Connection issue' : 'Something went wrong'}
        </p>
        <p className="text-sm mt-1" style={{ color: '#666' }}>
          {error || 'An unexpected error occurred'}
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg transition-all hover:opacity-80"
          style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#ccc' }}
        >
          <RefreshCw size={13} />
          Try again
        </button>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PLAN LIMIT BANNER — shows inline when 429 plan limit hit
   ═══════════════════════════════════════════════════════════ */
export function PlanLimitBanner({ message, onUpgrade }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="rounded-xl p-4 mb-4 flex items-center justify-between gap-3"
      style={{ background: '#7c3aed15', border: '1px solid #7c3aed40' }}
    >
      <div className="flex items-center gap-3">
        <span className="text-lg">⚡</span>
        <p className="text-sm" style={{ color: '#c4b5fd' }}>
          {message || "You've hit your daily AI limit. Upgrade to Pro for more."}
        </p>
      </div>
      <button
        onClick={onUpgrade}
        className="flex-shrink-0 text-sm font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-90"
        style={{ background: '#7c3aed', color: '#fff', fontSize: 13 }}
      >
        Upgrade →
      </button>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   LOADING SKELETON — generic pulsing skeleton row
   ═══════════════════════════════════════════════════════════ */
export function SkeletonRow({ lines = 2 }) {
  return (
    <div className="animate-pulse space-y-2 p-4 rounded-xl" style={{ background: '#131313', border: '1px solid #1e1e1e' }}>
      <div className="h-4 rounded" style={{ background: '#1e1e1e', width: `${60 + Math.random() * 30}%` }} />
      {lines > 1 && <div className="h-3 rounded" style={{ background: '#1a1a1a', width: `${40 + Math.random() * 20}%` }} />}
    </div>
  );
}

export function SkeletonList({ count = 4, lines = 2 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }, (_, i) => <SkeletonRow key={i} lines={lines} />)}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   RETRY BANNER — shows when API fails on a specific action
   ═══════════════════════════════════════════════════════════ */
export function ActionErrorToast({ error, onDismiss }) {
  if (!error) return null;
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="fixed bottom-6 right-6 z-50 max-w-sm rounded-xl p-4 flex items-center gap-3"
      style={{ background: '#1a0000', border: '1px solid #ef444440' }}
    >
      <AlertTriangle size={16} style={{ color: '#f87171', flexShrink: 0 }} />
      <p className="text-sm flex-1" style={{ color: '#fca5a5' }}>{error}</p>
      <button onClick={onDismiss} className="text-xs" style={{ color: '#666' }}>✕</button>
    </motion.div>
  );
}
