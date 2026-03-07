import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, TrendingUp, Target, Flame, CheckCircle2, Brain,
  ChevronDown, ChevronUp, Sparkles, Loader2, Calendar, Zap,
  Award, BookOpen
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { useData, getUserScopedKey } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/firebaseClient';

const luxuryEase = [0.22, 1, 0.36, 1];

/* Score ring SVG */
const ScoreRing = ({ score, label, color, size = 80 }) => {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--glass-border)" strokeWidth="5" />
        <motion.circle
          cx={size/2} cy={size/2} r={r} fill="none" stroke={color}
          strokeWidth="5" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: luxuryEase }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-lg font-bold" style={{ color }}>{score}%</span>
      </div>
      <span className="text-[10px] font-medium mt-1" style={{ color: 'var(--text-dim)' }}>{label}</span>
    </div>
  );
};

export default function WeeklyReport() {
  const { tasks, habits, xp, level, badges } = useData();
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [aiInsight, setAiInsight] = useState(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  const weekData = useMemo(() => {
    const today = new Date();
    const weekStart = subDays(today, 6);
    const days = [];

    for (let i = 0; i < 7; i++) {
      const d = subDays(today, 6 - i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const dayLabel = format(d, 'EEE');

      const tasksCompleted = (tasks || []).filter(t => {
        if (!t.completed || !t.dueDate) return false;
        return format(new Date(t.dueDate), 'yyyy-MM-dd') === dateStr;
      }).length;

      const totalTasks = (tasks || []).filter(t => {
        if (!t.dueDate) return false;
        return format(new Date(t.dueDate), 'yyyy-MM-dd') === dateStr;
      }).length;

      const habitsCompleted = (habits || []).filter(h =>
        (h.consistency || []).includes(dateStr)
      ).length;

      days.push({ label: dayLabel, date: dateStr, tasksCompleted, totalTasks, habitsCompleted, totalHabits: (habits || []).length });
    }

    const totalTasksDone = days.reduce((s, d) => s + d.tasksCompleted, 0);
    const totalTasksAvail = days.reduce((s, d) => s + d.totalTasks, 0);
    const totalHabitsDone = days.reduce((s, d) => s + d.habitsCompleted, 0);
    const totalHabitsAvail = days.reduce((s, d) => s + d.totalHabits, 0);

    const taskScore = totalTasksAvail > 0 ? Math.round((totalTasksDone / totalTasksAvail) * 100) : 0;
    const habitScore = totalHabitsAvail > 0 ? Math.round((totalHabitsDone / totalHabitsAvail) * 100) : 0;
    const overallScore = Math.round((taskScore + habitScore) / 2);

    // Mood data
    let moodAvg = 0;
    try {
      const moodHistory = JSON.parse(localStorage.getItem(getUserScopedKey('mood-history')) || '[]');
      const weekMoods = moodHistory.filter(m => {
        const mDate = format(new Date(m.date), 'yyyy-MM-dd');
        return mDate >= format(weekStart, 'yyyy-MM-dd');
      });
      if (weekMoods.length > 0) {
        moodAvg = Math.round(weekMoods.reduce((s, m) => s + m.mood, 0) / weekMoods.length * 20);
      }
    } catch {}

    // Focus sessions
    let focusCount = 0;
    try {
      const sessions = JSON.parse(localStorage.getItem(getUserScopedKey('focus-sessions')) || '0');
      focusCount = parseInt(sessions) || 0;
    } catch {}

    // Best streak
    const bestStreak = habits ? Math.max(...habits.map(h => h.streak || 0), 0) : 0;

    // Most productive day
    const bestDay = [...days].sort((a, b) => (b.tasksCompleted + b.habitsCompleted) - (a.tasksCompleted + a.habitsCompleted))[0];

    return {
      days, totalTasksDone, totalHabitsDone, taskScore, habitScore, overallScore,
      moodAvg, focusCount, bestStreak, bestDay,
    };
  }, [tasks, habits]);

  // Fetch AI insight
  const fetchInsight = async () => {
    if (aiInsight || loadingInsight) return;
    setLoadingInsight(true);
    try {
      const summary = `This week: ${weekData.totalTasksDone} tasks completed, ${weekData.totalHabitsDone} habit completions, task score ${weekData.taskScore}%, habit score ${weekData.habitScore}%, best streak ${weekData.bestStreak} days, level ${level}, ${badges?.length || 0} badges earned.`;
      const res = await apiFetch('/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: `You are Dost, an AI life coach. Give a brief, encouraging weekly productivity review (3-4 sentences) based on: ${summary}. Include one specific tip to improve next week. Be warm and personal.`,
          context: 'weekly_report',
        }),
      });
      setAiInsight(res.reply || res.message || 'Keep up the great work!');
    } catch {
      setAiInsight('Great week! Keep building that momentum. Try setting 3 priorities each morning for even better focus.');
    } finally {
      setLoadingInsight(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)' }}
    >
      {/* Header */}
      <button
        onClick={() => { setExpanded(!expanded); if (!expanded && !aiInsight) fetchInsight(); }}
        className="w-full p-5 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-glow)' }}>
            <BarChart3 size={20} style={{ color: 'var(--accent-color)' }} />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Weekly Report</h3>
            <p className="text-[10px]" style={{ color: 'var(--text-dim)' }}>
              {format(subDays(new Date(), 6), 'MMM d')} – {format(new Date(), 'MMM d')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold" style={{ color: 'var(--accent-color)' }}>
            {weekData.overallScore}%
          </span>
          {expanded ? <ChevronUp size={18} style={{ color: 'var(--text-dim)' }} /> : <ChevronDown size={18} style={{ color: 'var(--text-dim)' }} />}
        </div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: luxuryEase }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-5">
              {/* Score rings row */}
              <div className="flex justify-around pt-2">
                <div className="relative">
                  <ScoreRing score={weekData.taskScore} label="Tasks" color="var(--accent-color)" />
                </div>
                <div className="relative">
                  <ScoreRing score={weekData.habitScore} label="Habits" color="#f97316" />
                </div>
                <div className="relative">
                  <ScoreRing score={weekData.moodAvg} label="Mood" color="#a855f7" />
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: CheckCircle2, label: 'Tasks Done', value: weekData.totalTasksDone, color: 'var(--accent-color)' },
                  { icon: Flame, label: 'Habits Done', value: weekData.totalHabitsDone, color: '#f97316' },
                  { icon: Target, label: 'Best Streak', value: `${weekData.bestStreak}d`, color: '#22c55e' },
                  { icon: Zap, label: 'XP Earned', value: xp, color: '#FACC15' },
                ].map(stat => (
                  <div key={stat.label} className="flex items-center gap-2.5 p-3 rounded-xl" style={{ background: `${stat.color}08`, border: `1px solid ${stat.color}15` }}>
                    <stat.icon size={16} style={{ color: stat.color }} />
                    <div>
                      <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
                      <p className="text-[10px]" style={{ color: 'var(--text-dim)' }}>{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Best day */}
              {weekData.bestDay && (
                <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'var(--accent-glow)', border: '1px solid var(--glass-border)' }}>
                  <Calendar size={14} style={{ color: 'var(--accent-color)' }} />
                  <span className="text-xs" style={{ color: 'var(--text-primary)' }}>
                    Most productive: <strong>{weekData.bestDay.label}</strong> — {weekData.bestDay.tasksCompleted} tasks + {weekData.bestDay.habitsCompleted} habits
                  </span>
                </div>
              )}

              {/* Mini bar chart */}
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Daily Breakdown</p>
                <div className="flex items-end gap-2 h-24 justify-between">
                  {weekData.days.map((day, i) => {
                    const total = day.tasksCompleted + day.habitsCompleted;
                    const maxTotal = Math.max(...weekData.days.map(d => d.tasksCompleted + d.habitsCompleted), 1);
                    const pct = (total / maxTotal) * 100;
                    return (
                      <div key={day.date} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.max(pct, 6)}%` }}
                          transition={{ delay: 0.1 + i * 0.05, duration: 0.5, ease: luxuryEase }}
                          className="w-full max-w-5 rounded-t-md"
                          style={{ background: total > 0 ? 'var(--accent-color)' : 'var(--glass-border)', minHeight: '3px', opacity: total > 0 ? 1 : 0.3 }}
                          title={`${day.tasksCompleted}t + ${day.habitsCompleted}h`}
                        />
                        <span className="text-[9px]" style={{ color: 'var(--text-dim)', opacity: 0.5 }}>{day.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AI Insight */}
              <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, var(--accent-glow), transparent)', border: '1px solid var(--glass-border)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={14} style={{ color: 'var(--accent-color)' }} />
                  <span className="text-xs font-bold" style={{ color: 'var(--accent-color)' }}>Dost AI Insight</span>
                </div>
                {loadingInsight ? (
                  <div className="flex items-center gap-2 py-2">
                    <Loader2 size={14} className="animate-spin" style={{ color: 'var(--accent-color)' }} />
                    <span className="text-xs" style={{ color: 'var(--text-dim)' }}>Analyzing your week...</span>
                  </div>
                ) : aiInsight ? (
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-primary)', opacity: 0.85 }}>{aiInsight}</p>
                ) : (
                  <p className="text-xs" style={{ color: 'var(--text-dim)' }}>Expand to load AI insights about your week</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
