import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { format, addDays, startOfDay, setHours, setMinutes } from 'date-fns';
import { scheduleNotification, isNative, requestNotificationPermission as nativeRequestPermission } from '../native';
import { syncEngine } from '../services/syncEngine';
import { isSupabaseConfigured, supabase } from '../services/supabaseClient';
import { listGoogleEvents } from '../services/googleCalendar';

/* ═══════════════════════════════════════════════════════════════
   SHARED DATA CONTEXT
   Tasks, Habits, Focus sessions, Theme, and Sync settings
   shared across Calendar, Tasks, Habits, and Settings pages
   ═══════════════════════════════════════════════════════════════ */

const DataContext = createContext(null);

/* ═══════════════════════════════════════════════════════════════
   COLOR THEME PALETTES — Each palette defines accent colors
   for both dark and light modes
   ═══════════════════════════════════════════════════════════════ */
const COLOR_THEMES = {
  sakura: {
    name: 'Sakura',
    preview: { top: '#6B1525', bottomLeft: '#0A0505', bottomRight: '#F8BBD0' },
    dark: {
      '--accent-color': '#C2185B',
      '--accent-soft': '#8B1A2B',
      '--accent-glow': 'rgba(194,24,91,0.15)',
      '--accent-secondary': '#D4AF37',
      '--color-visor': '139 26 43',
      '--visor-glow': 'rgba(139,26,43,0.12)',
      '--glass-border': 'rgba(242,235,227,0.08)',
      '--glass-border-hover': 'rgba(242,235,227,0.14)',
    },
    light: {
      '--accent-color': '#9B1B30',
      '--accent-soft': '#6B1525',
      '--accent-glow': 'rgba(155,27,48,0.1)',
      '--accent-secondary': '#8B6914',
      '--color-visor': '107 21 37',
      '--visor-glow': 'rgba(107,21,37,0.08)',
      '--glass-border': 'rgba(107,21,37,0.1)',
      '--glass-border-hover': 'rgba(107,21,37,0.18)',
    },
  },
  blue: {
    name: 'Blue',
    preview: { top: '#1565C0', bottomLeft: '#0A1628', bottomRight: '#90CAF9' },
    dark: {
      '--accent-color': '#42A5F5',
      '--accent-soft': '#1565C0',
      '--accent-glow': 'rgba(66,165,245,0.15)',
      '--accent-secondary': '#80DEEA',
      '--color-visor': '66 165 245',
      '--visor-glow': 'rgba(66,165,245,0.12)',
      '--glass-border': 'rgba(242,235,227,0.08)',
      '--glass-border-hover': 'rgba(242,235,227,0.14)',
    },
    light: {
      '--accent-color': '#1565C0',
      '--accent-soft': '#0D47A1',
      '--accent-glow': 'rgba(21,101,192,0.1)',
      '--accent-secondary': '#00838F',
      '--color-visor': '21 101 192',
      '--visor-glow': 'rgba(21,101,192,0.08)',
      '--glass-border': 'rgba(21,101,192,0.1)',
      '--glass-border-hover': 'rgba(21,101,192,0.18)',
    },
  },
  forest: {
    name: 'Forest',
    preview: { top: '#2E7D32', bottomLeft: '#0A1409', bottomRight: '#A5D6A7' },
    dark: {
      '--accent-color': '#66BB6A',
      '--accent-soft': '#2E7D32',
      '--accent-glow': 'rgba(102,187,106,0.15)',
      '--accent-secondary': '#AED581',
      '--color-visor': '102 187 106',
      '--visor-glow': 'rgba(102,187,106,0.12)',
      '--glass-border': 'rgba(242,235,227,0.08)',
      '--glass-border-hover': 'rgba(242,235,227,0.14)',
    },
    light: {
      '--accent-color': '#2E7D32',
      '--accent-soft': '#1B5E20',
      '--accent-glow': 'rgba(46,125,50,0.1)',
      '--accent-secondary': '#558B2F',
      '--color-visor': '46 125 50',
      '--visor-glow': 'rgba(46,125,50,0.08)',
      '--glass-border': 'rgba(46,125,50,0.1)',
      '--glass-border-hover': 'rgba(46,125,50,0.18)',
    },
  },
  vapourwave: {
    name: 'Vapour Wave',
    preview: { top: '#00838F', bottomLeft: '#081214', bottomRight: '#80DEEA' },
    dark: {
      '--accent-color': '#26C6DA',
      '--accent-soft': '#00838F',
      '--accent-glow': 'rgba(38,198,218,0.15)',
      '--accent-secondary': '#CE93D8',
      '--color-visor': '38 198 218',
      '--visor-glow': 'rgba(38,198,218,0.12)',
      '--glass-border': 'rgba(242,235,227,0.08)',
      '--glass-border-hover': 'rgba(242,235,227,0.14)',
    },
    light: {
      '--accent-color': '#00838F',
      '--accent-soft': '#006064',
      '--accent-glow': 'rgba(0,131,143,0.1)',
      '--accent-secondary': '#7B1FA2',
      '--color-visor': '0 131 143',
      '--visor-glow': 'rgba(0,131,143,0.08)',
      '--glass-border': 'rgba(0,131,143,0.1)',
      '--glass-border-hover': 'rgba(0,131,143,0.18)',
    },
  },
  nightfall: {
    name: 'Nightfall',
    preview: { top: '#283593', bottomLeft: '#050718', bottomRight: '#9FA8DA' },
    dark: {
      '--accent-color': '#7986CB',
      '--accent-soft': '#283593',
      '--accent-glow': 'rgba(121,134,203,0.15)',
      '--accent-secondary': '#4FC3F7',
      '--color-visor': '121 134 203',
      '--visor-glow': 'rgba(121,134,203,0.12)',
      '--glass-border': 'rgba(242,235,227,0.08)',
      '--glass-border-hover': 'rgba(242,235,227,0.14)',
    },
    light: {
      '--accent-color': '#283593',
      '--accent-soft': '#1A237E',
      '--accent-glow': 'rgba(40,53,147,0.1)',
      '--accent-secondary': '#0277BD',
      '--color-visor': '40 53 147',
      '--visor-glow': 'rgba(40,53,147,0.08)',
      '--glass-border': 'rgba(40,53,147,0.1)',
      '--glass-border-hover': 'rgba(40,53,147,0.18)',
    },
  },
  cocoa: {
    name: 'Cocoa',
    preview: { top: '#8D6E63', bottomLeft: '#1A0E0A', bottomRight: '#D7CCC8' },
    dark: {
      '--accent-color': '#A1887F',
      '--accent-soft': '#6D4C41',
      '--accent-glow': 'rgba(161,136,127,0.15)',
      '--accent-secondary': '#FFB74D',
      '--color-visor': '161 136 127',
      '--visor-glow': 'rgba(161,136,127,0.12)',
      '--glass-border': 'rgba(242,235,227,0.08)',
      '--glass-border-hover': 'rgba(242,235,227,0.14)',
    },
    light: {
      '--accent-color': '#5D4037',
      '--accent-soft': '#3E2723',
      '--accent-glow': 'rgba(93,64,55,0.1)',
      '--accent-secondary': '#E65100',
      '--color-visor': '93 64 55',
      '--visor-glow': 'rgba(93,64,55,0.08)',
      '--glass-border': 'rgba(93,64,55,0.1)',
      '--glass-border-hover': 'rgba(93,64,55,0.18)',
    },
  },
  neon: {
    name: 'Neon',
    preview: { top: '#06b6d4', bottomLeft: '#0a0f14', bottomRight: '#22d3ee' },
    dark: {
      '--accent-color': '#22d3ee',
      '--accent-soft': '#06b6d4',
      '--accent-glow': 'rgba(34,211,238,0.15)',
      '--accent-secondary': '#3b82f6',
      '--color-visor': '34 211 238',
      '--visor-glow': 'rgba(34,211,238,0.12)',
      '--glass-border': 'rgba(242,235,227,0.08)',
      '--glass-border-hover': 'rgba(242,235,227,0.14)',
    },
    light: {
      '--accent-color': '#0891b2',
      '--accent-soft': '#0e7490',
      '--accent-glow': 'rgba(8,145,178,0.1)',
      '--accent-secondary': '#1d4ed8',
      '--color-visor': '8 145 178',
      '--visor-glow': 'rgba(8,145,178,0.08)',
      '--glass-border': 'rgba(8,145,178,0.1)',
      '--glass-border-hover': 'rgba(8,145,178,0.18)',
    },
  },

};

