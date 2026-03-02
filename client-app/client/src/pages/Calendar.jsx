import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Plus, X, Clock, MapPin,
  Calendar as CalIcon, Trash2, GripVertical, Check, AlertTriangle,
  Download, ExternalLink
} from 'lucide-react';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addMonths, subMonths, addWeeks, subWeeks,
  isSameMonth, isSameDay, isToday, getHours, getMinutes,
  setHours, setMinutes, startOfDay, differenceInMinutes,
  parseISO, addHours, eachDayOfInterval, addYears, isBefore, isAfter
} from 'date-fns';
import { clsx } from 'clsx';
import { useData, getUserScopedKey } from '../context/DataContext';

/* ═══════════════════════════════════════════════════════════════
   COLOR PALETTE FOR EVENT CATEGORIES
   ═══════════════════════════════════════════════════════════════ */
const CATEGORY_COLORS = {
  Work: { bg: 'bg-blue-500/15', border: 'border-blue-500', text: 'text-blue-400', dot: 'bg-blue-500', hex: '#3b82f6' },
  Meeting: { bg: 'bg-purple-500/15', border: 'border-purple-500', text: 'text-purple-400', dot: 'bg-purple-500', hex: '#a855f7' },
  Personal: { bg: 'bg-[var(--accent-color)]/10', border: 'border-[var(--accent-color)]', text: 'text-[var(--accent-color)]', dot: 'bg-[var(--accent-color)]', hex: 'var(--accent-color)' },
  Health: { bg: 'bg-orange-500/15', border: 'border-orange-500', text: 'text-orange-400', dot: 'bg-orange-500', hex: '#f97316' },
  Focus: { bg: 'bg-[var(--accent-color)]/10', border: 'border-[var(--accent-color)]', text: 'text-[var(--accent-color)]', dot: 'bg-[var(--accent-color)]', hex: 'var(--accent-color)' },
  default: { bg: 'bg-[var(--text-dim)]/10', border: 'border-[var(--text-dim)]/30', text: 'text-[var(--text-primary)]', dot: 'bg-[var(--text-dim)]', hex: 'var(--text-dim)' },
};

const getColor = (cat) => CATEGORY_COLORS[cat] || CATEGORY_COLORS.default;

/* Get the display color for an event — prefers custom eventColor/habitColor, falls back to category */
const getEventDisplayColor = (evt) => {
  const customHex = evt.eventColor || evt.habitColor;
  if (customHex && customHex !== '#3b82f6') {
    // Return inline-style-friendly object for custom colors
    return {
      hex: customHex,
      isCustom: true,
      bg: `${customHex}22`,        // 13% opacity
      text: customHex,
      border: customHex,
    };
  }
  const cat = getColor(evt.category);
  return { hex: cat.hex, isCustom: false, ...cat };
};

/* ═══════════════════════════════════════════════════════════════
   GOOGLE CALENDAR EXPORT UTILITIES
   ═══════════════════════════════════════════════════════════════ */
const toICSDate = (d) => {
  const dt = new Date(d);
  return dt.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
};

const buildGoogleCalendarUrl = (evt) => {
  const start = new Date(evt.start);
  const end = new Date(evt.end || addHours(start, 1));
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: evt.title || 'Event',
    dates: `${toICSDate(start)}/${toICSDate(end)}`,
    ...(evt.location && { location: evt.location }),
    ...(evt.description && { details: evt.description }),
  });
  return `https://www.google.com/calendar/render?${params}`;
};

const exportEventsAsICS = (events) => {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Mithra Life OS//EN',
    'CALSCALE:GREGORIAN',
  ];
  events.forEach(evt => {
    const start = new Date(evt.start);
    const end = new Date(evt.end || addHours(start, 1));
    lines.push(
      'BEGIN:VEVENT',
      `DTSTART:${toICSDate(start)}`,
      `DTEND:${toICSDate(end)}`,
      `SUMMARY:${(evt.title || 'Event').replace(/[,;]/g, ' ')}`,
      ...(evt.location ? [`LOCATION:${evt.location.replace(/[,;]/g, ' ')}`] : []),
      ...(evt.description ? [`DESCRIPTION:${evt.description.replace(/\n/g, '\\n').replace(/[,;]/g, ' ')}`] : []),
      `UID:${evt.id || Date.now()}@mithra.ai`,
      'END:VEVENT',
    );
  });
  lines.push('END:VCALENDAR');
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'mithra-calendar.ics';
  a.click();
  URL.revokeObjectURL(url);
};

/* ═══════════════════════════════════════════════════════════════
   OVERLAP DETECTION — Column-based layout for overlapping events
   ═══════════════════════════════════════════════════════════════ */
const computeEventColumns = (events) => {
  if (!events.length) return [];

  // Sort by start time, then by duration (longer first)
  const sorted = [...events].sort((a, b) => {
    const diff = a.start - b.start;
    if (diff !== 0) return diff;
    return (b.end - b.start) - (a.end - a.start);
  });

  // Assign columns using greedy algorithm
  const columns = []; // array of arrays of events
  const eventMeta = new Map(); // eventId → { col, totalCols }

  sorted.forEach(evt => {
    let placed = false;
    for (let col = 0; col < columns.length; col++) {
      const lastInCol = columns[col][columns[col].length - 1];
      // No overlap if event starts at or after the last event ends
      if (evt.start >= lastInCol.end) {
        columns[col].push(evt);
        eventMeta.set(evt.id, { col });
        placed = true;
        break;
      }
    }
    if (!placed) {
      columns.push([evt]);
      eventMeta.set(evt.id, { col: columns.length - 1 });
    }
  });

  // Find overlapping groups and set totalCols per group
  const groups = [];
  sorted.forEach(evt => {
    let addedToGroup = false;
    for (const group of groups) {
      const overlaps = group.some(g => evt.start < g.end && evt.end > g.start);
      if (overlaps) {
        group.push(evt);
        addedToGroup = true;
        break;
      }
    }
    if (!addedToGroup) groups.push([evt]);
  });

  groups.forEach(group => {
    // Determine the maximum column index used within this group
    const maxColIndex = group.reduce((max, e) => Math.max(max, eventMeta.get(e.id).col), 0);
    const totalCols = maxColIndex + 1;

    group.forEach(e => {
      eventMeta.get(e.id).totalCols = totalCols;
    });
  });

  return sorted.map(evt => ({
    ...evt,
    _col: eventMeta.get(evt.id).col,
    _totalCols: eventMeta.get(evt.id).totalCols,
  }));
};

