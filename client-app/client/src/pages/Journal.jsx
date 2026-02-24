import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, BarChart2, Calendar as CalIcon, X, Maximize2,
  Image as ImageIcon, Mic, Book, TrendingUp, Heart, Feather,
  Sparkles, ChevronDown, Pencil, Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import { useData, getUserScopedKey } from '../context/DataContext';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { useAuth } from '../context/AuthContext';
import EmptyState from '../components/EmptyState';

/* ═══════════════════════════════════════════════════════════════
   MOOD EMOJI MAP
   ═══════════════════════════════════════════════════════════════ */
const moodEmoji = (score) => {
  if (score >= 9) return '🌟';
  if (score >= 7) return '😊';
  if (score >= 5) return '😐';
  if (score >= 3) return '😔';
  return '😞';
};

const moodGradient = (score, isLight) => {
  if (score >= 8) return 'from-[var(--accent-color)]/15 to-transparent';
  return 'from-[var(--text-primary)]/[0.05] to-transparent';
};

const moodBorder = (score, isLight) => {
  if (score >= 8) return 'border-[var(--accent-color)]/20 hover:border-[var(--accent-color)]/40';
  return 'border-[var(--glass-border)] hover:border-[var(--glass-border-hover)]';
};

/* No mock entries — start with empty journal */

/* ═══════════════════════════════════════════════════════════════
   ZEN EDITOR (Full-screen composing experience)
   ═══════════════════════════════════════════════════════════════ */
