import React, { useState, useEffect } from 'react';
import { Cloud, CloudOff, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { syncEngine } from '../services/syncEngine';

/* ═══════════════════════════════════════════════════════════════
   SYNC STATUS — Shows cloud sync state with auto-retry indicator
   ═══════════════════════════════════════════════════════════════ */
export default function SyncStatus() {
  const [status, setStatus] = useState('idle'); // idle | syncing | synced | offline | error | partial | queued
  const [pendingCount, setPendingCount] = useState(0);
  const [lastError, setLastError] = useState(null);

  useEffect(() => {
    const unsubscribe = syncEngine.subscribe((event, data) => {
      setStatus(event);
      setPendingCount(syncEngine.getPendingCount());
      setLastError(syncEngine.getLastError());

      // Auto-reset "synced" back to idle after 3s
      if (event === 'synced') {
        setTimeout(() => setStatus('idle'), 3000);
      }
      if (event === 'partial') {
        // Stay in partial state but update to show retry info
        setTimeout(() => setStatus('queued'), 2000);
      }
    });

    // Initial state
    setPendingCount(syncEngine.getPendingCount());
    setLastError(syncEngine.getLastError());
    if (!navigator.onLine) setStatus('offline');
    else if (syncEngine.getPendingCount() > 0) setStatus('queued');

    return unsubscribe;
  }, []);

  // Don't show anything if sync isn't configured
  if (!syncEngine.isConfigured) return null;

  const getTooltip = () => {
    const lines = [];
    const lastSync = syncEngine.getLastSyncTime();
    if (lastSync) lines.push(`Last sync: ${lastSync.toLocaleTimeString()}`);
    if (pendingCount > 0) lines.push(`${pendingCount} pending (auto-retry in 1 min)`);
    if (lastError) lines.push(`Error: ${lastError}`);
    lines.push('Click to force sync');
    return lines.join(' • ');
  };

  const config = {
    idle: {
      icon: <Cloud size={13} />,
      label: 'Synced',
      className: 'text-white/40',
    },
    queued: {
      icon: <RefreshCw size={13} />,
      label: `${pendingCount} pending`,
      className: 'text-amber-400',
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
      label: pendingCount > 0 ? `Offline (${pendingCount})` : 'Offline',
      className: 'text-amber-400',
    },
    error: {
      icon: <AlertCircle size={13} />,
      label: 'Sync error',
      className: 'text-red-400',
    },
    partial: {
      icon: <RefreshCw size={13} />,
      label: `${pendingCount} pending`,
      className: 'text-amber-400',
    },
  };

  const c = config[status] || config.idle;

  const handleClick = () => {
    if (status !== 'syncing') {
      syncEngine.forceRetry();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium
        bg-[var(--glass-border)] hover:bg-[var(--glass-bg-hover)] transition-colors cursor-pointer ${c.className}`}
      title={getTooltip()}
    >
      {c.icon}
      <span>{c.label}</span>
    </button>
  );
}