/* ═══════════════════════════════════════════════════════════════
   LOAD/SAVE EVENTS FROM LOCALSTORAGE
   ═══════════════════════════════════════════════════════════════ */
const loadEvents = () => {
  try {
    const stored = localStorage.getItem(getUserScopedKey('calendar-events'));
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map(e => ({
        ...e,
        start: new Date(e.start),
        end: new Date(e.end),
      }));
    }
  } catch { }
  return null;
};

const saveEvents = (events) => {
  try {
    try {
      localStorage.setItem(getUserScopedKey('calendar-events'), JSON.stringify(events));
    } catch (e) {
      console.warn('Failed to save calendar events:', e.message);
    }
  } catch { }
};

/* ═══════════════════════════════════════════════════════════════
   REPEAT EVENT EXPANSION — generates occurrences for repeating events
   within a given date window (±90 days from today)
   ═══════════════════════════════════════════════════════════════ */
const expandRepeatingEvents = (events) => {
  const windowStart = addDays(startOfDay(new Date()), -90);
  const windowEnd = addDays(startOfDay(new Date()), 180);
  const expanded = [];

  events.forEach(evt => {
    expanded.push(evt); // always include the original

    if (!evt.repeat || evt.repeat === 'Does not repeat') return;

    const durationMs = evt.end.getTime() - evt.start.getTime();
    let currentDate = new Date(evt.start);
    let occurrenceCount = 0;
    const maxOccurrences = 365; // safety limit

    while (occurrenceCount < maxOccurrences) {
      // Advance to next occurrence
      if (evt.repeat === 'Daily') {
        currentDate = addDays(currentDate, 1);
      } else if (evt.repeat === 'Weekly') {
        currentDate = addDays(currentDate, 7);
      } else if (evt.repeat === 'Monthly') {
        currentDate = addMonths(currentDate, 1);
      } else if (evt.repeat === 'Yearly') {
        currentDate = addYears(currentDate, 1);
      } else {
        break;
      }

      if (isAfter(currentDate, windowEnd)) break;
      if (isBefore(currentDate, windowStart)) {
        occurrenceCount++;
        continue;
      }

      const newStart = new Date(currentDate);
      const newEnd = new Date(newStart.getTime() + durationMs);

      expanded.push({
        ...evt,
        id: `${evt.id}-repeat-${occurrenceCount}`,
        start: newStart,
        end: newEnd,
        isRepeatInstance: true,
        originalId: evt.id,
      });
      occurrenceCount++;
    }
  });

  return expanded;
};

/* ═══════════════════════════════════════════════════════════════
   INITIAL EVENTS
   ═══════════════════════════════════════════════════════════════ */
const now = new Date();
const makeEvent = (id, title, dayOffset, startH, startM, endH, endM, category) => ({
  id,
  title,
  start: setMinutes(setHours(addDays(startOfDay(now), dayOffset), startH), startM),
  end: setMinutes(setHours(addDays(startOfDay(now), dayOffset), endH), endM),
  category,
  location: '',
  description: '',
});

/* No mock events — start with empty calendar */
const INITIAL_EVENTS = [];

/* ═══════════════════════════════════════════════════════════════
   HOUR LABELS (6AM - 11PM)
   ═══════════════════════════════════════════════════════════════ */
const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 6..23
const HOUR_HEIGHT = 60; // px per hour

/* ═══════════════════════════════════════════════════════════════
   MINI CALENDAR (Sidebar)
   ═══════════════════════════════════════════════════════════════ */
