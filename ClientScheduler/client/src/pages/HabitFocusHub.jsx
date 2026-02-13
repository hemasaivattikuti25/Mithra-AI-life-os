import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame, CheckCircle2, Circle, Play, Pause, RotateCcw, Plus, X,
  Activity, Clock, Zap, Target, Dumbbell, BookOpen, Code, Brain,
  Heart, Trash2, TrendingUp, Pencil, Timer
} from 'lucide-react';
import { format, subDays, isSameDay, eachDayOfInterval, startOfYear } from 'date-fns';
import clsx from 'clsx';
import { useData, getUserScopedKey } from '../context/DataContext';

const luxuryEase = [0.22, 1, 0.36, 1];

const CATEGORY_CONFIG = {
  Work: { icon: Code, color: '#3b82f6' },
  Health: { icon: Dumbbell, color: '#f97316' },
  Personal: { icon: Heart, color: '#a855f7' },
  Learning: { icon: BookOpen, color: '#06b6d4' },
  Mindfulness: { icon: Brain, color: '#C2185B' },
};

/* roman numeral helper */
const toRoman = (num) => {
  const map = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  let result = '';
  for (const [value, symbol] of map) {
    while (num >= value) { result += symbol; num -= value; }
  }
  return result || '0';
};

/* ═══════════ HEATMAP — GitHub-style 365-day contribution graph ═══════════ */
const Heatmap = ({ habits, accentColor }) => {
  const today = new Date();
  const [hoveredDay, setHoveredDay] = useState(null);
  const { theme } = useData();
  const isLight = theme === 'light';
  const startDate = startOfYear(today);
  const days = useMemo(() => eachDayOfInterval({ start: startDate, end: today }), []);
  const totalDaysInYear = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24)) + 1;
  const weeks = useMemo(() => {
    const r = []; let cw = [];
    const firstDayOfWeek = days[0].getDay();
    for (let i = 0; i < firstDayOfWeek; i++) cw.push(null);
    days.forEach((d, i) => { cw.push(d); if (cw.length === 7) { r.push([...cw]); cw = []; } });
    if (cw.length > 0) r.push([...cw]);
    return r;
  }, [days]);

  // Accent-derived color levels (matching theme)
  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  };

  const THEME_COLORS = useMemo(() => {
    const accent = accentColor?.color || '#C2185B';
    const { r, g, b } = hexToRgb(accent);
    return {
      dark: {
        empty: '#161b22',
        emptyHover: '#1f2630',
        levels: [
          `rgba(${r},${g},${b},0.2)`,
          `rgba(${r},${g},${b},0.4)`,
          `rgba(${r},${g},${b},0.65)`,
          `rgba(${r},${g},${b},0.9)`,
        ],
      },
      light: {
        empty: '#ebedf0',
        emptyHover: '#dbdfe4',
        levels: [
          `rgba(${r},${g},${b},0.15)`,
          `rgba(${r},${g},${b},0.35)`,
          `rgba(${r},${g},${b},0.55)`,
          `rgba(${r},${g},${b},0.8)`,
        ],
      },
    };
  }, [accentColor]);

  const colors = isLight ? THEME_COLORS.light : THEME_COLORS.dark;

  // Build map: dateStr -> completion ratio (for ALL 365 days)
  const completionMap = useMemo(() => {
    const map = {};
    if (!habits || habits.length === 0) return map;
    days.forEach(d => {
      const dateStr = format(d, 'yyyy-MM-dd');
      const total = habits.length;
      const done = habits.filter(h => h.consistency?.includes(dateStr)).length;
      if (done > 0) map[dateStr] = done / total;
    });
    return map;
  }, [habits, days]);

  const getIntensityColor = (ratio) => {
    if (!ratio || ratio <= 0) return null;
    if (ratio <= 0.25) return colors.levels[0];
    if (ratio <= 0.5) return colors.levels[1];
    if (ratio <= 0.75) return colors.levels[2];
    return colors.levels[3];
  };

  const totalActiveDays = Object.keys(completionMap).length;

  // Month labels for the top axis
  const monthLabels = useMemo(() => {
    const labels = [];
    let lastMonth = -1;
    weeks.forEach((week, wi) => {
      const firstDay = week.find(d => d !== null);
      if (firstDay) {
        const m = firstDay.getMonth();
        if (m !== lastMonth) {
          labels.push({ month: format(firstDay, 'MMM'), col: wi });
          lastMonth = m;
        }
      }
    });
    return labels;
  }, [weeks]);

  const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

  // Empty state — no habits at all
  if (!habits || habits.length === 0) {
    return (
      <div className="glass-card glass-shine rounded-2xl p-5 lg:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={14} className="text-accent-visor" />
          <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: isLight ? 'rgba(26,26,26,0.45)' : 'rgba(242,235,227,0.35)' }}>Consistency Map</h3>
        </div>
        <div className="flex items-center justify-center py-12 rounded-xl border border-dashed" style={{ borderColor: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(242,235,227,0.1)' }}>
          <p className="text-sm text-center" style={{ color: isLight ? 'rgba(26,26,26,0.4)' : 'rgba(242,235,227,0.3)' }}>
            Add your first habit to start tracking consistency!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card glass-shine rounded-2xl p-5 lg:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: isLight ? 'rgba(26,26,26,0.45)' : 'rgba(242,235,227,0.35)' }}>
          <Activity size={14} className="text-accent-visor" /> Consistency Map — {format(today, 'yyyy')}
        </h3>
        <div className="flex items-center gap-3 text-xs" style={{ color: isLight ? 'rgba(26,26,26,0.45)' : 'rgba(242,235,227,0.45)' }}>
          <span>{totalActiveDays} active days</span>
          <span className="text-accent-visor font-semibold">{Math.round((totalActiveDays / totalDaysInYear) * 100)}%</span>
        </div>
      </div>

      {/* Month labels row */}
      <div className="flex overflow-x-auto pb-0.5 scrollbar-hide">
        <div className="w-7 flex-shrink-0" /> {/* spacer for day labels */}
        <div className="flex gap-[3px] relative" style={{ minWidth: weeks.length * 14 }}>
          {monthLabels.map((m, i) => (
            <span key={i} className="absolute text-[10px] font-medium" style={{ left: m.col * 14, color: isLight ? 'rgba(26,26,26,0.4)' : 'rgba(242,235,227,0.4)' }}>
              {m.month}
            </span>
          ))}
        </div>
      </div>

      {/* Grid with day labels */}
      <div className="flex overflow-x-auto pb-1 scrollbar-hide mt-4">
        {/* Day labels column */}
        <div className="flex flex-col gap-[3px] mr-1.5 flex-shrink-0">
          {DAY_LABELS.map((label, i) => (
            <div key={i} className="h-[11px] sm:h-3 flex items-center justify-end pr-0.5">
              <span className="text-[9px] leading-none" style={{ color: isLight ? 'rgba(26,26,26,0.35)' : 'rgba(242,235,227,0.35)' }}>{label}</span>
            </div>
          ))}
        </div>
        {/* Contribution grid */}
        <div className="flex gap-[3px]">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day, di) => {
                if (!day) return <div key={`empty-${di}`} className="w-[11px] h-[11px] sm:w-3 sm:h-3" />;
                const dateStr = format(day, 'yyyy-MM-dd');
                const ratio = completionMap[dateStr] || 0;
                const cellColor = getIntensityColor(ratio);
                const isH = hoveredDay && isSameDay(hoveredDay, day);
                return (
                  <div key={day.toISOString()} onMouseEnter={() => setHoveredDay(day)} onMouseLeave={() => setHoveredDay(null)} className="relative">
                    <div
                      className="w-[11px] h-[11px] sm:w-3 sm:h-3 rounded-[2px] sm:rounded-[3px] transition-all cursor-pointer"
                      style={{
                        backgroundColor: cellColor || colors.empty,
                        outline: isH ? `2px solid ${isLight ? '#24292f' : '#e6edf3'}` : 'none',
                        outlineOffset: isH ? '-1px' : '0',
                      }}
                    />
                    {isH && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg text-[10px] whitespace-nowrap z-50 pointer-events-none"
                        style={{ background: isLight ? '#24292f' : '#e6edf3', color: isLight ? '#fff' : '#24292f' }}>
                        <span className="font-bold">
                          {ratio >= 1 ? 'All habits done' : ratio > 0 ? `${Math.round(ratio * 100)}% completed` : 'No activity'}
                        </span>
                        <span className="ml-1.5 opacity-70">{format(day, 'MMM d, yyyy')}</span>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0" style={{
                          borderLeft: '4px solid transparent', borderRight: '4px solid transparent',
                          borderTop: `4px solid ${isLight ? '#24292f' : '#e6edf3'}`
                        }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend — GitHub style */}
      <div className="flex items-center justify-end gap-1.5 mt-3 text-[11px]" style={{ color: isLight ? 'rgba(26,26,26,0.4)' : 'rgba(242,235,227,0.4)' }}>
        <span>Less</span>
        <div className="w-[11px] h-[11px] rounded-[2px]" style={{ backgroundColor: colors.empty }} />
        {colors.levels.map((c, i) => (
          <div key={i} className="w-[11px] h-[11px] rounded-[2px]" style={{ backgroundColor: c }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
};

/* ═══════════ HABIT CARD — always-visible edit & delete ═══════════ */
const HabitCard = ({ habit, onToggle, onDelete, onEdit, index }) => {
  const catConfig = CATEGORY_CONFIG[habit.category] || CATEGORY_CONFIG.Work;
  const Icon = catConfig.icon;
  const { theme } = useData();
  const isLight = theme === 'light';
  const habitColor = habit.color || catConfig.color;



  // Streak goal progress
  const goalProgress = habit.streakGoal ? Math.min(100, (habit.streak / habit.streakGoal) * 100) : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -60, transition: { duration: 0.3 } }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: luxuryEase }}
      className={clsx('glass-card glass-shine rounded-xl p-4 flex items-center gap-4 group transition-all relative', habit.todayDone && 'opacity-60')}
      style={{
        background: `linear-gradient(135deg, ${habitColor}18, ${habitColor}08, transparent)`,
        borderLeft: `3px solid ${habitColor}${habit.todayDone ? '80' : '50'}`,
      }}
    >
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${habitColor}15`, border: `1px solid ${habitColor}25` }}>
        <Icon size={20} style={{ color: habitColor }} />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className={clsx('font-medium text-sm transition-all', habit.todayDone && 'line-through')} style={{ color: habit.todayDone ? 'var(--text-dim)' : 'var(--text-primary)' }}>{habit.title}</h4>
        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
          <span className="text-xs flex items-center gap-1">
            <Flame size={12} className="text-orange-500" />
            <span className="text-orange-400 font-semibold">{habit.streak}</span>
            <span style={{ color: 'var(--text-dim)', opacity: 0.6, fontSize: '11px' }}>day streak</span>
          </span>
          <span className="text-[11px] uppercase tracking-wider" style={{ color: habitColor, opacity: 0.7 }}>{habit.category}</span>
          {habit.scheduleTime && (
            <span className="text-[11px] flex items-center gap-1" style={{ color: 'var(--text-dim)', opacity: 0.6 }}>
              <Clock size={10} /> {(() => { const [h, m] = habit.scheduleTime.split(':').map(Number); return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`; })()}
            </span>
          )}
        </div>
        {/* Streak goal progress bar */}
        {habit.streakGoal > 0 && (
          <div className="mt-1.5 flex items-center gap-2">
            <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ backgroundColor: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(242,235,227,0.06)' }}>
              <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${goalProgress}%` }} transition={{ duration: 0.5 }}
                style={{ backgroundColor: habitColor }} />
            </div>
            <span className="text-[10px] tabular-nums" style={{ color: 'var(--text-dim)', opacity: 0.5 }}>{habit.streak}/{habit.streakGoal} {habit.streakUnit || 'Day'}</span>
          </div>
        )}
      </div>

      {/* Always visible action buttons */}
      <div className="flex items-center gap-1.5">
        <button onClick={() => onEdit(habit)}
          className="p-2 rounded-lg hover:bg-white/10 transition-all" style={{ color: 'var(--text-dim)' }} title="Edit">
          <Pencil size={16} />
        </button>
        <button onClick={() => onDelete(habit.id)}
          className="p-2 rounded-lg text-red-400/50 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Delete">
          <Trash2 size={16} />
        </button>
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => onToggle(habit.id)}
          className={clsx('w-9 h-9 rounded-full flex items-center justify-center transition-all border ml-1')}
          style={habit.todayDone ? {
            backgroundColor: habitColor,
            borderColor: habitColor,
            color: '#000',
            boxShadow: `0 0 12px ${habitColor}40`,
          } : {
            borderColor: isLight ? 'rgba(0,0,0,0.15)' : 'rgba(242,235,227,0.15)',
            color: isLight ? 'rgba(0,0,0,0.3)' : 'rgba(242,235,227,0.3)',
          }}>
          {habit.todayDone ? <CheckCircle2 size={18} /> : <Circle size={18} />}
        </motion.button>
      </div>
    </motion.div>
  );
};

/* ═══════════ HABIT MODAL — Rich fields with schedule time ═══════════ */
const HABIT_COLORS = ['#C2185B', '#3b82f6', '#f97316', '#a855f7', '#06b6d4', '#ef4444', '#eab308', '#ec4899', '#14b8a6', '#f2ebe3'];
const DAY_LABELS_MODAL = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const HabitModal = ({ isOpen, onClose, onSave, editingHabit }) => {
  const { theme } = useData();
  const isLight = theme === 'light';
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Work');
  const [color, setColor] = useState('#C2185B');
  const [repeatDays, setRepeatDays] = useState([0, 1, 2, 3, 4, 5, 6]);
  const [frequency, setFrequency] = useState(1);
  const [reminder, setReminder] = useState(false);
  const [scheduleTime, setScheduleTime] = useState('08:00');
  const [streakGoal, setStreakGoal] = useState(30);
  const [streakUnit, setStreakUnit] = useState('Day');
  const [duration, setDuration] = useState(25);
  const titleRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (editingHabit) {
        setTitle(editingHabit.title || ''); setCategory(editingHabit.category || 'Work');
        setColor(editingHabit.color || '#C2185B'); setRepeatDays(editingHabit.repeatDays || [0, 1, 2, 3, 4, 5, 6]);
        setFrequency(editingHabit.frequency || 1); setReminder(editingHabit.reminder || false);
        setScheduleTime(editingHabit.scheduleTime || '08:00');
        setStreakGoal(editingHabit.streakGoal || 30);
        setStreakUnit(editingHabit.streakUnit || 'Day'); setDuration(editingHabit.focusDuration || 25);
      } else {
        setTitle(''); setCategory('Work'); setColor('#C2185B'); setRepeatDays([0, 1, 2, 3, 4, 5, 6]);
        setFrequency(1); setReminder(false); setStreakGoal(30);
        setScheduleTime('08:00');
        setStreakUnit('Day'); setDuration(25);
      }
      setTimeout(() => titleRef.current?.focus(), 100);
    }
  }, [isOpen, editingHabit]);

  const handleSave = () => {
    if (!title.trim()) return;
    if (editingHabit) {
      onSave({ ...editingHabit, title: title.trim(), category, color, repeatDays, frequency, reminder, scheduleTime, streakGoal, streakUnit, focusDuration: duration });
    } else {
      onSave({ id: `h-${Date.now()}`, title: title.trim(), category, color, repeatDays, frequency, reminder, scheduleTime, streakGoal, streakUnit, streak: 0, bestStreak: 0, consistency: [], todayDone: false, focusDuration: duration });
    }
    onClose();
  };

  const toggleDay = (idx) => setRepeatDays(prev => prev.includes(idx) ? prev.filter(d => d !== idx) : [...prev, idx]);

  const getRepeatSummary = () => {
    if (repeatDays.length === 7) return 'Every day';
    if (repeatDays.length === 0) return 'No days selected';
    if (repeatDays.length === 5 && !repeatDays.includes(0) && !repeatDays.includes(6)) return 'Weekdays';
    if (repeatDays.length === 2 && repeatDays.includes(0) && repeatDays.includes(6)) return 'Weekends';
    return repeatDays.map(d => DAY_NAMES[d].slice(0, 3)).join(', ');
  };

  if (!isOpen) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xl p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 15 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 15 }}
        onClick={e => e.stopPropagation()} className="w-full max-w-md glass-heavy glass-shine rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header with colored accent bar */}
        <div className="relative">
          <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ backgroundColor: color }} />
          <div className="flex items-center justify-between p-5 pt-6 border-b" style={{ borderColor: isLight ? 'var(--glass-border)' : 'rgba(242,235,227,0.05)' }}>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{editingHabit ? 'Edit Habit' : 'New Habit'}</h3>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors" style={{ color: 'var(--text-dim)' }}><X size={20} /></button>
          </div>
        </div>

        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {/* Habit Name */}
          <div>
            <label className="text-xs uppercase tracking-wider font-bold mb-2 block" style={{ color: 'var(--text-dim)' }}>Habit Name</label>
            <input ref={titleRef} value={title} onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSave()} placeholder="e.g. Morning Run, Read 30 pages..." className="glass-input !text-base" />
          </div>

          {/* Category */}
          <div>
            <label className="text-xs uppercase tracking-wider font-bold mb-2 block" style={{ color: 'var(--text-dim)' }}>Category</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(CATEGORY_CONFIG).map(([cat, cfg]) => (
                <button key={cat} onClick={() => setCategory(cat)}
                  className={clsx('px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5',
                    category === cat ? 'text-white font-bold' : 'text-[var(--text-dim)] hover:opacity-80'
                  )} style={category === cat ? { background: cfg.color, borderColor: cfg.color } : { borderColor: isLight ? 'var(--glass-border)' : 'rgba(242,235,227,0.1)' }}>
                  <cfg.icon size={12} /> {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="text-xs uppercase tracking-wider font-bold mb-2 block" style={{ color: 'var(--text-dim)' }}>Color</label>
            <div className="flex gap-2.5 flex-wrap">
              {HABIT_COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)}
                  className={clsx('w-8 h-8 rounded-full transition-all border-2', color === c ? 'scale-110' : 'border-transparent hover:scale-105')}
                  style={{ backgroundColor: c, borderColor: color === c ? c : 'transparent', boxShadow: color === c ? `0 0 12px ${c}60` : undefined }} />
              ))}
            </div>
          </div>

          {/* Repeat Days */}
          <div>
            <label className="text-xs uppercase tracking-wider font-bold mb-1 block" style={{ color: 'var(--text-dim)' }}>Repeat</label>
            <p className="text-[11px] mb-3" style={{ color: 'var(--text-dim)', opacity: 0.6 }}>{getRepeatSummary()}</p>
            <div className="flex gap-2">
              {DAY_LABELS_MODAL.map((label, idx) => (
                <button key={idx} onClick={() => toggleDay(idx)}
                  className={clsx('w-10 h-10 rounded-full text-xs font-bold transition-all border',
                    repeatDays.includes(idx) ? 'text-white border-transparent' : 'hover:opacity-80'
                  )} style={repeatDays.includes(idx) ? { backgroundColor: color, borderColor: color } : { borderColor: isLight ? 'var(--glass-border)' : 'rgba(242,235,227,0.1)', color: 'var(--text-dim)' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Schedule Time */}
          <div>
            <label className="text-xs uppercase tracking-wider font-bold mb-2 block" style={{ color: 'var(--text-dim)' }}>Schedule Time</label>
            <p className="text-[11px] mb-2" style={{ color: 'var(--text-dim)', opacity: 0.6 }}>When do you want to do this habit?</p>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-dim)' }} />
                <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)}
                  className="glass-input !py-2.5 !pl-9 !text-sm w-full" />
              </div>
              <span className="text-xs" style={{ color: 'var(--text-dim)', opacity: 0.5 }}>
                {scheduleTime ? (() => { const [h, m] = scheduleTime.split(':').map(Number); const ampm = h >= 12 ? 'PM' : 'AM'; return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`; })() : ''}
              </span>
            </div>
          </div>

          {/* Focus Duration */}
          <div>
            <label className="text-xs uppercase tracking-wider font-bold mb-2 block" style={{ color: 'var(--text-dim)' }}>Focus Duration</label>
            <div className="flex gap-2 flex-wrap">
              {[10, 15, 25, 30, 45, 60, 90].map(d => (
                <button key={d} onClick={() => setDuration(d)}
                  className={clsx('px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                    duration === d ? 'text-white' : ''
                  )} style={duration === d ? { borderColor: `${color}50`, color: color, background: `${color}15` } : { borderColor: isLight ? 'var(--glass-border)' : 'rgba(242,235,227,0.1)', color: 'var(--text-dim)' }}>{d}m</button>
              ))}
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label className="text-xs uppercase tracking-wider font-bold mb-2 block" style={{ color: 'var(--text-dim)' }}>Frequency</label>
            <div className="flex items-center gap-4">
              <span className="text-xs" style={{ color: 'var(--text-dim)' }}>Completions per day</span>
              <div className="flex items-center gap-2 ml-auto">
                <button onClick={() => setFrequency(f => Math.max(1, f - 1))} className="w-8 h-8 rounded-lg glass-card flex items-center justify-center transition-colors font-bold text-lg" style={{ color: 'var(--text-dim)' }}>−</button>
                <span className="w-8 text-center font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>{frequency}</span>
                <button onClick={() => setFrequency(f => Math.min(10, f + 1))} className="w-8 h-8 rounded-lg glass-card flex items-center justify-center transition-colors font-bold text-lg" style={{ color: 'var(--text-dim)' }}>+</button>
              </div>
            </div>
          </div>

          {/* Reminder */}
          <div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs uppercase tracking-wider font-bold" style={{ color: 'var(--text-dim)' }}>Reminder</label>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-dim)', opacity: 0.6 }}>Get a notification — timing is set in Settings → Notifications</p>
              </div>
              <button onClick={() => setReminder(!reminder)} className={clsx('w-11 h-6 rounded-full transition-all relative')} style={{ backgroundColor: reminder ? color : isLight ? 'rgba(0,0,0,0.1)' : 'rgba(242,235,227,0.1)' }}>
                <motion.div animate={{ x: reminder ? 20 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className={clsx('w-5 h-5 rounded-full absolute top-0.5')} style={{ backgroundColor: reminder ? (isLight ? '#fff' : '#000') : 'var(--text-dim)' }} />
              </button>
            </div>
          </div>

          {/* Streak Goal */}
          <div>
            <label className="text-xs uppercase tracking-wider font-bold mb-2 block" style={{ color: 'var(--text-dim)' }}>Streak Goal</label>
            <p className="text-[11px] mb-2" style={{ color: 'var(--text-dim)', opacity: 0.6 }}>
              {streakUnit === 'Day' ? `Complete ${streakGoal} consecutive days` : streakUnit === 'Week' ? `Maintain for ${streakGoal} weeks` : `Keep going for ${streakGoal} months`}
            </p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <button onClick={() => setStreakGoal(g => Math.max(1, g - 1))} className="w-8 h-8 rounded-lg glass-card flex items-center justify-center transition-colors font-bold text-lg" style={{ color: 'var(--text-dim)' }}>−</button>
                <span className="w-10 text-center font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>{streakGoal}</span>
                <button onClick={() => setStreakGoal(g => g + 1)} className="w-8 h-8 rounded-lg glass-card flex items-center justify-center transition-colors font-bold text-lg" style={{ color: 'var(--text-dim)' }}>+</button>
              </div>
              <div className="flex gap-1.5 ml-2">
                {['Day', 'Week', 'Month'].map(u => (
                  <button key={u} onClick={() => setStreakUnit(u)}
                    className={clsx('px-3 py-1.5 rounded-lg text-xs font-medium border transition-all')}
                    style={streakUnit === u ? { borderColor: `${color}50`, color: color, background: `${color}15` } : { borderColor: isLight ? 'var(--glass-border)' : 'rgba(242,235,227,0.1)', color: 'var(--text-dim)' }}>{u}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t flex justify-end gap-3 flex-shrink-0" style={{ borderColor: isLight ? 'var(--glass-border)' : 'rgba(242,235,227,0.05)' }}>
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm hover:bg-white/5 transition-colors" style={{ color: 'var(--text-dim)' }}>Cancel</button>
          <button onClick={handleSave} disabled={!title.trim()}
            className={clsx('px-6 py-2.5 rounded-xl text-white font-bold text-sm transition-all', !title.trim() && 'opacity-40 cursor-not-allowed')}
            style={{ backgroundColor: color, boxShadow: title.trim() ? `0 0 20px ${color}40` : undefined }}>
            {editingHabit ? 'Save Changes' : 'Create Habit'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ═══════════ SESSION MODAL — Add Custom Focus Session ═══════════ */
const SessionModal = ({ isOpen, onClose, onSave, editingSession }) => {
  const [name, setName] = useState('');
  const [time, setTime] = useState(25);
  const nameRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (editingSession) { setName(editingSession.name); setTime(editingSession.time); }
      else { setName(''); setTime(25); }
      setTimeout(() => nameRef.current?.focus(), 100);
    }
  }, [isOpen, editingSession]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ id: editingSession?.id || `s-${Date.now()}`, name: name.trim(), time });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xl p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 15 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 15 }}
        onClick={e => e.stopPropagation()} className="w-full max-w-sm glass-heavy glass-shine rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-[#F2EBE3]/5">
          <h3 className="text-lg font-medium text-[#F2EBE3]">{editingSession ? 'Edit Session' : 'Add Session'}</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-[#F2EBE3]/50"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-5">
          <div>
            <label className="text-xs text-[#F2EBE3]/40 uppercase tracking-wider font-bold mb-2 block">Session Name</label>
            <input ref={nameRef} value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSave()}
              placeholder="e.g. Deep Work" className="glass-input" />
          </div>
          <div>
            <label className="text-xs text-[#F2EBE3]/40 uppercase tracking-wider font-bold mb-2 block">Duration (minutes)</label>
            <div className="flex items-center gap-3">
              <button onClick={() => setTime(t => Math.max(1, t - 5))} className="w-10 h-10 rounded-xl glass-card flex items-center justify-center text-[#F2EBE3]/50 hover:text-[#F2EBE3] font-bold text-lg">−</button>
              <span className="w-16 text-center font-bold text-2xl text-[#F2EBE3] tabular-nums">{time}</span>
              <button onClick={() => setTime(t => Math.min(120, t + 5))} className="w-10 h-10 rounded-xl glass-card flex items-center justify-center text-[#F2EBE3]/50 hover:text-[#F2EBE3] font-bold text-lg">+</button>
            </div>
            <div className="flex gap-2 mt-3 flex-wrap">
              {[5, 10, 15, 25, 30, 45, 60, 90].map(d => (
                <button key={d} onClick={() => setTime(d)}
                  className={clsx('px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                    time === d ? 'border-[#C2185B]/30 text-[#C2185B] bg-[#C2185B]/10' : 'border-[#F2EBE3]/10 text-[#F2EBE3]/30 hover:border-[#F2EBE3]/20'
                  )}>{d}m</button>
              ))}
            </div>
          </div>
        </div>
        <div className="p-5 border-t border-[#F2EBE3]/5 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-[#F2EBE3]/40 text-sm hover:bg-white/5 transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-6 py-2.5 rounded-xl bg-[#C2185B] text-white font-bold text-sm hover:shadow-[0_0_20px_rgba(194,24,91,0.3)] transition-all">
            {editingSession ? 'Save' : 'Add Session'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ═══════════ CIRCULAR PROGRESS RING (heartbeat animation) ═══════════ */
const CircularTimer = ({ progress, timeStr, label, isActive, color = '#C2185B', isLight }) => {
  const size = 280;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Background ring */}
      <svg width={size} height={size} className="absolute -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={isLight ? 'rgba(0,0,0,0.08)' : 'rgba(242,235,227,0.06)'} strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${color}50)` }}
          transition={{ duration: 0.5, ease: 'linear' }}
        />
      </svg>

      {/* Dot at progress tip */}
      {progress > 0 && (
        <motion.div
          className="absolute w-3.5 h-3.5 rounded-full"
          style={{
            backgroundColor: color,
            boxShadow: `0 0 10px ${color}`,
            top: size / 2 - radius * Math.cos((progress / 100) * 2 * Math.PI) - 7,
            left: size / 2 + radius * Math.sin((progress / 100) * 2 * Math.PI) - 7,
          }}
        />
      )}

      {/* Heartbeat pulse ring when active */}
      {isActive && (
        <motion.div
          className="absolute rounded-full border-2"
          style={{ width: size + 20, height: size + 20, borderColor: `${color}20` }}
          animate={{ scale: [1, 1.06, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      {isActive && (
        <motion.div
          className="absolute rounded-full border"
          style={{ width: size + 40, height: size + 40, borderColor: `${color}10` }}
          animate={{ scale: [1, 1.04, 1], opacity: [0.3, 0.1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        />
      )}

      {/* Center text */}
      <div className="text-center z-10">
        <div className="text-5xl font-light tabular-nums tracking-tight" style={{ color: 'var(--text-primary)' }}>{timeStr}</div>
        <div className="text-sm mt-1" style={{ color: 'var(--text-dim)' }}>{label}</div>
      </div>
    </div>
  );
};

/* ═══════════ MAIN COMPONENT ═══════════ */
export default function HabitFocusHub() {
  const { habits, addHabit, updateHabit, deleteHabit, toggleHabit, theme, accentColor, lastMilestone } = useData();
  const isLight = theme === 'light';
  const [activeTab, setActiveTab] = useState('tracker');
  const [showModal, setShowModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);

  // Focus state
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null); // habit or custom session
  const [sessions, setSessions] = useState(() => {
    try { return parseInt(localStorage.getItem(getUserScopedKey('focus-sessions')) || '0', 10); } catch { return 0; }
  });
  const [totalFocusTime, setTotalFocusTime] = useState(() => {
    try { return parseInt(localStorage.getItem(getUserScopedKey('focus-total-time')) || '0', 10); } catch { return 0; }
  });
  const [sessionHistory, setSessionHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem(getUserScopedKey('focus-history')) || '[]'); } catch { return []; }
  });
  const [editingHistorySession, setEditingHistorySession] = useState(null);
  const [editDuration, setEditDuration] = useState('');

  // Custom sessions list
  const [customSessions, setCustomSessions] = useState(() => {
    try {
      const saved = localStorage.getItem(getUserScopedKey('custom-sessions'));
      if (saved) return JSON.parse(saved);
    } catch { }
    return [
      { id: 's-1', name: 'Deep Work', time: 45 },
      { id: 's-2', name: 'Quick Sprint', time: 15 },
    ];
  });
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [editingSession, setEditingSession] = useState(null);

  // Persist focus data
  useEffect(() => { try { localStorage.setItem(getUserScopedKey('focus-sessions'), String(sessions)); } catch { } }, [sessions]);
  useEffect(() => { try { localStorage.setItem(getUserScopedKey('focus-total-time'), String(totalFocusTime)); } catch { } }, [totalFocusTime]);
  useEffect(() => { try { localStorage.setItem(getUserScopedKey('focus-history'), JSON.stringify(sessionHistory)); } catch { } }, [sessionHistory]);
  useEffect(() => { try { localStorage.setItem(getUserScopedKey('custom-sessions'), JSON.stringify(customSessions)); } catch { } }, [customSessions]);

  // Stopwatch state
  const [mode, setMode] = useState('timer'); // 'timer' | 'stopwatch'
  const [stopwatchTime, setStopwatchTime] = useState(0);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const swMin = Math.floor(stopwatchTime / 60);
  const swSec = stopwatchTime % 60;
  const swStr = `${String(swMin).padStart(2, '0')}:${String(swSec).padStart(2, '0')}`;

  // Timer logic
  useEffect(() => {
    let interval = null;
    if (isActive && !isPaused && mode === 'timer' && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (isActive && !isPaused && mode === 'stopwatch') {
      interval = setInterval(() => setStopwatchTime(t => t + 1), 1000);
    } else if (mode === 'timer' && timeLeft === 0 && isActive) {
      // Timer completed naturally
      setIsActive(false);
      setIsPaused(false);
      const dur = selectedSession?.focusDuration || selectedSession?.time || 25;
      setSessions(s => s + 1);
      setTotalFocusTime(t => t + dur);
      setSessionHistory(prev => [...prev, {
        id: `sh-${Date.now()}`, name: selectedSession?.title || selectedSession?.name || 'Session',
        duration: dur, endedAt: new Date().toISOString(),
      }]);
    }
    return () => clearInterval(interval);
  }, [isActive, isPaused, timeLeft, mode, stopwatchTime, selectedSession]);

  const startSession = (item, type) => {
    const dur = (type === 'habit' ? item.focusDuration : item.time) || 25;
    setSelectedSession(type === 'habit' ? { ...item, _type: 'habit' } : { ...item, _type: 'custom' });
    setTimeLeft(dur * 60);
    setIsActive(false);
    setIsPaused(false);
    setMode('timer');
  };

  const handlePlayPause = () => {
    if (!isActive) {
      setIsActive(true);
      setIsPaused(false);
    } else {
      setIsPaused(!isPaused);
    }
  };

  // End = finishes current timer and counts elapsed time as a session
  const endSession = () => {
    setIsActive(false);
    setIsPaused(false);
    let elapsed = 0;
    if (mode === 'stopwatch') {
      elapsed = Math.floor(stopwatchTime / 60);
      setStopwatchTime(0);
    } else {
      const dur = selectedSession?.focusDuration || selectedSession?.time || 25;
      elapsed = Math.floor((dur * 60 - timeLeft) / 60);
      setTimeLeft(dur * 60);
    }
    if (elapsed > 0) {
      setSessions(s => s + 1);
      setTotalFocusTime(t => t + elapsed);
      setSessionHistory(prev => [...prev, {
        id: `sh-${Date.now()}`, name: selectedSession?.title || selectedSession?.name || 'Session',
        duration: elapsed, endedAt: new Date().toISOString(),
      }]);
    }
  };

  // Restart = reset timer and start again
  const restartSession = () => {
    if (mode === 'stopwatch') { setStopwatchTime(0); }
    else { const dur = selectedSession?.focusDuration || selectedSession?.time || 25; setTimeLeft(dur * 60); }
    setIsActive(true);
    setIsPaused(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsPaused(false);
    if (mode === 'stopwatch') { setStopwatchTime(0); }
    else { const dur = selectedSession?.focusDuration || selectedSession?.time || 25; setTimeLeft(dur * 60); }
  };

  // Session history management
  const deleteHistorySession = (id) => {
    const s = sessionHistory.find(x => x.id === id);
    if (s) {
      setSessionHistory(prev => prev.filter(x => x.id !== id));
      setSessions(prev => Math.max(0, prev - 1));
      setTotalFocusTime(prev => Math.max(0, prev - s.duration));
    }
  };

  const saveHistoryEdit = (id) => {
    const dur = parseInt(editDuration);
    if (isNaN(dur) || dur <= 0) return;
    setSessionHistory(prev => prev.map(s => {
      if (s.id === id) {
        const diff = dur - s.duration;
        setTotalFocusTime(t => Math.max(0, t + diff));
        return { ...s, duration: dur };
      }
      return s;
    }));
    setEditingHistorySession(null);
    setEditDuration('');
  };

  const totalDuration = selectedSession?.focusDuration * 60 || selectedSession?.time * 60 || 25 * 60;
  const progress = mode === 'timer' ? ((totalDuration - timeLeft) / totalDuration) * 100 : Math.min(100, (stopwatchTime / 3600) * 100);

  const addCustomSession = (s) => {
    if (editingSession) setCustomSessions(prev => prev.map(x => x.id === s.id ? s : x));
    else setCustomSessions(prev => [...prev, s]);
  };
  const deleteCustomSession = (id) => setCustomSessions(prev => prev.filter(s => s.id !== id));

  // Sort habits: done last
  const sortedHabits = useMemo(() => [...habits].sort((a, b) => {
    if (a.todayDone !== b.todayDone) return a.todayDone ? 1 : -1;
    return b.streak - a.streak;
  }), [habits]);

  const doneToday = habits.filter(h => h.todayDone).length;
  const combinedConsistency = useMemo(() => {
    const all = new Set(); habits.forEach(h => h.consistency.forEach(d => all.add(d))); return Array.from(all);
  }, [habits]);

  const sessionLabel = selectedSession
    ? (selectedSession._type === 'habit' ? selectedSession.title : selectedSession.name)
    : 'Custom';

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 max-w-[1200px] mx-auto pb-24 md:pb-8">
      {/* STREAK MILESTONE CELEBRATION */}
      <AnimatePresence>
        {lastMilestone && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] glass-heavy glass-shine rounded-2xl px-6 py-4 flex items-center gap-4 shadow-2xl max-w-md"
            style={{ border: `2px solid ${lastMilestone.color || 'var(--accent-color)'}40` }}
          >
            <div className="text-4xl">🏆</div>
            <div>
              <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                {lastMilestone.streak}-Day Streak!
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-dim)' }}>
                <span className="font-semibold" style={{ color: lastMilestone.color || 'var(--accent-color)' }}>
                  {lastMilestone.habit}
                </span>{' '}
                — {lastMilestone.streak >= 365 ? 'Legendary! A full year! 🌟' : lastMilestone.streak >= 100 ? 'Incredible dedication! 💎' : lastMilestone.streak >= 60 ? 'Two months strong! 🔥🔥' : lastMilestone.streak >= 30 ? 'One month champion! 🎖️' : lastMilestone.streak >= 21 ? 'Habit formed! 🧠' : lastMilestone.streak >= 14 ? 'Two weeks! Keep going!' : 'First week conquered! 💪'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* TOP TOGGLE */}
      <div className="flex justify-center mb-6 sm:mb-8">
        <div className="glass-card rounded-full p-1 flex gap-1 relative w-full max-w-xs sm:max-w-sm">
          <motion.div className="absolute top-1 bottom-1 rounded-full" initial={false}
            animate={{ left: activeTab === 'tracker' ? '4px' : 'calc(50%)', width: 'calc(50% - 4px)' }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            style={{ background: 'rgb(var(--color-visor) / 0.1)', border: '1px solid rgb(var(--color-visor) / 0.2)', boxShadow: '0 0 16px rgb(var(--color-visor) / 0.08)' }} />
          <button onClick={() => setActiveTab('tracker')} className={clsx('flex-1 py-3 text-sm font-bold uppercase tracking-widest rounded-full z-10 flex items-center justify-center gap-2 transition-colors', activeTab === 'tracker' ? 'text-[#C2185B]' : 'text-[#F2EBE3]/35')}>
            <Activity size={16} /> Tracker
          </button>
          <button onClick={() => setActiveTab('focus')} className={clsx('flex-1 py-3 text-sm font-bold uppercase tracking-widest rounded-full z-10 flex items-center justify-center gap-2 transition-colors', activeTab === 'focus' ? 'text-[#C2185B]' : 'text-[#F2EBE3]/35')}>
            <Zap size={16} /> Focus
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ═══════ TRACKER VIEW ═══════ */}
        {activeTab === 'tracker' && (
          <motion.div key="tracker" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.35, ease: luxuryEase }} className="space-y-6">
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
              <div className="glass-card rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2.5">
                <Target size={16} className="text-accent-visor" />
                <span className="text-sm font-semibold">{doneToday}/{habits.length}</span>
                <span className="text-xs text-[#F2EBE3]/30">today</span>
              </div>
              <div className="glass-card rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2.5">
                <Flame size={16} className="text-orange-500" />
                <span className="text-sm font-semibold text-orange-400">{Math.max(...habits.map(h => h.streak), 0)}</span>
                <span className="text-xs text-[#F2EBE3]/30">best streak</span>
              </div>
              <div className="glass-card rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2.5">
                <TrendingUp size={16} className="text-accent-visor" />
                <span className="text-sm font-semibold text-accent-visor">{Math.round((doneToday / Math.max(habits.length, 1)) * 100)}%</span>
                <span className="text-xs text-[#F2EBE3]/30">completion</span>
              </div>
            </div>
            <Heatmap habits={habits} accentColor={accentColor} />
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold tracking-tight">Your Habits</h2>
                <button onClick={() => { setEditingHabit(null); setShowModal(true); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl glass-card text-accent-visor text-xs font-bold hover:bg-[#C2185B]/10 transition-all">
                  <Plus size={16} /> Add Habit
                </button>
              </div>
              <div className="space-y-2.5">
                <AnimatePresence mode="popLayout">
                  {sortedHabits.map((habit, i) => (
                    <HabitCard key={habit.id} habit={habit} index={i} onToggle={toggleHabit} onDelete={deleteHabit}
                      onEdit={(h) => { setEditingHabit(h); setShowModal(true); }} />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════ FOCUS VIEW — Circular heartbeat timer ═══════ */}
        {activeTab === 'focus' && (
          <motion.div key="focus" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.35, ease: luxuryEase }} className="flex flex-col items-center">

            {/* Timer/Stopwatch toggle */}
            <div className="flex gap-2 mb-8">
              <button onClick={() => { setMode('timer'); setIsActive(false); }}
                className={clsx('px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-2',
                  mode === 'timer' ? 'border-[#C2185B]/30 text-[#C2185B] bg-[#C2185B]/10' : 'border-[#F2EBE3]/10 text-[#F2EBE3]/35')}>
                <Timer size={14} /> Timer
              </button>
              <button onClick={() => { setMode('stopwatch'); setIsActive(false); setStopwatchTime(0); }}
                className={clsx('px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-2',
                  mode === 'stopwatch' ? 'border-[#C2185B]/30 text-[#C2185B] bg-[#C2185B]/10' : 'border-[#F2EBE3]/10 text-[#F2EBE3]/35')}>
                <Clock size={14} /> Stopwatch
              </button>
            </div>

            {/* Session label */}
            {selectedSession && mode === 'timer' && (
              <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-[#F2EBE3]/30 mb-4 flex items-center gap-2">
                <Flame size={14} className="text-orange-500" />
                Focusing on <span className="text-[#F2EBE3]/60 font-medium ml-1">{sessionLabel}</span>
              </motion.p>
            )}

            {/* Circular timer */}
            <div className="py-6">
              <CircularTimer
                progress={mode === 'timer' ? progress : Math.min(100, (stopwatchTime / 3600) * 100)}
                timeStr={mode === 'timer' ? timeStr : swStr}
                label={mode === 'stopwatch' ? 'Stopwatch' : sessionLabel}
                isActive={isActive}
                isLight={isLight}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 mt-4 flex-wrap justify-center">
              {/* Play / Pause */}
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={handlePlayPause}
                className={clsx('px-8 py-3.5 rounded-full font-bold tracking-widest text-sm transition-all',
                  isActive && !isPaused ? 'glass-card text-orange-400 border border-orange-400/30' : 'bg-[#C2185B] text-white shadow-[0_0_30px_rgba(194,24,91,0.25)]')}>
                {isActive && !isPaused
                  ? <span className="flex items-center gap-2"><Pause size={18} /> Pause</span>
                  : <span className="flex items-center gap-2"><Play size={18} /> {isPaused ? 'Resume' : 'Start'}</span>}
              </motion.button>

              {/* End — counts elapsed as a session */}
              {isActive && (
                <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                  whileTap={{ scale: 0.95 }} onClick={endSession}
                  className="px-6 py-3.5 rounded-full font-bold tracking-widest text-sm text-[#C2185B] border border-[#C2185B]/30 glass-card flex items-center gap-2">
                  <CheckCircle2 size={16} /> End
                </motion.button>
              )}

              {/* Restart */}
              {isActive && (
                <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                  whileTap={{ scale: 0.95 }} onClick={restartSession}
                  className="px-5 py-3.5 rounded-full font-bold tracking-widest text-sm text-blue-400 border border-blue-400/30 glass-card flex items-center gap-2">
                  <RotateCcw size={16} /> Restart
                </motion.button>
              )}

              {/* Reset when paused or not started */}
              {!isActive && (
                <button onClick={resetTimer} className="p-3 rounded-full text-[#F2EBE3]/25 hover:text-[#F2EBE3]/60 transition-colors">
                  <RotateCcw size={20} />
                </button>
              )}
            </div>

            {/* Stats bar + Sync toggle */}
            <div className="flex gap-4 mt-8 mb-6 flex-wrap justify-center">
              <div className="glass-card rounded-xl px-5 py-3 flex items-center gap-2.5">
                <Timer size={16} className="text-blue-400" />
                <span className="text-sm font-semibold">{sessions}</span>
                <span className="text-xs text-[#F2EBE3]/30">Sessions</span>
              </div>
              <div className="glass-card rounded-xl px-5 py-3 flex items-center gap-2.5">
                <Clock size={16} className="text-[#C2185B]" />
                <span className="text-sm font-semibold text-[#C2185B]">{totalFocusTime}m</span>
                <span className="text-xs text-[#F2EBE3]/30">Total Time</span>
              </div>
            </div>

            {/* Session History */}
            {sessionHistory.length > 0 && (
              <div className="w-full max-w-2xl mb-6">
                <h3 className="text-xs text-[#F2EBE3]/30 uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
                  <Clock size={12} /> Today's Sessions
                </h3>
                <div className="space-y-2">
                  {sessionHistory.map((s) => (
                    <div key={s.id} className="glass-card rounded-xl p-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#C2185B]/10 border border-[#C2185B]/20 flex items-center justify-center">
                        <CheckCircle2 size={14} className="text-[#C2185B]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-[#F2EBE3]/80">{s.name}</span>
                        <span className="text-xs text-[#F2EBE3]/25 ml-2">
                          {new Date(s.endedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {editingHistorySession === s.id ? (
                        <div className="flex items-center gap-1.5">
                          <input type="number" value={editDuration} onChange={e => setEditDuration(e.target.value)}
                            className="w-16 px-2 py-1 rounded-lg glass-input !py-1 !px-2 !text-xs text-center"
                            placeholder="min" autoFocus onKeyDown={e => e.key === 'Enter' && saveHistoryEdit(s.id)} />
                          <button onClick={() => saveHistoryEdit(s.id)} className="text-[#C2185B] text-xs font-bold px-2 py-1 rounded hover:bg-[#C2185B]/10">✓</button>
                          <button onClick={() => { setEditingHistorySession(null); setEditDuration(''); }} className="text-[#F2EBE3]/30 text-xs px-2 py-1 rounded hover:bg-white/5">✕</button>
                        </div>
                      ) : (
                        <>
                          <span className="text-sm font-semibold text-[#C2185B] tabular-nums">{s.duration}m</span>
                          <button onClick={() => { setEditingHistorySession(s.id); setEditDuration(String(s.duration)); }}
                            className="p-1.5 rounded-lg text-[#F2EBE3]/20 hover:text-[#F2EBE3]/60 hover:bg-white/5 transition-all">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => deleteHistorySession(s.id)}
                            className="p-1.5 rounded-lg text-[#F2EBE3]/20 hover:text-red-400 hover:bg-red-500/10 transition-all">
                            <Trash2 size={13} />
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Sessions — at top */}
            <div className="w-full max-w-2xl">
              <h3 className="text-xs text-[#F2EBE3]/30 uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
                <Zap size={12} /> Custom Sessions
              </h3>
              <div className="space-y-2 mb-4">
                {customSessions.map((s, i) => {
                  const isSelected = selectedSession?._type === 'custom' && selectedSession?.id === s.id;
                  return (
                    <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={clsx('glass-card rounded-xl p-3.5 flex items-center gap-3 cursor-pointer transition-all group',
                        isSelected ? 'border border-[#C2185B]/30 bg-[#C2185B]/5' : 'hover:bg-white/[0.03]')}>
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#C2185B]/10 border border-[#C2185B]/20"
                        onClick={() => startSession(s, 'custom')}>
                        <Zap size={16} className="text-[#C2185B]" />
                      </div>
                      <div className="flex-1 min-w-0" onClick={() => startSession(s, 'custom')}>
                        <span className="text-sm font-medium text-[#F2EBE3]/80">{s.name}</span>
                        <span className="text-xs text-[#F2EBE3]/25 ml-2">{s.time}m</span>
                      </div>
                      <span className="text-xs text-[#F2EBE3]/15 font-mono uppercase mr-2">{toRoman(i + 1)}</span>
                      <button onClick={() => { setEditingSession(s); setShowSessionModal(true); }}
                        className="p-1.5 rounded-lg text-[#F2EBE3]/20 hover:text-[#F2EBE3]/60 hover:bg-white/5 transition-all">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => deleteCustomSession(s.id)}
                        className="p-1.5 rounded-lg text-[#F2EBE3]/20 hover:text-red-400 hover:bg-red-500/10 transition-all">
                        <Trash2 size={13} />
                      </button>
                    </motion.div>
                  );
                })}
              </div>

              <button onClick={() => { setEditingSession(null); setShowSessionModal(true); }}
                className="w-full py-3 rounded-xl border border-dashed border-[#C2185B]/20 text-[#C2185B] text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#C2185B]/5 transition-all mb-6">
                <Plus size={16} /> Add Custom Session
              </button>

              {/* Sessions from Habits — below custom */}
              <h3 className="text-xs text-[#F2EBE3]/30 uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
                <Activity size={12} /> From Your Habits
              </h3>
              <div className="space-y-2">
                {habits.map((h, i) => {
                  const cfg = CATEGORY_CONFIG[h.category] || CATEGORY_CONFIG.Work;
                  const Icon = cfg.icon;
                  const isSelected = selectedSession?._type === 'habit' && selectedSession?.id === h.id;
                  return (
                    <motion.div key={h.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={clsx('glass-card rounded-xl p-3.5 flex items-center gap-3 cursor-pointer transition-all group',
                        isSelected ? 'border border-[#C2185B]/30 bg-[#C2185B]/5' : 'hover:bg-white/[0.03]')}>
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${h.color || cfg.color}15`, border: `1px solid ${h.color || cfg.color}25` }}
                        onClick={() => startSession(h, 'habit')}>
                        <Icon size={16} style={{ color: h.color || cfg.color }} />
                      </div>
                      <div className="flex-1 min-w-0" onClick={() => startSession(h, 'habit')}>
                        <span className="text-sm font-medium text-[#F2EBE3]/80">{h.title}</span>
                        <span className="text-xs text-[#F2EBE3]/25 ml-2">{h.focusDuration}m</span>
                      </div>
                      <span className="text-xs text-[#F2EBE3]/15 font-mono uppercase mr-2">{toRoman(i + 1)}</span>
                      <button onClick={(e) => { e.stopPropagation(); setEditingHabit(h); setShowModal(true); }}
                        className="p-1.5 rounded-lg text-[#F2EBE3]/20 hover:text-[#F2EBE3]/60 hover:bg-white/5 transition-all">
                        <Pencil size={13} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); deleteHabit(h.id); }}
                        className="p-1.5 rounded-lg text-[#F2EBE3]/20 hover:text-red-400 hover:bg-red-500/10 transition-all">
                        <Trash2 size={13} />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {showModal && (
          <HabitModal isOpen={showModal} onClose={() => { setShowModal(false); setEditingHabit(null); }}
            onSave={(h) => { if (editingHabit) updateHabit(h); else addHabit(h); }} editingHabit={editingHabit} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showSessionModal && (
          <SessionModal isOpen={showSessionModal} onClose={() => { setShowSessionModal(false); setEditingSession(null); }}
            onSave={addCustomSession} editingSession={editingSession} />
        )}
      </AnimatePresence>
    </div>
  );
}
