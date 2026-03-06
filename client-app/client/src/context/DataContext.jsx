import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { format, addDays, subDays, isSameDay, startOfDay, setHours, setMinutes } from 'date-fns';
import { notificationManager } from '../services/notifications';
import { syncEngine } from '../services/syncEngine';
import { apiFetch } from '../services/firebaseClient';
import { useAuth } from './AuthContext';

/* ═══════════════════════════════════════════════════════════════
   SHARED DATA CONTEXT
   Tasks, Habits, Focus sessions, Theme, and Sync settings
   shared across Calendar, Tasks, Habits, and Settings pages
   ═══════════════════════════════════════════════════════════════ */

const mapTaskToDB = (t) => ({
  id: t.id,
  user_id: t.userId, // passed if available, strict schema
  title: t.title,
  details: t.details || '',
  list_id: t.listId || 'default',
  priority: t.priority || 'medium',
  completed: t.completed || false,
  starred: t.starred || false,
  due_date: t.dueDate ? new Date(t.dueDate).toISOString() : null,
  recurrence: t.recurrence || 'none',
  subtasks: t.subtasks || [],
  workspace_id: t.workspaceId || null,
});

const mapTaskFromDB = (t) => ({
  id: t.id,
  title: t.title,
  details: t.details || '',
  listId: t.listId || t.list_id || 'default',
  priority: t.priority || 'medium',
  completed: t.completed,
  starred: t.starred,
  dueDate: (t.dueDate || t.due_date) ? new Date(t.dueDate || t.due_date) : null,
  recurrence: t.recurrence || 'none',
  subtasks: t.subtasks || [],
  workspaceId: t.workspaceId || t.workspace_id || null,
});

