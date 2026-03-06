import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun, Moon, CloudSun, Calendar, CheckCircle2, Circle,
  Star, Clock, ArrowRight, Zap, BookOpen,
  ChevronRight, Sparkles, Target, Flame, Dumbbell,
  Code, Brain, Heart, AlertTriangle,
  TrendingUp, BarChart3, Inbox, FileText, Share2
} from 'lucide-react';
import { format, isToday as isTodayFn } from 'date-fns';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import { useData, getUserScopedKey } from '../context/DataContext';
import { notificationManager } from '../services/notifications';
import { useAuth } from '../context/AuthContext';
import { apiFetch, isFirebaseConfigured } from '../services/firebaseClient';
import EmptyState from '../components/EmptyState';
import PullToRefresh from '../components/PullToRefresh';
import ShareStatsCard from '../components/ShareStatsCard';
import DailyPlanCard from '../components/DailyPlanCard';

/* ───── animation config ───── */
const luxuryEase = [0.22, 1, 0.36, 1];
const sectionReveal = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.65, ease: luxuryEase },
  }),
};

/* ───── greeting logic ───── */
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Good Morning', icon: Sun, period: 'morning' };
  if (h < 17) return { text: 'Good Afternoon', icon: CloudSun, period: 'afternoon' };
  return { text: 'Good Evening', icon: Moon, period: 'evening' };
};

/* ───── config data ───── */
const CATEGORY_COLORS = {
  Work: '#3b82f6',
  Health: '#f97316',
  Personal: '#a855f7',
  Focus: '#06b6d4',
  Social: '#FACC15',
  default: 'var(--accent-color)',
};

const MOOD_EMOJIS = [
  { emoji: '😊', label: 'Happy', value: 5, message: "You're radiating positivity! Keep spreading that joy — the world needs your light. ✨" },
  { emoji: '😌', label: 'Calm', value: 4, message: "Beautiful inner peace. Stay in this flow — calmness is your superpower. 🧘" },
  { emoji: '😐', label: 'Neutral', value: 3, message: "It's okay to feel neutral — not every day has to be extraordinary. You're doing just fine. 💛" },
  { emoji: '😔', label: 'Sad', value: 2, message: "It's okay to feel this way. Be gentle with yourself — brighter days are ahead. You matter. 💙" },
  { emoji: '😤', label: 'Stressed', value: 1, message: "Take a deep breath. You've overcome tough days before, and you'll get through this too. 💪" },
];

/* ───── habit category config ───── */
const HABIT_CATEGORY_CONFIG = {
  Work: { icon: Code, color: '#3b82f6' },
  Health: { icon: Dumbbell, color: '#f97316' },
  Personal: { icon: Heart, color: '#a855f7' },
  Learning: { icon: BookOpen, color: '#06b6d4' },
  Mindfulness: { icon: Brain, color: '#C2185B' },
};

/* ───── glass card wrapper ───── */
const GlassCard = ({ children, className = '', custom = 0, shine = true, ...props }) => (
  <motion.div
    custom={custom}
    variants={sectionReveal}
    initial="hidden"
    animate="visible"
    className={clsx(
      'rounded-2xl glass-card',
      shine && 'glass-shine',
      className
    )}
    {...props}
  >
    {children}
  </motion.div>
);

