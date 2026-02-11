import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, CheckCircle2, Flame, Target, Clock,
  BarChart3, Calendar, BookOpen, Zap, Award,
  ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { useData, getUserScopedKey } from '../context/DataContext';

const luxuryEase = [0.22, 1, 0.36, 1];

const GlassCard = ({ children, className = '', delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6, ease: luxuryEase }}
    className={`rounded-2xl glass-card glass-shine ${className}`}
  >
    {children}
  </motion.div>
);

const StatCard = ({ icon: Icon, label, value, change, changeType = 'neutral', delay = 0 }) => {
  const ChangeIcon = changeType === 'up' ? ArrowUpRight : changeType === 'down' ? ArrowDownRight : Minus;
  const changeColor = changeType === 'up' ? 'text-green-400' : changeType === 'down' ? 'text-red-400' : 'text-mithra-merino/40';

  return (
    <GlassCard className="p-5" delay={delay}>
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(var(--color-visor), 0.1)', border: '1px solid rgba(var(--color-visor), 0.15)' }}>
          <Icon className="w-4 h-4 text-accent-visor" />
        </div>
        {change && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold ${changeColor}`}>
            <ChangeIcon size={12} /> {change}
          </span>
        )}
      </div>
      <p className="text-mithra-merino text-2xl font-bold tracking-tight">{value}</p>
      <p className="text-mithra-merino/50 text-xs mt-1 font-medium">{label}</p>
    </GlassCard>
  );
};

/* Mini bar chart */
const MiniBarChart = ({ data, color = 'var(--accent-color)', maxHeight = 60 }) => {
  const maxVal = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1 justify-between" style={{ height: maxHeight }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${Math.max((d.value / maxVal) * 100, 4)}%` }}
            transition={{ delay: 0.3 + i * 0.04, duration: 0.5, ease: luxuryEase }}
            className="w-full max-w-[12px] rounded-t-sm"
            style={{ background: color, opacity: d.value > 0 ? 1 : 0.15, minHeight: 2 }}
          />
          <span className="text-[8px] text-mithra-merino/30">{d.label}</span>
        </div>
      ))}
    </div>
  );
};