const MiniCalendar = ({ currentDate, onDateClick, events }) => {
  const { accentColor } = useData();
  const [viewMonth, setViewMonth] = useState(startOfMonth(currentDate));

  // Keep viewMonth in sync when parent navigates months
  useEffect(() => {
    setViewMonth(startOfMonth(currentDate));
  }, [currentDate]);

  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const hasEvent = (day) => events.some(e => isSameDay(e.start, day));

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">{format(viewMonth, 'MMMM yyyy')}</h3>
        <div className="flex gap-1">
          <button aria-label="Previous month" onClick={() => setViewMonth(subMonths(viewMonth, 1))} className="p-1 rounded hover:bg-[var(--glass-bg-hover)] text-[var(--text-dim)]"><ChevronLeft size={16} /></button>
          <button aria-label="Next month" onClick={() => setViewMonth(addMonths(viewMonth, 1))} className="p-1 rounded hover:bg-[var(--glass-bg-hover)] text-[var(--text-dim)]"><ChevronRight size={16} /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0 text-center text-xs font-medium text-[var(--text-dim)] opacity-50 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <span key={i}>{d}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-0">
        {days.map((day, i) => {
          const inMonth = isSameMonth(day, viewMonth);
          const selected = isSameDay(day, currentDate);
          const todayMark = isToday(day);
          return (
            <button
              key={i}
              onClick={() => onDateClick(day)}
              className={clsx(
                'aspect-square flex flex-col items-center justify-center rounded-full text-xs relative transition-all',
                !inMonth && 'opacity-20',
                selected && 'text-white font-bold',
                todayMark && !selected && 'font-bold',
                !selected && inMonth && 'text-[var(--text-dim)] hover:bg-[var(--glass-bg-hover)]',
              )}
              style={selected ? { backgroundColor: 'var(--accent-color)' } : todayMark ? { color: 'var(--accent-color)' } : {}}
            >
              {format(day, 'd')}
              {hasEvent(day) && !selected && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--accent-color)' }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   EVENT CREATION / EDIT MODAL — Google Calendar-style redesign
   ═══════════════════════════════════════════════════════════════ */
const EVENT_COLORS = [
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Red', hex: '#ef4444' },
  { name: 'Yellow', hex: '#eab308' },
  { name: 'Maroon', hex: 'var(--accent-color)' },
  { name: 'Orange', hex: '#f97316' },
  { name: 'Purple', hex: '#a855f7' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Cyan', hex: '#06b6d4' },
];

const REPEAT_OPTIONS = ['Does not repeat', 'Daily', 'Weekly', 'Monthly', 'Yearly'];

const EventModal = ({ isOpen, onClose, onSave, onDelete, event, selectedDate }) => {
  const { accentColor } = useData();
  const isSynced = event?.isTask || event?.isHabit;
  const [title, setTitle] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('10:00');
  const [location, setLocation] = useState('');
  const [eventColor, setEventColor] = useState('#3b82f6');
  const [repeat, setRepeat] = useState('Does not repeat');
  const [category, setCategory] = useState('Work');
  const [description, setDescription] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const titleRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setShowDeleteConfirm(false);
      if (event) {
        setTitle(event.title);
        setAllDay(event.allDay || false);
        setStartDate(format(event.start, 'yyyy-MM-dd'));
        setStartTime(format(event.start, 'HH:mm'));
        setEndDate(format(event.end, 'yyyy-MM-dd'));
        setEndTime(format(event.end, 'HH:mm'));
        setLocation(event.location || '');
        setEventColor(event.eventColor || getColor(event.category).hex || '#3b82f6');
        setRepeat(event.repeat || 'Does not repeat');
        setCategory(event.category || 'Work');
        setDescription(event.description || '');
      } else {
        setTitle('');
        setAllDay(false);
        const day = selectedDate || new Date();
        setStartDate(format(day, 'yyyy-MM-dd'));
        setEndDate(format(day, 'yyyy-MM-dd'));
        const slotHour = selectedDate ? getHours(selectedDate) : 9;
        const slotMin = selectedDate ? getMinutes(selectedDate) : 0;
        setStartTime(`${String(slotHour).padStart(2, '0')}:${String(slotMin).padStart(2, '0')}`);
        setEndTime(`${String(Math.min(slotHour + 1, 23)).padStart(2, '0')}:${String(slotMin).padStart(2, '0')}`);
        setLocation('');
        setEventColor('#3b82f6');
        setRepeat('Does not repeat');
        setCategory('Work');
        setDescription('');
      }
      setTimeout(() => titleRef.current?.focus(), 100);
    }
  }, [isOpen, event, selectedDate]);

  // Auto-adjust end time when start time changes (keep same duration, minimum 30min)
  const handleStartTimeChange = (newStartTime) => {
    const [sh, sm] = newStartTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const startMins = sh * 60 + sm;
    const endMins = eh * 60 + em;
    const currentDuration = endMins - startMins;

    setStartTime(newStartTime);

    // If end would be before start, push it forward keeping at least 30 min
    if (currentDuration <= 0) {
      const newEndMins = Math.min(startMins + 60, 24 * 60 - 1);
      const newEh = Math.floor(newEndMins / 60);
      const newEm = newEndMins % 60;
      setEndTime(`${String(newEh).padStart(2, '0')}:${String(newEm).padStart(2, '0')}`);
    }
  };

  const handleEndTimeChange = (newEndTime) => {
    setEndTime(newEndTime);
  };

  const handleSave = () => {
    if (!title.trim()) return;
    const sDay = startDate ? new Date(startDate + 'T00:00:00') : startOfDay(new Date());
    const eDay = endDate ? new Date(endDate + 'T00:00:00') : sDay;
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);

    const computedStart = allDay ? startOfDay(sDay) : setMinutes(setHours(sDay, sh), sm);
    const computedEnd = allDay ? startOfDay(eDay) : setMinutes(setHours(eDay, eh), em);

    // If end is before or equal to start (same day), push end to next day or fix
    let finalEnd = computedEnd;
    if (!allDay && finalEnd <= computedStart) {
      finalEnd = new Date(computedStart.getTime() + 60 * 60 * 1000); // default 1hr
    }

    onSave({
      id: event?.id || Date.now().toString(),
      title: title.trim(),
      start: computedStart,
      end: finalEnd,
      category,
      location,
      description,
      allDay,
      eventColor,
      repeat,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-xl p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl overflow-hidden glass-heavy glass-shine max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 flex-shrink-0">
              <h3 className="text-lg font-medium text-[var(--text-primary)] flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[var(--accent-color)]/15 flex items-center justify-center">
                  <CalIcon size={18} className="text-[var(--accent-color)]" />
                </div>
                {event ? 'Edit Event' : 'Add Event'}
              </h3>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--glass-bg-hover)] text-[var(--text-dim)]"><X size={20} /></button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-5 overflow-y-auto flex-1">
              {/* Synced event notice */}
              {isSynced && (
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-blue-500/8 border border-blue-500/15 text-blue-300/80 text-xs">
                  <span>{event.isTask ? '📋' : '🔄'}</span>
                  <span>This event is synced from <strong>{event.isTask ? 'Tasks' : 'Habits'}</strong>. Edit it there to make changes.</span>
                </div>
              )}
              {/* Title */}
              <div>
                <label className="text-xs text-[var(--text-dim)] uppercase tracking-wider font-bold mb-2 block opacity-60">Event Title</label>
                <input
                  ref={titleRef}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Add title"
                  className="glass-input !text-lg !font-light !bg-[var(--glass-bg)]"
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                />
              </div>

              {/* All Day Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-dim)]">All day</span>
                <button onClick={() => setAllDay(!allDay)}
                  className={clsx('w-11 h-6 rounded-full transition-all relative', !allDay && 'bg-[var(--glass-border)]/50')}
                  style={allDay ? { backgroundColor: 'var(--accent-color)' } : {}}>
                  <motion.div animate={{ x: allDay ? 20 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className={clsx('w-5 h-5 rounded-full absolute top-0.5', allDay ? 'bg-white' : 'bg-[var(--text-dim)] opacity-40')} />
                </button>
              </div>

              {/* Start Date/Time Row */}
              <div className="flex items-center gap-3">
                <CalIcon size={16} className="text-[var(--text-dim)] opacity-40 flex-shrink-0" />
                <div className="flex-1">
                  <label className="text-[11px] text-[var(--text-dim)] uppercase tracking-wider mb-1 block opacity-50">Start</label>
                  <div className="flex gap-2">
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                      className="glass-input !py-2 !px-3 !text-sm flex-1 !bg-[var(--glass-bg)]" />
                    {!allDay && (
                      <input type="time" value={startTime} onChange={e => handleStartTimeChange(e.target.value)}
                        className="glass-input !py-2 !px-3 !text-sm !w-auto !bg-[var(--glass-bg)]" />
                    )}
                  </div>
                </div>
              </div>

              {/* End Date/Time Row */}
              <div className="flex items-center gap-3">
                <Clock size={16} className="text-[var(--text-dim)] opacity-40 flex-shrink-0" />
                <div className="flex-1">
                  <label className="text-[11px] text-[var(--text-dim)] uppercase tracking-wider mb-1 block opacity-50">End</label>
                  <div className="flex gap-2">
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                      className="glass-input !py-2 !px-3 !text-sm flex-1 !bg-[var(--glass-bg)]" />
                    {!allDay && (
                      <input type="time" value={endTime} onChange={e => handleEndTimeChange(e.target.value)}
                        className="glass-input !py-2 !px-3 !text-sm !w-auto !bg-[var(--glass-bg)]" />
                    )}
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-[var(--text-dim)] opacity-40 flex-shrink-0" />
                <input value={location} onChange={e => setLocation(e.target.value)}
                  placeholder="Add location" className="flex-1 glass-input !py-2 !px-3 !text-sm !bg-[var(--glass-bg)]" />
              </div>

              {/* Color Picker */}
              <div>
                <label className="text-xs text-[var(--text-dim)] uppercase tracking-wider font-bold mb-3 block opacity-60">Color</label>
                <div className="flex gap-3 flex-wrap">
                  {EVENT_COLORS.map(c => (
                    <button key={c.hex} onClick={() => setEventColor(c.hex)}
                      className={clsx('w-8 h-8 rounded-full transition-all', eventColor === c.hex ? 'scale-110 ring-2 ring-offset-2 ring-offset-[var(--body-bg)]' : 'hover:scale-105')}
                      style={{ backgroundColor: c.hex.startsWith('var') ? `var(--accent-color)` : c.hex }} />
                  ))}
                </div>
              </div>

              {/* Repeat */}
              <div>
                <label className="text-xs text-[var(--text-dim)] uppercase tracking-wider font-bold mb-2 block opacity-60">Repeat</label>
                <select value={repeat} onChange={e => setRepeat(e.target.value)}
                  className="glass-input !py-2.5 !text-sm appearance-none cursor-pointer !bg-[var(--glass-bg)]">
                  {REPEAT_OPTIONS.map(opt => <option key={opt} value={opt} className="bg-[var(--body-bg)] text-[var(--text-primary)]">{opt}</option>)}
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-5 flex-shrink-0">
              {event ? (
                event.isTask || event.isHabit ? (
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-[var(--glass-bg)] text-xs text-[var(--text-dim)]">
                      {event.isTask ? '📋 From Tasks' : '🔄 From Habits'}
                    </span>
                    <button onClick={() => setShowDeleteConfirm(true)} className="px-3 py-1.5 rounded-lg text-red-400 text-xs hover:bg-red-500/10 transition-colors flex items-center gap-1.5">
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setShowDeleteConfirm(true)} className="px-4 py-2 rounded-lg text-red-400 text-sm hover:bg-red-500/10 transition-colors flex items-center gap-2">
                    <Trash2 size={16} /> Delete
                  </button>
                )
              ) : <div />}
              <div className="flex gap-3">
                <button onClick={onClose} className="px-5 py-2.5 rounded-lg text-[var(--text-dim)] text-sm hover:bg-[var(--glass-bg-hover)] transition-colors">Cancel</button>
                <button onClick={handleSave} disabled={isSynced} className={clsx('px-6 py-2.5 rounded-lg text-white text-sm font-semibold transition-colors', isSynced ? 'opacity-40 cursor-not-allowed' : 'hover:opacity-90')} style={{ backgroundColor: 'var(--accent-color)' }}>Save</button>
              </div>
            </div>

            {/* Delete Confirmation Overlay */}
            <AnimatePresence>
              {showDeleteConfirm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-10 flex items-center justify-center bg-black/70 backdrop-blur-sm rounded-2xl"
                >
                  <motion.div
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.85, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="glass-heavy glass-shine rounded-2xl p-6 max-w-sm mx-4 text-center space-y-4"
                  >
                    <div className="w-14 h-14 rounded-full bg-red-500/15 border border-red-500/25 flex items-center justify-center mx-auto">
                      <AlertTriangle size={28} className="text-red-400" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                        {event?.isTask ? 'Delete Task?' : event?.isHabit ? 'Delete Habit?' : 'Delete Event?'}
                      </h4>
                      <p className="text-sm text-[var(--text-dim)] opacity-60">
                        <span className="font-medium text-red-300">"{title}"</span> will be permanently removed
                        {event?.isTask ? ' from Tasks.' : event?.isHabit ? ' from Habits.' : ' from your calendar.'}
                      </p>
                    </div>
                    <div className="flex gap-3 justify-center pt-1">
                      <button onClick={() => setShowDeleteConfirm(false)}
                        className="px-5 py-2.5 rounded-xl text-[var(--text-dim)] text-sm font-medium hover:bg-[var(--glass-bg-hover)] transition-colors">
                        Keep It
                      </button>
                      <button onClick={() => { onDelete(event.id); onClose(); }}
                        className="px-5 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                        Yes, Delete
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ═══════════════════════════════════════════════════════════════
   WEEK VIEW — THE CORE (Google Calendar Style)
   ═══════════════════════════════════════════════════════════════ */
const WeekView = ({ currentDate, events, onEventClick, onSlotClick }) => {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const gridRef = useRef(null);

  // Current time indicator
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  // Scroll to 8AM on mount
  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.scrollTop = 2 * HOUR_HEIGHT; // 6 + 2 = 8AM
    }
  }, []);

  const getEventsForDay = (day) => events.filter(e => isSameDay(e.start, day));

  const getEventStyle = (event) => {
    const startMin = getHours(event.start) * 60 + getMinutes(event.start);
    const endMin = getHours(event.end) * 60 + getMinutes(event.end);
    const top = ((startMin - 360) / 60) * HOUR_HEIGHT; // 360 = 6 * 60 (start at 6AM)
    const height = Math.max(((endMin - startMin) / 60) * HOUR_HEIGHT, 24);
    return { top: `${top}px`, height: `${height}px` };
  };

  const nowTop = useMemo(() => {
    const mins = getHours(currentTime) * 60 + getMinutes(currentTime);
    return ((mins - 360) / 60) * HOUR_HEIGHT;
  }, [currentTime]);

  // Handle click on empty slot
  const handleGridClick = (e, day) => {
    if (e.target !== e.currentTarget) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const hour = Math.floor(y / HOUR_HEIGHT) + 6;
    const roundedHour = Math.min(Math.max(hour, 6), 23);
    onSlotClick(day, roundedHour);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Day Headers */}
      <div className="flex border-b border-white/[0.04] flex-shrink-0">
        <div className="w-10 sm:w-16 flex-shrink-0" /> {/* gutter */}
        {weekDays.map((day, i) => (
          <div key={i} className={clsx('flex-1 text-center py-2 sm:py-3 border-l border-white/[0.04]', isToday(day) && 'bg-[var(--accent-color)]/5')}>
            <div className="text-[10px] sm:text-xs text-[var(--text-dim)] uppercase tracking-wider opacity-50">{format(day, 'EEEEE')}<span className="hidden sm:inline">{format(day, 'EEE').slice(1)}</span></div>
            <div className={clsx(
              'text-lg sm:text-2xl font-light mt-0.5 sm:mt-1',
              isToday(day) ? 'text-[var(--accent-color)]' : 'text-[var(--text-primary)]',
              isSameDay(day, currentDate) && !isToday(day) && 'text-[var(--text-primary)]'
            )}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>

      {/* Time Grid */}
      <div ref={gridRef} className="flex-1 overflow-y-auto relative" style={{ scrollbarWidth: 'thin' }}>
        <div className="flex relative" style={{ height: `${HOURS.length * HOUR_HEIGHT}px` }}>
          {/* Hour Labels */}
          <div className="w-10 sm:w-16 flex-shrink-0 relative">
            {HOURS.map((hour) => (
              <div key={hour} className="absolute w-full text-right pr-1 sm:pr-3 text-[10px] sm:text-xs text-[var(--text-dim)] -mt-2 opacity-50" style={{ top: `${(hour - 6) * HOUR_HEIGHT}px` }}>
                {hour === 0 ? '12a' : hour < 12 ? `${hour}a` : hour === 12 ? '12p' : `${hour - 12}p`}
              </div>
            ))}
          </div>

          {/* Day Columns */}
          {weekDays.map((day, col) => {
            const dayEvents = getEventsForDay(day);
            const layoutEvents = computeEventColumns(dayEvents);
            const showNowLine = isToday(day);
            return (
              <div
                key={col}
                className={clsx('flex-1 relative border-l border-white/[0.04]', isToday(day) && 'bg-[var(--accent-color)]/[0.02]')}
                onClick={(e) => handleGridClick(e, day)}
              >
                {/* Hour grid lines */}
                {HOURS.map((hour) => (
                  <div key={hour} className="absolute w-full border-t border-white/[0.04]" style={{ top: `${(hour - 6) * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }} />
                ))}

                {/* Events */}
                {layoutEvents.map((evt) => {
                  const style = getEventStyle(evt);
                  const dc = getEventDisplayColor(evt);
                  const colWidth = 100 / evt._totalCols;
                  const colLeft = evt._col * colWidth;
                  return (
                    <motion.div
                      key={evt.id}
                      layoutId={evt.id}
                      onClick={(e) => { e.stopPropagation(); onEventClick(evt); }}
                      className={clsx(
                        'absolute rounded-lg px-2 py-1.5 cursor-pointer border-l-[3px] overflow-hidden group transition-shadow',
                        !dc.isCustom && dc.bg, !dc.isCustom && dc.border,
                        'hover:shadow-lg hover:z-20'
                      )}
                      style={{
                        ...style,
                        left: `calc(${colLeft}% + 2px)`,
                        width: `calc(${colWidth}% - 4px)`,
                        ...(dc.isCustom ? { backgroundColor: dc.bg, borderLeftColor: dc.border } : {}),
                      }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className={clsx('text-xs font-semibold truncate', !dc.isCustom && dc.text)} style={dc.isCustom ? { color: dc.text } : {}}>{evt.title}</div>
                      <div className="text-[10px] text-[var(--text-dim)] opacity-60 mt-0.5">
                        {format(evt.start, 'h:mm a')} – {format(evt.end, 'h:mm a')}
                      </div>
                      {evt.location && <div className="text-[10px] text-[var(--text-dim)] opacity-40 truncate">{evt.location}</div>}
                    </motion.div>
                  );
                })}

                {/* Now indicator */}
                {showNowLine && nowTop > 0 && nowTop < HOURS.length * HOUR_HEIGHT && (
                  <div className="absolute left-0 right-0 z-30 pointer-events-none" style={{ top: `${nowTop}px` }}>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-[var(--accent-color)] -ml-1.5 shadow-[0_0_8px_var(--accent-color)]" />
                      <div className="flex-1 h-[2px] bg-[var(--accent-color)] shadow-[0_0_6px_var(--accent-color)]" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MONTH VIEW
   ═══════════════════════════════════════════════════════════════ */
const MonthView = ({ currentDate, events, onDateClick, onEventClick }) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  return (
    <div className="flex-1 flex flex-col">
      {/* Headers */}
      <div className="grid grid-cols-7 border-b border-white/[0.04] flex-shrink-0">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="text-center py-1.5 sm:py-2 text-[10px] sm:text-xs text-[var(--text-dim)] uppercase tracking-wider opacity-60">{d}</div>
        ))}
      </div>
      {/* Grid */}
      <div className="grid grid-cols-7 flex-1 auto-rows-fr">
        {days.map((day, i) => {
          const inMonth = isSameMonth(day, currentDate);
          const dayEvents = events.filter(e => isSameDay(e.start, day));
          return (
            <div
              key={i}
              onClick={() => onDateClick(day)}
              className={clsx(
                'border-b border-r border-white/[0.04] p-1 sm:p-2 cursor-pointer transition-colors min-h-[60px] sm:min-h-[100px]',
                !inMonth && 'opacity-30',
                isToday(day) && 'bg-[var(--accent-color)]/[0.03]',
                'hover:bg-white/[0.03]'
              )}
            >
              <div className={clsx(
                'text-sm mb-1 w-7 h-7 flex items-center justify-center rounded-full',
                isToday(day) ? 'bg-[var(--accent-color)] text-white font-bold' : 'text-[var(--text-dim)] opacity-60',
              )}>
                {format(day, 'd')}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map(evt => {
                  const dc = getEventDisplayColor(evt);
                  return (
                    <div
                      key={evt.id}
                      onClick={(e) => { e.stopPropagation(); onEventClick(evt); }}
                      className={clsx('text-[11px] px-2 py-0.5 rounded truncate cursor-pointer', !dc.isCustom && dc.bg, !dc.isCustom && dc.text, 'hover:opacity-80')}
                      style={dc.isCustom ? { backgroundColor: dc.bg, color: dc.text } : {}}
                    >
                      {format(evt.start, 'h:mm')} {evt.title}
                    </div>
                  );
                })}
                {dayEvents.length > 3 && (
                  <div className="text-[10px] text-[var(--text-dim)] opacity-40 px-2">+{dayEvents.length - 3} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   DAY VIEW
   ═══════════════════════════════════════════════════════════════ */
const DayView = ({ currentDate, events, onEventClick, onSlotClick }) => {
  const dayEvents = events.filter(e => isSameDay(e.start, currentDate));
  const layoutEvents = computeEventColumns(dayEvents);
  const gridRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (gridRef.current) gridRef.current.scrollTop = 2 * HOUR_HEIGHT;
  }, []);

  const nowTop = useMemo(() => {
    const mins = getHours(currentTime) * 60 + getMinutes(currentTime);
    return ((mins - 360) / 60) * HOUR_HEIGHT;
  }, [currentTime]);

  const getEventStyle = (event) => {
    const startMin = getHours(event.start) * 60 + getMinutes(event.start);
    const endMin = getHours(event.end) * 60 + getMinutes(event.end);
    const top = ((startMin - 360) / 60) * HOUR_HEIGHT;
    const height = Math.max(((endMin - startMin) / 60) * HOUR_HEIGHT, 24);
    return { top: `${top}px`, height: `${height}px` };
  };

  const handleGridClick = (e) => {
    if (e.target !== e.currentTarget) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const hour = Math.floor(y / HOUR_HEIGHT) + 6;
    onSlotClick(currentDate, Math.min(Math.max(hour, 6), 23));
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <div className="text-center py-4 border-b border-white/[0.04] flex-shrink-0">
        <div className="text-xs text-[var(--text-dim)] uppercase tracking-wider opacity-60">{format(currentDate, 'EEEE')}</div>
        <div className={clsx('text-3xl font-light mt-1', isToday(currentDate) ? 'text-[var(--accent-color)]' : 'text-[var(--text-primary)]')}>
          {format(currentDate, 'd')}
        </div>
      </div>
      <div ref={gridRef} className="flex-1 overflow-y-auto">
        <div className="flex relative" style={{ height: `${HOURS.length * HOUR_HEIGHT}px` }}>
          <div className="w-10 sm:w-16 flex-shrink-0 relative">
            {HOURS.map((hour) => (
              <div key={hour} className="absolute w-full text-right pr-1 sm:pr-3 text-[10px] sm:text-xs text-[var(--text-dim)] opacity-30 -mt-2" style={{ top: `${(hour - 6) * HOUR_HEIGHT}px` }}>
                {hour === 0 ? '12a' : hour < 12 ? `${hour}a` : hour === 12 ? '12p' : `${hour - 12}p`}
              </div>
            ))}
          </div>
          <div className="flex-1 relative border-l border-white/[0.04]" onClick={handleGridClick}>
            {HOURS.map((hour) => (
              <div key={hour} className="absolute w-full border-t border-white/[0.04]" style={{ top: `${(hour - 6) * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }} />
            ))}
            {layoutEvents.map(evt => {
              const style = getEventStyle(evt);
              const dc = getEventDisplayColor(evt);
              const colWidth = 100 / evt._totalCols;
              const colLeft = evt._col * colWidth;
              return (
                <motion.div
                  key={evt.id}
                  onClick={(e) => { e.stopPropagation(); onEventClick(evt); }}
                  className={clsx('absolute rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 cursor-pointer border-l-[3px] overflow-hidden', !dc.isCustom && dc.bg, !dc.isCustom && dc.border, 'hover:shadow-lg hover:z-20')}
                  style={{
                    ...style,
                    left: `calc(${colLeft}% + 4px)`,
                    width: `calc(${colWidth}% - 8px)`,
                    ...(dc.isCustom ? { backgroundColor: dc.bg, borderLeftColor: dc.border } : {}),
                  }}
                  whileHover={{ scale: 1.01 }}
                >
                  <div className={clsx('text-sm font-semibold', !dc.isCustom && dc.text)} style={dc.isCustom ? { color: dc.text } : {}}>{evt.title}</div>
                  <div className="text-xs text-[var(--text-dim)] opacity-50 mt-0.5">{format(evt.start, 'h:mm a')} – {format(evt.end, 'h:mm a')}</div>
                </motion.div>
              );
            })}
            {isToday(currentDate) && nowTop > 0 && (
              <div className="absolute left-0 right-0 z-30 pointer-events-none" style={{ top: `${nowTop}px` }}>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[var(--accent-color)] -ml-1.5 shadow-[0_0_8px_var(--accent-color)]" />
                  <div className="flex-1 h-[2px] bg-[var(--accent-color)] shadow-[0_0_6px_var(--accent-color)]" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN CALENDAR COMPONENT
   ═══════════════════════════════════════════════════════════════ */
const MithraCalendar = () => {
  const {
    taskCalendarEvents,
    habitCalendarEvents,
    googleEvents,
    syncSettings,
    toggleSyncGoogleCalendar,
    deleteTask,
    deleteHabit
  } = useData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState(() => loadEvents() || INITIAL_EVENTS);
  const [view, setView] = useState('week'); // 'month' | 'week' | 'day'
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedSlotDate, setSelectedSlotDate] = useState(null);

  // Persist events to localStorage
  React.useEffect(() => { saveEvents(events); }, [events]);

  // Merge own events (with repeat expansion) with synced task/habit/google events
  const allEvents = useMemo(() => {
    const expandedEvents = expandRepeatingEvents(events);
    const gEvents = syncSettings.syncGoogleCalendar ? googleEvents : [];
    return [...expandedEvents, ...taskCalendarEvents, ...habitCalendarEvents, ...gEvents];
  }, [events, taskCalendarEvents, habitCalendarEvents, googleEvents, syncSettings.syncGoogleCalendar]);

  // Navigation
  const navigateForward = () => {
    if (view === 'month') setCurrentDate(addMonths(currentDate, 1));
    else if (view === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };
  const navigateBack = () => {
    if (view === 'month') setCurrentDate(subMonths(currentDate, 1));
    else if (view === 'week') setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, -1));
  };
  const goToToday = () => setCurrentDate(new Date());

  // Event CRUD
  const handleSaveEvent = (evt) => {
    setEvents(prev => {
      const exists = prev.find(e => e.id === evt.id);
      if (exists) return prev.map(e => e.id === evt.id ? evt : e);
      return [...prev, evt];
    });
  };
  const handleDeleteEvent = (id) => {
    // Handle synced task/habit deletion
    if (typeof id === 'string' && id.startsWith('task-')) {
      deleteTask(id.replace('task-', ''));
      return;
    }
    if (typeof id === 'string' && id.startsWith('habit-')) {
      deleteHabit(id.replace('habit-', ''));
      return;
    }
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const openNewEvent = (day, hour) => {
    setEditingEvent(null);
    setSelectedSlotDate(day ? setHours(day, hour || 9) : null);
    setModalOpen(true);
  };

  const openEditEvent = (evt) => {
    setEditingEvent(evt);
    setModalOpen(true);
  };

  // Title text
  const headerTitle = useMemo(() => {
    if (view === 'month') return format(currentDate, 'MMMM yyyy');
    if (view === 'day') return format(currentDate, 'MMMM d, yyyy');
    const ws = startOfWeek(currentDate, { weekStartsOn: 0 });
    const we = addDays(ws, 6);
    if (ws.getMonth() === we.getMonth()) return format(ws, 'MMMM yyyy');
    return `${format(ws, 'MMM')} – ${format(we, 'MMM yyyy')}`;
  }, [currentDate, view]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-[calc(100dvh-140px)] md:h-[calc(100vh-32px)] flex gap-0 rounded-2xl overflow-hidden glass-heavy glass-shine mx-2 sm:mx-0"
    >
      {/* ── LEFT SIDEBAR ── */}
      <div className="w-60 flex-shrink-0 p-4 hidden lg:flex flex-col gap-6">
        {/* Create Button */}
        <button
          onClick={() => openNewEvent(currentDate, 9)}
          className="w-full flex items-center gap-3 px-5 py-3 rounded-2xl glass-card text-[var(--text-primary)] hover:bg-[var(--accent-color)]/10 hover:border-[var(--accent-color)]/30 hover:text-[var(--accent-color)] transition-all group"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform" />
          <span className="font-medium">Create</span>
        </button>

        {/* Mini Calendar */}
        <MiniCalendar
          currentDate={currentDate}
          onDateClick={(d) => { setCurrentDate(d); setView('day'); }}
          events={allEvents}
        />

        {/* Categories Legend */}
        <div className="mt-auto space-y-2">
          <h4 className="text-xs text-[var(--text-dim)] uppercase tracking-wider mb-3 opacity-40">Categories</h4>
          {Object.entries(CATEGORY_COLORS).filter(([k]) => k !== 'default').map(([cat, c]) => (
            <div key={cat} className="flex items-center gap-3 text-sm text-[var(--text-dim)] opacity-70">
              <span className={clsx('w-3 h-3 rounded-sm', c.dot)} />
              {cat}
            </div>
          ))}

          <div className="pt-4 mt-4">
            <h4 className="text-xs text-[var(--text-dim)] uppercase tracking-wider mb-3 opacity-40">Sync</h4>
            <button
              onClick={toggleSyncGoogleCalendar}
              className="flex items-center gap-3 text-sm text-[var(--text-dim)] opacity-70 hover:opacity-100 hover:text-[var(--text-primary)] transition-all w-full text-left"
            >
              <div className={clsx("w-3 h-3 rounded-full border flex items-center justify-center transition-colors",
                syncSettings.syncGoogleCalendar ? "bg-green-500 border-green-500" : "border-[var(--glass-border)]")}
              >
                {syncSettings.syncGoogleCalendar && <Check size={8} className="text-black" />}
              </div>
              Google Calendar
            </button>
          </div>
        </div>
      </div>

      {/* ── MAIN AREA ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-3 sm:px-6 py-2 sm:py-4 flex-shrink-0 gap-2">
          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={goToToday} className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm text-[var(--text-primary)] hover:bg-[var(--glass-bg-hover)] transition-colors">Today</button>
            <div className="flex gap-0.5 sm:gap-1">
              <button aria-label="Navigate back" onClick={navigateBack} className="p-1.5 sm:p-2 rounded-lg hover:bg-[var(--glass-bg-hover)] text-[var(--text-dim)]"><ChevronLeft size={18} /></button>
              <button aria-label="Navigate forward" onClick={navigateForward} className="p-1.5 sm:p-2 rounded-lg hover:bg-[var(--glass-bg-hover)] text-[var(--text-dim)]"><ChevronRight size={18} /></button>
            </div>
            <h2 className="text-sm sm:text-xl font-light text-[var(--text-primary)] tracking-tight truncate">{headerTitle}</h2>
          </div>
          <div className="flex gap-1 items-center">
            <button onClick={() => exportEventsAsICS(allEvents)} title="Export to .ics (Google Calendar, Apple Calendar)"
              className="p-1.5 sm:p-2 rounded-lg hover:bg-[var(--glass-bg-hover)] text-[var(--text-dim)] transition-colors mr-1" aria-label="Export calendar">
              <Download size={16} />
            </button>
            <div className="flex gap-1 rounded-lg p-0.5 sm:p-1 glass-card">
              {['day', 'week', 'month'].map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={clsx(
                    'px-3 sm:px-4 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm capitalize transition-all',
                    view === v
                      ? 'bg-[var(--accent-color)]/10 text-[var(--accent-color)] border border-[var(--accent-color)]/30'
                      : 'text-[var(--text-dim)] opacity-60 hover:opacity-100 hover:text-[var(--text-primary)] border border-transparent'
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* View Content */}
        {view === 'week' && (
          <WeekView
            currentDate={currentDate}
            events={allEvents}
            onEventClick={openEditEvent}
            onSlotClick={(day, hour) => openNewEvent(day, hour)}
          />
        )}
        {view === 'month' && (
          <MonthView
            currentDate={currentDate}
            events={allEvents}
            onDateClick={(d) => { setCurrentDate(d); setView('day'); }}
            onEventClick={openEditEvent}
          />
        )}
        {view === 'day' && (
          <DayView
            currentDate={currentDate}
            events={allEvents}
            onEventClick={openEditEvent}
            onSlotClick={(day, hour) => openNewEvent(day, hour)}
          />
        )}
      </div>

      {/* Mobile FAB — Create Event (since left sidebar is hidden) */}
      <AnimatePresence>
        {!modalOpen && (
          <motion.button
            key="fab-calendar"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => openNewEvent(currentDate, 9)}
            className="lg:hidden fixed bottom-20 right-4 z-30 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
            style={{
              backgroundColor: 'var(--accent-color)',
              boxShadow: '0 4px 20px var(--accent-glow)',
              display: modalOpen ? 'none' : 'flex'
            }}
          >
            <Plus size={24} className="text-white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Event Modal */}
      <EventModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingEvent(null); }}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        event={editingEvent}
        selectedDate={selectedSlotDate}
      />
    </motion.div>
  );
};

export default MithraCalendar;
