import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Circle, CheckCircle2, Star, Trash2, Calendar as CalIcon,
  ChevronDown, ChevronRight, MoreVertical, X, Clock,
  ListTodo, SortAsc, Flag, Edit3, ArrowRight, FileText,
  User, Briefcase, Heart, Hash, BarChart3, Target, TrendingUp, Zap, Users
} from 'lucide-react';
import { format, isToday, isTomorrow, isPast, startOfDay, addDays, subDays } from 'date-fns';
import clsx from 'clsx';
import { useData } from '../context/DataContext';
import { useToast } from '../components/Toast';
import { notificationManager } from '../services/notifications';
import PullToRefresh from '../components/PullToRefresh';
import ConfirmDialog from '../components/ConfirmDialog';
import ClockPicker from '../components/ClockPicker';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { workspaceService } from '../services/workspaceService';
import { apiFetch } from '../services/firebaseClient';

/* ═══════════════════════════════════════════════════════════════
   PRIORITY CONFIG
   ═══════════════════════════════════════════════════════════════ */
const PRIORITY_CONFIG = {
  high: { color: 'text-red-400', bg: 'bg-red-500/10', label: 'High', icon: '!' },
  medium: { color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Med' },
  low: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Low' },
};

const TASK_CATEGORIES = [
  { id: 'default', name: 'My Tasks', icon: ListTodo, color: 'var(--accent-color)' },
  { id: 'work', name: 'Work', icon: Briefcase, color: '#3b82f6' },
  { id: 'personal', name: 'Personal', icon: Heart, color: '#f97316' },
];

/* ═══════════════════════════════════════════════════════════════
   ADD TASK MODAL — Rich input form
   ═══════════════════════════════════════════════════════════════ */
const AddTaskModal = ({ isOpen, onClose, onSave, taskLists, initialCategory }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(initialCategory && initialCategory !== 'all' ? initialCategory : 'default');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [recurrence, setRecurrence] = useState('none');
  const [showCatDropdown, setShowCatDropdown] = useState(false);
  const titleRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTitle(''); setDescription('');
      setCategory(initialCategory && initialCategory !== 'all' ? initialCategory : 'default');
      setPriority('medium'); setDueDate('');
      setDueTime(''); setRecurrence('none'); setShowCatDropdown(false);
      // Slight delay to allow animation to start before potential keyboard shift
      setTimeout(() => titleRef.current?.focus(), 300);
    }
  }, [isOpen, initialCategory]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      id: crypto.randomUUID(),
      title: title.trim(),
      details: description.trim(),
      listId: category,
      completed: false,
      starred: false,
      priority,
      dueDate: dueDate ? new Date(dueDate + 'T' + (dueTime || '00:00') + ':00') : null,
      recurrence,
      subtasks: [],
    });
    onClose();
  };

  const selectedCat = TASK_CATEGORIES.find(c => c.id === category) || TASK_CATEGORIES[0];
  const CatIcon = selectedCat.icon;

  if (!isOpen) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xl sm:p-4" onClick={onClose}>
      <motion.div initial={{ y: '100%', opacity: 0.8 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        className="w-full sm:max-w-md max-h-[85dvh] flex flex-col rounded-t-2xl sm:rounded-2xl overflow-hidden glass-heavy glass-shine"
        style={{
          marginBottom: 'env(safe-area-inset-bottom)',
          background: 'var(--body-bg)',
          borderColor: 'var(--glass-border)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Drag handle for mobile */}
        <div className="sm:hidden flex justify-center pt-3 pb-1" onClick={onClose}>
          <div className="w-12 h-1.5 rounded-full bg-[var(--text-dim)] opacity-20" />
        </div>
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-5 border-b border-[var(--glass-border)]">
          <h3 className="text-lg font-medium text-[var(--text-primary)] flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center border" style={{ backgroundColor: 'var(--accent-glow)', borderColor: 'var(--accent-color)' }}>
              <CheckCircle2 size={18} style={{ color: 'var(--accent-color)' }} />
            </div>
            Add New Task
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--glass-bg-hover)] text-[var(--text-dim)]"><X size={20} /></button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 space-y-5">
          {/* Task Title */}
          <div>
            <label className="text-xs text-[var(--text-dim)] uppercase tracking-wider font-bold mb-2 block opacity-60">Task Title</label>
            <input ref={titleRef} value={title} onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()} placeholder="What needs to be done?"
              className="glass-input !bg-[var(--glass-bg)]" />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-[var(--text-dim)] uppercase tracking-wider font-bold mb-2 block flex items-center gap-1.5 opacity-60">
              <FileText size={12} /> Description <span className="text-[var(--text-dim)] normal-case tracking-normal font-normal ml-1 opacity-40">(optional)</span>
            </label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Add details about this task..." rows={3}
              className="glass-input !text-sm resize-none !bg-[var(--glass-bg)]" />
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <label className="text-xs text-[var(--text-dim)] uppercase tracking-wider font-bold mb-2 block opacity-60">Category</label>
            <button onClick={() => setShowCatDropdown(!showCatDropdown)}
              className="w-full glass-input !py-3 flex items-center justify-between !bg-[var(--glass-bg)]">
              <span className="flex items-center gap-2.5">
                <CatIcon size={16} style={{ color: selectedCat.color }} />
                <span className="text-[var(--text-primary)] opacity-80">{selectedCat.name}</span>
              </span>
              <ChevronDown size={16} className="text-[var(--text-dim)] opacity-30" />
            </button>
            <AnimatePresence>
              {showCatDropdown && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                  className="absolute top-full left-0 right-0 mt-1 glass-heavy rounded-xl overflow-hidden z-20 shadow-lg border border-[var(--glass-border)]">
                  {TASK_CATEGORIES.map(cat => (
                    <button key={cat.id} onClick={() => { setCategory(cat.id); setShowCatDropdown(false); }}
                      className={clsx('w-full px-4 py-3 flex items-center gap-2.5 text-sm transition-all',
                        category === cat.id ? 'bg-[var(--glass-bg-hover)] text-[var(--text-primary)]' : 'text-[var(--text-dim)] opacity-50 hover:bg-[var(--glass-bg-hover)]')}>
                      <cat.icon size={16} style={{ color: cat.color }} />
                      {cat.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Priority */}
          <div>
            <label className="text-xs text-[var(--text-dim)] uppercase tracking-wider font-bold mb-2 block opacity-40">Priority</label>
            <div className="flex gap-2">
              {[
                { key: 'low', label: 'LOW', color: '#22c55e', bgActive: 'bg-green-500/15 border-green-500/40', bgInactive: 'border-[var(--glass-border)] text-[var(--text-dim)] opacity-40' },
                { key: 'medium', label: 'MEDIUM', color: '#f97316', bgActive: 'bg-orange-500/15 border-orange-500/40', bgInactive: 'border-[var(--glass-border)] text-[var(--text-dim)] opacity-40' },
                { key: 'high', label: 'HIGH', color: '#ef4444', bgActive: 'bg-red-500/15 border-red-500/40', bgInactive: 'border-[var(--glass-border)] text-[var(--text-dim)] opacity-40' },
              ].map(p => (
                <button key={p.key} onClick={() => setPriority(p.key)}
                  className={clsx('flex-1 py-2.5 rounded-xl text-xs font-bold tracking-wider border transition-all flex items-center justify-center gap-1.5',
                    priority === p.key ? p.bgActive : p.bgInactive)}>
                  <Flag size={13} style={{ color: priority === p.key ? p.color : 'inherit' }} />
                  <span style={{ color: priority === p.key ? p.color : 'inherit' }}>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time Row */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-[var(--text-dim)] uppercase tracking-wider font-bold mb-2 block flex items-center gap-1.5 opacity-40">
                <CalIcon size={12} /> Date <span className="text-[var(--text-dim)] normal-case tracking-normal font-normal ml-1 opacity-20">(optional)</span>
              </label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                className="glass-input !py-2.5 !text-sm w-full" />
            </div>
            <div className="flex-1">
              <label className="text-xs uppercase tracking-wider font-bold mb-2 block flex items-center gap-1.5" style={{ color: 'var(--text-dim)' }}>
                <Clock size={12} /> Time <span className="normal-case tracking-normal font-normal ml-1" style={{ opacity: 0.4 }}>(optional)</span>
              </label>
              <ClockPicker value={dueTime} onChange={setDueTime} />
            </div>
          </div>

          {/* Recurrence */}
          <div>
            <label className="text-xs text-[var(--text-dim)] uppercase tracking-wider font-bold mb-2 block opacity-40">Repeat</label>
            <div className="flex gap-2">
              {[
                { key: 'none', label: 'Once' },
                { key: 'daily', label: 'Daily' },
                { key: 'weekly', label: 'Weekly' },
                { key: 'monthly', label: 'Monthly' },
              ].map(r => (
                <button key={r.key} onClick={() => setRecurrence(r.key)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${recurrence === r.key
                    ? 'border-[var(--accent-color)]/40 bg-[var(--accent-glow)] text-[var(--accent-color)]'
                    : 'border-[var(--glass-border)] text-[var(--text-dim)] opacity-30 hover:opacity-100 hover:border-[var(--glass-border-hover)]'
                    }`}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer — always visible at bottom */}
        <div className="flex-shrink-0 p-5 flex justify-end gap-3 sticky bottom-0 bg-inherit backdrop-blur-xl">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-[var(--text-dim)] text-sm hover:bg-[var(--glass-bg-hover)] transition-colors opacity-60">Cancel</button>
          <button onClick={handleSave} disabled={!title.trim()}
            className="px-6 py-2.5 rounded-xl bg-[var(--accent-color)] text-white font-bold text-sm hover:shadow-[0_0_20px_var(--accent-glow)] transition-all disabled:opacity-30 disabled:cursor-not-allowed">
            Add Task
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   DUE DATE FORMATTER
   ═══════════════════════════════════════════════════════════════ */
const formatDueDate = (date) => {
  if (!date) return null;
  if (isToday(date)) return { text: 'Today', class: 'text-[var(--accent-color)]' };
  if (isTomorrow(date)) return { text: 'Tomorrow', class: 'text-blue-400' };
  if (isPast(startOfDay(date))) return { text: format(date, 'MMM d'), class: 'text-red-400' };
  return { text: format(date, 'MMM d'), class: 'text-[var(--text-dim)] opacity-40' };
};

/* ═══════════════════════════════════════════════════════════════
   TASK DETAIL PANEL (Right side, Google Tasks style)
   ═══════════════════════════════════════════════════════════════ */
const TaskDetailPanel = ({ task, onClose, onUpdate, onDelete }) => {
  const [title, setTitle] = useState(task.title);
  const [details, setDetails] = useState(task.details);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [editingDate, setEditingDate] = useState(false);
  const titleRef = useRef(null);

  useEffect(() => {
    setTitle(task.title);
    setDetails(task.details);
  }, [task]);

  const saveChanges = () => {
    onUpdate({ ...task, title, details });
  };

  const addSubtask = () => {
    if (!subtaskInput.trim()) return;
    const newSub = { id: Date.now().toString(), title: subtaskInput.trim(), completed: false };
    onUpdate({ ...task, subtasks: [...(Array.isArray(task.subtasks) ? task.subtasks : []), newSub] });
    setSubtaskInput('');
  };

  const toggleSubtask = (subId) => {
    onUpdate({
      ...task,
      subtasks: (Array.isArray(task.subtasks) ? task.subtasks : []).map(s => s.id === subId ? { ...s, completed: !s.completed } : s)
    });
  };

  const deleteSubtask = (subId) => {
    onUpdate({ ...task, subtasks: (Array.isArray(task.subtasks) ? task.subtasks : []).filter(s => s.id !== subId) });
  };

  const cyclePriority = () => {
    const order = ['low', 'medium', 'high'];
    const idx = order.indexOf(task.priority);
    onUpdate({ ...task, priority: order[(idx + 1) % 3] });
  };

  const handleDateChange = (e) => {
    const val = e.target.value;
    if (val) {
      onUpdate({ ...task, dueDate: new Date(val + 'T00:00:00') });
    } else {
      onUpdate({ ...task, dueDate: null });
    }
    setEditingDate(false);
  };

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="w-[380px] flex-shrink-0 flex flex-col h-full shadow-2xl"
      style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(30px) saturate(180%)', WebkitBackdropFilter: 'blur(30px) saturate(180%)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--glass-bg-hover)] text-[var(--text-dim)] transition-colors"><X size={20} /></button>
        <div className="flex gap-1">
          <button onClick={cyclePriority}
            className={clsx('p-2 rounded-lg hover:bg-white/10 transition-colors', PRIORITY_CONFIG[task.priority].color)}
            title="Cycle priority">
            <Flag size={18} />
          </button>
          <button onClick={() => onUpdate({ ...task, starred: !task.starred })}
            className={clsx('p-2 rounded-lg hover:bg-[var(--glass-bg-hover)] transition-colors', task.starred ? 'text-yellow-400' : 'text-[var(--text-dim)] opacity-50')}>
            <Star size={18} fill={task.starred ? 'currentColor' : 'none'} />
          </button>
          <button onClick={() => { onDelete(task.id); onClose(); }}
            className="p-2 rounded-lg hover:bg-red-500/10 text-red-400/60 hover:text-red-400 transition-colors">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Title (editable) */}
        <input
          ref={titleRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={saveChanges}
          onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
          className="w-full bg-transparent text-lg font-medium text-[var(--text-primary)] border-none outline-none placeholder:text-[var(--text-dim)]"
          placeholder="Task title"
        />

        {/* Details */}
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          onBlur={saveChanges}
          placeholder="Add details"
          rows={3}
          className="glass-input !text-sm !text-[var(--text-dim)] resize-none"
        />

        {/* Due Date — clickable with mini date picker */}
        <div className="flex items-center gap-3 text-sm">
          <CalIcon size={16} className="text-[var(--text-dim)] opacity-40 flex-shrink-0" />
          {editingDate ? (
            <input
              type="date"
              autoFocus
              defaultValue={task.dueDate ? format(task.dueDate, 'yyyy-MM-dd') : ''}
              onChange={handleDateChange}
              onBlur={() => setEditingDate(false)}
              className="glass-input !py-1.5 !px-3 !w-auto !text-sm"
            />
          ) : (
            <button
              onClick={() => setEditingDate(true)}
              className="text-left hover:bg-[var(--glass-bg-hover)] px-2 py-1 rounded-lg transition-colors"
            >
              {task.dueDate ? (
                <span className={formatDueDate(task.dueDate)?.class}>{formatDueDate(task.dueDate)?.text}</span>
              ) : (
                <span className="text-[var(--text-dim)] opacity-30">Add date</span>
              )}
            </button>
          )}
        </div>

        {/* Priority Badge */}
        <button onClick={cyclePriority} className="flex items-center gap-3 text-sm hover:bg-[var(--glass-bg-hover)] -mx-2 px-2 py-1 rounded-lg transition-colors">
          <Flag size={16} className="text-[var(--text-dim)] opacity-40" />
          <span className={clsx('px-3 py-1 rounded-full text-xs font-medium', PRIORITY_CONFIG[task.priority].bg, PRIORITY_CONFIG[task.priority].color)}>
            {PRIORITY_CONFIG[task.priority].label} Priority
          </span>
        </button>

        {/* Subtasks */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs text-[var(--text-dim)] uppercase tracking-wider font-bold opacity-60">Subtasks</h4>
          <AnimatePresence>
            {(Array.isArray(task.subtasks) ? task.subtasks : []).map(sub => (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                className="flex items-center gap-3 group py-1"
              >
                <button onClick={() => toggleSubtask(sub.id)} className="flex-shrink-0">
                  {sub.completed ? (
                    <CheckCircle2 size={18} className="text-[var(--accent-color)]" />
                  ) : (
                    <Circle size={18} className="text-[var(--text-dim)] opacity-35 hover:text-[var(--accent-color)] transition-colors" />
                  )}
                </button>
                <span className={clsx('flex-1 text-sm', sub.completed ? 'line-through text-[var(--text-dim)] opacity-30' : 'text-[var(--text-primary)] opacity-80')}>
                  {sub.title}
                </span>
                <button onClick={() => deleteSubtask(sub.id)}
                  className="p-1 rounded hover:bg-red-500/10 text-red-400/40 hover:text-red-400 transition-all">
                  <X size={16} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Add Subtask */}
          <div className="flex items-center gap-3">
            <Plus size={18} className="text-[var(--text-dim)] opacity-35 flex-shrink-0" />
            <input
              value={subtaskInput}
              onChange={(e) => setSubtaskInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addSubtask()}
              placeholder="Add subtask"
              className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-dim)] border-none outline-none opacity-60"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   TASK ITEM ROW
   ═══════════════════════════════════════════════════════════════ */
const TaskItem = ({ task, onToggle, onStar, onSelect, onDelete, isSelected }) => {
  const due = formatDueDate(task.dueDate);
  const subs = Array.isArray(task.subtasks) ? task.subtasks : [];
  const subtasksDone = subs.filter(s => s.completed).length;
  const subtasksTotal = subs.length;
  const listColor = TASK_CATEGORIES.find(c => c.id === task.listId)?.color || 'var(--accent-color)';   

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, transition: { duration: 0.25 } }}
      onClick={() => onSelect(task)}
      className={clsx(
        'flex items-start gap-3.5 px-4 py-3.5 cursor-pointer group transition-all rounded-lg mb-1',
        isSelected
          ? 'bg-[var(--accent-glow)] shadow-sm'
          : 'hover:bg-[var(--glass-bg-hover)]',
        task.completed && 'opacity-45'
      )}
      style={{
        borderLeft: `3px solid ${task.completed ? `color-mix(in srgb, ${listColor}, transparent 80%)` : `color-mix(in srgb, ${listColor}, transparent 60%)`}`,
        background: isSelected
          ? `color-mix(in srgb, ${listColor}, transparent 92%)`
          : task.priority === 'high'
            ? 'rgba(239,68,68,0.06)'
            : task.priority === 'medium'
              ? 'rgba(245,158,11,0.04)'
              : task.priority === 'low'
                ? 'rgba(34,197,94,0.04)'
                : undefined,
      }}
    >
      {/* Checkbox */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggle(task.id); }}
        className="flex-shrink-0 mt-0.5"
      >
        {task.completed ? (
          <CheckCircle2 size={20} className="text-[var(--accent-color)]" />
        ) : (
          <Circle size={20} className={clsx(
            'transition-colors',
            task.priority === 'high' ? 'text-red-400/60 hover:text-[var(--accent-color)]' :
              task.priority === 'medium' ? 'text-yellow-400/40 hover:text-[var(--accent-color)]' :
                'text-[var(--text-dim)] opacity-20 hover:text-[var(--accent-color)]'
          )} />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className={clsx(
          'text-[14px] leading-snug transition-all',
          task.completed ? 'line-through text-[var(--text-dim)] opacity-30' : 'text-[var(--text-primary)] opacity-90 group-hover:opacity-100'
        )}>
          {task.title}
        </div>
        <div className="flex items-center gap-2.5 mt-1 flex-wrap">
          {due && (
            <span className={clsx('text-[11px] flex items-center gap-1', due.class)}>
              <CalIcon size={11} /> {due.text}
            </span>
          )}
          {task.priority === 'high' && (
            <span className="text-[11px] text-red-400/80 flex items-center gap-0.5">
              <Flag size={11} />
            </span>
          )}
          {subtasksTotal > 0 && (
            <span className="text-[12px] text-[var(--text-dim)] opacity-45">
              {subtasksDone}/{subtasksTotal}
            </span>
          )}
          {task.details && !task.completed && (
            <span className="text-[12px] text-[var(--text-dim)] opacity-35 truncate max-w-[140px]">{task.details}</span>
          )}
        </div>
      </div>

      {/* Action Buttons — always visible */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={(e) => { e.stopPropagation(); onSelect(task); }}
          className="p-1.5 rounded-lg text-[var(--text-dim)] opacity-50 hover:opacity-100 hover:bg-[var(--glass-bg-hover)] transition-all"
          title="Edit"
        >
          <Edit3 size={16} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onStar(task.id); }}
          className="p-1.5 rounded-lg transition-all"
        >
          <Star size={16} className={task.starred ? 'text-yellow-400 fill-yellow-400' : 'text-[var(--text-dim)] opacity-40 hover:text-yellow-400/70'} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
          className="p-1.5 rounded-lg text-red-400/50 hover:text-red-400 hover:bg-red-500/10 transition-all"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN TASKS PAGE  — Google Tasks layout
   ═══════════════════════════════════════════════════════════════ */
export default function MithraTasks() {
  const { tasks, taskLists, addTask, updateTask, deleteTask, toggleTask, starTask, theme, accentColor } = useData();
  const isLight = theme === 'light';
  const { addToast } = useToast();
  const { user } = useAuth();

  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [deleteConfirm, setDeleteConfirm] = useState(null); // task ID pending delete
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsFilter, setAnalyticsFilter] = useState(null); // 'overdue' | 'high' | 'pending' | null

  // ── Blend workspace tasks ──
  const [blendWorkspace, setBlendWorkspace] = useState(null);
  const [blendTasks, setBlendTasks] = useState([]);

  useEffect(() => {
    if (!user) return;
    workspaceService.getWorkspaces(user.id)
      .then(ws => { if (ws.length > 0) setBlendWorkspace(ws[0]); })
      .catch((err) => {
        console.warn('[Tasks] Failed to load workspaces:', err.message);
      });
  }, [user]);

  useEffect(() => {
    if (!blendWorkspace) return;
    workspaceService.getWorkspaceTasks(blendWorkspace.id)
      .then(setBlendTasks)
      .catch((err) => {
        console.warn('[Tasks] Failed to load workspace tasks:', err.message);
      });
  }, [blendWorkspace]);

  const completeBlendTask = async (taskId) => {
    try {
      await apiFetch(`/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify({ completed: true })
      });
      setBlendTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('[Tasks] Failed to complete blend task:', error.message);
      // Optionally show user feedback here
    }
  };

  // ── Task Analytics ──
  const analytics = useMemo(() => {
    const now = new Date();
    const totalTasks = tasks?.length || 0;
    const completedCount = tasks?.filter(t => t.completed).length || 0;
    const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

    const overdue = tasks?.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < now).length || 0;
    const highP = tasks?.filter(t => t.priority === 'high' && !t.completed).length || 0;
    const medP = tasks?.filter(t => t.priority === 'medium' && !t.completed).length || 0;
    const lowP = tasks?.filter(t => t.priority === 'low' && !t.completed).length || 0;

    // Weekly trend (last 7 days)
    const weeklyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(now, i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const count = tasks?.filter(t => {
        if (!t.completed || !t.dueDate) return false;
        return format(new Date(t.dueDate), 'yyyy-MM-dd') === dateStr;
      }).length || 0;
      weeklyTrend.push({ label: format(d, 'EEE'), value: count });
    }

    // Category breakdown
    const categories = {};
    tasks?.forEach(t => {
      const cat = t.listId || 'default';
      if (!categories[cat]) categories[cat] = { total: 0, done: 0 };
      categories[cat].total++;
      if (t.completed) categories[cat].done++;
    });

    return { totalTasks, completedCount, completionRate, overdue, highP, medP, lowP, weeklyTrend, categories };
  }, [tasks]);

  // Filter & Sort — show ALL tasks, with optional list filter + analytics filter
  const filteredTasks = useMemo(() => {
    let result = activeFilter === 'all' ? tasks : tasks.filter(t => t.listId === activeFilter);
    if (analyticsFilter === 'overdue') {
      const now = new Date();
      result = result.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < now);
    } else if (analyticsFilter === 'high') {
      result = result.filter(t => t.priority === 'high' && !t.completed);
    } else if (analyticsFilter === 'pending') {
      result = result.filter(t => !t.completed);
    }
    return result;
  }, [tasks, activeFilter, analyticsFilter]);
  const activeTasks = filteredTasks.filter(t => !t.completed);
  const completedTasks = filteredTasks.filter(t => t.completed);

  const sortTasks = (taskList) => {
    return [...taskList].sort((a, b) => {
      if (a.starred !== b.starred) return a.starred ? -1 : 1;
      if (sortBy === 'date') {
        const ad = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const bd = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        return ad - bd;
      }
      if (sortBy === 'priority') {
        const p = { high: 0, medium: 1, low: 2 };
        return p[a.priority] - p[b.priority];
      }
      return a.title.localeCompare(b.title);
    });
  };

  const sortedActive = sortTasks(activeTasks);
  const sortedCompleted = sortTasks(completedTasks);

  const handleToggle = useCallback((id) => {
    notificationManager.hapticLight();
    toggleTask(id);
    if (selectedTask?.id === id) {
      setSelectedTask(prev => prev ? { ...prev, completed: !prev.completed } : null);
    }
  }, [toggleTask, selectedTask]);

  const handleAdd = useCallback((task) => {
    notificationManager.hapticMedium();
    addTask(task);
    addToast({ title: 'Task scheduled', description: `"${task.title}" added to ${taskLists.find(l => l.id === task.listId)?.name || 'list'}.`, variant: 'success' });
  }, [addTask, taskLists, addToast]);

  const handleUpdate = useCallback((updatedTask) => {
    updateTask(updatedTask);
    if (selectedTask?.id === updatedTask.id) {
      setSelectedTask(updatedTask);
    }
  }, [updateTask, selectedTask]);

  const handleDelete = useCallback((id) => {
    notificationManager.hapticHeavy();
    setDeleteConfirm(id);
  }, []);

  const handleRefresh = async () => {
    return new Promise(resolve => setTimeout(resolve, 1000));
  };

  const confirmDelete = useCallback(() => {
    if (deleteConfirm) {
      const taskToDelete = tasks.find(t => t.id === deleteConfirm);
      deleteTask(deleteConfirm);
      if (selectedTask?.id === deleteConfirm) setSelectedTask(null);
      setDeleteConfirm(null);
      // Undo toast
      if (taskToDelete) {
        addToast({
          message: `"${taskToDelete.title}" deleted`,
          type: 'success',
          duration: 5000,
          undoAction: () => addTask(taskToDelete),
        });
      }
    }
  }, [deleteTask, selectedTask, deleteConfirm, tasks, addTask, addToast]);

  const cancelDelete = useCallback(() => {
    setDeleteConfirm(null);
  }, []);

  // Keep detail panel in sync
  useEffect(() => {
    if (selectedTask) {
      const updated = tasks.find(t => t.id === selectedTask.id);
      if (updated && JSON.stringify(updated) !== JSON.stringify(selectedTask)) {
        setSelectedTask(updated);
      }
    }
  }, [tasks, selectedTask]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="h-[calc(100vh-100px)] flex flex-col md:flex-row rounded-2xl overflow-hidden glass-heavy glass-shine"
      >
        {/* ── MAIN TASK LIST ── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header with filter chips */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0 gap-2">
            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar">
              <h2 className="text-lg sm:text-xl font-medium tracking-tight text-[var(--text-primary)] flex-shrink-0">Tasks</h2>
              {/* Filter chips */}
              <div className="flex gap-1.5 ml-2 sm:ml-4">
                <button
                  onClick={() => { setActiveFilter('all'); setSelectedTask(null); }}
                  className={clsx(
                    'px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap',
                    activeFilter === 'all'
                      ? 'border-[var(--accent-color)]/30 bg-[var(--accent-glow)] text-[var(--accent-color)]'
                      : 'border-[var(--glass-border)] text-[var(--text-dim)] hover:bg-[var(--glass-bg-hover)]'
                  )}
                >
                  All
                </button>
                {taskLists.map(list => {
                  const count = tasks.filter(t => t.listId === list.id && !t.completed).length;
                  return (
                    <button
                      key={list.id}
                      onClick={() => { setActiveFilter(list.id); setSelectedTask(null); }}
                      className={clsx(
                        'px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 whitespace-nowrap',
                        activeFilter === list.id
                          ? 'bg-[var(--glass-bg-hover)] text-[var(--text-primary)] font-semibold'
                          : 'border-[var(--glass-border)] text-[var(--text-dim)] opacity-60 hover:opacity-100'
                      )}
                      style={activeFilter === list.id ? { borderColor: `color-mix(in srgb, ${list.color}, transparent 50%)` } : {}}
                    >
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: list.color }} />
                      {list.name}
                      {count > 0 && <span className="text-[10px] opacity-60">{count}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAnalytics(p => !p)}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] border transition-all uppercase tracking-wider font-medium',
                  showAnalytics
                    ? 'border-[var(--accent-color)]/30 bg-[var(--accent-glow)]'
                    : 'border-[var(--accent-color)]/15 bg-[var(--accent-glow)] hover:bg-[var(--accent-glow)] hover:border-[var(--accent-color)]/25'
                )}
              >
                <BarChart3 size={13} />
                Analytics
              </button>
              <button
                onClick={() => setSortBy(s => s === 'date' ? 'priority' : s === 'priority' ? 'name' : 'date')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] text-[var(--text-dim)] opacity-40 hover:opacity-100 hover:bg-[var(--glass-bg-hover)] border border-[var(--glass-border)] transition-colors uppercase tracking-wider font-medium"
              >
                <SortAsc size={13} />
                {sortBy}
              </button>
            </div>
          </div>

          {/* Add Task Button — opens rich modal */}
          <div className="px-5 py-3 flex-shrink-0 flex items-center gap-3">
            <button onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent-glow)] border border-[var(--accent-color)]/25 text-[var(--accent-color)] text-sm font-medium hover:bg-[var(--accent-color)]/10 hover:border-[var(--accent-color)]/40 transition-all">
              <Plus size={16} /> New Task
            </button>
          </div>

          {/* ── ANALYTICS PANEL ── */}
          <AnimatePresence>
            {showAnalytics && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="p-5 space-y-4">
                  {/* Completion Rate + Quick Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-xl p-3 border border-[var(--glass-border)] cursor-default" style={{ background: 'var(--glass-bg)' }}>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <TrendingUp size={12} className="text-accent-visor" />
                        <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-dim)' }}>Completion</span>
                      </div>
                      <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{analytics.completionRate}%</span>
                      <span className="text-[10px] ml-1.5" style={{ color: 'var(--text-dim)' }}>{analytics.completedCount}/{analytics.totalTasks}</span>
                    </div>
                    <div onClick={() => setAnalyticsFilter(f => f === 'overdue' ? null : 'overdue')}
                      className={clsx('rounded-xl p-3 border cursor-pointer transition-all hover:scale-[1.02]', analyticsFilter === 'overdue' ? 'ring-1 ring-red-400/50' : '')}
                      style={{ background: analytics.overdue > 0 ? 'rgba(239,68,68,0.06)' : 'var(--glass-bg)', borderColor: analyticsFilter === 'overdue' ? 'rgba(239,68,68,0.3)' : 'var(--glass-border)' }}>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Clock size={12} className={analytics.overdue > 0 ? 'text-red-400' : 'text-accent-visor'} />
                        <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-dim)' }}>Overdue</span>
                      </div>
                      <span className={clsx('text-xl font-bold', analytics.overdue > 0 ? 'text-red-400' : '')} style={analytics.overdue === 0 ? { color: 'var(--text-primary)' } : {}}>{analytics.overdue}</span>
                    </div>
                    <div onClick={() => setAnalyticsFilter(f => f === 'high' ? null : 'high')}
                      className={clsx('rounded-xl p-3 border cursor-pointer transition-all hover:scale-[1.02]', analyticsFilter === 'high' ? 'ring-1 ring-red-400/50' : '')}
                      style={{ background: 'var(--glass-bg)', borderColor: analyticsFilter === 'high' ? 'rgba(239,68,68,0.3)' : 'var(--glass-border)' }}>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Flag size={12} className="text-red-400" />
                        <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-dim)' }}>High</span>
                      </div>
                      <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{analytics.highP}</span>
                    </div>
                    <div onClick={() => setAnalyticsFilter(f => f === 'pending' ? null : 'pending')}
                      className={clsx('rounded-xl p-3 border cursor-pointer transition-all hover:scale-[1.02]', analyticsFilter === 'pending' ? 'ring-1 ring-accent-visor/50' : '')}
                      style={{ background: 'var(--glass-bg)', borderColor: analyticsFilter === 'pending' ? 'var(--accent-color)' : 'var(--glass-border)' }}>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Zap size={12} className="text-accent-visor" />
                        <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-dim)' }}>Pending</span>
                      </div>
                      <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{analytics.totalTasks - analytics.completedCount}</span>
                    </div>
                  </div>

                  {/* Weekly Bar Chart + Priority Breakdown side-by-side */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Weekly Trend */}
                    <div className="rounded-xl p-4 border border-white/[0.06]" style={{ background: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)' }}>
                      <div className="flex items-center gap-1.5 mb-3">
                        <BarChart3 size={12} className="text-accent-visor" />
                        <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>This Week</span>
                      </div>
                      <div className="flex items-end gap-1 justify-between h-14">
                        {analytics.weeklyTrend.map((d, i) => {
                          const maxVal = Math.max(...analytics.weeklyTrend.map(x => x.value), 1);
                          return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${Math.max((d.value / maxVal) * 100, 6)}%` }}
                                transition={{ delay: 0.1 + i * 0.04, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                className="w-full max-w-[10px] rounded-t-sm"
                                style={{ background: 'var(--accent-color)', opacity: d.value > 0 ? 1 : 0.15, minHeight: 2 }}
                              />
                              <span className="text-[8px]" style={{ color: isLight ? 'rgba(26,26,26,0.3)' : 'rgba(242,235,227,0.3)' }}>{d.label}</span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="text-[10px] text-right mt-2" style={{ color: isLight ? 'rgba(26,26,26,0.35)' : 'rgba(242,235,227,0.35)' }}>
                        {analytics.weeklyTrend.reduce((s, d) => s + d.value, 0)} completed
                      </div>
                    </div>

                    {/* Priority Breakdown */}
                    <div className="rounded-xl p-4 border border-white/[0.06]" style={{ background: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)' }}>
                      <div className="flex items-center gap-1.5 mb-3">
                        <Target size={12} className="text-accent-visor" />
                        <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Priority Breakdown</span>
                      </div>
                      <div className="space-y-2">
                        {[
                          { label: 'High', count: analytics.highP, color: '#ef4444', total: analytics.totalTasks },
                          { label: 'Medium', count: analytics.medP, color: '#f59e0b', total: analytics.totalTasks },
                          { label: 'Low', count: analytics.lowP, color: '#22c55e', total: analytics.totalTasks },
                        ].map(item => (
                          <div key={item.label} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                            <span className="text-[11px] flex-1" style={{ color: isLight ? 'rgba(26,26,26,0.5)' : 'rgba(242,235,227,0.5)' }}>{item.label}</span>
                            <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{item.count}</span>
                            <div className="w-16 h-1.5 rounded-full" style={{ background: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(242,235,227,0.06)' }}>
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${item.total > 0 ? (item.count / item.total) * 100 : 0}%` }}
                                transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                className="h-full rounded-full"
                                style={{ background: item.color, minWidth: item.count > 0 ? 3 : 0 }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      {analytics.overdue > 0 && (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t" style={{ borderColor: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(242,235,227,0.06)' }}>
                          <div className="w-2 h-2 rounded-full flex-shrink-0 bg-red-500" />
                          <span className="text-[11px] flex-1 text-red-400">Overdue</span>
                          <span className="text-xs font-bold text-red-400">{analytics.overdue}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Category completion bars */}
                  {Object.keys(analytics.categories).length > 0 && (
                    <div className="rounded-xl p-4 border border-white/[0.06]" style={{ background: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)' }}>
                      <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>By Category</span>
                      <div className="space-y-2 mt-3">
                        {Object.entries(analytics.categories).map(([cat, data]) => {
                          const pct = data.total > 0 ? Math.round((data.done / data.total) * 100) : 0;
                          const catObj = TASK_CATEGORIES.find(c => c.id === cat);
                          const catName = catObj?.name || cat;
                          const catColor = catObj?.color || '#C2185B';
                          return (
                            <div key={cat}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[11px]" style={{ color: catColor }}>{catName}</span>
                                <span className="text-[10px]" style={{ color: isLight ? 'rgba(26,26,26,0.35)' : 'rgba(242,235,227,0.35)' }}>{data.done}/{data.total} ({pct}%)</span>
                              </div>
                              <div className="w-full h-1.5 rounded-full" style={{ background: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(242,235,227,0.06)' }}>
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{ delay: 0.4, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                  className="h-full rounded-full"
                                  style={{ background: catColor, minWidth: data.done > 0 ? 3 : 0 }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Filter Banner */}
          {analyticsFilter && (
            <div className="flex items-center justify-between px-5 py-2 border-b" style={{ borderColor: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(242,235,227,0.06)', background: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)' }}>
              <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                Showing: <span className="text-accent-visor capitalize">{analyticsFilter}</span> ({filteredTasks.length} tasks)
              </span>
              <button onClick={() => setAnalyticsFilter(null)} className="text-xs text-accent-visor hover:underline">Clear filter</button>
            </div>
          )}

          {/* Task List */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="popLayout">
              <div className="space-y-1">
                {sortedActive.length > 0 ? (
                  sortedActive.map(task => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={handleToggle}
                      onStar={starTask}
                      onSelect={setSelectedTask}
                      onDelete={handleDelete}
                      isSelected={selectedTask?.id === task.id}
                    />
                  ))
                ) : (
                  <EmptyState
                    icon={ListTodo}
                    title="Your list is clear"
                    description="You've conquered everything for today. Ready to take on something new?"
                    actionLabel="Add a Task"
                    onAction={() => setShowAddModal(true)}
                    className="!bg-transparent !border-none !shadow-none py-20"
                  />
                )}
              </div>
            </AnimatePresence>

            {/* Completed Section */}
            {sortedCompleted.length > 0 && (
              <div className="border-t border-[#F2EBE3]/5">
                <button
                  onClick={() => setShowCompleted(!showCompleted)}
                  className="flex items-center gap-2 px-5 py-3 text-[13px] text-white/30 hover:text-white/50 transition-colors w-full"
                >
                  <motion.div animate={{ rotate: showCompleted ? 90 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronRight size={16} />
                  </motion.div>
                  Completed ({sortedCompleted.length})
                </button>
                <AnimatePresence>
                  {showCompleted && sortedCompleted.map(task => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={handleToggle}
                      onStar={starTask}
                      onSelect={setSelectedTask}
                      onDelete={handleDelete}
                      isSelected={selectedTask?.id === task.id}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: DETAIL PANEL ── */}
        <AnimatePresence>
          {selectedTask && (
            <TaskDetailPanel
              key={selectedTask.id}
              task={selectedTask}
              onClose={() => setSelectedTask(null)}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          )}
        </AnimatePresence>

        {/* ── BLEND WORKSPACE TASKS ── */}
        {blendWorkspace && blendTasks.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4 px-1">
              <div className="flex-1 h-px" style={{ background: 'var(--glass-border)' }} />
              <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--accent-color)' }}>
                <Users size={12} /> Blend: {blendWorkspace.name}
              </div>
              <div className="flex-1 h-px" style={{ background: 'var(--glass-border)' }} />
            </div>
            <div className="space-y-2">
              {blendTasks.map(t => (
                <motion.div key={t.id} layout
                  className="flex items-center gap-3 px-4 py-3 rounded-xl group"
                  style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
                  <button onClick={() => completeBlendTask(t.id)}
                    className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center"
                    style={{ border: '2px solid var(--glass-border)' }}>
                  </button>
                  <span className="flex-1 text-sm text-[var(--text-primary)]">{t.title}</span>
                  <Users size={10} style={{ color: 'var(--text-dim)', opacity: 0.3 }} />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ── DELETE CONFIRMATION DIALOG ── */}
        <ConfirmDialog
          open={!!deleteConfirm}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          title="Remove This Task?"
          message={`"${tasks.find(t => t.id === deleteConfirm)?.title || 'this task'}" will be permanently removed. Don't worry — you can undo this right after.`}
          confirmLabel="Yes, Remove It"
          cancelLabel="No, Keep It"
          variant="danger"
        />

        {/* ── ADD TASK MODAL ── */}
        <AnimatePresence>
          {showAddModal && (
            <AddTaskModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSave={handleAdd} taskLists={taskLists} initialCategory={activeFilter} />
          )}
        </AnimatePresence>

        {/* ── MOBILE FAB — Add Task above bottom nav ── */}
        <AnimatePresence>
          {!showAddModal && (
            <motion.button
              key="fab-task"
              className="md:hidden fixed right-5 z-[100] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center"
              style={{
                bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
                background: 'var(--accent-color)',
                boxShadow: '0 0 24px var(--accent-glow), 0 8px 20px rgba(0,0,0,0.4)',
                display: showAddModal ? 'none' : 'flex'
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileTap={{ scale: 0.88 }}
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={24} className="text-white" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </PullToRefresh>
  );
}