export default function Insights() {
  const { tasks, habits, theme } = useData();
  const isLight = theme === 'light';

  /* ── Computed analytics ── */
  const stats = useMemo(() => {
    const now = new Date();
    const todayStr = format(now, 'yyyy-MM-dd');

    // Tasks
    const totalTasks = tasks?.length || 0;
    const completedTasks = tasks?.filter(t => t.completed).length || 0;
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Today's tasks
    const todayTasks = tasks?.filter(t => {
      if (!t.dueDate) return false;
      return format(new Date(t.dueDate), 'yyyy-MM-dd') === todayStr;
    }) || [];
    const todayDone = todayTasks.filter(t => t.completed).length;

    // Overdue
    const overdue = tasks?.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < now).length || 0;

    // Priority breakdown
    const highPriority = tasks?.filter(t => t.priority === 'high' && !t.completed).length || 0;
    const medPriority = tasks?.filter(t => t.priority === 'medium' && !t.completed).length || 0;
    const lowPriority = tasks?.filter(t => t.priority === 'low' && !t.completed).length || 0;

    // Habits
    const totalHabits = habits?.length || 0;
    const todayHabits = habits?.filter(h => h.todayDone).length || 0;
    const bestStreak = habits?.reduce((max, h) => Math.max(max, h.bestStreak || h.streak || 0), 0) || 0;
    const avgStreak = totalHabits > 0 ? Math.round(habits.reduce((s, h) => s + (h.streak || 0), 0) / totalHabits) : 0;

    // Focus sessions — stored as plain number count + total time
    let focusSessions = 0;
    let totalFocusMin = 0;
    try {
      focusSessions = parseInt(localStorage.getItem(getUserScopedKey('focus-sessions')) || '0', 10);
      totalFocusMin = Math.round(parseInt(localStorage.getItem(getUserScopedKey('focus-total-time')) || '0', 10));
    } catch {}

    // Journal entries
    let journalCount = 0;
    try {
      const entries = JSON.parse(localStorage.getItem(getUserScopedKey('journal-entries')) || '[]');
      journalCount = entries.length;
    } catch {}

    // Mood history
    let avgMood = 0;
    let moodTrend = 'neutral';
    try {
      const moods = JSON.parse(localStorage.getItem(getUserScopedKey('mood-history')) || '[]');
      if (moods.length > 0) {
        avgMood = (moods.reduce((s, m) => s + m.mood, 0) / moods.length).toFixed(1);
        if (moods.length >= 3) {
          const recent = moods.slice(-3).reduce((s, m) => s + m.mood, 0) / 3;
          const older = moods.slice(-6, -3).reduce((s, m) => s + m.mood, 0) / Math.min(moods.length - 3, 3) || recent;
          moodTrend = recent > older ? 'up' : recent < older ? 'down' : 'neutral';
        }
      }
    } catch {}

    // Weekly task trend (last 7 days)
    const weeklyTasks = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(now, i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const count = tasks?.filter(t => {
        if (!t.completed || !t.dueDate) return false;
        return format(new Date(t.dueDate), 'yyyy-MM-dd') === dateStr;
      }).length || 0;
      weeklyTasks.push({ label: format(d, 'E'), value: count, date: dateStr });
    }

    // Weekly habit trend
    const weeklyHabits = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(now, i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const count = habits?.filter(h => h.consistency?.includes(dateStr)).length || 0;
      weeklyHabits.push({ label: format(d, 'E'), value: count, date: dateStr });
    }

    // Category breakdown
    const categories = {};
    tasks?.forEach(t => {
      const cat = t.listId || 'default';
      if (!categories[cat]) categories[cat] = { total: 0, done: 0 };
      categories[cat].total++;
      if (t.completed) categories[cat].done++;
    });

    return {
      totalTasks, completedTasks, taskCompletionRate,
      todayTasks: todayTasks.length, todayDone,
      overdue, highPriority, medPriority, lowPriority,
      totalHabits, todayHabits, bestStreak, avgStreak,
      focusSessions, totalFocusMin,
      journalCount, avgMood, moodTrend,
      weeklyTasks, weeklyHabits, categories,
    };
  }, [tasks, habits]);

  const moodEmoji = stats.avgMood >= 4.5 ? '😊' : stats.avgMood >= 3.5 ? '😌' : stats.avgMood >= 2.5 ? '😐' : stats.avgMood >= 1.5 ? '😔' : stats.avgMood > 0 ? '😤' : '—';

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 space-y-6 max-w-[1400px] mx-auto pb-24 md:pb-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-3 mb-1">
          <BarChart3 className="w-6 h-6 text-accent-visor" />
          <h1 className="text-2xl md:text-3xl font-light text-mithra-merino tracking-tight">
            Insights & <span className="font-semibold">Analytics</span>
          </h1>
        </div>
        <p className="text-mithra-merino/40 text-sm ml-9">Your productivity at a glance</p>
      </motion.div>

      {/* Top stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={CheckCircle2} label="Task Completion" value={`${stats.taskCompletionRate}%`} 
          change={`${stats.completedTasks}/${stats.totalTasks}`} changeType="neutral" delay={0.1} />
        <StatCard icon={Flame} label="Best Streak" value={`${stats.bestStreak}d`} 
          change={`avg ${stats.avgStreak}d`} changeType={stats.avgStreak > 3 ? 'up' : 'neutral'} delay={0.15} />
        <StatCard icon={Zap} label="Focus Sessions" value={String(stats.focusSessions)} 
          change={`${Math.round(stats.totalFocusMin / 60)}h total`} changeType="neutral" delay={0.2} />
        <StatCard icon={BookOpen} label="Journal Entries" value={String(stats.journalCount)} 
          change="All time" changeType="neutral" delay={0.25} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weekly Tasks */}
        <GlassCard className="p-6" delay={0.3}>
          <div className="flex items-center gap-2 mb-5">
            <CheckCircle2 size={16} className="text-accent-visor" />
            <h3 className="text-mithra-merino text-sm font-semibold">Tasks Completed This Week</h3>
          </div>
          <MiniBarChart data={stats.weeklyTasks} color="var(--accent-color)" maxHeight={80} />
          <div className="mt-3 pt-3 border-t flex items-center justify-between" style={{ borderColor: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(242,235,227,0.06)' }}>
            <span className="text-xs text-mithra-merino/40">Total this week</span>
            <span className="text-sm font-semibold text-accent-visor">{stats.weeklyTasks.reduce((s, d) => s + d.value, 0)}</span>
          </div>
        </GlassCard>

        {/* Weekly Habits */}
        <GlassCard className="p-6" delay={0.35}>
          <div className="flex items-center gap-2 mb-5">
            <Flame size={16} className="text-orange-400" />
            <h3 className="text-mithra-merino text-sm font-semibold">Habits Completed This Week</h3>
          </div>
          <MiniBarChart data={stats.weeklyHabits} color="#f97316" maxHeight={80} />
          <div className="mt-3 pt-3 border-t flex items-center justify-between" style={{ borderColor: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(242,235,227,0.06)' }}>
            <span className="text-xs text-mithra-merino/40">Avg per day</span>
            <span className="text-sm font-semibold text-orange-400">
              {(stats.weeklyHabits.reduce((s, d) => s + d.value, 0) / 7).toFixed(1)}
            </span>
          </div>
        </GlassCard>
      </div>

      {/* Details row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today's Progress */}
        <GlassCard className="p-6" delay={0.4}>
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={16} className="text-accent-visor" />
            <h3 className="text-mithra-merino text-sm font-semibold">Today</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-mithra-merino/50 text-xs">Tasks</span>
              <span className="text-sm font-semibold text-mithra-merino">{stats.todayDone}/{stats.todayTasks}</span>
            </div>
            <div className="w-full h-2 rounded-full" style={{ background: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(242,235,227,0.06)' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${stats.todayTasks > 0 ? (stats.todayDone / stats.todayTasks) * 100 : 0}%` }}
                transition={{ delay: 0.6, duration: 0.8, ease: luxuryEase }}
                className="h-full rounded-full" style={{ background: 'var(--accent-color)', minWidth: stats.todayDone > 0 ? 8 : 0 }} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-mithra-merino/50 text-xs">Habits</span>
              <span className="text-sm font-semibold text-mithra-merino">{stats.todayHabits}/{stats.totalHabits}</span>
            </div>
            <div className="w-full h-2 rounded-full" style={{ background: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(242,235,227,0.06)' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${stats.totalHabits > 0 ? (stats.todayHabits / stats.totalHabits) * 100 : 0}%` }}
                transition={{ delay: 0.7, duration: 0.8, ease: luxuryEase }}
                className="h-full rounded-full" style={{ background: '#f97316', minWidth: stats.todayHabits > 0 ? 8 : 0 }} />
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-mithra-merino/50 text-xs">Mood</span>
              <span className="text-lg">{moodEmoji}</span>
            </div>
          </div>
        </GlassCard>

        {/* Priority Breakdown */}
        <GlassCard className="p-6" delay={0.45}>
          <div className="flex items-center gap-2 mb-4">
            <Target size={16} className="text-accent-visor" />
            <h3 className="text-mithra-merino text-sm font-semibold">Pending by Priority</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: 'High', count: stats.highPriority, color: '#ef4444' },
              { label: 'Medium', count: stats.medPriority, color: '#f59e0b' },
              { label: 'Low', count: stats.lowPriority, color: '#22c55e' },
              { label: 'Overdue', count: stats.overdue, color: '#dc2626' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                <span className="text-mithra-merino/60 text-xs flex-1">{item.label}</span>
                <span className="text-sm font-bold text-mithra-merino">{item.count}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Category Breakdown */}
        <GlassCard className="p-6" delay={0.5}>
          <div className="flex items-center gap-2 mb-4">
            <Award size={16} className="text-accent-visor" />
            <h3 className="text-mithra-merino text-sm font-semibold">Tasks by Category</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(stats.categories).map(([cat, data]) => {
              const pct = data.total > 0 ? Math.round((data.done / data.total) * 100) : 0;
              const catName = cat === 'default' ? 'My Tasks' : cat === 'work' ? 'Work' : cat === 'personal' ? 'Personal' : cat;
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-mithra-merino/60 text-xs capitalize">{catName}</span>
                    <span className="text-xs text-mithra-merino/40">{data.done}/{data.total} ({pct}%)</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full" style={{ background: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(242,235,227,0.06)' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.7, duration: 0.6, ease: luxuryEase }}
                      className="h-full rounded-full" style={{ background: 'var(--accent-color)', minWidth: data.done > 0 ? 4 : 0 }} />
                  </div>
                </div>
              );
            })}
            {Object.keys(stats.categories).length === 0 && (
              <p className="text-mithra-merino/30 text-xs text-center py-4">No task data yet</p>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
