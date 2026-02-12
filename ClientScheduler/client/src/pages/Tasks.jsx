import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Circle, CheckCircle2, Star, Trash2, Calendar as CalIcon,
  ChevronDown, ChevronRight, MoreVertical, X, Clock,
  ListTodo, SortAsc, Flag, Edit3, ArrowRight, FileText,
  User, Briefcase, Heart, Hash, BarChart3, Target, TrendingUp, Zap
} from 'lucide-react';
import { format, isToday, isTomorrow, isPast, startOfDay, addDays, subDays } from 'date-fns';
import { clsx } from 'clsx';
import { useData } from '../context/DataContext';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import ClockPicker from '../components/ClockPicker';

/* ═══════════════════════════════════════════════════════════════
   PRIORITY CONFIG
   ═══════════════════════════════════════════════════════════════ */
const PRIORITY_CONFIG = {
  high: { color: 'text-red-400', bg: 'bg-red-500/10', label: 'High', icon: '!' },
  medium: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Med' },
  low: { color: 'text-[#F2EBE3]/40', bg: 'bg-white/5', label: 'Low' },
};

const TASK_CATEGORIES = [
  { id: 'default', name: 'My Tasks', icon: ListTodo, color: '#C2185B' },
  { id: 'work', name: 'Work', icon: Briefcase, color: '#3b82f6' },
  { id: 'personal', name: 'Personal', icon: Heart, color: '#f97316' },
];

/* ═══════════════════════════════════════════════════════════════
   ADD TASK MODAL — Rich input form
   ═══════════════════════════════════════════════════════════════ */