/* Helper to apply a color theme's CSS variables */
const applyColorTheme = (themeId, mode) => {
  const palette = COLOR_THEMES[themeId];
  if (!palette) return;
  const vars = mode === 'light' ? palette.light : palette.dark;
  const root = document.documentElement;
  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
};

/* ═══════════════════════════════════════════════════════════════
   NOTIFICATION REMINDER OPTIONS
   ═══════════════════════════════════════════════════════════════ */
const REMINDER_OPTIONS = [
  { value: 1, label: '1 minute before' },
  { value: 5, label: '5 minutes before' },
  { value: 10, label: '10 minutes before' },
  { value: 15, label: '15 minutes before' },
  { value: 30, label: '30 minutes before' },
  { value: 60, label: '1 hour before' },
  { value: 120, label: '2 hours before' },
  { value: 360, label: '6 hours before' },
  { value: 720, label: '12 hours before' },
  { value: 1440, label: '1 day before' },
];

const today = new Date();

/* ── localStorage helpers ── */
const loadFromStorage = (key, fallback) => {
  try {
    // Try user-scoped key first, fall back to global key for migration
    const userId = (() => { try { const a = JSON.parse(localStorage.getItem('mithra-auth') || 'null'); return a?.id; } catch { return null; } })();
    const scopedKey = userId ? `mithra-${userId}-${key}` : `mithra-${key}`;
    const stored = localStorage.getItem(scopedKey);
    if (stored !== null) return JSON.parse(stored);
    // Migrate from unscopped key if user-scoped doesn't exist
    if (userId) {
      const globalStored = localStorage.getItem(`mithra-${key}`);
      if (globalStored !== null) {
        const parsed = JSON.parse(globalStored);
        localStorage.setItem(scopedKey, globalStored); // migrate
        return parsed;
      }
    }
    return fallback;
  } catch { return fallback; }
};
const saveToStorage = (key, value) => {
  try {
    const userId = (() => { try { const a = JSON.parse(localStorage.getItem('mithra-auth') || 'null'); return a?.id; } catch { return null; } })();
    const scopedKey = userId ? `mithra-${userId}-${key}` : `mithra-${key}`;
    localStorage.setItem(scopedKey, JSON.stringify(value));
  } catch { }
};