const mapHabitToDB = (h) => ({
  id: h.id,
  user_id: h.userId,
  workspace_id: h.workspaceId || null,
  title: h.title,
  category: h.category || 'Personal',
  color: h.color,
  streak: h.streak || 0,
  longest_streak: h.bestStreak || 0,
  completed_dates: h.consistency || [],
  repeat_days: h.repeatDays || [0, 1, 2, 3, 4, 5, 6],
  frequency: h.frequency || 1,
  reminder: h.reminder || false,
  schedule_time: h.scheduleTime || '08:00',
  streak_goal: h.streakGoal || 30,
  streak_unit: h.streakUnit || 'Day',
  focus_duration: h.focusDuration || 25,
});
const mapHabitFromDB = (h) => ({
  id: h.id,
  workspaceId: h.workspaceId || h.workspace_id || null,
  title: h.title,
  category: h.category || 'Personal',
  color: h.color,
  streak: h.streak || 0,
  bestStreak: h.longestStreak || h.longest_streak || 0,
  consistency: h.completedDates || h.completed_dates || [],
  repeatDays: h.repeatDays || h.repeat_days || [0, 1, 2, 3, 4, 5, 6],
  frequency: h.frequency || 1,
  reminder: h.reminder || false,
  scheduleTime: h.scheduleTime || h.schedule_time || '08:00',
  streakGoal: h.streakGoal || h.streak_goal || 30,
  streakUnit: h.streakUnit || h.streak_unit || 'Day',
  focusDuration: h.focusDuration || h.focus_duration || 25,
  todayDone: false,
});

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
      '--glass-border': 'var(--glass-border)',
      '--glass-border-hover': 'var(--glass-border-hover)',
    },
    light: {
      '--accent-color': '#9B1B30',
      '--accent-soft': '#6B1525',
      '--accent-glow': 'rgba(155,27,48,0.1)',
      '--accent-secondary': '#8B6914',
      '--color-visor': '107 21 37',
      '--visor-glow': 'rgba(107,21,37,0.08)',
      '--glass-border': 'var(--glass-border)',
      '--glass-border-hover': 'var(--glass-border-hover)',
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
      '--glass-border': 'var(--glass-border)',
      '--glass-border-hover': 'var(--glass-border-hover)',
    },
    light: {
      '--accent-color': '#1565C0',
      '--accent-soft': '#0D47A1',
      '--accent-glow': 'rgba(21,101,192,0.1)',
      '--accent-secondary': '#00838F',
      '--color-visor': '21 101 192',
      '--visor-glow': 'rgba(21,101,192,0.08)',
      '--glass-border': 'var(--glass-border)',
      '--glass-border-hover': 'var(--glass-border-hover)',
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
      '--glass-border': 'var(--glass-border)',
      '--glass-border-hover': 'var(--glass-border-hover)',
    },
    light: {
      '--accent-color': '#2E7D32',
      '--accent-soft': '#1B5E20',
      '--accent-glow': 'rgba(46,125,50,0.1)',
      '--accent-secondary': '#558B2F',
      '--color-visor': '46 125 50',
      '--visor-glow': 'rgba(46,125,50,0.08)',
      '--glass-border': 'var(--glass-border)',
      '--glass-border-hover': 'var(--glass-border-hover)',
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
      '--glass-border': 'var(--glass-border)',
      '--glass-border-hover': 'var(--glass-border-hover)',
    },
    light: {
      '--accent-color': '#00838F',
      '--accent-soft': '#006064',
      '--accent-glow': 'rgba(0,131,143,0.1)',
      '--accent-secondary': '#7B1FA2',
      '--color-visor': '0 131 143',
      '--visor-glow': 'rgba(0,131,143,0.08)',
      '--glass-border': 'var(--glass-border)',
      '--glass-border-hover': 'var(--glass-border-hover)',
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
      '--glass-border': 'var(--glass-border)',
      '--glass-border-hover': 'var(--glass-border-hover)',
    },
    light: {
      '--accent-color': '#283593',
      '--accent-soft': '#1A237E',
      '--accent-glow': 'rgba(40,53,147,0.1)',
      '--accent-secondary': '#0277BD',
      '--color-visor': '40 53 147',
      '--visor-glow': 'rgba(40,53,147,0.08)',
      '--glass-border': 'var(--glass-border)',
      '--glass-border-hover': 'var(--glass-border-hover)',
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
      '--glass-border': 'var(--glass-border)',
      '--glass-border-hover': 'var(--glass-border-hover)',
    },
    light: {
      '--accent-color': '#5D4037',
      '--accent-soft': '#3E2723',
      '--accent-glow': 'rgba(93,64,55,0.1)',
      '--accent-secondary': '#E65100',
      '--color-visor': '93 64 55',
      '--visor-glow': 'rgba(93,64,55,0.08)',
      '--glass-border': 'var(--glass-border)',
      '--glass-border-hover': 'var(--glass-border-hover)',
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
      '--glass-border': 'var(--glass-border)',
      '--glass-border-hover': 'var(--glass-border-hover)',
    },
    light: {
      '--accent-color': '#0891b2',
      '--accent-soft': '#0e7490',
      '--accent-glow': 'rgba(8,145,178,0.1)',
      '--accent-secondary': '#1d4ed8',
      '--color-visor': '8 145 178',
      '--visor-glow': 'rgba(8,145,178,0.08)',
      '--glass-border': 'var(--glass-border)',
      '--glass-border-hover': 'var(--glass-border-hover)',
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
  const start = new Date(new Date().getFullYear(), 0, 1);
  const today = new Date();
  const days = [];
  let d = new Date(start);
  while (d <= today) {
    if (Math.random() < probability) days.push(format(d, 'yyyy-MM-dd'));
    d = addDays(d, 1);
  }
  return days;
}

const INITIAL_HABITS = [];

