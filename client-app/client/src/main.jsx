import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { initNative } from './native.js'

// Initialize native platform features (Capacitor)
initNative();

/* ══════════════════════════════════════════════════════════════
   SERVICE WORKER CACHE BUST — Force-update SW on first load
   after migration from Supabase to Firebase. Clears old cached
   JS bundles that still contain Supabase auth code.
   ══════════════════════════════════════════════════════════════ */
if ('serviceWorker' in navigator) {
  const SW_MIGRATION = 'mithra-sw-firebase-v1';
  if (!localStorage.getItem(SW_MIGRATION)) {
    // Unregister all old service workers and clear all caches
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((reg) => reg.unregister());
    });
    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name));
    });
    localStorage.setItem(SW_MIGRATION, Date.now().toString());
    // Reload once to ensure fresh code loads
    window.location.reload();
  }
}

/* ══════════════════════════════════════════════════════════════
   DATA MIGRATION v2 — Clear stale mock data from localStorage
   Old versions shipped hardcoded demo entries (journal, calendar).
   This one-time cleanup removes them so users start fresh.
   ══════════════════════════════════════════════════════════════ */
try {
  const DATA_VERSION = 'mithra-data-v2';
  if (!localStorage.getItem(DATA_VERSION)) {
    // Known mock entry titles from old versions
    const MOCK_JOURNAL_TITLES = ['Great breakthrough at work', 'Feeling drained', 'New PR at the Gym', 'Quiet Morning', 'Anxiety about deadline', 'Meditated for 20 minutes'];
    const MOCK_EVENT_TITLES = ['Deep Work Session', 'Team Standup', 'Client Review', 'Gym', 'Design Sprint', 'Lunch w/ Sam', 'Weekly Review', 'Reading Block'];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      // Clean journal entries
      if (key.includes('journal-entries') || key.includes('journal')) {
        try {
          const entries = JSON.parse(localStorage.getItem(key));
          if (Array.isArray(entries)) {
            const cleaned = entries.filter(e => !MOCK_JOURNAL_TITLES.includes(e.title));
            if (cleaned.length !== entries.length) {
              localStorage.setItem(key, JSON.stringify(cleaned));
            }
          }
        } catch {}
      }

      // Clean calendar events
      if (key.includes('calendar-events')) {
        try {
          const events = JSON.parse(localStorage.getItem(key));
          if (Array.isArray(events)) {
            const cleaned = events.filter(e => !MOCK_EVENT_TITLES.includes(e.title));
            if (cleaned.length !== events.length) {
              localStorage.setItem(key, JSON.stringify(cleaned));
            }
          }
        } catch {}
      }
    }
    localStorage.setItem(DATA_VERSION, Date.now().toString());
  }
} catch {}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