/** Get user-scoped localStorage key — use this in pages that manage their own storage */
export const getUserScopedKey = (baseKey) => {
  try {
    const a = JSON.parse(localStorage.getItem('mithra-auth') || 'null');
    if (a?.id) return `mithra-${a.id}-${baseKey}`;
  } catch { }
  return `mithra-${baseKey}`;
};

/** Load from user-scoped localStorage with migration from global key */
export const loadUserStorage = (baseKey, fallback) => {
  try {
    const scopedKey = getUserScopedKey(baseKey);
    const stored = localStorage.getItem(scopedKey);
    if (stored !== null) return JSON.parse(stored);
    // Migrate from global key
    const globalKey = `mithra-${baseKey}`;
    if (scopedKey !== globalKey) {
      const globalStored = localStorage.getItem(globalKey);
      if (globalStored !== null) {
        localStorage.setItem(scopedKey, globalStored);
        return JSON.parse(globalStored);
      }
    }
    return fallback;
  } catch { return fallback; }
};

/** Save to user-scoped localStorage */
export const saveUserStorage = (baseKey, value) => {
  try {
    localStorage.setItem(getUserScopedKey(baseKey), JSON.stringify(value));
  } catch { }
};

/* ── initial tasks — empty for new users ── */
const INITIAL_TASKS = [];

/* ── initial habits ── */
function generateConsistency(probability) {
  const start = new Date(today.getFullYear(), 0, 1);
  const days = [];
  let d = new Date(start);
  while (d <= today) {
    if (Math.random() < probability) days.push(format(d, 'yyyy-MM-dd'));
    d = addDays(d, 1);
  }
  return days;
}

/* ── initial habits — empty for new users ── */
const INITIAL_HABITS = [];

/* ── initial lists ── */
const INITIAL_LISTS = [
  { id: 'default', name: 'My Tasks', color: '#C2185B' },
  { id: 'work', name: 'Work', color: '#3b82f6' },
  { id: 'personal', name: 'Personal', color: '#f97316' },
];

/* ── habit → calendar category mapping ── */
const HABIT_CATEGORY_MAP = {
  Work: 'Work',
  Health: 'Health',
  Personal: 'Personal',
  Learning: 'Focus',
  Mindfulness: 'Focus',
};

