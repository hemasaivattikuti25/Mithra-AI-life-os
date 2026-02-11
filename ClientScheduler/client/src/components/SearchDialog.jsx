import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, CheckSquare, Calendar, BookOpen, Activity, Settings, Layout as LayoutIcon, MessageSquare, ArrowRight, Command } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useData, getUserScopedKey } from '../context/DataContext';

const PAGE_RESULTS = [
  { type: 'page', title: 'Home', path: '/', icon: LayoutIcon },
  { type: 'page', title: 'Tasks', path: '/tasks', icon: CheckSquare },
  { type: 'page', title: 'Calendar', path: '/calendar', icon: Calendar },
  { type: 'page', title: 'Habits & Focus', path: '/habits', icon: Activity },
  { type: 'page', title: 'Journal', path: '/journal', icon: BookOpen },
  { type: 'page', title: 'Dost Mode (AI Chat)', path: '/dost', icon: MessageSquare },
  { type: 'page', title: 'Settings', path: '/settings', icon: Settings },
];

export default function SearchDialog({ open, onClose }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { tasks, habits } = useData();
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Close on Escape only — Cmd+K toggle is handled by parent GlobalSearch
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && open) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return PAGE_RESULTS.slice(0, 7);

    const matched = [];

    // Search pages
    PAGE_RESULTS.forEach(p => {
      if (p.title.toLowerCase().includes(q)) matched.push(p);
    });

    // Search tasks
    if (tasks) {
      tasks.forEach(t => {
        if ((t.title || '').toLowerCase().includes(q) || (t.details && t.details.toLowerCase().includes(q))) {
          matched.push({ type: 'task', title: t.title, subtitle: t.completed ? 'Completed' : (t.priority || 'medium'), path: '/tasks', icon: CheckSquare, id: t.id });
        }
      });
    }

    // Search habits
    if (habits) {
      habits.forEach(h => {
        if ((h.title || '').toLowerCase().includes(q) || (h.category && h.category.toLowerCase().includes(q))) {
          matched.push({ type: 'habit', title: h.title, subtitle: `${h.streak} day streak`, path: '/habits', icon: Activity, id: h.id });
        }
      });
    }

    // Search journal entries
    try {
      const journal = JSON.parse(localStorage.getItem(getUserScopedKey('journal-entries')) || '[]');
      journal.forEach(entry => {
        const text = `${entry.title || ''} ${entry.body || ''} ${entry.content || ''}`.toLowerCase();
        if (text.includes(q)) {
          matched.push({ type: 'journal', title: entry.title || 'Journal entry', subtitle: entry.date, path: '/journal', icon: BookOpen });
        }
      });
    } catch {}

    return matched.slice(0, 12);
  }, [query, tasks, habits]);

  // Reset selection when results change
  useEffect(() => { setSelectedIndex(0); }, [results]);

  const handleSelect = useCallback((item) => {
    navigate(item.path);
    onClose();
  }, [navigate, onClose]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) handleSelect(results[selectedIndex]);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9997] flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-xl p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: -20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: -20 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-lg rounded-2xl overflow-hidden glass-heavy shadow-2xl"
        >
          {/* Search input */}
          <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'rgba(242,235,227,0.06)' }}>
            <Search size={20} className="text-mithra-merino/40 flex-shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search tasks, habits, pages..."
              className="flex-1 bg-transparent text-mithra-merino text-sm outline-none placeholder:text-mithra-merino/30"
            />
            <kbd className="hidden sm:flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] font-medium text-mithra-merino/30 bg-white/5 border border-white/10">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto py-2">
            {results.length === 0 ? (
              <div className="py-12 text-center text-mithra-merino/40 text-sm">
                No results found for "{query}"
              </div>
            ) : (
              results.map((item, i) => {
                const Icon = item.icon;
                return (
                  <button
                    key={`${item.type}-${item.title}-${i}`}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(i)}
                    className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-all ${
                      i === selectedIndex ? 'bg-white/[0.05]' : 'hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: i === selectedIndex ? 'rgba(var(--color-visor), 0.1)' : 'rgba(242,235,227,0.03)' }}>
                      <Icon size={16} className={i === selectedIndex ? 'text-accent-visor' : 'text-mithra-merino/40'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-mithra-merino/80 truncate">{item.title}</div>
                      {item.subtitle && <div className="text-xs text-mithra-merino/30 truncate">{item.subtitle}</div>}
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-mithra-merino/25 flex-shrink-0">{item.type}</span>
                    {i === selectedIndex && <ArrowRight size={14} className="text-accent-visor flex-shrink-0" />}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-2.5 border-t text-[10px] text-mithra-merino/25" style={{ borderColor: 'rgba(242,235,227,0.06)' }}>
            <span>Navigate with ↑↓ &middot; Select with ↵</span>
            <span className="flex items-center gap-1">
              <Command size={10} />K to toggle
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
