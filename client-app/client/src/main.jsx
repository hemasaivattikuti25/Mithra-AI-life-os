import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { initNative } from './native.js'

// Initialize native platform features (Capacitor)
initNative();

// Capture PWA install prompt
window.deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.deferredPrompt = e;
});

/* ══════════════════════════════════════════════════════════════
   SERVICE WORKER CLEANUP — Kill any old cached SW that still
   serves stale Supabase-era JS bundles. Runs on every page load
   until no registrations remain.
   ══════════════════════════════════════════════════════════════ */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    regs.forEach((r) => r.unregister());
  });
  caches.keys().then((names) => {
    names.forEach((n) => caches.delete(n));
  });
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