/* ───── Weekly Analytics Chart ───── */
const WeeklyAnalyticsChart = ({ tasks, habits, isLight }) => {
  const data = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const dayLabel = format(d, 'EEE');

      const tasksCompleted = tasks.filter(t => {
        if (!t.completed || !t.dueDate) return false;
        return format(new Date(t.dueDate), 'yyyy-MM-dd') === dateStr;
      }).length;

      const totalTasks = tasks.filter(t => {
        if (!t.dueDate) return false;
        return format(new Date(t.dueDate), 'yyyy-MM-dd') === dateStr;
      }).length;

      const habitsCompleted = habits.filter(h =>
        h.consistency?.includes(dateStr)
      ).length;
      const totalHabits = habits.length;

      days.push({
        label: dayLabel,
        date: dateStr,
        tasksCompleted,
        totalTasks: Math.max(totalTasks, 1),
        habitsCompleted,
        totalHabits: Math.max(totalHabits, 1),
        taskPct: totalTasks > 0 ? Math.round((tasksCompleted / totalTasks) * 100) : 0,
        habitPct: totalHabits > 0 ? Math.round((habitsCompleted / totalHabits) * 100) : 0,
      });
    }
    return days;
  }, [tasks, habits]);

  const maxPct = 100;

  return (
    <div className="space-y-4">
      {/* Bar Chart */}
      <div className="flex items-end gap-2 justify-between h-40">
        {data.map((day, i) => (
          <div key={day.date} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
            <div className="flex gap-1 items-end flex-1 w-full justify-center">
              {/* Tasks bar */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(day.taskPct, 4)}%` }}
                transition={{ delay: 0.3 + i * 0.05, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="w-3 md:w-4 rounded-t-md relative group cursor-pointer"
                style={{ background: 'var(--accent-color)', minHeight: '4px', opacity: day.taskPct > 0 ? 1 : 0.2 }}
                title={`${day.tasksCompleted} tasks done`}
              />
              {/* Habits bar */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(day.habitPct, 4)}%` }}
                transition={{ delay: 0.35 + i * 0.05, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="w-3 md:w-4 rounded-t-md relative group cursor-pointer"
                style={{ background: '#f97316', minHeight: '4px', opacity: day.habitPct > 0 ? 1 : 0.2 }}
                title={`${day.habitsCompleted} habits done`}
              />
            </div>
            <span className="text-[10px] text-[var(--text-dim)] font-medium mt-1 opacity-40">{day.label}</span>
          </div>
        ))}
      </div>

      {/* Summary stats */}
      <div className="flex items-center justify-between pt-3">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-accent-visor" />
          <span className="text-xs text-[var(--text-dim)] opacity-50">
            {data.reduce((s, d) => s + d.tasksCompleted, 0)} tasks &middot; {data.reduce((s, d) => s + d.habitsCompleted, 0)} habits this week
          </span>
        </div>
        <div className="text-xs font-semibold text-accent-visor">
          {Math.round(data.reduce((s, d) => s + d.habitPct, 0) / 7)}% avg habit rate
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════
   DASHBOARD — Royal Merino + Black Glassmorphism
   ═══════════════════════════════════════════ */
export default function Dashboard() {
  const [selectedMood, setSelectedMood] = useState(null);
  const [moodSaved, setMoodSaved] = useState(false);
  const [moodHistory, setMoodHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(getUserScopedKey('mood-history')) || '[]');
    } catch { return []; }
  });
  
  // ── Share Stats Modal ──
  const [showShareStats, setShowShareStats] = useState(false);
  
  const { theme, accentColor, tasks: realTasks, toggleTask: ctxToggleTask, habits, toggleHabit, taskCalendarEvents, habitCalendarEvents } = useData();
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const isLight = theme === 'light';
  const greeting = useMemo(getGreeting, []);
  const GreetingIcon = greeting.icon;
  const today = new Date();

  // Cache focus session count to avoid localStorage reads in render
  const focusSessionCount = useMemo(() => {
    try { return localStorage.getItem(getUserScopedKey('focus-sessions')) || '0'; } catch { return '0'; }
  }, []);

  // ── Load mood history from API on mount ──
  useEffect(() => {
    if (!isFirebaseConfigured || !user?.id) return;
    apiFetch('/mood-logs?limit=30')
      .then((res) => {
        const data = res.moodLogs || res.data || [];
        if (data.length > 0) {
          const formatted = data.map(r => ({
            date: r.logged_at,
            mood: r.mood_value,
            label: r.mood_label,
          }));
          setMoodHistory(formatted);
          localStorage.setItem(getUserScopedKey('mood-history'), JSON.stringify(formatted));
        }
      })
      .catch(() => { }); // localStorage cache already loaded in useState
  }, [user?.id]);

  /* ── Today's events from real calendar data (deduplicated) ── */
  const todayEvents = useMemo(() => {
    const todayStr = format(today, 'yyyy-MM-dd');
    const events = [];
    const seenIds = new Set();
    // Load saved calendar events from localStorage
    try {
      const saved = JSON.parse(localStorage.getItem(getUserScopedKey('calendar-events')) || '[]');
      saved.forEach(evt => {
        if (!evt.start || seenIds.has(evt.id)) return;
        const evtDate = format(new Date(evt.start), 'yyyy-MM-dd');
        if (evtDate === todayStr) {
          seenIds.add(evt.id);
          events.push({
            id: evt.id,
            title: evt.title,
            time: `${format(new Date(evt.start), 'h:mm a')}${evt.end ? ` – ${format(new Date(evt.end), 'h:mm a')}` : ''}`,
            color: CATEGORY_COLORS[evt.category] || CATEGORY_COLORS.default,
            source: 'calendar',
          });
        }
      });
    } catch { }
    // Also add synced task events (skip duplicates)
    if (taskCalendarEvents) {
      taskCalendarEvents.forEach(evt => {
        if (seenIds.has(evt.id)) return;
        if (format(new Date(evt.start), 'yyyy-MM-dd') === todayStr) {
          seenIds.add(evt.id);
          events.push({
            id: evt.id,
            title: evt.title,
            time: format(new Date(evt.start), 'h:mm a'),
            color: CATEGORY_COLORS[evt.category] || CATEGORY_COLORS.default,
            source: 'task',
          });
        }
      });
    }
    // Habits are shown in their own section — not mixed into Events
    // Sort by time string
    return events.sort((a, b) => a.time.localeCompare(b.time));
  }, [taskCalendarEvents]);

  /* Map real tasks into dashboard format — show empty state if no tasks */
  const dashTasks = useMemo(() => {
    if (realTasks && realTasks.length > 0) {
      return realTasks
        .filter(t => {
          if (!t.dueDate) return true;
          const d = new Date(t.dueDate);
          return d.toDateString() === today.toDateString();
        })
        .slice(0, 6)
        .map(t => ({
          id: t.id,
          title: t.title,
          priority: (t.priority || 'med').toUpperCase(),
          done: !!t.completed,
          starred: !!t.starred,
        }));
    }
    return [];
  }, [realTasks]);

  const toggleTask = (id) => {
    notificationManager.hapticLight();
    if (ctxToggleTask) ctxToggleTask(id);
  };

  const handleRefresh = async () => {
    return new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handleMoodSelect = async (mood) => {
    setSelectedMood(mood);
    setMoodSaved(false);

    // Optimistic local update
    const entry = { date: new Date().toISOString(), mood: mood.value, label: mood.label };
    const updated = [entry, ...moodHistory].slice(0, 30);
    setMoodHistory(updated);
    localStorage.setItem(getUserScopedKey('mood-history'), JSON.stringify(updated));

    // Persist to API (non-critical — warn but don't block UI)
    if (isFirebaseConfigured && user?.id) {
      apiFetch('/mood-logs', {
        method: 'POST',
        body: JSON.stringify({ mood_value: mood.value, mood_label: mood.label })
      })
        .catch(() => {});
    }

    setTimeout(() => setMoodSaved(true), 600);
  };

  const pendingCount = dashTasks.filter((t) => !t.done).length;
  const doneCount = dashTasks.filter((t) => t.done).length;

  /* Compute real stats from data */
  const completedTasks = realTasks ? realTasks.filter(t => t.completed).length : doneCount;
  const totalHabits = habits ? habits.length : 0;

  /* Best streak across all habits */
  const bestStreakData = useMemo(() => {
    if (!habits || habits.length === 0) return { streak: 0, habit: 'None' };
    let best = habits[0];
    for (const h of habits) {
      if ((h.bestStreak || h.streak) > (best.bestStreak || best.streak)) best = h;
    }
    return { streak: best.bestStreak || best.streak, habit: best.title };
  }, [habits]);
  const bestStreak = bestStreakData.streak;
  const bestStreakHabit = bestStreakData.habit;

  /* Streak alerts — habits where streak < bestStreak / 2 or streak = 0 */
  const streakAlerts = useMemo(() => {
    if (!habits) return [];
    return habits.filter(h => {
      if (h.bestStreak > 3 && h.streak === 0) return true;
      if (h.bestStreak > 5 && h.streak <= Math.floor(h.bestStreak * 0.3)) return true;
      return false;
    });
  }, [habits]);

  /* Last mood from state (loaded after mount) */
  const lastMood = useMemo(() => {
    if (moodHistory.length === 0) return null;
    const last = moodHistory[0]; // already sorted newest-first
    return MOOD_EMOJIS.find(m => m.value === last.mood) || null;
  }, [moodHistory, selectedMood]);

  /* Overdue tasks (past due, not completed) */
  const overdueTasks = useMemo(() => {
    if (!realTasks) return [];
    const now = new Date();
    return realTasks.filter(t => {
      if (t.completed || !t.dueDate) return false;
      return new Date(t.dueDate) < now;
    });
  }, [realTasks]);

  /* Recent journal entries */
  const recentJournals = useMemo(() => {
    try {
      const entries = JSON.parse(localStorage.getItem(getUserScopedKey('journal-entries')) || '[]');
      return entries
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 4);
    } catch { return []; }
  }, []);

  const MOOD_EMOJI_MAP = { 5: '😊', 4: '😌', 3: '😐', 2: '😔', 1: '😤' };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen p-4 sm:p-6 md:p-8 space-y-6 max-w-[1400px] mx-auto pb-24 md:pb-8">

        {/* ════════════════════════════════════
          GREETING CARD — Hero glass panel
          ════════════════════════════════════ */}
        {/* ════════════════════════════════════
          GREETING CARD — Hero glass panel
          ════════════════════════════════════ */}
        <motion.div
          custom={0}
          variants={sectionReveal}
          initial="hidden"
          animate="visible"
          className="relative overflow-hidden rounded-3xl p-8 md:p-10"
          style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(40px)',
            boxShadow: isLight ? '0 10px 40px rgba(0,0,0,0.05)' : '0 20px 60px rgba(0,0,0,0.4)',
          }}
        >
          {/* ambient glows inside the card */}
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-[0.1]"
            style={{ background: 'radial-gradient(circle, #22d3ee 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 left-[20%] w-56 h-56 rounded-full opacity-[0.08]"
            style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }} />

          <div className="relative flex items-center justify-between flex-wrap gap-5">
            <div>
              <motion.div
                className="flex items-center gap-3 mb-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15, duration: 0.6, ease: luxuryEase }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--accent-glow)]">
                  <GreetingIcon className="w-5 h-5 text-[var(--accent-color)]" />
                </div>
                <span className="text-[var(--text-dim)] text-sm font-medium tracking-widest uppercase">
                  {format(today, 'EEEE')}
                </span>
              </motion.div>

              <motion.h1
                className="text-3xl md:text-4xl font-light text-[var(--text-primary)] tracking-tight"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.6, ease: luxuryEase }}
              >
                {greeting.text},&nbsp;
                <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-secondary)]">
                  {profile?.fullName || 'User'}
                </span>
              </motion.h1>

              <motion.p
                className="text-[var(--text-dim)] text-base mt-2 font-light"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.6, ease: luxuryEase }}
              >
                {format(today, 'MMMM d, yyyy')} &middot;&nbsp;
                <span className="text-[var(--accent-color)] opacity-80">{pendingCount} tasks pending</span>
              </motion.p>
            </div>

            {/* Date badge — frosted glass */}
            <motion.div
              className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-[var(--glass-bg)] shadow-sm"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.45, duration: 0.5, ease: luxuryEase }}
            >
              <span className="text-[var(--accent-color)] text-2xl font-bold leading-none">{format(today, 'd')}</span>
              <span className="text-[var(--text-dim)] text-xs uppercase mt-1 tracking-wider">{format(today, 'MMM')}</span>
            </motion.div>
          </div>
        </motion.div>

        {/* ════════════════════════════════════
          STREAK ALERTS — if any habit streak dropped
          ════════════════════════════════════ */}
        <AnimatePresence>
          {streakAlerts.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} custom={0.5}>
              <GlassCard custom={0.5} className="p-4 border-l-4 border-orange-500/60 !bg-orange-500/05">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-white text-sm font-semibold mb-1">Streak Alert!</h3>
                    <div className="space-y-1">
                      {streakAlerts.map(a => (
                        <p key={a.id} className="text-white/60 text-xs">
                          <span className="font-medium text-orange-400">{a.title}</span> — streak dropped to {a.streak} {a.streak === 0 ? '(lost!)' : `from best of ${a.bestStreak}`}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ════════════════════════════════════
          OVERDUE TASKS — warning section
          ════════════════════════════════════ */}
        <AnimatePresence>
          {overdueTasks.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <GlassCard custom={0.6} className="p-4 border-l-4 border-red-500/60 !bg-red-500/05">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-white text-sm font-semibold mb-1">Overdue Tasks</h3>
                    <div className="space-y-1">
                      {overdueTasks.slice(0, 5).map(t => (
                        <p key={t.id} className="text-white/60 text-xs">
                          <span className="font-medium text-red-400">{t.title}</span>
                          <span className="text-white/30"> — due {format(new Date(t.dueDate), 'MMM d')}</span>
                        </p>
                      ))}
                      {overdueTasks.length > 5 && (
                        <p className="text-white/40 text-xs">...and {overdueTasks.length - 5} more</p>
                      )}
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ════════════════════════════════════
          AI DAILY PLAN — Plan My Day
          ════════════════════════════════════ */}
        <motion.div custom={0.7} variants={sectionReveal} initial="hidden" animate="visible">
          <DailyPlanCard />
        </motion.div>

        {/* ════════════════════════════════════
          EVENTS + TASKS + HABITS — three-column glass grid
          ════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Today's Events */}
          <GlassCard custom={1} className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-[18px] h-[18px] text-[var(--accent-color)]" />
                <h2 className="text-[var(--text-primary)] text-lg font-semibold tracking-tight">Events</h2>
              </div>
              <button onClick={() => navigate('/calendar')} className="text-[var(--accent-color)] text-xs font-semibold hover:opacity-80 transition-opacity">
                {todayEvents.length} today →
              </button>
            </div>

            {todayEvents.length > 0 ? (
              <div className="space-y-2">
                {todayEvents.map((event, i) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.06, duration: 0.5, ease: luxuryEase }}
                    className="group flex items-center gap-3 p-3 rounded-xl transition-all duration-300 cursor-pointer hover:bg-[var(--glass-bg-hover)] border border-transparent hover:border-[var(--glass-border)]"
                    onClick={() => {
                      if (event.source === 'task') navigate('/tasks');
                      else if (event.source === 'habit') navigate('/habits');
                      else navigate('/calendar');
                    }}
                  >
                    <div className="w-1 h-10 rounded-full flex-shrink-0 shadow-sm" style={{ backgroundColor: event.color, boxShadow: `0 0 8px ${event.color}33` }} />

                    <div className="flex-1 min-w-0">
                      <p className="text-[var(--text-primary)] opacity-90 text-sm font-medium truncate group-hover:opacity-100 transition-colors duration-300">
                        {event.title}
                      </p>
                      <p className="text-[var(--text-dim)] text-xs mt-0.5 flex items-center gap-1.5">
                        <Clock className="w-3 h-3" /> {event.time}
                      </p>
                    </div>

                    <ArrowRight className="w-4 h-4 text-transparent group-hover:text-[var(--text-dim)] transition-all duration-300 -translate-x-1 group-hover:translate-x-0" />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Inbox size={24} className="text-[var(--text-dim)] mb-2 opacity-20" />
                <p className="text-[var(--text-dim)] text-sm opacity-40">No events today</p>
                <p className="text-[var(--text-dim)] text-xs mt-1 opacity-25">Add events in Calendar</p>
              </div>
            )}
          </GlassCard>

          {/* Priority Tasks */}
          <GlassCard custom={2} className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-[18px] h-[18px] text-[var(--accent-color)]" />
                <h2 className="text-[var(--text-primary)] text-lg font-semibold tracking-tight">Tasks</h2>
              </div>
              <button onClick={() => navigate('/tasks')} className="text-[var(--accent-color)] text-xs font-semibold hover:opacity-80 transition-opacity px-2 py-0.5 rounded-lg bg-[var(--accent-glow)]">
                {doneCount}/{dashTasks.length} →
              </button>
            </div>

            <div className="space-y-1.5">
              {dashTasks.length > 0 ? (
                dashTasks.map((task, i) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.06, duration: 0.5, ease: luxuryEase }}
                    className="group flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--glass-bg-hover)] transition-all duration-300 border border-transparent hover:border-[var(--glass-border)]"
                    style={{
                      background: task.priority === 'HIGH'
                        ? 'rgba(239,68,68,0.08)'
                        : task.priority === 'MED'
                          ? 'rgba(245,158,11,0.07)'
                          : task.priority === 'LOW'
                            ? 'rgba(34,197,94,0.06)'
                            : 'transparent',
                    }}
                  >
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="flex-shrink-0 transition-transform duration-200 active:scale-90"
                    >
                      {task.done ? (
                        <CheckCircle2 className="w-5 h-5 text-[var(--accent-color)] drop-shadow-[0_0_8px_var(--accent-glow)]" />
                      ) : (
                        <Circle className="w-5 h-5 text-[var(--text-dim)] opacity-40 group-hover:text-[var(--text-primary)] group-hover:opacity-100 transition-colors duration-300" />
                      )}
                    </button>

                    <span className={clsx(
                      'flex-1 text-sm transition-all duration-300 truncate',
                      task.done
                        ? 'line-through text-[var(--text-dim)]'
                        : 'text-[var(--text-primary)] opacity-90 group-hover:opacity-100'
                    )}>
                      {task.title}
                    </span>

                    {task.starred && (
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0 drop-shadow-[0_0_4px_rgba(251,191,36,0.3)]" />
                    )}

                    <span className={clsx(
                      'text-[10px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0 uppercase tracking-wider',
                      task.priority === 'HIGH' ? 'text-red-400 bg-red-500/10' : 'text-amber-400 bg-amber-500/10'
                    )}>
                      {task.priority}
                    </span>
                  </motion.div>
                ))
              ) : (
                <EmptyState
                  icon={CheckCircle2}
                  title="No tasks today"
                  description="Your agenda is wide open. Take a moment to breathe or plan your next win."
                  actionLabel="Create Task"
                  onAction={() => navigate('/tasks')}
                  className="!bg-transparent !border-none !shadow-none !py-8"
                />
              )}
            </div>
          </GlassCard>

          {/* Habit Tracker — in main grid */}
          <GlassCard custom={3} className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <Flame className="w-[18px] h-[18px] text-[var(--accent-color)]" />
                <h2 className="text-[var(--text-primary)] text-lg font-semibold tracking-tight">Habits</h2>
              </div>
              <button onClick={() => navigate('/habits')} className="text-[var(--accent-color)] text-xs font-semibold hover:opacity-80 transition-opacity px-2 py-0.5 rounded-lg bg-[var(--accent-glow)]">
                {habits ? habits.filter(h => h.todayDone).length : 0}/{habits ? habits.length : 0} →
              </button>
            </div>

            <div className="space-y-2">
              {habits && habits.length > 0 ? habits.map((habit, i) => {
                const catConfig = HABIT_CATEGORY_CONFIG[habit.category] || HABIT_CATEGORY_CONFIG.Work;
                const HabitIcon = catConfig.icon;
                return (
                  <motion.div
                    key={habit.id}
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.06, duration: 0.5, ease: luxuryEase }}
                    className={clsx(
                      'flex items-center gap-3 p-3 rounded-xl transition-all duration-300',
                      habit.todayDone ? 'opacity-70' : 'hover:bg-[var(--glass-bg-hover)]'
                    )}
                    style={{
                      background: habit.todayDone
                        ? `${habit.color || catConfig.color}12`
                        : `${habit.color || catConfig.color}08`,
                      borderLeft: `3px solid ${habit.color || catConfig.color}${habit.todayDone ? '60' : '30'}`,
                    }}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${habit.color || catConfig.color}15` }}>
                      <HabitIcon size={14} style={{ color: habit.color || catConfig.color }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className={clsx(
                        'text-sm font-medium transition-all truncate block',
                        habit.todayDone ? 'line-through text-[var(--text-dim)]' : 'text-[var(--text-primary)] opacity-90 group-hover:opacity-100'
                      )}>
                        {habit.title}
                      </span>
                      <span className="text-xs flex items-center gap-1 mt-0.5">
                        <Flame size={10} className="text-orange-500" />
                        <span className="text-orange-400 font-semibold">{habit.streak}</span>
                      </span>
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => toggleHabit(habit.id)}
                      className={clsx('w-7 h-7 rounded-full flex items-center justify-center transition-all border flex-shrink-0',
                        habit.todayDone
                          ? 'bg-[var(--accent-color)] border-[var(--accent-glow)] text-[var(--selection-text)] shadow-[0_0_12px_var(--accent-glow)]'
                          : 'border-[var(--glass-border)] text-[var(--text-dim)] hover:border-[var(--accent-color)] hover:text-[var(--accent-color)]'
                      )}
                    >
                      {habit.todayDone ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                    </motion.button>
                  </motion.div>
                );
              }) : (
                <EmptyState
                  icon={Flame}
                  title="No habits yet"
                  description="Build a foundation of excellence through small daily wins."
                  actionLabel="Explore Habits"
                  onAction={() => navigate('/habits')}
                  className="!bg-transparent !border-none !shadow-none !py-8"
                />
              )}
            </div>
          </GlassCard>
        </div>

        {/* ════════════════════════════════════
          MOOD PICKER — glass panel with animated emojis
          ════════════════════════════════════ */}
        <GlassCard custom={4} className="p-6 md:p-8">
          <div className="flex items-center gap-2.5 mb-6">
            <Sparkles className="w-[18px] h-[18px] text-[var(--accent-color)]" />
            <h2 className="text-[var(--text-primary)] text-lg font-semibold tracking-tight">
              How are you feeling?
            </h2>
          </div>

          <div className="flex items-center justify-center gap-3 md:gap-5 flex-wrap">
            {MOOD_EMOJIS.map((mood, i) => (
              <motion.button
                key={mood.value}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.4, ease: luxuryEase }}
                whileHover={{ scale: 1.18, y: -8, rotate: [0, -5, 5, 0] }}
                whileTap={{ scale: 0.88 }}
                onClick={() => handleMoodSelect(mood)}
                className={clsx(
                  'flex flex-col items-center gap-2.5 p-4 md:p-5 rounded-2xl transition-all duration-300',
                  selectedMood?.value === mood.value
                    ? 'bg-[var(--accent-glow)] shadow-lg border border-[var(--glass-border)]'
                    : 'hover:bg-[var(--glass-bg-hover)]'
                )}
              >
                <span className="text-4xl md:text-5xl select-none drop-shadow-lg">{mood.emoji}</span>
                <span className={clsx(
                  'text-xs font-medium transition-colors duration-300',
                  selectedMood?.value === mood.value
                    ? 'text-[var(--text-primary)]'
                    : 'text-[var(--text-dim)]'
                )}>
                  {mood.label}
                </span>
              </motion.button>
            ))}
          </div>

          <AnimatePresence>
            {moodSaved && selectedMood && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="mt-5 p-4 rounded-xl text-center bg-[var(--accent-glow)] border border-[var(--glass-border)]"
              >
                <p className="text-[var(--accent-color)] text-sm font-medium mb-1">✓ Mood logged</p>
                <p className="text-[var(--text-dim)] text-sm leading-relaxed italic">
                  "{selectedMood.message}"
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>

        {/* ════════════════════════════════════
          STATS ROW — live computed stat cards
          ════════════════════════════════════ */}
        <motion.div
          custom={5}
          variants={sectionReveal}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: 'Tasks Done', value: String(completedTasks), icon: CheckCircle2, change: `${pendingCount} left` },
            { label: 'Habits Done', value: `${habits ? habits.filter(h => h.todayDone).length : 0}/${totalHabits}`, icon: Flame, change: 'Today' },
            { label: 'Best Streak', value: `${bestStreak}d`, icon: Target, change: bestStreakHabit },
            { label: 'Focus Sessions', value: focusSessionCount, icon: BookOpen, change: 'Total' },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.07, duration: 0.5, ease: luxuryEase }}
                className="rounded-2xl p-5 group hover:scale-[1.02] transition-transform duration-300"
                style={{
                  background: 'var(--glass-bg)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--accent-glow)]">
                    <Icon className="w-4 h-4 text-[var(--accent-color)]" />
                  </div>
                  <span className="text-[var(--accent-color)] text-xs font-semibold">{stat.change}</span>
                </div>
                <p className="text-[var(--text-primary)] text-2xl font-bold tracking-tight">{stat.value}</p>
                <p className="text-[var(--text-dim)] text-xs mt-1 font-medium">{stat.label}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ════════════════════════════════════
          WEEKLY ANALYTICS GRAPH 
          ════════════════════════════════════ */}
        <GlassCard custom={6} className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <BarChart3 className="w-[18px] h-[18px] text-[var(--accent-color)]" />
              <h2 className="text-[var(--text-primary)] text-lg font-semibold tracking-tight">
                Weekly Progress
              </h2>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm" style={{ background: 'var(--accent-color)' }} />
                Tasks
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-orange-500" />
                Habits
              </span>
            </div>
          </div>
          <WeeklyAnalyticsChart tasks={realTasks || []} habits={habits || []} isLight={isLight} />
        </GlassCard>

        {/* ════════════════════════════════════
          JOURNAL ENTRIES — recent entries
          ════════════════════════════════════ */}
        <GlassCard custom={7} className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-[18px] h-[18px] text-accent-visor" />
              <h2 className="text-[var(--text-primary)] text-lg font-semibold tracking-tight">
                Recent Journal
              </h2>
            </div>
            <button
              onClick={() => navigate('/journal')}
              className="flex items-center gap-1 text-xs text-accent-visor/70 hover:text-accent-visor transition-colors font-medium"
            >
              View All <ArrowRight size={12} />
            </button>
          </div>

          {recentJournals.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recentJournals.map((entry, i) => (
                <motion.div
                  key={entry.id || i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.06, duration: 0.5, ease: luxuryEase }}
                  onClick={() => navigate('/journal')}
                  className="p-4 rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.01] group"
                  style={{
                    background: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)',
                    boxShadow: `0 4px 16px rgba(0,0,0,0.08)`,
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg">{MOOD_EMOJI_MAP[entry.mood] || '📝'}</span>
                    <span className="text-[10px] font-medium" style={{ color: isLight ? 'rgba(26,26,26,0.35)' : 'rgba(242,235,227,0.35)' }}>
                      {entry.date ? format(new Date(entry.date), 'MMM d') : ''}
                    </span>
                  </div>
                  <h4 className="text-sm font-medium text-[var(--text-primary)] truncate group-hover:text-[var(--accent-color)] transition-colors opacity-85">
                    {entry.title || 'Untitled'}
                  </h4>
                  <p className="text-xs text-[var(--text-dim)] mt-1 line-clamp-2 leading-relaxed opacity-35">
                    {entry.body || entry.content || ''}
                  </p>
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {entry.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full" style={{
                          color: isLight ? 'rgba(26,26,26,0.4)' : 'rgba(242,235,227,0.4)',
                          background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)',
                        }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText size={24} className="text-[var(--text-dim)] mb-2 opacity-20" />
              <p className="text-[var(--text-dim)] text-sm opacity-40">No journal entries yet</p>
              <button
                onClick={() => navigate('/journal')}
                className="text-accent-visor/70 text-xs mt-2 hover:text-accent-visor transition-colors"
              >
                Write your first entry →
              </button>
            </div>
          )}
        </GlassCard>

        {/* ════════════════════════════════════
          SHARE STATS BUTTON
          ════════════════════════════════════ */}
        <motion.button
          custom={8}
          variants={sectionReveal}
          initial="hidden"
          animate="visible"
          onClick={() => setShowShareStats(true)}
          whileTap={{ scale: 0.97 }}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-sm transition-all"
          style={{
            background: 'linear-gradient(135deg, var(--accent-glow), transparent)',
            border: '1px solid var(--glass-border)',
            color: 'var(--accent-color)',
          }}
        >
          <Share2 size={18} />
          Share Your Stats
        </motion.button>
      </div>

      {/* Share Stats Modal */}
      <ShareStatsCard
        isOpen={showShareStats}
        onClose={() => setShowShareStats(false)}
        stats={{
          streakDays: bestStreak,
          bestStreak: bestStreak,
          habitsCompleted: habits ? habits.reduce((sum, h) => sum + (h.completedDates?.length || 0), 0) : 0,
          tasksCompleted: completedTasks,
          daysActive: parseInt(focusSessionCount) || 0,
        }}
        userName={profile?.fullName?.split(' ')[0] || 'User'}
      />
    </PullToRefresh>
  );
}
