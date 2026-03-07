/**
 * NLCreate — Natural Language Quick-Create
 * Shortcut: Ctrl/Cmd + Shift + N from anywhere in the app
 *
 * Examples:
 *   "Buy groceries"               → creates a Task
 *   "Team meeting at 3pm tomorrow" → parses as Calendar Event via /parse-schedule
 */
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X, Calendar, CheckSquare, Loader2 } from 'lucide-react';
import { useData, getUserScopedKey } from '../context/DataContext';
import { apiFetch } from '../services/firebaseClient';
import { useToast } from './Toast';

/* Heuristic: if the input mentions time/date keywords, treat as an event */
const EVENT_REGEX = /\b(am|pm|today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|next week|tonight|morning|afternoon|evening|noon|midnight|\d{1,2}:\d{2}|\d{1,2}(am|pm)|schedule|meeting|call|event|appointment|remind me)\b/i;

export default function NLCreate() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState(null); // 'task' | 'event'
  const inputRef = useRef(null);
  const { addTask } = useData();
  const { addToast } = useToast();

  /* Keyboard shortcut: Ctrl/Cmd + Shift + N */
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setOpen((p) => !p);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  /* Focus input when opened */
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      setText('');
      setMode(null);
    }
  }, [open]);

  /* Detect intent as user types */
  const handleChange = (e) => {
    const val = e.target.value;
    setText(val);
    if (val.trim().length > 3) {
      setMode(EVENT_REGEX.test(val) ? 'event' : 'task');
    } else {
      setMode(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || loading) return;
    setLoading(true);

    try {
      if (mode === 'event') {
        /* ── Calendar event via AI parse ── */
        const res = await apiFetch('/tasks/parse-schedule', {
          method: 'POST',
          body: JSON.stringify({ text: text.trim() }),
        });

        const parsedEvents = res.events || [];
        if (parsedEvents.length > 0) {
          /* Save events to localStorage so Calendar.jsx picks them up */
          const storageKey = getUserScopedKey('calendar-events');
          let existing = [];
          try { existing = JSON.parse(localStorage.getItem(storageKey) || '[]'); } catch {}

          const newEvents = parsedEvents.map((ev) => ({
            ...ev,
            id: crypto.randomUUID(),
            start: new Date(ev.start).toISOString(),
            end: new Date(ev.end).toISOString(),
          }));

          localStorage.setItem(storageKey, JSON.stringify([...existing, ...newEvents]));

          addToast({
            message: `Event added: "${parsedEvents[0].title}" — check Calendar`,
            type: 'success',
            duration: 5000,
          });
        } else {
          /* Fallback: create as task */
          await addTask({ title: text.trim(), priority: 'medium' });
          addToast({ message: `Added as task: "${text.trim()}"`, type: 'success' });
        }
      } else {
        /* ── Create task directly ── */
        await addTask({ title: text.trim(), priority: 'medium' });
        addToast({ message: `Task added: "${text.trim()}"`, type: 'success' });
      }
    } catch (err) {
      /* Fallback: always create as task */
      try { await addTask({ title: text.trim(), priority: 'medium' }); } catch {}
      addToast({ message: 'Added as task (offline mode)', type: 'info' });
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      {/* Floating trigger button (bottom-right) */}
      <button
        onClick={() => setOpen(true)}
        title="Quick create (Ctrl+Shift+N)"
        className="fixed bottom-24 right-4 z-40 w-12 h-12 rounded-2xl shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 md:bottom-8"
        style={{ background: 'var(--accent-color)', boxShadow: '0 0 20px var(--accent-glow)' }}
      >
        <Zap size={20} className="text-white" />
      </button>

      {/* Dialog */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
          >
            <motion.div
              className="w-full max-w-lg"
              initial={{ y: -20, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.97 }}
              transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            >
              <form
                onSubmit={handleSubmit}
                className="rounded-2xl border overflow-hidden shadow-2xl"
                style={{ background: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}
              >
                {/* Header */}
                <div className="flex items-center gap-3 px-4 pt-4 pb-2">
                  <Zap size={16} style={{ color: 'var(--accent-color)' }} />
                  <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>
                    Quick Create
                  </span>
                  <div className="ml-auto flex items-center gap-2">
                    {mode === 'event' && (
                      <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'var(--accent-glow)', color: 'var(--accent-color)' }}>
                        <Calendar size={10} /> Event
                      </span>
                    )}
                    {mode === 'task' && (
                      <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>
                        <CheckSquare size={10} /> Task
                      </span>
                    )}
                    <button type="button" onClick={() => setOpen(false)} className="opacity-40 hover:opacity-100">
                      <X size={16} style={{ color: 'var(--text-dim)' }} />
                    </button>
                  </div>
                </div>

                {/* Input */}
                <div className="px-4 pb-4">
                  <input
                    ref={inputRef}
                    value={text}
                    onChange={handleChange}
                    placeholder='Try "Buy groceries" or "Team call at 3pm tomorrow"'
                    className="w-full bg-transparent outline-none text-base py-2"
                    style={{ color: 'var(--text-primary)', caretColor: 'var(--accent-color)' }}
                    disabled={loading}
                  />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: 'var(--glass-border)', background: 'var(--glass-bg-hover)' }}>
                  <span className="text-[11px] opacity-40" style={{ color: 'var(--text-dim)' }}>
                    Press <kbd className="px-1 rounded border" style={{ borderColor: 'var(--glass-border)' }}>Enter</kbd> to create · <kbd className="px-1 rounded border" style={{ borderColor: 'var(--glass-border)' }}>Esc</kbd> to close
                  </span>
                  <button
                    type="submit"
                    disabled={!text.trim() || loading}
                    className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-sm font-medium transition-all disabled:opacity-40"
                    style={{ background: 'var(--accent-color)', color: 'white' }}
                  >
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                    {loading ? 'Parsing…' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
