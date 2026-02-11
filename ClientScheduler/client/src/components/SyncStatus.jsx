import React, { useState, useEffect } from 'react';
import { Cloud, CloudOff, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { syncEngine } from '../services/syncEngine';

/* ═══════════════════════════════════════════════════════════════
   SYNC STATUS — Shows cloud sync state in the sidebar/UI
   ═══════════════════════════════════════════════════════════════ */
export default function SyncStatus() {
  const [status, setStatus] = useState('idle'); // idle | syncing | synced | offline | error | partial
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const unsubscribe = syncEngine.subscribe((event) => {
      setStatus(event);
      setPendingCount(syncEngine.getPendingCount());

      // Auto-reset "synced" back to idle after 3s
      if (event === 'synced') {
        setTimeout(() => setStatus('idle'), 3000);
      }
      if (event === 'partial') {
        setTimeout(() => setStatus('idle'), 5000);
      }
    });

    // Initial state
    setPendingCount(syncEngine.getPendingCount());
    if (!navigator.onLine) setStatus('offline');

    return unsubscribe;
  }, []);

  // Don't show anything if Supabase isn't configured
  if (!syncEngine.isConfigured) return null;

  const config = {
    idle: {
      icon: <Cloud size={13} />,
      label: pendingCount > 0 ? `${pendingCount} pending` : 'Synced',
      className: 'text-white/40',
    },
    syncing: {
      icon: <RefreshCw size={13} className="animate-spin" />,
      label: 'Syncing…',
      className: 'text-cyan-400',
    },
    synced: {
      icon: <Check size={13} />,
      label: 'All synced',
      className: 'text-green-400',
    },
    offline: {
      icon: <CloudOff size={13} />,
      label: 'Offline',
      className: 'text-amber-400',
    },
    error: {
      icon: <AlertCircle size={13} />,
      label: 'Sync failed',
      className: 'text-red-400',
    },
    partial: {
      icon: <AlertCircle size={13} />,
      label: 'Partial sync',
      className: 'text-amber-400',
    },
  };

  const c = config[status] || config.idle;

  return (
    <button
      onClick={() => status !== 'syncing' && syncEngine.processQueue()}
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium
        bg-white/5 hover:bg-white/10 transition-colors cursor-pointer ${c.className}`}
      title={`Click to sync • ${syncEngine.getLastSyncTime()?.toLocaleTimeString() || 'Never synced'}`}
    >
      {c.icon}
      <span>{c.label}</span>
    </button>
  );
}
