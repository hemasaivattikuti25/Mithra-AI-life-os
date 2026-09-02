import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Terminal, Settings, AlertCircle, CheckCircle2, RefreshCw,
  Play, Trash2, Database, Wifi, WifiOff, Clock, Sparkles,
  Code, Sun, Moon, Eye, EyeOff, Activity, ChevronRight, Check
} from 'lucide-react';
import { subDays, format } from 'date-fns';
import { useData, getUserScopedKey } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { checkBackendHealth } from '../services/firebaseClient';

export default function Diagnostics() {
  const {
    tasks, setTasks,
    habits, setHabits,
    theme, toggleTheme,
    colorTheme, changeColorTheme, COLOR_THEMES,
    accentColor,
    syncStatus
  } = useData();

  const { profile } = useAuth();
  const { addToast } = useToast();

  const [cssVars, setCssVars] = useState({});
  const [pingResult, setPingResult] = useState(null);
  const [pingLoading, setPingLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(false);

  // Read CSS custom variables dynamically from document element
  const refreshCssVars = () => {
    const style = window.getComputedStyle(document.documentElement);
    setCssVars({
      '--body-bg': style.getPropertyValue('--body-bg').trim(),
      '--surface-bg': style.getPropertyValue('--surface-bg').trim(),
      '--text-primary': style.getPropertyValue('--text-primary').trim(),
      '--text-dim': style.getPropertyValue('--text-dim').trim(),
      '--accent-color': style.getPropertyValue('--accent-color').trim(),
      '--accent-soft': style.getPropertyValue('--accent-soft').trim(),
      '--glass-bg': style.getPropertyValue('--glass-bg').trim(),
      '--glass-border': style.getPropertyValue('--glass-border').trim(),
    });
  };

  useEffect(() => {
    refreshCssVars();
  }, [theme, colorTheme]);

  // Run a latency check to backend FastAPI service
  const handlePingTest = async () => {
    setPingLoading(true);
    setPingResult(null);
    try {
      const res = await checkBackendHealth();
      setPingResult(res);
      if (res.ok) {
        addToast({ message: `Ping success! Latency: ${res.latency}ms`, type: 'success' });
      } else {
        addToast({ message: `Ping failed: ${res.error}`, type: 'error' });
      }
    } catch (e) {
      setPingResult({ ok: false, error: e.message });
      addToast({ message: `Ping error: ${e.message}`, type: 'error' });
    } finally {
      setPingLoading(false);
    }
  };

  // Run dynamic contrast/readability check on the DOM
  const handleThemeScan = () => {
    setScanning(true);
    setScanResult(null);

    setTimeout(() => {
      const textWhiteElements = Array.from(document.querySelectorAll('.text-white'));
      const issues = [];

      textWhiteElements.forEach((el, idx) => {
        // Walk up to find if any parent has a dark background class
        let parent = el.parentElement;
        let hasDarkWrapper = false;
        while (parent) {
          const classList = parent.classList;
          const style = parent.getAttribute('style') || '';
          if (
            classList.contains('bg-black') ||
            classList.contains('bg-slate-900') ||
            classList.contains('bg-gray-900') ||
            classList.contains('bg-[#0A0A0A]') ||
            classList.contains('bg-[#0a0a0a]') ||
            classList.contains('bg-emerald-500') ||
            classList.contains('bg-green-500') ||
            classList.contains('bg-red-500') ||
            classList.contains('bg-[#C2185B]') ||
            classList.contains('bg-[#9B1B30]') ||
            style.includes('background') ||
            parent.tagName === 'BUTTON'
          ) {
            hasDarkWrapper = true;
            break;
          }
          parent = parent.parentElement;
        }

        if (!hasDarkWrapper) {
          issues.push({
            id: idx,
            tag: el.tagName.toLowerCase(),
            text: el.innerText?.slice(0, 30) || '(No inner text)',
            classes: el.className.split(' ').slice(0, 3).join(' ') + '...',
          });
        }
      });

      setScanResult(issues);
      setScanning(false);
      addToast({
        message: `Theme scan completed. Found ${issues.length} potential issues.`,
        type: issues.length > 0 ? 'warning' : 'success'
      });
    }, 800);
  };

  // Seed sample data to local storage and update app state
  const handleSeedData = () => {
    const userId = profile?.id;
    const userTasksKey = getUserScopedKey('tasks');
    const userHabitsKey = getUserScopedKey('habits');
    const userJournalKey = getUserScopedKey('journal-entries');

    const mockTasks = [
      {
        id: crypto.randomUUID(),
        title: "Verify Light Theme text colors",
        details: "Ensure that all buttons, badges, and alerts keep white text on colored backgrounds",
        completed: false,
        priority: "high",
        listId: "personal",
        dueDate: new Date().toISOString(),
        starred: true,
        userId
      },
      {
        id: crypto.randomUUID(),
        title: "Run sync diagnostic ping tests",
        details: "Confirm round-trip latency to FastAPI backend is below 500ms",
        completed: false,
        priority: "medium",
        listId: "work",
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        starred: false,
        userId
      },
      {
        id: crypto.randomUUID(),
        title: "Reflect on Marcus Aurelius quotations",
        details: "Write reflections inside journal mode on self-discipline",
        completed: true,
        priority: "low",
        listId: "personal",
        dueDate: new Date(Date.now() - 86400000).toISOString(),
        starred: false,
        userId
      }
    ];

    const mockHabits = [
      {
        id: crypto.randomUUID(),
        title: "Hydration Target (3L)",
        category: "Health",
        color: "#06b6d4",
        streak: 6,
        bestStreak: 15,
        consistency: [
          format(subDays(new Date(), 1), 'yyyy-MM-dd'),
          format(subDays(new Date(), 2), 'yyyy-MM-dd'),
          format(subDays(new Date(), 3), 'yyyy-MM-dd'),
          format(subDays(new Date(), 4), 'yyyy-MM-dd'),
          format(subDays(new Date(), 5), 'yyyy-MM-dd'),
          format(subDays(new Date(), 6), 'yyyy-MM-dd'),
        ],
        streakGoal: 30,
        streakUnit: "Day",
        frequency: 1,
        reminder: true,
        todayDone: false,
        focusDuration: 5,
        repeatDays: [0, 1, 2, 3, 4, 5, 6],
        userId
      },
      {
        id: crypto.randomUUID(),
        title: "Stoic Journaling",
        category: "Mindfulness",
        color: "#C2185B",
        streak: 3,
        bestStreak: 9,
        consistency: [
          format(subDays(new Date(), 1), 'yyyy-MM-dd'),
          format(subDays(new Date(), 2), 'yyyy-MM-dd'),
          format(subDays(new Date(), 3), 'yyyy-MM-dd'),
        ],
        streakGoal: 21,
        streakUnit: "Day",
        frequency: 1,
        reminder: true,
        todayDone: false,
        focusDuration: 10,
        repeatDays: [1, 2, 3, 4, 5],
        userId
      },
      {
        id: crypto.randomUUID(),
        title: "Algorithmic Practice",
        category: "Learning",
        color: "#3b82f6",
        streak: 0,
        bestStreak: 5,
        consistency: [],
        streakGoal: 30,
        streakUnit: "Day",
        frequency: 1,
        reminder: false,
        todayDone: false,
        focusDuration: 45,
        repeatDays: [0, 1, 2, 3, 4, 5, 6],
        userId
      }
    ];

    const mockJournal = [
      {
        id: Date.now(),
        title: "A beautiful morning of debugging",
        body: "Today, I spent some time checking the contrast of our app in the brand new light theme. The clean slate backgrounds combined with neon highlights look absolutely stunning! Everything feels incredibly responsive.",
        mood: 9,
        tags: ["#debugging", "#design", "#gratitude"],
        date: new Date(),
        color: "var(--accent-color)"
      },
      {
        id: Date.now() - 100000,
        title: "Reflections on Life OS",
        body: "Building Mithra AI has been an amazing journey. Having all my habits, tasks, and journals organized in one single reactive dashboard keeps me focused and aligned.",
        mood: 8,
        tags: ["#productivity", "#mithra", "#focus"],
        date: new Date(Date.now() - 86400000),
        color: "var(--text-primary)"
      }
    ];

    localStorage.setItem(userTasksKey, JSON.stringify(mockTasks));
    localStorage.setItem(userHabitsKey, JSON.stringify(mockHabits));
    localStorage.setItem(userJournalKey, JSON.stringify(mockJournal));

    setTasks(mockTasks);
    setHabits(mockHabits);

    addToast({ message: 'Sample tasks, habits, and journals loaded successfully!', type: 'success' });
  };

  // Reset local storage keys
  const handleClearCache = () => {
    if (window.confirm('Are you sure you want to clear your local cache? This will reset local data.')) {
      const userId = profile?.id;
      const keys = ['tasks', 'habits', 'journal-entries', 'calendar-events', 'focus-sessions', 'mood-history'];
      keys.forEach(k => {
        localStorage.removeItem(getUserScopedKey(k));
      });
      setTasks([]);
      setHabits([]);
      addToast({ message: 'Local storage keys cleared. Refresh page to reload empty state.', type: 'info' });
    }
  };

  // Read LocalStorage stats
  const localStats = useMemo(() => {
    let rawTasks = [], rawHabits = [], rawJournal = [], rawSessions = [];
    try { rawTasks = JSON.parse(localStorage.getItem(getUserScopedKey('tasks')) || '[]'); } catch { }
    try { rawHabits = JSON.parse(localStorage.getItem(getUserScopedKey('habits')) || '[]'); } catch { }
    try { rawJournal = JSON.parse(localStorage.getItem(getUserScopedKey('journal-entries')) || '[]'); } catch { }
    try { rawSessions = JSON.parse(localStorage.getItem(getUserScopedKey('focus-sessions')) || '[]'); } catch { }

    return [
      { name: 'Tasks (Cached)', count: Array.isArray(rawTasks) ? rawTasks.length : 0, icon: CheckCircle2 },
      { name: 'Habits (Cached)', count: Array.isArray(rawHabits) ? rawHabits.length : 0, icon: Activity },
      { name: 'Journal Entries (Cached)', count: Array.isArray(rawJournal) ? rawJournal.length : 0, icon: Code },
      { name: 'Focus Sessions (Cached)', count: Array.isArray(rawSessions) ? rawSessions.length : (parseInt(rawSessions) || 0), icon: Clock },
    ];
  }, [tasks, habits, profile]);

  return (
    <div className="p-4 pt-2 md:p-12 max-w-5xl mx-auto pb-28 md:pb-20 page-ambient" style={{ color: 'var(--text-primary)', '--ambient-x': '70%', '--ambient-y': '20%', '--ambient-opacity': '0.04' }}>
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl md:text-5xl font-light flex items-center gap-3">
          <Terminal size={32} className="text-[var(--accent-color)]" />
          Diagnostics &amp; Debug Center
        </h1>
        <p style={{ color: 'var(--text-dim)' }} className="text-sm mt-1 opacity-50">
          Verify system properties, health checks, cache operations, and theme contrast metrics.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* CARD 1: THEME & ACTIVE COLOR PALETTES */}
        <section className="glass-card glass-shine p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h2 className="text-xs uppercase font-bold tracking-widest mb-4" style={{ color: 'var(--accent-color)' }}>
              Theme Monitor &amp; CSS Variables
            </h2>
            <p className="text-xs mb-6" style={{ color: 'var(--text-dim)' }}>
              Directly view client theme variables. Switch custom layouts to inspect visual styles.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {Object.entries(cssVars).map(([name, val]) => (
                <div key={name} className="p-3 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] flex flex-col gap-1 overflow-hidden">
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-40">{name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-sm border border-[var(--glass-border)] shrink-0" style={{ backgroundColor: val }} />
                    <span className="text-xs font-mono font-semibold truncate">{val || 'N/A'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 pt-4 border-t border-[var(--glass-border)]">
            <button onClick={toggleTheme} className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-[var(--glass-bg-hover)] border border-[var(--glass-border)] flex items-center gap-2 hover:border-[var(--accent-color)] transition-all">
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              Toggle Theme
            </button>
            <div className="flex gap-1 bg-[var(--glass-bg)] p-1 rounded-xl border border-[var(--glass-border)]">
              {Object.keys(COLOR_THEMES).map(id => (
                <button
                  key={id}
                  onClick={() => changeColorTheme(id)}
                  className={`w-6 h-6 rounded-lg text-[10px] font-bold transition-all uppercase ${colorTheme === id ? 'bg-[var(--accent-color)] text-white font-black' : 'hover:bg-[var(--glass-bg-hover)] opacity-50'}`}
                  style={colorTheme === id ? { color: '#ffffff' } : { color: 'var(--text-primary)' }}
                >
                  {id[0]}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* CARD 2: DYNAMIC LIGHT THEME AUDITOR */}
        <section className="glass-card glass-shine p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h2 className="text-xs uppercase font-bold tracking-widest mb-4" style={{ color: 'var(--accent-color)' }}>
              Light Theme Contrast Auditor
            </h2>
            <p className="text-xs mb-6" style={{ color: 'var(--text-dim)' }}>
              Scan components to detect elements with absolute white text styles that fail color readability audits in Light Mode.
            </p>

            {/* Test Pattern Preview Panel */}
            <div className="p-4 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] mb-4">
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-40 mb-3 block">Contrast Preview System</span>
              <div className="flex flex-wrap gap-2.5">
                {/* Button 1: Custom accent color background */}
                <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[var(--accent-color)] shadow-[0_0_10px_var(--accent-glow)] transition-all">
                  Accent Button (White Text)
                </button>
                {/* Button 2: Red destructive background */}
                <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-red-500 transition-all">
                  Danger Button (White Text)
                </button>
                {/* Badge: Custom green status background */}
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-white bg-green-500 uppercase tracking-wide flex items-center gap-1 shrink-0">
                  <Check size={10} strokeWidth={3} /> Verified (White)
                </span>
              </div>
              <p className="text-[10px] mt-2 opacity-50 italic">
                * If any button text above appears in dark slate, the accessibility override is failing.
              </p>
            </div>

            {/* Auditor Scan Results */}
            {scanResult !== null && (
              <div className="max-h-40 overflow-y-auto space-y-2 p-2 rounded-xl bg-black/10 border border-[var(--glass-border)] mb-4">
                {scanResult.length === 0 ? (
                  <div className="text-xs text-green-400 font-medium flex items-center gap-2 py-1">
                    <CheckCircle2 size={14} /> DOM Audit Pass! Zero light-theme contrast warnings.
                  </div>
                ) : (
                  scanResult.map(item => (
                    <div key={item.id} className="text-[11px] font-mono flex items-start gap-1 text-amber-500 bg-amber-500/5 p-2 rounded border border-amber-500/10">
                      <AlertCircle size={12} className="shrink-0 mt-0.5" />
                      <div>
                        <span><strong>&lt;{item.tag}&gt;</strong>: &quot;{item.text}&quot;</span>
                        <p className="text-[9px] opacity-60">Classes: {item.classes}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[var(--glass-border)]">
            <button
              onClick={handleThemeScan}
              disabled={scanning}
              className="w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-[var(--accent-glow)] text-[var(--accent-color)] hover:bg-[var(--accent-color)]/20 flex items-center justify-center gap-2 border border-transparent disabled:opacity-40 transition-all"
            >
              {scanning ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
              {scanning ? 'Auditing DOM elements...' : 'Run Readability Scan'}
            </button>
          </div>
        </section>

        {/* CARD 3: LOCAL STORAGE DIAGNOSTICS */}
        <section className="glass-card glass-shine p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h2 className="text-xs uppercase font-bold tracking-widest mb-4" style={{ color: 'var(--accent-color)' }}>
              Local Cache &amp; Storage Inspector
            </h2>
            <p className="text-xs mb-6" style={{ color: 'var(--text-dim)' }}>
              Inspect key/value pairs stored in the user workspace. Clear cache to reset layout, or seed with custom mock datasets.
            </p>

            <div className="space-y-2.5 mb-6">
              {localStats.map(item => (
                <div key={item.name} className="flex items-center justify-between p-3 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                  <div className="flex items-center gap-2">
                    <item.icon size={16} className="text-[var(--accent-color)]" />
                    <span className="text-xs font-medium text-[var(--text-primary)]">{item.name}</span>
                  </div>
                  <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-[var(--glass-bg-hover)] border border-[var(--glass-border)]">
                    {item.count} items
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2.5 pt-4 border-t border-[var(--glass-border)]">
            <button
              onClick={handleSeedData}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-[var(--accent-glow)] text-[var(--accent-color)] hover:bg-[var(--accent-color)]/20 flex items-center justify-center gap-2 border border-transparent transition-all"
            >
              <Sparkles size={14} />
              Seed Demo Data
            </button>
            <button
              onClick={handleClearCache}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-red-500/10 text-red-400 hover:bg-red-500/25 flex items-center justify-center gap-2 border border-transparent transition-all"
            >
              <Trash2 size={14} />
              Clear Storage
            </button>
          </div>
        </section>

        {/* CARD 4: API & BACKEND LATENCY DIAGNOSTICS */}
        <section className="glass-card glass-shine p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h2 className="text-xs uppercase font-bold tracking-widest mb-4" style={{ color: 'var(--accent-color)' }}>
              Sync &amp; Backend Diagnostics
            </h2>
            <p className="text-xs mb-6" style={{ color: 'var(--text-dim)' }}>
              Check online connectivity status and run round-trip latency checks to evaluate sync responsiveness.
            </p>

            <div className="space-y-3 mb-6 text-xs">
              <div className="flex justify-between items-center py-1">
                <span style={{ color: 'var(--text-dim)' }}>Network Status</span>
                <span className="flex items-center gap-1.5 font-bold">
                  {navigator.onLine ? (
                    <span className="text-green-400 flex items-center gap-1"><Wifi size={14} /> Online</span>
                  ) : (
                    <span className="text-amber-500 flex items-center gap-1"><WifiOff size={14} /> Offline Mode</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span style={{ color: 'var(--text-dim)' }}>Sync State</span>
                <span className="font-bold uppercase tracking-wider text-[var(--accent-color)] font-mono">{syncStatus}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span style={{ color: 'var(--text-dim)' }}>Diagnostics Health check</span>
                <span className="font-semibold">
                  {pingResult ? (
                    pingResult.ok ? (
                      <span className="text-green-400">FastAPI Active</span>
                    ) : (
                      <span className="text-red-400">Connection Failed</span>
                    )
                  ) : (
                    <span className="opacity-40">Not tested</span>
                  )}
                </span>
              </div>

              {pingResult && (
                <div className="p-3 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] font-mono text-[10px] space-y-1">
                  <div className="flex justify-between">
                    <span className="opacity-40">Status:</span>
                    <span>{pingResult.ok ? 'SUCCESS' : 'ERROR'}</span>
                  </div>
                  {pingResult.ok ? (
                    <div className="flex justify-between">
                      <span className="opacity-40">Round-trip Latency:</span>
                      <span className={pingResult.latency < 300 ? 'text-green-400' : pingResult.latency < 1000 ? 'text-amber-400' : 'text-red-400'}>
                        {pingResult.latency} ms
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="opacity-40 block mb-1">Details:</span>
                      <span className="text-red-400 block break-words">{pingResult.error}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--glass-border)]">
            <button
              onClick={handlePingTest}
              disabled={pingLoading}
              className="w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-[var(--glass-bg-hover)] border border-[var(--glass-border)] flex items-center justify-center gap-2 hover:border-[var(--accent-color)] disabled:opacity-40 transition-all"
            >
              <RefreshCw size={14} className={pingLoading ? 'animate-spin' : ''} />
              {pingLoading ? 'Pinging backend api...' : 'Test Backend Latency'}
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