/* ── initial lists ── */
const INITIAL_LISTS = [
  { id: 'default', name: 'My Tasks', color: 'var(--accent-color)' },
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
  const { user } = useAuth();

  // Tasks — start empty, API is truth, localStorage is offline cache
  const [tasks, setTasks] = useState(() => {
    // Instant fallback from cache while API fetch happens
    const stored = loadFromStorage('tasks', null);
    if (stored && Array.isArray(stored) && stored.length > 0) {
      return stored.map(t => ({ ...t, dueDate: t.dueDate ? new Date(t.dueDate) : null }));
    }
    return INITIAL_TASKS;
  });
  const [taskLists] = useState(INITIAL_LISTS);
  const [dataLoading, setDataLoading] = useState(true);

  // Habits — start empty, API is truth, localStorage is offline cache
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
  const [colorTheme, setColorTheme] = useState(() => loadFromStorage('colorTheme', 'neon'));

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
  }));

  // Persist settings to localStorage whenever they change
  useEffect(() => { saveToStorage('theme', theme); }, [theme]);
  useEffect(() => { saveToStorage('colorTheme', colorTheme); }, [colorTheme]);
  useEffect(() => { saveToStorage('notifications', notifications); }, [notifications]);
  useEffect(() => { saveToStorage('focusSound', focusSound); }, [focusSound]);
  useEffect(() => { saveToStorage('syncSettings', syncSettings); }, [syncSettings]);
  useEffect(() => { saveToStorage('notificationSettings', notificationSettings); }, [notificationSettings]);

  // NOTE: tasks/habits are NO LONGER auto-saved to localStorage on every change.
  // localStorage is only updated as a cache AFTER successful API operations.
  // This prevents stale localStorage from overwriting fresh server data.

  // Wipe memory on logout to prevent data crossover between user sessions
  useEffect(() => {
    if (!user) {
      setTasks([]);
      setHabits([]);
      setDataLoading(true); // show loading state for next login fetch
      hasPulledRef.current = false;
    }
  }, [user]);

  /* ══════════════════════════════════════════════════════════════
     API-FIRST: Fetch on mount, write before state update
     ═══════════════════════════════════════════════════════════ */
  const hasPulledRef = useRef(false);

  // Fetch personal tasks + habits from API on mount
  useEffect(() => {
    if (!user || hasPulledRef.current) return;

    const fetchFromAPI = async () => {
      setDataLoading(true);
      try {
        // Fetch tasks via API
        const tasksRes = await apiFetch('/tasks');
        if (tasksRes.tasks) {
          const mapped = tasksRes.tasks.map(mapTaskFromDB);
          setTasks(mapped);
          saveToStorage('tasks', mapped); // update cache
        }

        // Fetch habits via API
        const habitsRes = await apiFetch('/habits');
        if (habitsRes.habits) {
          const mapped = habitsRes.habits.map(mapHabitFromDB);
          setHabits(mapped);
          saveToStorage('habits', mapped); // update cache
        }

        hasPulledRef.current = true;
      } catch (err) {
        // Cache is already loaded in useState — no action needed
      } finally {
        setDataLoading(false);
      }
    };

    fetchFromAPI();
  }, [user]);

  // Computed accent colors for JS usage (charts, inline styles, etc.)
  const accentColor = useMemo(() => {
    const palette = COLOR_THEMES[colorTheme];
    if (!palette) return { color: '#22d3ee', soft: '#06b6d4', secondary: '#3b82f6', glow: 'rgba(34,211,238,0.15)' };
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
    return notificationManager.requestPermissions();
  }, []);

  // Helper: fire an immediate notification or haptic pulse
  const fireNotification = useCallback(async (title, body, tag) => {
    notificationManager.pulse(); // Haptic feedback on notification fire
    // For immediate ones we still use the manager
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico', tag });
    }
  }, []);

  // Sync persistent local notifications with current state
  // This ensures that even if the app is closed, reminders fire.
  useEffect(() => {
    if (!notificationSettings.enabled) {
      notificationManager.cancelAll();
      return;
    }

    const syncReminders = async () => {
      await notificationManager.cancelAll();

      // Schedule Task Reminders
      if (notificationSettings.taskReminders) {
        tasks.forEach(t => {
          if (!t.completed && t.dueDate) {
            notificationManager.scheduleTaskReminder(t, notificationSettings.taskReminderMinutes || 15);
          }
        });
      }

      // Schedule Habit Reminders
      if (notificationSettings.habitReminders) {
        habits.forEach(h => {
          notificationManager.scheduleHabitReminder(h);
        });
      }

      // Schedule Daily Briefing (8am summary)
      if (notificationSettings.dailyBriefing !== false) {
        notificationManager.scheduleDailyBriefing(tasks, habits, 8, 0);
      }
    };

    syncReminders();
  }, [tasks, habits, notificationSettings.enabled, notificationSettings.taskReminders, notificationSettings.habitReminders, notificationSettings.dailyBriefing]);

  /* ── Task CRUD — Local-first with sync queue ── */
  const addTask = useCallback(async (task) => {
    const taskWithId = { ...task, id: task.id || crypto.randomUUID() };
    
    // Step 1: ALWAYS save locally first (guaranteed immediate save)
    setTasks(prev => {
      const next = [taskWithId, ...prev];
      saveToStorage('tasks', next);
      return next;
    });

    // Step 2: Sync to API (will queue for retry if fails)
    if (user) {
      try {
        const res = await apiFetch('/tasks', {
          method: 'POST',
          body: JSON.stringify(mapTaskToDB({ ...taskWithId, userId: user.id })),
        });
        // Update with server-returned data if different
        if (res.task && res.task.id !== taskWithId.id) {
          setTasks(prev => prev.map(t => t.id === taskWithId.id ? mapTaskFromDB(res.task) : t));
        }
      } catch (error) {
        syncEngine.enqueue({
          table: 'tasks',
          action: 'upsert',
          data: mapTaskToDB({ ...taskWithId, userId: user.id }),
        });
      }
    }
    return taskWithId;
  }, [user]);

  const updateTask = useCallback(async (updated) => {
    // Step 1: ALWAYS save locally first
    setTasks(prev => {
      const next = prev.map(t => t.id === updated.id ? updated : t);
      saveToStorage('tasks', next);
      return next;
    });

    // Step 2: Sync to API
    if (user) {
      try {
        await apiFetch(`/tasks/${updated.id}`, {
          method: 'PUT',
          body: JSON.stringify(mapTaskToDB(updated)),
        });
      } catch (error) {
        syncEngine.enqueue({
          table: 'tasks',
          action: 'update',
          data: mapTaskToDB({ ...updated, userId: user.id }),
        });
      }
    }
  }, [user]);

  const deleteTask = useCallback(async (id) => {
    // Step 1: ALWAYS delete locally first
    setTasks(prev => {
      const next = prev.filter(t => t.id !== id);
      saveToStorage('tasks', next);
      return next;
    });

    // Step 2: Sync to API
    if (user) {
      try {
        await apiFetch(`/tasks/${id}`, { method: 'DELETE' });
      } catch (error) {
        syncEngine.enqueue({
          table: 'tasks',
          action: 'delete',
          data: { id },
        });
      }
    }
  }, [user]);

  const toggleTask = useCallback(async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const willComplete = !task.completed;
    const updated = { ...task, completed: willComplete };

    // Step 1: ALWAYS save locally first
    setTasks(prev => {
      const next = prev.map(t => t.id === id ? updated : t);
      saveToStorage('tasks', next);
      return next;
    });

    // Step 2: Sync to API
    if (user) {
      try {
        await apiFetch(`/tasks/${id}`, {
          method: 'PUT',
          body: JSON.stringify({ completed: willComplete }),
        });
      } catch (error) {
        syncEngine.enqueue({
          table: 'tasks',
          action: 'update',
          data: { id, completed: willComplete },
        });
      }
    }

    // If completing a recurring task, auto-create next occurrence
    if (willComplete && task.recurrence && task.recurrence !== 'none' && task.dueDate) {
      const due = new Date(task.dueDate);
      let nextDate;
      switch (task.recurrence) {
        case 'daily': nextDate = addDays(due, 1); break;
        case 'weekly': nextDate = addDays(due, 7); break;
        case 'monthly': nextDate = new Date(due.getFullYear(), due.getMonth() + 1, due.getDate()); break;
        default: nextDate = null;
      }
      if (nextDate) {
        const recurringTask = {
          ...task,
          id: crypto.randomUUID(),
          completed: false,
          dueDate: nextDate,
          userId: user?.id,
        };
        // Local-first: save recurring task locally, then sync
        setTasks(p => {
          const next = [...p, recurringTask];
          saveToStorage('tasks', next);
          return next;
        });
        if (user) {
          try {
            await apiFetch('/tasks', {
              method: 'POST',
              body: JSON.stringify(mapTaskToDB(recurringTask)),
            });
          } catch (recurErr) {
            syncEngine.enqueue({
              table: 'tasks',
              action: 'upsert',
              data: mapTaskToDB(recurringTask),
            });
          }
        }
      }
    }
  }, [tasks, user]);

  const starTask = useCallback(async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const newStarred = !task.starred;

    // Step 1: ALWAYS save locally first
    setTasks(prev => {
      const next = prev.map(t => t.id === id ? { ...t, starred: newStarred } : t);
      saveToStorage('tasks', next);
      return next;
    });

    // Step 2: Sync to API
    if (user) {
      try {
        await apiFetch(`/tasks/${id}`, {
          method: 'PUT',
          body: JSON.stringify({ starred: newStarred }),
        });
      } catch (err) {
        syncEngine.enqueue({
          table: 'tasks',
          action: 'update',
          data: { id, starred: newStarred },
        });
      }
    }
  }, [tasks, user]);

  /* ── Habit CRUD — Local-first with sync queue ── */
  const addHabit = useCallback(async (habit) => {
    const habitWithId = { ...habit, id: habit.id || crypto.randomUUID() };
    
    // Step 1: ALWAYS save locally first (guaranteed immediate save)
    setHabits(prev => {
      const next = [...prev, habitWithId];
      saveToStorage('habits', next);
      return next;
    });

    // Step 2: Sync to API (will queue for retry if fails)
    if (user) {
      try {
        const dbHabit = mapHabitToDB(habitWithId);
        dbHabit.user_id = user.id;
        const res = await apiFetch('/habits', {
          method: 'POST',
          body: JSON.stringify(dbHabit),
        });
        // Update with server-returned data if different
        if (res.habit && res.habit.id !== habitWithId.id) {
          setHabits(prev => prev.map(h => h.id === habitWithId.id ? mapHabitFromDB(res.habit) : h));
        }
      } catch (error) {
        syncEngine.enqueue({
          table: 'habits',
          action: 'upsert',
          data: { ...mapHabitToDB(habitWithId), user_id: user.id },
        });
      }
    }
    return habitWithId;
  }, [user]);

  const updateHabit = useCallback(async (updated) => {
    // Step 1: ALWAYS save locally first
    setHabits(prev => {
      const next = prev.map(h => h.id === updated.id ? updated : h);
      saveToStorage('habits', next);
      return next;
    });

    // Step 2: Sync to API
    if (user) {
      try {
        await apiFetch(`/habits/${updated.id}`, {
          method: 'PUT',
          body: JSON.stringify(mapHabitToDB(updated)),
        });
      } catch (error) {
        syncEngine.enqueue({
          table: 'habits',
          action: 'update',
          data: mapHabitToDB({ ...updated, userId: user.id }),
        });
      }
    }
  }, [user]);

  const deleteHabit = useCallback(async (id) => {
    // Step 1: ALWAYS delete locally first
    setHabits(prev => {
      const next = prev.filter(h => h.id !== id);
      saveToStorage('habits', next);
      return next;
    });

    // Step 2: Sync to API
    if (user) {
      try {
        await apiFetch(`/habits/${id}`, { method: 'DELETE' });
      } catch (error) {
        syncEngine.enqueue({
          table: 'habits',
          action: 'delete',
          data: { id },
        });
      }
    }
  }, [user]);

  // Streak milestones
  const STREAK_MILESTONES = [7, 14, 21, 30, 60, 90, 100, 180, 365];
  const [lastMilestone, setLastMilestone] = useState(null);

  /* ── Habit Consistency Helpers ── */
  const getTodayStr = () => format(new Date(), 'yyyy-MM-dd');

  const calculateStreak = (consistency) => {
    if (!consistency || consistency.length === 0) return 0;
    const sorted = [...consistency].sort().reverse();
    const todayStr = getTodayStr();
    const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');

    // If consecutive chain is broken (neither today nor yesterday is present), streak is 0
    if (sorted[0] !== todayStr && sorted[0] !== yesterdayStr) return 0;

    let streak = 0;
    let current = new Date(sorted[0]);
    for (let i = 0; i < sorted.length; i++) {
      if (isSameDay(new Date(sorted[i]), current)) {
        streak++;
        current = subDays(current, 1);
      } else break;
    }
    return streak;
  };

  const validateHabitState = useCallback((list) => {
    const todayStr = getTodayStr();
    return list.map(h => {
      const consistency = h.consistency || [];
      const actuallyDone = consistency.includes(todayStr);
      const recalcStreak = calculateStreak(consistency);
      if (h.todayDone !== actuallyDone || h.streak !== recalcStreak) {
        return { ...h, todayDone: actuallyDone, streak: recalcStreak, bestStreak: Math.max(h.bestStreak || 0, recalcStreak) };
      }
      return h;
    });
  }, []);

  // Validate on mount
  useEffect(() => {
    setHabits(prev => validateHabitState(prev));
  }, [validateHabitState]);

  /* ── Journal Cleanup & Quota Listeners ── */
  useEffect(() => {
    // 1. Clean up demo journal data
    const stored = loadFromStorage('journal', []);
    if (stored && stored.length > 0) {
      // Rule: Delete if content contains "Welcome to Mithra" (demo text)
      const cleaned = stored.filter(entry => !entry.content?.includes("Welcome to Mithra"));
      if (cleaned.length !== stored.length) {
        saveToStorage('journal', cleaned);
      }
    }

    // 2. Listen for quota exceeded
    const unsub = syncEngine.subscribe((event, data) => {
      if (event === 'quota_exceeded') {
        fireNotification('Sync Warning', `Storage full. Dropped ${data.dropped} offline changes.`, 'quota');
      }
    });
    return () => unsub();
  }, [fireNotification]);

  const toggleHabit = useCallback(async (id) => {
    const habit = habits.find(h => h.id === id);
    if (!habit) return;

    const todayStr = getTodayStr();
    const consistency = habit.consistency || [];
    const alreadyDone = consistency.includes(todayStr);

    const newConsistency = alreadyDone
      ? consistency.filter(d => d !== todayStr)
      : [...consistency, todayStr];

    const newStreak = calculateStreak(newConsistency);
    const isDone = !alreadyDone;

    const updated = {
      ...habit,
      todayDone: isDone,
      streak: newStreak,
      bestStreak: Math.max(habit.bestStreak || 0, newStreak),
      consistency: newConsistency,
    };

    // Write to API FIRST
    if (user) {
      try {
        await apiFetch(`/habits/${id}`, {
          method: 'PUT',
          body: JSON.stringify(mapHabitToDB(updated)),
        });
      } catch (error) {
        // Continue with local update as fallback
      }
    }

    if (isDone && !alreadyDone && STREAK_MILESTONES.includes(newStreak)) {
      setLastMilestone({ habit: updated.title, streak: newStreak, color: updated.color });
      setTimeout(() => setLastMilestone(null), 5000);
    }

    setHabits(prev => {
      const next = prev.map(h => h.id === id ? updated : h);
      saveToStorage('habits', next);
      return next;
    });
  }, [habits, user]);

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

  /* ── Generate calendar events from habits (60-day static window) ── */
  const habitCalendarEvents = useMemo(() => {
    if (!syncSettings.syncHabitsToCalendar) return [];

    const events = [];
    const daysToRender = 60; // Render habits for 15 days past + 45 days future
    // Anchor the start point to exactly 15 days ago so the grid is stable
    const todayStart = new Date();
    todayStart.setDate(todayStart.getDate() - 15);
    todayStart.setHours(0, 0, 0, 0);

    habits.forEach((h, index) => {
      // Stagger start hours for different habits: 6 AM, 7 AM, etc. if no scheduleTime
      let baseHour = 6 + index;
      let baseMin = 0;
      if (h.scheduleTime) {
        const [sh, sm] = h.scheduleTime.split(':').map(Number);
        baseHour = sh;
        baseMin = sm || 0;
      }

      for (let i = 0; i < daysToRender; i++) {
        const targetDate = addDays(todayStart, i);
        // Only render if the habit is scheduled for this day of the week
        if (h.repeatDays && h.repeatDays.length > 0 && !h.repeatDays.includes(targetDate.getDay())) {
          continue;
        }

        // Only mark "todayDone" if we are rendering today's event and the habit is actually done
        const isTodayEvent = targetDate.toDateString() === new Date().toDateString();
        // Check historical consistency or today's status
        const isPastEvent = targetDate < new Date().setHours(0, 0, 0, 0);
        let isDone = false;
        if (isTodayEvent) {
          isDone = h.todayDone;
        } else if (isPastEvent && h.consistency) {
          isDone = h.consistency.includes(format(targetDate, 'yyyy-MM-dd'));
        }

        events.push({
          id: `habit-${h.id}-day-${i}`,
          title: `${isDone ? '✅' : '🔄'} ${h.title}`,
          start: setMinutes(setHours(targetDate, baseHour), baseMin),
          end: setMinutes(setHours(targetDate, baseHour), baseMin + (h.focusDuration || 25)),
          category: HABIT_CATEGORY_MAP[h.category] || 'Focus',
          location: '',
          description: `Streak: ${h.streak} days | Duration: ${h.focusDuration || 25}m`,
          isHabit: true,
          todayDone: isDone,
          habitColor: h.color,
        });
      }
    });

    return events;
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
    syncSettings, toggleSyncTasks, toggleSyncHabits, toggleSyncFocus,
    // Export
    exportData,
    // Loading state
    dataLoading,
  }), [tasks, taskLists, habits, taskCalendarEvents, habitCalendarEvents, syncSettings,
    theme, colorTheme, accentColor, notifications, focusSound, notificationSettings,
    addTask, updateTask, deleteTask, toggleTask, starTask,
    addHabit, updateHabit, deleteHabit, toggleHabit,
    toggleTheme, changeColorTheme, toggleNotifications, toggleFocusSound,
    updateNotificationSettings, requestNotificationPermission,
    toggleSyncTasks, toggleSyncHabits, toggleSyncFocus, exportData, dataLoading]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};