/* ═══════════════════════════════════════════════════════════════ */
export function DataProvider({ children }) {
  // Tasks — load from localStorage, fall back to initial data
  const [tasks, setTasks] = useState(() => {
    const stored = loadFromStorage('tasks', null);
    if (stored && Array.isArray(stored) && stored.length > 0) {
      // Rehydrate date objects
      return stored.map(t => ({
        ...t,
        dueDate: t.dueDate ? new Date(t.dueDate) : null,
      }));
    }
    return INITIAL_TASKS;
  });
  const [taskLists] = useState(INITIAL_LISTS);

  // Habits — load from localStorage, fall back to initial data
  const [habits, setHabits] = useState(() => {
    const stored = loadFromStorage('habits', null);
    if (stored && Array.isArray(stored) && stored.length > 0) return stored;
    return INITIAL_HABITS;
  });

  // Theme: 'dark' | 'light' — defaults to system preference
  const [theme, setTheme] = useState(() => {
    const stored = loadFromStorage('theme', null);
    if (stored) return stored;
    // Auto-detect system preference
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

  // Color theme palette
  const [colorTheme, setColorTheme] = useState(() => loadFromStorage('colorTheme', 'sakura'));

  // Preferences
  const [notifications, setNotifications] = useState(() => loadFromStorage('notifications', true));
  const [focusSound, setFocusSound] = useState(() => loadFromStorage('focusSound', false));

  // Notification settings — per-category
  const [notificationSettings, setNotificationSettings] = useState(() =>
    loadFromStorage('notificationSettings', {
      enabled: false,
      reminderMinutes: 15,
      taskReminders: true,
      eventReminders: true,
      habitReminders: true,
      streakLossAlerts: true,
      overdueTaskAlerts: true,
      taskReminderMinutes: 15,
      eventReminderMinutes: 15,
      habitReminderMinutes: 60,
    })
  );

  // Sync settings
  const [syncSettings, setSyncSettings] = useState(() => loadFromStorage('syncSettings', {
    syncTasksToCalendar: true,
    syncHabitsToCalendar: true,
    syncFocusToTracker: true,
    syncGoogleCalendar: false, // User toggle for G-Cal
  }));

  // Google Calendar Events State
  const [googleEvents, setGoogleEvents] = useState([]);

  const fetchGoogleEvents = useCallback(async () => {
    if (!isSupabaseConfigured || !syncSettings.syncGoogleCalendar) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.provider_token) {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1); // 1 month back
        const end = new Date(now.getFullYear(), now.getMonth() + 3, 1);   // 3 months forward
        const events = await listGoogleEvents(session.provider_token, start, end);
        setGoogleEvents(events);
        console.log('[Mithra] Synced', events.length, 'Google Calendar events');
      }
    } catch (err) {
      console.warn('[Mithra] Google Calendar sync failed:', err);
    }
  }, [syncSettings.syncGoogleCalendar]);

  // Initial sync and poll
  useEffect(() => {
    fetchGoogleEvents();
    const interval = setInterval(fetchGoogleEvents, 5 * 60 * 1000); // 5 mins
    return () => clearInterval(interval);
  }, [fetchGoogleEvents]);

  // Persist settings to localStorage whenever they change
  useEffect(() => { saveToStorage('theme', theme); }, [theme]);
  useEffect(() => { saveToStorage('colorTheme', colorTheme); }, [colorTheme]);
  useEffect(() => { saveToStorage('notifications', notifications); }, [notifications]);
  useEffect(() => { saveToStorage('focusSound', focusSound); }, [focusSound]);
  useEffect(() => { saveToStorage('syncSettings', syncSettings); }, [syncSettings]);
  useEffect(() => { saveToStorage('notificationSettings', notificationSettings); }, [notificationSettings]);

  // Persist tasks and habits to localStorage
  useEffect(() => { saveToStorage('tasks', tasks); }, [tasks]);
  useEffect(() => { saveToStorage('habits', habits); }, [habits]);

  /* ══════════════════════════════════════════════════════════════
     SUPABASE SYNC — Pull on mount, push on CRUD
     ═══════════════════════════════════════════════════════════ */
  const hasPulledRef = useRef(false);

  // Initial pull from Supabase when user is authenticated
  useEffect(() => {
    if (!isSupabaseConfigured || hasPulledRef.current) return;

    const pullFromCloud = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) return;
        const userId = session.user.id;

        // Pull tasks
        const { data: cloudTasks } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', userId);

        if (cloudTasks && cloudTasks.length > 0) {
          const mapped = cloudTasks.map(t => ({
            id: t.id,
            title: t.title,
            details: t.details || '',
            listId: t.list_id || 'default',
            completed: t.completed,
            starred: t.starred,
            priority: t.priority || 'low',
            dueDate: t.due_date ? new Date(t.due_date) : null,
            subtasks: t.subtasks || [],
            recurrence: t.recurrence || 'none',
          }));
          setTasks(mapped);
        }

        // Pull habits
        const { data: cloudHabits } = await supabase
          .from('habits')
          .select('*')
          .eq('user_id', userId);

        if (cloudHabits && cloudHabits.length > 0) {
          const mapped = cloudHabits.map(h => ({
            id: h.id,
            title: h.title,
            category: h.category || 'Personal',
            streak: h.streak || 0,
            bestStreak: h.best_streak || 0,
            consistency: h.consistency || [],
            todayDone: h.today_done || false,
            focusDuration: h.focus_duration || 25,
          }));
          setHabits(mapped);
        }

        hasPulledRef.current = true;
        console.log('[Sync] Initial pull complete');
      } catch (err) {
        console.warn('[Sync] Initial pull failed:', err);
      }
    };

    pullFromCloud();
  }, []);

  // Helper: push a change to Supabase in the background
  const syncToCloud = useCallback((table, action, data) => {
    if (!isSupabaseConfigured) return;
    syncEngine.enqueue({ table, action, data });
  }, []);

  // Computed accent colors for JS usage (charts, inline styles, etc.)
  const accentColor = useMemo(() => {
    const palette = COLOR_THEMES[colorTheme];
    if (!palette) return { color: '#C2185B', soft: '#8B1A2B', secondary: '#D4AF37', glow: 'rgba(194,24,91,0.15)' };
    const vars = theme === 'light' ? palette.light : palette.dark;
    return {
      color: vars['--accent-color'],
      soft: vars['--accent-soft'],
      secondary: vars['--accent-secondary'],
      glow: vars['--accent-glow'],
    };
  }, [colorTheme, theme]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('light', theme === 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
    applyColorTheme(colorTheme, theme);
  }, [theme, colorTheme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  const changeColorTheme = useCallback((id) => {
    if (COLOR_THEMES[id]) setColorTheme(id);
  }, []);

  const toggleNotifications = useCallback(() => setNotifications(prev => !prev), []);
  const toggleFocusSound = useCallback(() => setFocusSound(prev => !prev), []);

  // Notification functions
  const updateNotificationSettings = useCallback((updates) => {
    setNotificationSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    return nativeRequestPermission();
  }, []);

  // Helper: fire an immediate notification via native bridge or web API
  const fireNotification = useCallback(async (title, body, tag) => {
    try {
      if (isNative) {
        await scheduleNotification({
          id: Math.floor(Math.random() * 100000),
          title,
          body,
          at: new Date(),
        });
      } else if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/favicon.ico', tag });
      }
    } catch (e) { console.warn('Notification error:', e); }
  }, []);

  // Notification check interval — checks every 30s if any task is due within reminder window
  // Also sends daily habit reminders, streak loss alerts, and overdue task alerts
  useEffect(() => {
    if (!notificationSettings.enabled) return;
    // Request permission on first enable (native or web)
    nativeRequestPermission();
    const checkNotifications = async () => {
      // On web, check permission; on native, permission was already requested
      if (!isNative && (!('Notification' in window) || Notification.permission !== 'granted')) return;
      const now = new Date();

      // Task reminder notifications
      if (notificationSettings.taskReminders) {
        const reminderMs = (notificationSettings.taskReminderMinutes || notificationSettings.reminderMinutes) * 60 * 1000;
        tasks.forEach(task => {
          if (!task.dueDate || task.completed) return;
          const dueTime = new Date(task.dueDate).getTime();
          const diff = dueTime - now.getTime();
          if (diff > 0 && diff <= reminderMs + 30000) {
            const notifKey = `mithra-notif-${task.id}-${format(new Date(task.dueDate), 'yyyy-MM-dd-HH-mm')}`;
            if (!sessionStorage.getItem(notifKey)) {
              const mins = notificationSettings.taskReminderMinutes || notificationSettings.reminderMinutes;
              const timeLabel = mins < 60 ? `${mins} min` : mins < 1440 ? `${Math.round(mins / 60)} hr` : '1 day';
              fireNotification('Mithra — Task Reminder', `"${task.title}" is due in ${timeLabel}`, notifKey);
              sessionStorage.setItem(notifKey, 'true');
            }
          }
        });
      }

      // Overdue task notifications
      if (notificationSettings.overdueTaskAlerts) {
        tasks.forEach(task => {
          if (!task.dueDate || task.completed) return;
          const dueTime = new Date(task.dueDate).getTime();
          const diff = dueTime - now.getTime();
          if (diff < 0 && diff > -86400000) {
            const overdueKey = `mithra-overdue-${task.id}-${format(now, 'yyyy-MM-dd')}`;
            if (!sessionStorage.getItem(overdueKey)) {
              fireNotification('Mithra — Overdue Task', `"${task.title}" is overdue! Time to get it done.`, overdueKey);
              sessionStorage.setItem(overdueKey, 'true');
            }
          }
        });
      }

      // Habit reminders — remind about incomplete habits in the evening (after 6pm)
      if (notificationSettings.habitReminders) {
        const hour = now.getHours();
        if (hour >= 18 && hour < 22) {
          const habitReminderKey = `mithra-habit-reminder-${format(now, 'yyyy-MM-dd')}`;
          if (!sessionStorage.getItem(habitReminderKey)) {
            const incompleteHabits = habits.filter(h => !h.todayDone);
            if (incompleteHabits.length > 0) {
              fireNotification('Mithra — Habit Reminder', `You have ${incompleteHabits.length} habit${incompleteHabits.length > 1 ? 's' : ''} left today: ${incompleteHabits.map(h => h.title).slice(0, 3).join(', ')}${incompleteHabits.length > 3 ? '...' : ''}`, habitReminderKey);
              sessionStorage.setItem(habitReminderKey, 'true');
            }
          }
        }
      }

      // Streak loss alerts — warn if a habit streak might be lost today
      if (notificationSettings.streakLossAlerts) {
        const hour = now.getHours();
        if (hour >= 20 && hour < 23) {
          const streakKey = `mithra-streak-alert-${format(now, 'yyyy-MM-dd')}`;
          if (!sessionStorage.getItem(streakKey)) {
            const atRisk = habits.filter(h => !h.todayDone && h.streak >= 3);
            if (atRisk.length > 0) {
              fireNotification('Mithra — Streak at Risk!', `Don't lose your streak! ${atRisk.map(h => `${h.title} (${h.streak} days)`).slice(0, 3).join(', ')}`, streakKey);
              sessionStorage.setItem(streakKey, 'true');
            }
          }
        }
      }

      // Calendar event reminders
      if (notificationSettings.eventReminders) {
        try {
          const savedEvents = JSON.parse(localStorage.getItem(getUserScopedKey('calendar-events')) || '[]');
          const eventReminderMs = (notificationSettings.eventReminderMinutes || 15) * 60 * 1000;
          savedEvents.forEach(evt => {
            if (!evt.start) return;
            const startTime = new Date(evt.start).getTime();
            const diff = startTime - now.getTime();
            if (diff > 0 && diff <= eventReminderMs + 30000) {
              const evtKey = `mithra-evt-notif-${evt.id}-${format(new Date(evt.start), 'yyyy-MM-dd-HH-mm')}`;
              if (!sessionStorage.getItem(evtKey)) {
                const mins = notificationSettings.eventReminderMinutes || 15;
                const timeLabel = mins < 60 ? `${mins} min` : mins < 1440 ? `${Math.round(mins / 60)} hr` : '1 day';
                fireNotification('Mithra — Event Starting Soon', `"${evt.title}" starts in ${timeLabel}${evt.location ? ` at ${evt.location}` : ''}`, evtKey);
                sessionStorage.setItem(evtKey, 'true');
              }
            }
          });
        } catch (e) { console.warn('Event notification error:', e); }
      }
    };
    const interval = setInterval(checkNotifications, 30000);
    checkNotifications();
    return () => clearInterval(interval);
  }, [notificationSettings, tasks, habits, fireNotification]);

  /* ── Task CRUD (with cloud sync) ── */
  const addTask = useCallback((task) => {
    setTasks(prev => [...prev, task]);
    syncToCloud('tasks', 'upsert', {
      id: task.id,
      title: task.title,
      details: task.details || '',
      list_id: task.listId || 'default',
      completed: task.completed || false,
      starred: task.starred || false,
      priority: task.priority || 'low',
      due_date: task.dueDate ? new Date(task.dueDate).toISOString() : null,
      subtasks: task.subtasks || [],
      recurrence: task.recurrence || 'none',
    });
  }, [syncToCloud]);

  const updateTask = useCallback((updated) => {
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
    syncToCloud('tasks', 'upsert', {
      id: updated.id,
      title: updated.title,
      details: updated.details || '',
      list_id: updated.listId || 'default',
      completed: updated.completed || false,
      starred: updated.starred || false,
      priority: updated.priority || 'low',
      due_date: updated.dueDate ? new Date(updated.dueDate).toISOString() : null,
      subtasks: updated.subtasks || [],
      recurrence: updated.recurrence || 'none',
    });
  }, [syncToCloud]);

  const deleteTask = useCallback((id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    syncToCloud('tasks', 'delete', { id });
  }, [syncToCloud]);
  const toggleTask = useCallback((id) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const willComplete = !t.completed;
      // If completing a recurring task, auto-create next occurrence
      if (willComplete && t.recurrence && t.recurrence !== 'none' && t.dueDate) {
        const due = new Date(t.dueDate);
        let nextDate;
        switch (t.recurrence) {
          case 'daily': nextDate = addDays(due, 1); break;
          case 'weekly': nextDate = addDays(due, 7); break;
          case 'monthly': nextDate = new Date(due.getFullYear(), due.getMonth() + 1, due.getDate()); break;
          default: nextDate = null;
        }
        if (nextDate) {
          setTimeout(() => {
            setTasks(p => [...p, {
              ...t,
              id: `${t.id}-${Date.now()}`,
              completed: false,
              dueDate: nextDate,
            }]);
          }, 0);
        }
      }
      return { ...t, completed: willComplete };
    }));
  }, []);
  const starTask = useCallback((id) => setTasks(prev => prev.map(t => t.id === id ? { ...t, starred: !t.starred } : t)), []);

  /* ── Habit CRUD (with cloud sync) ── */
  const addHabit = useCallback((habit) => {
    setHabits(prev => [...prev, habit]);
    syncToCloud('habits', 'upsert', {
      id: habit.id,
      title: habit.title,
      category: habit.category || 'Personal',
      streak: habit.streak || 0,
      best_streak: habit.bestStreak || 0,
      consistency: habit.consistency || [],
      today_done: habit.todayDone || false,
      focus_duration: habit.focusDuration || 25,
    });
  }, [syncToCloud]);

  const updateHabit = useCallback((updated) => {
    setHabits(prev => prev.map(h => h.id === updated.id ? updated : h));
    syncToCloud('habits', 'upsert', {
      id: updated.id,
      title: updated.title,
      category: updated.category || 'Personal',
      streak: updated.streak || 0,
      best_streak: updated.bestStreak || 0,
      consistency: updated.consistency || [],
      today_done: updated.todayDone || false,
      focus_duration: updated.focusDuration || 25,
    });
  }, [syncToCloud]);

  const deleteHabit = useCallback((id) => {
    setHabits(prev => prev.filter(h => h.id !== id));
    syncToCloud('habits', 'delete', { id });
  }, [syncToCloud]);

  // Streak milestones
  const STREAK_MILESTONES = [7, 14, 21, 30, 60, 90, 100, 180, 365];
  const [lastMilestone, setLastMilestone] = useState(null);

  const toggleHabit = useCallback((id) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h;
      const willBeDone = !h.todayDone;
      const newStreak = willBeDone ? h.streak + 1 : Math.max(0, h.streak - 1);
      const updated = {
        ...h,
        todayDone: willBeDone,
        streak: newStreak,
        bestStreak: Math.max(h.bestStreak || 0, newStreak),
        consistency: willBeDone
          ? [...h.consistency, format(new Date(), 'yyyy-MM-dd')]
          : h.consistency.filter(d => d !== format(new Date(), 'yyyy-MM-dd')),
      };

      // Check for streak milestones
      if (willBeDone && STREAK_MILESTONES.includes(newStreak)) {
        setLastMilestone({ habit: updated.title, streak: newStreak, color: updated.color });
        setTimeout(() => setLastMilestone(null), 5000);
      }

      // Sync the toggled habit to cloud
      syncToCloud('habits', 'upsert', {
        id: updated.id,
        title: updated.title,
        category: updated.category,
        streak: updated.streak,
        best_streak: updated.bestStreak,
        consistency: updated.consistency,
        today_done: updated.todayDone,
        focus_duration: updated.focusDuration,
      });
      return updated;
    }));
  }, [syncToCloud]);

  /* ── Generate calendar events from tasks ── */
  const taskCalendarEvents = useMemo(() => {
    if (!syncSettings.syncTasksToCalendar) return [];
    return tasks
      .filter(t => t.dueDate && !t.completed)
      .map(t => ({
        id: `task-${t.id}`,
        title: `📋 ${t.title}`,
        start: setMinutes(setHours(startOfDay(t.dueDate), 8), 0),
        end: setMinutes(setHours(startOfDay(t.dueDate), 8), 30),
        category: t.listId === 'work' ? 'Work' : 'Personal',
        location: '',
        description: t.details || '',
        isTask: true,
        priority: t.priority,
      }));
  }, [tasks, syncSettings.syncTasksToCalendar]);

  /* ── Generate calendar events from habits (today only) ── */
  const habitCalendarEvents = useMemo(() => {
    if (!syncSettings.syncHabitsToCalendar) return [];
    const todayDate = new Date();
    const dayOfWeek = todayDate.getDay(); // 0=Sun, 1=Mon...
    let slotHour = 7; // Fallback start hour if no scheduleTime

    return habits
      .filter(h => {
        // Only show habits scheduled for today (based on repeatDays)
        if (h.repeatDays && h.repeatDays.length > 0) {
          return h.repeatDays.includes(dayOfWeek);
        }
        return true; // If no repeat days set, show every day
      })
      .map(h => {
        let startHour, startMin;
        if (h.scheduleTime) {
          const [sh, sm] = h.scheduleTime.split(':').map(Number);
          startHour = sh;
          startMin = sm || 0;
        } else {
          startHour = slotHour;
          startMin = 0;
          slotHour += 1;
        }

        const evt = {
          id: `habit-${h.id}`,
          title: `${h.todayDone ? '✅' : '🔄'} ${h.title}`,
          start: setMinutes(setHours(startOfDay(todayDate), startHour), startMin),
          end: setMinutes(setHours(startOfDay(todayDate), startHour), startMin + (h.focusDuration || 25)),
          category: HABIT_CATEGORY_MAP[h.category] || 'Focus',
          location: '',
          description: `Streak: ${h.streak} days | Duration: ${h.focusDuration || 25}m`,
          isHabit: true,
          todayDone: h.todayDone,
          habitColor: h.color,
        };
        return evt;
      });
  }, [habits, syncSettings.syncHabitsToCalendar]);

  /* ── Sync toggles ── */
  const toggleSyncTasks = useCallback(() => {
    setSyncSettings(prev => ({ ...prev, syncTasksToCalendar: !prev.syncTasksToCalendar }));
  }, []);
  const toggleSyncHabits = useCallback(() => {
    setSyncSettings(prev => ({ ...prev, syncHabitsToCalendar: !prev.syncHabitsToCalendar }));
  }, []);
  const toggleSyncFocus = useCallback(() => {
    setSyncSettings(prev => ({ ...prev, syncFocusToTracker: !prev.syncFocusToTracker }));
  }, []);
  const toggleSyncGoogleCalendar = useCallback(() => {
    setSyncSettings(prev => ({ ...prev, syncGoogleCalendar: !prev.syncGoogleCalendar }));
  }, []);

  /* ── Export ALL data ── */
  const exportData = useCallback(() => {
    // Gather all user data from localStorage
    let events = [], journal = [], moodHistory = [], focusSessions = [];
    try { events = JSON.parse(localStorage.getItem(getUserScopedKey('calendar-events')) || '[]'); } catch { }
    try { journal = JSON.parse(localStorage.getItem(getUserScopedKey('journal')) || '[]'); } catch { }
    try { moodHistory = JSON.parse(localStorage.getItem(getUserScopedKey('mood-history')) || '[]'); } catch { }
    try { focusSessions = JSON.parse(localStorage.getItem(getUserScopedKey('focus-sessions')) || '[]'); } catch { }

    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      tasks,
      habits,
      events,
      journal,
      moodHistory,
      focusSessions,
      syncSettings,
      notificationSettings,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mithra-export-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [tasks, habits, syncSettings, notificationSettings]);

  const value = useMemo(() => ({
    // Tasks
    tasks, taskLists, addTask, updateTask, deleteTask, toggleTask, starTask,
    // Habits
    habits, addHabit, updateHabit, deleteHabit, toggleHabit, setHabits, lastMilestone,
    // Calendar sync events
    taskCalendarEvents, habitCalendarEvents,
    // Theme
    theme, toggleTheme,
    colorTheme, changeColorTheme, COLOR_THEMES,
    accentColor,
    // Preferences
    notifications, toggleNotifications,
    focusSound, toggleFocusSound,
    // Notifications
    notificationSettings, updateNotificationSettings, requestNotificationPermission, REMINDER_OPTIONS,
    // Settings
    syncSettings, toggleSyncTasks, toggleSyncHabits, toggleSyncFocus, toggleSyncGoogleCalendar,
    googleEvents,
    // Export
    exportData,
  }), [tasks, taskLists, habits, taskCalendarEvents, habitCalendarEvents, syncSettings,
    theme, colorTheme, accentColor, notifications, focusSound, notificationSettings, googleEvents,
    addTask, updateTask, deleteTask, toggleTask, starTask,
    addHabit, updateHabit, deleteHabit, toggleHabit,
    toggleTheme, changeColorTheme, toggleNotifications, toggleFocusSound,
    updateNotificationSettings, requestNotificationPermission,
    toggleSyncTasks, toggleSyncHabits, toggleSyncFocus, toggleSyncGoogleCalendar, exportData]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};