const ZenEditor = ({ isOpen, onClose, onSave, editingEntry, isLight }) => {
  const [mood, setMood] = useState(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');
  const titleRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (editingEntry) {
        setMood(editingEntry.mood);
        setTitle(editingEntry.title);
        setBody(editingEntry.body);
        setTags(editingEntry.tags.map(t => t.replace('#', '')).join(', '));
      } else {
        setMood(5);
        setTitle('');
        setBody('');
        setTags('');
      }
      setTimeout(() => titleRef.current?.focus(), 200);
    }
  }, [isOpen, editingEntry]);

  const handleSave = () => {
    if (!title.trim() && !body.trim()) return;
    onSave({
      id: editingEntry?.id || Date.now(),
      title: title.trim() || 'Untitled',
      body: body.trim(),
      mood,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean).map(t => t.startsWith('#') ? t : `#${t}`),
      date: editingEntry?.date || new Date(),
      color: mood >= 8 ? 'var(--accent-color)' : 'var(--text-primary)',
    });
    onClose();
  };

  const moodLabel = mood >= 8 ? 'Wonderful' : mood >= 6 ? 'Good' : mood >= 4 ? 'Neutral' : mood >= 2 ? 'Low' : 'Rough';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-2xl p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 30 }}
            className="w-full max-w-3xl h-[85vh] rounded-2xl overflow-hidden flex flex-col relative glass-heavy glass-shine"
          >
            {/* Dynamic Mood Bar */}
            <div
              className={clsx('absolute top-0 left-0 w-full h-1 transition-all duration-500')}
              style={{
                background: mood >= 8 ? 'var(--accent-color)' : 'var(--glass-border)',
                boxShadow: mood >= 8 ? '0 0 15px var(--accent-color)' : 'none'
              }}
            />

            {/* Toolbar */}
            <div className="flex justify-between items-center px-6 py-4">
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--glass-bg-hover)] transition-colors" style={{ color: 'var(--text-dim)' }}>
                <X size={22} />
              </button>
              <span className="text-xs uppercase tracking-[0.2em] flex items-center gap-2" style={{ color: 'var(--text-dim)', opacity: 0.5 }}>
                <Feather size={14} /> {editingEntry ? 'Edit Entry' : 'New Entry'}
              </span>
              <button onClick={handleSave} className="px-5 py-2 rounded-lg bg-[var(--accent-glow)] text-[var(--accent-color)] text-sm font-medium hover:bg-[var(--accent-color)]/20 transition-all">
                Save
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-8 lg:px-16 py-8">
              {/* Mood Selector */}
              <div className="mb-10">
                <div className="flex justify-between text-xs mb-3 tracking-widest uppercase" style={{ color: 'var(--text-dim)', opacity: 0.4 }}>
                  <span>Rough</span>
                  <span className="text-sm font-medium transition-colors" style={{ color: mood >= 8 ? 'var(--accent-color)' : 'var(--text-primary)' }}>
                    {moodEmoji(mood)} {moodLabel}
                  </span>
                  <span>Wonderful</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={mood}
                  onChange={(e) => setMood(parseInt(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{ background: 'linear-gradient(to right, #ef4444, var(--text-dim), var(--accent-color))' }}
                />
              </div>

              {/* Title */}
              <input
                ref={titleRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full bg-transparent text-3xl lg:text-4xl font-light border-none outline-none mb-6"
                style={{ color: 'var(--text-primary)' }}
              />

              {/* Body */}
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Let your thoughts flow freely..."
                className="w-full h-48 lg:h-64 bg-transparent text-lg border-none outline-none resize-none leading-relaxed"
                style={{ color: 'var(--text-dim)' }}
              />

              {/* Tags */}
              <div className="mt-6 pt-6">
                <input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Tags (comma separated): gratitude, work, calm"
                  className="w-full bg-transparent text-sm border-none outline-none"
                  style={{ color: 'var(--text-dim)', opacity: 0.6 }}
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 flex gap-3">
              <button className="p-3 rounded-xl transition-all" style={{ background: 'var(--glass-bg)', color: 'var(--text-dim)', opacity: 0.4 }}>
                <ImageIcon size={18} />
              </button>
              <button className="p-3 rounded-xl transition-all" style={{ background: 'var(--glass-bg)', color: 'var(--text-dim)', opacity: 0.4 }}>
                <Mic size={18} />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ═══════════════════════════════════════════════════════════════
   JOURNAL CARD
   ═══════════════════════════════════════════════════════════════ */
const JournalCard = ({ entry, onClick, onEdit, onDelete, index, isLight }) => {
  const due = entry.date;
  const textPrimary = 'var(--text-primary)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      onClick={onClick}
      className={clsx(
        'break-inside-avoid p-6 rounded-2xl cursor-pointer group relative overflow-hidden transition-shadow glass-card',
        moodBorder(entry.mood, isLight),
      )}
    >
      {/* Top gradient based on mood */}
      <div className={clsx('absolute top-0 left-0 w-full h-24 bg-gradient-to-b pointer-events-none', moodGradient(entry.mood, isLight))} />

      {/* Action buttons — always visible */}
      <div className="absolute top-3 right-3 flex gap-1 z-10">
        <button onClick={(e) => { e.stopPropagation(); onEdit(entry); }}
          style={{ color: 'var(--text-dim)' }}
          className="p-1.5 rounded-lg hover:bg-[var(--glass-bg-hover)] transition-all opacity-40 hover:opacity-100">
          <Pencil size={15} />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }}
          className="p-1.5 rounded-lg text-red-400/50 hover:text-red-400 hover:bg-red-500/10 transition-all">
          <Trash2 size={15} />
        </button>
      </div>

      {/* Mood Dot */}
      <div className="flex items-center justify-between mb-4 relative pr-20">
        <span className="text-2xl">{moodEmoji(entry.mood)}</span>
        <span style={{ color: 'var(--text-dim)' }} className="text-xs opacity-40">{format(due, 'MMM d')}</span>
      </div>

      {/* Title */}
      <h3 style={{ color: textPrimary }} className="font-medium text-lg mb-3 opacity-90 group-hover:opacity-100 transition-colors relative">
        {entry.title}
      </h3>

      {/* Body Preview */}
      <p style={{ color: 'var(--text-dim)' }} className="text-sm leading-relaxed mb-5 line-clamp-4 relative opacity-60">
        {entry.body}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 relative">
        {entry.tags.map(tag => (
          <span key={tag} style={{ color: 'var(--text-dim)' }} className="text-xs px-2.5 py-1 rounded-full bg-[var(--glass-bg)] opacity-60">
            {tag}
          </span>
        ))}
      </div>

      <div className={clsx(
        'absolute top-14 right-5 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border',
        entry.mood >= 8 ? 'border-[var(--accent-color)]/30 text-[var(--accent-color)] bg-[var(--accent-glow)]' :
          'border-[var(--glass-border)] text-[var(--text-dim)] bg-[var(--glass-bg)] opacity-50'
      )}>
        {entry.mood}/10
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN JOURNAL PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function MithraJournal() {
  const { theme } = useData();
  const { user } = useAuth();
  const isLight = theme === 'light';
  // Entries: show localStorage cache instantly, then replace with Supabase data
  const [entries, setEntries] = useState(() => {
    try {
      const saved = localStorage.getItem(getUserScopedKey('journal-entries'));
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map(e => ({ ...e, date: new Date(e.date) }));
      }
    } catch { }
    return [];
  });
  const [isEditorOpen, setEditorOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // ── PRIMARY: Load from Supabase on mount (localStorage is cache only) ──
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !user?.id) return;

    const fetchFromSupabase = async () => {
      try {
        setIsSyncing(true);
        const { data: cloudEntries, error } = await supabase
          .from('journal_entries')
          .select('id, content, mood, tags, date, created_at, updated_at')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(100);

        if (error) throw error;

        const formatted = (cloudEntries || []).map(e => ({
          id: e.id,
          title: (e.content || '').split('\n')[0]?.slice(0, 80) || 'Untitled',
          body: e.content || '',
          mood: e.mood ? e.mood * 2 : 5,  // DB 1-5 → local 1-10
          tags: (e.tags || []).map(t => t.startsWith('#') ? t : `#${t}`),
          date: new Date(e.date),
          color: (e.mood && e.mood >= 4) ? 'var(--accent-color)' : 'var(--text-primary)',
          _cloudId: e.id,
          _updatedAt: e.updated_at,
        }));

        setEntries(formatted); // Supabase is truth — replace, don't merge
        // Update localStorage cache
        localStorage.setItem(getUserScopedKey('journal-entries'), JSON.stringify(formatted));
        console.log('[Journal] Loaded', formatted.length, 'entries from Supabase');
      } catch (err) {
        console.warn('[Journal] Supabase fetch failed, using localStorage cache:', err.message);
        // localStorage cache already loaded in useState — no action needed
      } finally {
        setIsSyncing(false);
      }
    };

    fetchFromSupabase();
  }, [user?.id]);

  // NOTE: localStorage is NO LONGER auto-updated on every entry change.
  // Cache is updated AFTER successful Supabase operations only.

  // ── Supabase-first: upsert to DB, update state from response ──
  const syncToCloud = async (entry, action = 'upsert') => {
    if (!isSupabaseConfigured || !supabase || !user?.id) return null;

    if (action === 'delete') {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', entry.id);
      if (error) throw error;
      return null;
    }

    const dbEntry = {
      ...(entry._cloudId || (typeof entry.id === 'string' && entry.id.includes('-') ? { id: entry.id } : {})),
      user_id: user.id,
      content: entry.title ? `${entry.title}\n\n${entry.body}` : entry.body,
      mood: Math.max(1, Math.min(5, Math.round((entry.mood || 5) / 2))),
      tags: (entry.tags || []).map(t => t.replace('#', '')),
      date: entry.date instanceof Date ? entry.date.toISOString().split('T')[0] : entry.date,
    };

    const { data, error } = await supabase
      .from('journal_entries')
      .upsert(dbEntry, { onConflict: 'id' })
      .select('id, created_at, updated_at')
      .single();

    if (error) throw error;
    return data; // caller uses this to update state with real DB id
  };

  const handleSaveEntry = async (entry) => {
    try {
      setIsSyncing(true);
      const dbResult = await syncToCloud(entry);

      // If DB returned a new id (new entry), update the entry's id
      const finalEntry = dbResult?.id && dbResult.id !== entry.id
        ? { ...entry, id: dbResult.id, _cloudId: dbResult.id }
        : { ...entry, _cloudId: entry._cloudId || dbResult?.id };

      if (editingEntry) {
        setEntries(prev => {
          const next = prev.map(e => e.id === entry.id || e.id === editingEntry.id ? finalEntry : e);
          localStorage.setItem(getUserScopedKey('journal-entries'), JSON.stringify(next));
          return next;
        });
        if (selectedEntry?.id === entry.id) setSelectedEntry(finalEntry);
      } else {
        setEntries(prev => {
          const next = [finalEntry, ...prev];
          localStorage.setItem(getUserScopedKey('journal-entries'), JSON.stringify(next));
          return next;
        });
      }
    } catch (err) {
      console.error('[Journal] Save failed:', err.message);
      // Optimistic fallback — save to state even if Supabase failed
      if (editingEntry) {
        setEntries(prev => prev.map(e => e.id === entry.id ? entry : e));
      } else {
        setEntries(prev => [entry, ...prev]);
      }
    } finally {
      setIsSyncing(false);
      setEditingEntry(null);
    }
  };

  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    setSelectedEntry(null);
    setEditorOpen(true);
  };

  const handleDeleteEntry = async (id) => {
    const entry = entries.find(e => e.id === id);
    if (!entry) return;
    try {
      await syncToCloud(entry, 'delete'); // await the delete
    } catch (err) {
      console.error('[Journal] Delete failed:', err.message);
      // Still remove from local state — user intent is clear
    }
    setEntries(prev => {
      const next = prev.filter(e => e.id !== id);
      localStorage.setItem(getUserScopedKey('journal-entries'), JSON.stringify(next));
      return next;
    });
    if (selectedEntry?.id === id) setSelectedEntry(null);
  };

  // Stats
  const avgMood = entries.length > 0 ? (entries.reduce((a, e) => a + e.mood, 0) / entries.length).toFixed(1) : 0;
  // Real streak: count consecutive days with entries from today backwards
  const streakDays = (() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const entryDates = new Set(entries.map(e => {
      const d = new Date(e.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }));
    let streak = 0;
    let checkDate = new Date(today);
    while (entryDates.has(checkDate.getTime())) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
    return streak;
  })();
  const weekMoods = entries.slice(0, 7).map(e => e.mood);

  // Filter logic
  const filteredEntries = entries.filter(entry => {
    const matchesSearch = !searchQuery ||
      (entry.title && entry.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (entry.body && entry.body.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (entry.tags && entry.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesFilter =
      activeFilter === 'all' ? true :
        activeFilter === 'high' ? entry.mood >= 7 :
          activeFilter === 'low' ? entry.mood < 5 : true;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex gap-8 h-[calc(100vh-100px)] relative" style={{ color: 'var(--text-primary)' }}>

      <ZenEditor isOpen={isEditorOpen} onClose={() => { setEditorOpen(false); setEditingEntry(null); }} onSave={handleSaveEntry} editingEntry={editingEntry} isLight={isLight} />

      {/* ── ENTRY DETAIL OVERLAY ── */}
      <AnimatePresence>
        {selectedEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/65 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setSelectedEntry(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl rounded-2xl p-8 lg:p-12 relative overflow-hidden glass-heavy glass-shine"
              style={{ background: 'var(--body-bg)' }}
            >
              <div className={clsx('absolute top-0 left-0 w-full h-1', selectedEntry.mood >= 8 ? 'bg-accent-visor' : 'bg-[var(--glass-border)]')} />
              <div className="absolute top-4 right-4 flex items-center gap-1.5">
                <button onClick={() => handleEditEntry(selectedEntry)}
                  style={{ color: 'var(--text-dim)' }}
                  className="p-2 rounded-lg hover:bg-[var(--glass-bg-hover)] transition-all opacity-40 hover:opacity-100" title="Edit">
                  <Pencil size={18} />
                </button>
                <button onClick={() => handleDeleteEntry(selectedEntry.id)}
                  style={{ color: 'var(--text-dim)' }}
                  className="p-2 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-all opacity-40 hover:opacity-100" title="Delete">
                  <Trash2 size={18} />
                </button>
                <button onClick={() => setSelectedEntry(null)} style={{ color: 'var(--text-dim)' }} className="p-2 rounded-lg hover:bg-[var(--glass-bg-hover)] opacity-60 hover:opacity-100">
                  <X size={20} />
                </button>
              </div>
              <div style={{ color: 'var(--text-dim)' }} className="flex items-center gap-3 mb-6 text-sm opacity-60">
                <span className="text-3xl">{moodEmoji(selectedEntry.mood)}</span>
                <span>{format(selectedEntry.date, 'EEEE, MMMM d, yyyy')}</span>
                <span className="ml-auto px-3 py-1 rounded-full text-xs" style={{ background: 'var(--glass-bg)' }}>Mood: {selectedEntry.mood}/10</span>
              </div>
              <h2 style={{ color: 'var(--text-primary)' }} className="text-2xl lg:text-3xl font-light mb-6">{selectedEntry.title}</h2>
              <p style={{ color: 'var(--text-dim)' }} className="leading-relaxed text-lg whitespace-pre-wrap opacity-80">{selectedEntry.body}</p>
              <div className="flex flex-wrap gap-2 mt-8 pt-6">
                {selectedEntry.tags.map(t => (
                  <span key={t} style={{ color: 'var(--text-dim)' }} className="text-xs px-3 py-1.5 rounded-full bg-[var(--glass-bg)] opacity-60">{t}</span>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 overflow-y-auto space-y-8 pr-2">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-light tracking-tight flex items-center gap-3">
              <Book size={28} className="text-[var(--accent-color)]" /> Journal
            </h1>
            <p style={{ color: 'var(--text-dim)' }} className="mt-1 text-sm opacity-40 flex items-center gap-2">
              Capture your mind. Track your soul.
              {isSyncing && (
                <span className="inline-flex items-center gap-1 text-[var(--accent-color)] opacity-60 text-xs">
                  <span className="animate-pulse">●</span> syncing...
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Filter Pills */}
            {[{ key: 'all', label: 'All' }, { key: 'high', label: '😊 Good Days' }, { key: 'low', label: '😔 Tough Days' }].map(f => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={clsx(
                  'px-4 py-2 rounded-full text-xs font-medium border transition-all',
                  activeFilter === f.key
                    ? 'border-[var(--accent-color)]/30 text-[var(--accent-color)] bg-[var(--accent-glow)]'
                    : 'border-[var(--glass-border)] text-[var(--text-dim)] hover:bg-[var(--glass-bg-hover)] opacity-40 hover:opacity-100'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </header>

        {/* Search */}
        <div className="relative group">
          <Search style={{ color: 'var(--text-dim)' }} className="absolute left-4 top-3.5 group-focus-within:text-[var(--accent-color)] transition-colors opacity-30" size={18} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search memories..."
            className="w-full glass-input !pl-12"
          />
        </div>

        {/* Masonry Grid */}
        <div className="columns-1 md:columns-2 xl:columns-3 gap-5 space-y-5 pb-16">
          {/* New Entry Card */}
          <motion.div
            whileHover={{ scale: 1.02, backgroundColor: 'var(--accent-glow)' }}
            onClick={() => setEditorOpen(true)}
            style={{ color: 'var(--text-dim)', background: 'var(--glass-bg)', backdropFilter: 'blur(12px)' }}
            className="break-inside-avoid p-8 rounded-2xl border-dashed flex flex-col items-center justify-center gap-4 cursor-pointer min-h-[220px] hover:text-[var(--accent-color)] transition-all group"
          >
            <div style={{ background: 'var(--glass-bg)' }} className="p-4 rounded-full group-hover:bg-[var(--accent-glow)] transition-all">
              <Plus size={28} />
            </div>
            <span className="font-light tracking-[0.2em] uppercase text-sm">New Entry</span>
          </motion.div>

          {/* Entry Cards */}
          {filteredEntries.map((entry, i) => (
            <JournalCard
              key={entry.id}
              entry={entry}
              index={i}
              isLight={isLight}
              onClick={() => setSelectedEntry(entry)}
              onEdit={handleEditEntry}
              onDelete={handleDeleteEntry}
            />
          ))}
        </div>

        {filteredEntries.length === 0 && !searchQuery && (
          <EmptyState
            icon={Feather}
            title="A blank canvas awaits"
            description="Your thoughts deserve a beautiful home. Capture your first memory today."
            actionLabel="Write Entry"
            onAction={() => setEditorOpen(true)}
            className="!bg-transparent !border-none !shadow-none py-20"
          />
        )}
      </div>

      {/* ── SIDEBAR: SOUL ANALYTICS ── */}
      <aside className="w-72 hidden xl:flex flex-col gap-6 flex-shrink-0">
        <div className="rounded-2xl p-5 flex flex-col gap-6 h-full overflow-y-auto glass-card glass-shine">

          {/* Average Mood */}
          <div className="text-center py-4">
            <div className="text-5xl mb-2">{moodEmoji(Math.round(avgMood))}</div>
            <div style={{ color: 'var(--text-primary)' }} className="text-2xl font-light">{avgMood}</div>
            <div style={{ color: 'var(--text-dim)' }} className="text-xs mt-1 uppercase tracking-wider opacity-40">Avg Mood</div>
          </div>

          {/* Mood Bars */}
          <div>
            <h4 style={{ color: 'var(--text-dim)' }} className="text-xs uppercase tracking-wider font-bold mb-4 flex items-center gap-2 opacity-50">
              <BarChart2 size={14} /> This Week
            </h4>
            <div className="h-32 flex items-end justify-between gap-1.5 pb-2">
              {weekMoods.map((val, i) => (
                <div key={i} style={{ background: 'var(--glass-bg-hover)' }} className="w-full rounded-t-sm relative group h-full flex items-end">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${val * 10}%` }}
                    transition={{ delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className={clsx(
                      'w-full rounded-t-sm transition-opacity',
                      val >= 8 ? 'bg-accent-visor' : 'bg-[var(--text-primary)]',
                      'opacity-40 group-hover:opacity-100'
                    )}
                  />
                </div>
              ))}
            </div>
            <p style={{ color: 'var(--text-dim)' }} className="text-xs text-center mt-3 opacity-40">
              Trending <span className="text-[var(--accent-color)]">upward</span> this week
            </p>
          </div>

          {/* Tag Cloud */}
          <div>
            <h4 style={{ color: 'var(--text-dim)' }} className="text-xs uppercase tracking-wider font-bold mb-4 opacity-50">Mind Patterns</h4>
            <div className="flex flex-wrap gap-2">
              {entries.length > 0 ? (
                [...new Set(entries.flatMap(e => (e.tags || []).map(t => t.replace('#', ''))))].slice(0, 12).map((word, i) => (
                  <span
                    key={word}
                    className={clsx(
                      'text-xs px-2.5 py-1 rounded-full border transition-colors cursor-default',
                      i % 3 === 0 ? 'border-accent-visor/20 text-accent-visor/60 hover:bg-accent-visor/5' :
                        'border-[var(--glass-border)] text-[var(--text-dim)] hover:bg-[var(--glass-bg-hover)] opacity-50 hover:opacity-100'
                    )}
                  >
                    {word}
                  </span>
                ))
              ) : (
                <p style={{ color: 'var(--text-dim)' }} className="text-xs opacity-20">No tags yet</p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-auto pt-4 space-y-3">
            <div className="flex justify-between text-xs">
              <span style={{ color: 'var(--text-dim)', opacity: 0.4 }}>Total Entries</span>
              <span style={{ color: 'var(--text-dim)', opacity: 0.8 }}>{entries.length}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span style={{ color: 'var(--text-dim)', opacity: 0.4 }}>Writing Streak</span>
              <span className="text-[var(--accent-color)] opacity-60">{streakDays} days</span>
            </div>
            <div className="flex justify-between text-xs">
              <span style={{ color: 'var(--text-dim)', opacity: 0.4 }}>Best Day</span>
              <span style={{ color: 'var(--text-dim)', opacity: 0.8 }}>{entries.length > 0 ? `${moodEmoji(Math.max(...entries.map(e => e.mood)))} ${Math.max(...entries.map(e => e.mood))}/10` : '—'}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MOBILE FAB — New Journal Entry above bottom nav ── */}
      <motion.button
        className="md:hidden fixed right-5 z-[100] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center"
        style={{
          bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
          background: 'var(--accent-color)',
          boxShadow: '0 0 24px var(--accent-glow), 0 8px 20px rgba(0,0,0,0.4)',
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileTap={{ scale: 0.88 }}
        onClick={() => setEditorOpen(true)}
      >
        <Plus size={24} className="text-white" />
      </motion.button>
    </div>
  );
}