const AddTaskModal = ({ isOpen, onClose, onSave, taskLists }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('default');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [recurrence, setRecurrence] = useState('none');
  const [showCatDropdown, setShowCatDropdown] = useState(false);
  const titleRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTitle(''); setDescription(''); setCategory('default');
      setPriority('medium'); setDueDate('');
      setDueTime(''); setRecurrence('none'); setShowCatDropdown(false);
      setTimeout(() => titleRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      id: Date.now().toString(),
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xl sm:p-4" onClick={onClose}>
      <motion.div initial={{ y: '100%', opacity: 0.8 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        onClick={e => e.stopPropagation()} className="w-full sm:max-w-md max-h-[92vh] sm:max-h-[85vh] flex flex-col glass-heavy glass-shine rounded-t-2xl sm:rounded-2xl overflow-hidden">
        {/* Drag handle for mobile */}
        <div className="sm:hidden flex justify-center pt-2 pb-0">
          <div className="w-10 h-1 rounded-full bg-[#F2EBE3]/20" />
        </div>
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-5 border-b border-[#F2EBE3]/5">
          <h3 className="text-lg font-medium text-[#F2EBE3] flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#C2185B]/10 flex items-center justify-center">
              <CheckCircle2 size={18} className="text-[#C2185B]" />
            </div>
            Add New Task
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-[#F2EBE3]/50"><X size={20} /></button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 space-y-5">
          {/* Task Title */}
          <div>
            <label className="text-xs text-[#F2EBE3]/60 uppercase tracking-wider font-bold mb-2 block">Task Title</label>
            <input ref={titleRef} value={title} onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()} placeholder="What needs to be done?"
              className="glass-input !border-[#C2185B]/20 focus:!border-[#C2185B]/40" />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-[#F2EBE3]/60 uppercase tracking-wider font-bold mb-2 block flex items-center gap-1.5">
              <FileText size={12} /> Description <span className="text-[#F2EBE3]/35 normal-case tracking-normal font-normal ml-1">(optional)</span>
            </label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Add details about this task..." rows={3}
              className="glass-input !text-sm resize-none" />
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <label className="text-xs text-[#F2EBE3]/60 uppercase tracking-wider font-bold mb-2 block">Category</label>
            <button onClick={() => setShowCatDropdown(!showCatDropdown)}
              className="w-full glass-input !py-3 flex items-center justify-between">
              <span className="flex items-center gap-2.5">
                <CatIcon size={16} style={{ color: selectedCat.color }} />
                <span className="text-[#F2EBE3]/80">{selectedCat.name}</span>
              </span>
              <ChevronDown size={16} className="text-[#F2EBE3]/30" />
            </button>
            <AnimatePresence>
              {showCatDropdown && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                  className="absolute top-full left-0 right-0 mt-1 glass-heavy rounded-xl border border-[#F2EBE3]/10 overflow-hidden z-20">
                  {TASK_CATEGORIES.map(cat => (
                    <button key={cat.id} onClick={() => { setCategory(cat.id); setShowCatDropdown(false); }}
                      className={clsx('w-full px-4 py-3 flex items-center gap-2.5 text-sm transition-all',
                        category === cat.id ? 'bg-white/[0.06] text-[#F2EBE3]' : 'text-[#F2EBE3]/50 hover:bg-white/[0.03]')}>
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
            <label className="text-xs text-[#F2EBE3]/40 uppercase tracking-wider font-bold mb-2 block">Priority</label>
            <div className="flex gap-2">
              {[
                { key: 'low', label: 'LOW', color: '#22c55e', bgActive: 'bg-green-500/15 border-green-500/40', bgInactive: 'border-green-500/20 text-green-400/40' },
                { key: 'medium', label: 'MEDIUM', color: '#f97316', bgActive: 'bg-orange-500/15 border-orange-500/40', bgInactive: 'border-orange-500/20 text-orange-400/40' },
                { key: 'high', label: 'HIGH', color: '#ef4444', bgActive: 'bg-red-500/15 border-red-500/40', bgInactive: 'border-red-500/20 text-red-400/40' },
              ].map(p => (
                <button key={p.key} onClick={() => setPriority(p.key)}
                  className={clsx('flex-1 py-2.5 rounded-xl text-xs font-bold tracking-wider border transition-all flex items-center justify-center gap-1.5',
                    priority === p.key ? p.bgActive : p.bgInactive)}>
                  <Flag size={13} style={{ color: p.color }} />
                  <span style={{ color: priority === p.key ? p.color : undefined }}>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time Row */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-[#F2EBE3]/40 uppercase tracking-wider font-bold mb-2 block flex items-center gap-1.5">
                <CalIcon size={12} /> Date <span className="text-[#F2EBE3]/20 normal-case tracking-normal font-normal ml-1">(optional)</span>
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
            <label className="text-xs text-[#F2EBE3]/40 uppercase tracking-wider font-bold mb-2 block">Repeat</label>
            <div className="flex gap-2">
              {[
                { key: 'none', label: 'Once' },
                { key: 'daily', label: 'Daily' },
                { key: 'weekly', label: 'Weekly' },
                { key: 'monthly', label: 'Monthly' },
              ].map(r => (
                <button key={r.key} onClick={() => setRecurrence(r.key)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    recurrence === r.key
                      ? 'border-[#C2185B]/40 bg-[#C2185B]/10 text-[#C2185B]'
                      : 'border-white/10 text-[#F2EBE3]/30 hover:border-white/20'
                  }`}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer — always visible at bottom */}
        <div className="flex-shrink-0 p-5 border-t border-[#F2EBE3]/5 flex justify-end gap-3" style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}>
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-[#F2EBE3]/40 text-sm hover:bg-white/5 transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={!title.trim()}
            className="px-6 py-2.5 rounded-xl bg-[#C2185B] text-white font-bold text-sm hover:shadow-[0_0_20px_rgba(194,24,91,0.3)] transition-all disabled:opacity-30 disabled:cursor-not-allowed">
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
  if (isToday(date)) return { text: 'Today', class: 'text-[#C2185B]' };
  if (isTomorrow(date)) return { text: 'Tomorrow', class: 'text-blue-400' };
  if (isPast(startOfDay(date))) return { text: format(date, 'MMM d'), class: 'text-red-400' };
  return { text: format(date, 'MMM d'), class: 'text-[#F2EBE3]/40' };
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
    onUpdate({ ...task, subtasks: [...task.subtasks, newSub] });
    setSubtaskInput('');
  };

  const toggleSubtask = (subId) => {
    onUpdate({
      ...task,
      subtasks: task.subtasks.map(s => s.id === subId ? { ...s, completed: !s.completed } : s)
    });
  };

  const deleteSubtask = (subId) => {
    onUpdate({ ...task, subtasks: task.subtasks.filter(s => s.id !== subId) });
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
      className="w-[380px] flex-shrink-0 border-l border-[#F2EBE3]/5 flex flex-col h-full"
      style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(30px) saturate(180%)', WebkitBackdropFilter: 'blur(30px) saturate(180%)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#F2EBE3]/5">
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-[#F2EBE3]/50 transition-colors"><X size={20} /></button>
        <div className="flex gap-1">
          <button onClick={cyclePriority}
            className={clsx('p-2 rounded-lg hover:bg-white/10 transition-colors', PRIORITY_CONFIG[task.priority].color)}
            title="Cycle priority">
            <Flag size={18} />
          </button>
          <button onClick={() => onUpdate({ ...task, starred: !task.starred })}
            className={clsx('p-2 rounded-lg hover:bg-white/10 transition-colors', task.starred ? 'text-yellow-400' : 'text-[#F2EBE3]/50')}>
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
          className="w-full bg-transparent text-lg font-medium text-[#F2EBE3] border-none outline-none placeholder:text-[#F2EBE3]/20"
          placeholder="Task title"
        />

        {/* Details */}
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          onBlur={saveChanges}
          placeholder="Add details"
          rows={3}
          className="glass-input !text-sm !text-[#F2EBE3]/70 resize-none"
        />

        {/* Due Date — clickable with mini date picker */}
        <div className="flex items-center gap-3 text-sm">
          <CalIcon size={16} className="text-[#F2EBE3]/40 flex-shrink-0" />
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
              className="text-left hover:bg-white/5 px-2 py-1 rounded-lg transition-colors"
            >
              {task.dueDate ? (
                <span className={formatDueDate(task.dueDate)?.class}>{formatDueDate(task.dueDate)?.text}</span>
              ) : (
                <span className="text-[#F2EBE3]/30">Add date</span>
              )}
            </button>
          )}
        </div>

        {/* Priority Badge */}
        <button onClick={cyclePriority} className="flex items-center gap-3 text-sm hover:bg-white/5 -mx-2 px-2 py-1 rounded-lg transition-colors">
          <Flag size={16} className="text-[#F2EBE3]/40" />
          <span className={clsx('px-3 py-1 rounded-full text-xs font-medium', PRIORITY_CONFIG[task.priority].bg, PRIORITY_CONFIG[task.priority].color)}>
            {PRIORITY_CONFIG[task.priority].label} Priority
          </span>
        </button>

        {/* Subtasks */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs text-[#F2EBE3]/60 uppercase tracking-wider font-bold">Subtasks</h4>
          <AnimatePresence>
            {task.subtasks.map(sub => (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                className="flex items-center gap-3 group py-1"
              >
                <button onClick={() => toggleSubtask(sub.id)} className="flex-shrink-0">
                  {sub.completed ? (
                    <CheckCircle2 size={18} className="text-[#C2185B]" />
                  ) : (
                    <Circle size={18} className="text-[#F2EBE3]/35 hover:text-[#C2185B] transition-colors" />
                  )}
                </button>
                <span className={clsx('flex-1 text-sm', sub.completed ? 'line-through text-[#F2EBE3]/30' : 'text-[#F2EBE3]/80')}>
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
            <Plus size={18} className="text-[#F2EBE3]/35 flex-shrink-0" />
            <input
              value={subtaskInput}
              onChange={(e) => setSubtaskInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addSubtask()}
              placeholder="Add subtask"
              className="flex-1 bg-transparent text-sm text-[#F2EBE3] placeholder:text-[#F2EBE3]/20 border-none outline-none"
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
  const subtasksDone = task.subtasks.filter(s => s.completed).length;
  const subtasksTotal = task.subtasks.length;
  const listColor = TASK_CATEGORIES.find(c => c.id === task.listId)?.color || '#C2185B';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, transition: { duration: 0.25 } }}
      onClick={() => onSelect(task)}
      className={clsx(
        'flex items-start gap-3.5 px-4 py-3.5 cursor-pointer group transition-all border-b border-[#F2EBE3]/[0.04]',
        isSelected
          ? 'bg-[#C2185B]/[0.04]'
          : 'hover:bg-white/[0.02]',
        task.completed && 'opacity-45'
      )}
      style={{
        borderLeft: `3px solid ${listColor}${task.completed ? '30' : '50'}`,
        background: isSelected
          ? `${listColor}08`
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
          <CheckCircle2 size={20} className="text-[#C2185B]" />
        ) : (
          <Circle size={20} className={clsx(
            'transition-colors',
            task.priority === 'high' ? 'text-red-400/60 hover:text-[#C2185B]' :
            task.priority === 'medium' ? 'text-yellow-400/40 hover:text-[#C2185B]' :
            'text-[#F2EBE3]/20 hover:text-[#C2185B]'
          )} />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className={clsx(
          'text-[14px] leading-snug transition-all',
          task.completed ? 'line-through text-[#F2EBE3]/30' : 'text-[#F2EBE3]/90'
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
            <span className="text-[12px] text-[#F2EBE3]/45">
              {subtasksDone}/{subtasksTotal}
            </span>
          )}
          {task.details && !task.completed && (
            <span className="text-[12px] text-[#F2EBE3]/35 truncate max-w-[140px]">{task.details}</span>
          )}
        </div>
      </div>

      {/* Action Buttons — always visible */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={(e) => { e.stopPropagation(); onSelect(task); }}
          className="p-1.5 rounded-lg text-[#F2EBE3]/50 hover:text-[#F2EBE3]/80 hover:bg-white/10 transition-all"
          title="Edit"
        >
          <Edit3 size={16} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onStar(task.id); }}
          className="p-1.5 rounded-lg transition-all"
        >
          <Star size={16} className={task.starred ? 'text-yellow-400 fill-yellow-400' : 'text-[#F2EBE3]/40 hover:text-yellow-400/70'} />
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
  const { addToast } = useToast();
  const isLight = theme === 'light';

  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [deleteConfirm, setDeleteConfirm] = useState(null); // task ID pending delete
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsFilter, setAnalyticsFilter] = useState(null); // 'overdue' | 'high' | 'pending' | null

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
        const ad = a.dueDate ? a.dueDate.getTime() : Infinity;
        const bd = b.dueDate ? b.dueDate.getTime() : Infinity;
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
    toggleTask(id);
    if (selectedTask?.id === id) {
      setSelectedTask(prev => prev ? { ...prev, completed: !prev.completed } : null);
    }
  }, [toggleTask, selectedTask]);

  const handleAdd = (taskData) => {
    addTask(taskData);
  };

  const handleUpdate = useCallback((updated) => {
    updateTask(updated);
    setSelectedTask(updated);
  }, [updateTask]);

  const handleDelete = useCallback((id) => {
    setDeleteConfirm(id);
  }, []);

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
  }, [tasks]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-[calc(100vh-100px)] flex flex-col md:flex-row rounded-2xl overflow-hidden glass-heavy glass-shine"
    >
      {/* ── MAIN TASK LIST ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header with filter chips */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-[#F2EBE3]/5 flex-shrink-0 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar">
            <h2 className="text-lg sm:text-xl font-medium tracking-tight text-[#F2EBE3] flex-shrink-0">Tasks</h2>
            {/* Filter chips */}
            <div className="flex gap-1.5 ml-2 sm:ml-4">
              <button
                onClick={() => { setActiveFilter('all'); setSelectedTask(null); }}
                className={clsx(
                  'px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap',
                  activeFilter === 'all'
                    ? 'border-[#C2185B]/30 text-[#C2185B] bg-[#C2185B]/10'
                    : 'border-[#F2EBE3]/10 text-[#F2EBE3]/35 hover:border-[#F2EBE3]/20'
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
                        ? 'bg-white/[0.08] text-[#F2EBE3] font-semibold'
                        : 'border-[#F2EBE3]/10 text-[#F2EBE3]/35 hover:border-[#F2EBE3]/20'
                    )}
                    style={activeFilter === list.id ? { borderColor: list.color + '50' } : {}}
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
                  ? 'border-[#C2185B]/30 text-[#C2185B] bg-[#C2185B]/10'
                  : 'border-[#C2185B]/15 text-[#C2185B]/70 bg-[#C2185B]/[0.04] hover:bg-[#C2185B]/10 hover:border-[#C2185B]/25'
              )}
            >
              <BarChart3 size={13} />
              Analytics
            </button>
            <button
              onClick={() => setSortBy(s => s === 'date' ? 'priority' : s === 'priority' ? 'name' : 'date')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] text-[#F2EBE3]/35 hover:bg-white/5 border border-[#F2EBE3]/[0.06] transition-colors uppercase tracking-wider font-medium"
            >
              <SortAsc size={13} />
              {sortBy}
            </button>
          </div>
        </div>

        {/* Add Task Button — opens rich modal */}
        <div className="px-5 py-3 border-b border-[#F2EBE3]/5 flex-shrink-0 flex items-center gap-3">
          <button onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C2185B]/10 border border-[#C2185B]/25 text-[#C2185B] text-sm font-medium hover:bg-[#C2185B]/15 hover:border-[#C2185B]/40 transition-all">
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
              className="overflow-hidden border-b border-[#F2EBE3]/5"
            >
              <div className="p-5 space-y-4">
                {/* Completion Rate + Quick Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-xl p-3 border border-[#F2EBE3]/[0.06] cursor-default" style={{ background: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)' }}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <TrendingUp size={12} className="text-accent-visor" />
                      <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: isLight ? 'rgba(26,26,26,0.4)' : 'rgba(242,235,227,0.4)' }}>Completion</span>
                    </div>
                    <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{analytics.completionRate}%</span>
                    <span className="text-[10px] ml-1.5" style={{ color: isLight ? 'rgba(26,26,26,0.35)' : 'rgba(242,235,227,0.35)' }}>{analytics.completedCount}/{analytics.totalTasks}</span>
                  </div>
                  <div onClick={() => setAnalyticsFilter(f => f === 'overdue' ? null : 'overdue')}
                    className={clsx('rounded-xl p-3 border cursor-pointer transition-all hover:scale-[1.02]', analyticsFilter === 'overdue' ? 'ring-1 ring-red-400/50' : '')}
                    style={{ background: analytics.overdue > 0 ? 'rgba(239,68,68,0.06)' : isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)', borderColor: analyticsFilter === 'overdue' ? 'rgba(239,68,68,0.3)' : 'rgba(242,235,227,0.06)' }}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Clock size={12} className={analytics.overdue > 0 ? 'text-red-400' : 'text-accent-visor'} />
                      <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: isLight ? 'rgba(26,26,26,0.4)' : 'rgba(242,235,227,0.4)' }}>Overdue</span>
                    </div>
                    <span className={clsx('text-xl font-bold', analytics.overdue > 0 ? 'text-red-400' : '')} style={analytics.overdue === 0 ? { color: 'var(--text-primary)' } : {}}>{analytics.overdue}</span>
                  </div>
                  <div onClick={() => setAnalyticsFilter(f => f === 'high' ? null : 'high')}
                    className={clsx('rounded-xl p-3 border cursor-pointer transition-all hover:scale-[1.02]', analyticsFilter === 'high' ? 'ring-1 ring-red-400/50' : '')}
                    style={{ background: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)', borderColor: analyticsFilter === 'high' ? 'rgba(239,68,68,0.3)' : 'rgba(242,235,227,0.06)' }}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Flag size={12} className="text-red-400" />
                      <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: isLight ? 'rgba(26,26,26,0.4)' : 'rgba(242,235,227,0.4)' }}>High</span>
                    </div>
                    <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{analytics.highP}</span>
                  </div>
                  <div onClick={() => setAnalyticsFilter(f => f === 'pending' ? null : 'pending')}
                    className={clsx('rounded-xl p-3 border cursor-pointer transition-all hover:scale-[1.02]', analyticsFilter === 'pending' ? 'ring-1 ring-accent-visor/50' : '')}
                    style={{ background: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)', borderColor: analyticsFilter === 'pending' ? 'var(--accent-color)' : 'rgba(242,235,227,0.06)' }}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Zap size={12} className="text-accent-visor" />
                      <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: isLight ? 'rgba(26,26,26,0.4)' : 'rgba(242,235,227,0.4)' }}>Pending</span>
                    </div>
                    <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{analytics.totalTasks - analytics.completedCount}</span>
                  </div>
                </div>

                {/* Weekly Bar Chart + Priority Breakdown side-by-side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Weekly Trend */}
                  <div className="rounded-xl p-4 border border-[#F2EBE3]/[0.06]" style={{ background: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)' }}>
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
                  <div className="rounded-xl p-4 border border-[#F2EBE3]/[0.06]" style={{ background: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)' }}>
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
                  <div className="rounded-xl p-4 border border-[#F2EBE3]/[0.06]" style={{ background: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)' }}>
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
            {sortedActive.map(task => (
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

          {sortedActive.length === 0 && (
            <div className="text-center py-20">
              <ListTodo size={40} className="text-[#F2EBE3]/[0.06] mx-auto mb-4" />
              <p className="text-[#F2EBE3]/25 text-sm font-medium">No tasks yet</p>
              <p className="text-[#F2EBE3]/15 text-xs mt-1">Add one above to get started</p>
            </div>
          )}

          {/* Completed Section */}
          {sortedCompleted.length > 0 && (
            <div className="border-t border-[#F2EBE3]/5">
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className="flex items-center gap-2 px-5 py-3 text-[13px] text-[#F2EBE3]/30 hover:text-[#F2EBE3]/50 transition-colors w-full"
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
          <AddTaskModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSave={handleAdd} taskLists={taskLists} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
