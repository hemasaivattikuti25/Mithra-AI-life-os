import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, BarChart2, Calendar as CalIcon, X, Maximize2,
  Image as ImageIcon, Mic, Book, TrendingUp, Heart, Feather,
  Sparkles, ChevronDown, Pencil, Trash2
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { clsx } from 'clsx';
import { useData, getUserScopedKey } from '../context/DataContext';

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
  if (score >= 5) return isLight ? 'from-[#333]/8 to-transparent' : 'from-[#F2EBE3]/8 to-transparent';
  return isLight ? 'from-[#333]/5 to-transparent' : 'from-[#F2EBE3]/5 to-transparent';
};

const moodBorder = (score, isLight) => {
  if (score >= 8) return 'border-[var(--accent-color)]/20 hover:border-[var(--accent-color)]/40';
  if (score >= 5) return isLight ? 'border-[#333]/10 hover:border-[#333]/20' : 'border-[#F2EBE3]/10 hover:border-[#F2EBE3]/20';
  return isLight ? 'border-[#333]/8 hover:border-[#333]/15' : 'border-[#F2EBE3]/8 hover:border-[#F2EBE3]/15';
};

/* ═══════════════════════════════════════════════════════════════
   MOCK ENTRIES
   ═══════════════════════════════════════════════════════════════ */
const today = new Date();

const ENTRIES = [
  {
    id: 1,
    title: 'Great breakthrough at work',
    body: 'Finally solved the API issue that has been bugging the team for weeks. It turned out to be a race condition in the database layer. Felt amazing to deploy the fix. The team celebrated with coffee and high-fives.',
    mood: 9,
    tags: ['#Work', '#Win', '#Code'],
    date: today,
    color: '#C2185B',
  },
  {
    id: 2,
    title: 'Feeling drained',
    body: 'Too many meetings today. Could not find time for deep work. Need silence and maybe a long walk. The noise in my head needs to settle.',
    mood: 3,
    tags: ['#Burnout', '#Meetings'],
    date: subDays(today, 1),
    color: '#4A0404',
  },
  {
    id: 3,
    title: 'New PR at the Gym',
    body: 'Hit a new PR on deadlifts! 120kg for 5 reps. The consistency is finally paying off. Sleep and nutrition have been dialed in.',
    mood: 8,
    tags: ['#Health', '#Gym', '#PR'],
    date: subDays(today, 2),
    color: '#C2185B',
  },
  {
    id: 4,
    title: 'Quiet Morning',
    body: 'Woke up early, drank coffee, and watched the sunrise. No phone for the first hour. The world felt still and beautiful.',
    mood: 7,
    tags: ['#Morning', '#Peace', '#Gratitude'],
    date: subDays(today, 3),
    color: '#F2EBE3',
  },
  {
    id: 5,
    title: 'Anxiety about deadline',
    body: 'Upcoming deadline is stressing me out. Not sure if we can deliver on time. Need to break the work into smaller chunks and breathe.',
    mood: 2,
    tags: ['#Anxiety', '#Deadline', '#Stress'],
    date: subDays(today, 4),
    color: '#4A0404',
  },
  {
    id: 6,
    title: 'Meditated for 20 minutes',
    body: 'Sat with my thoughts and just breathed. The anxiety from yesterday began to dissolve. Stillness is a superpower.',
    mood: 6,
    tags: ['#Meditation', '#Calm'],
    date: subDays(today, 5),
    color: '#F2EBE3',
  },
];

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
      color: mood >= 8 ? 'var(--accent-color)' : mood >= 5 ? '#F2EBE3' : '#F2EBE3',
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
                background: mood >= 8 ? 'var(--accent-color)' : isLight ? 'rgba(0,0,0,0.15)' : 'rgba(242,235,227,0.3)',
                boxShadow: mood >= 8 ? '0 0 15px var(--accent-color)' : 'none' 
              }}
            />

            {/* Toolbar */}
            <div className="flex justify-between items-center px-6 py-4" style={{ borderBottom: `1px solid ${isLight ? 'rgba(0,0,0,0.08)' : 'rgba(242,235,227,0.05)'}` }}>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors" style={{ color: isLight ? 'rgba(0,0,0,0.5)' : 'rgba(242,235,227,0.5)' }}>
                <X size={22} />
              </button>
              <span className="text-xs uppercase tracking-[0.2em] flex items-center gap-2" style={{ color: isLight ? 'rgba(0,0,0,0.4)' : 'rgba(242,235,227,0.3)' }}>
                <Feather size={14} /> {editingEntry ? 'Edit Entry' : 'New Entry'}
              </span>
              <button onClick={handleSave} className="px-5 py-2 rounded-lg bg-[#C2185B]/10 text-[#C2185B] text-sm font-medium hover:bg-[#C2185B]/20 border border-[#C2185B]/20 transition-all">
                Save
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-8 lg:px-16 py-8">
              {/* Mood Selector */}
              <div className="mb-10">
                <div className="flex justify-between text-xs mb-3 tracking-widest uppercase" style={{ color: isLight ? 'rgba(0,0,0,0.4)' : 'rgba(242,235,227,0.4)' }}>
                  <span>Rough</span>
                  <span className="text-sm font-medium transition-colors" style={{ color: mood >= 8 ? 'var(--accent-color)' : isLight ? 'rgba(0,0,0,0.8)' : '#F2EBE3' }}>
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
                  style={{ background: isLight ? 'linear-gradient(to right, #e57373, #9e9e9e, #9B1B30)' : 'linear-gradient(to right, #4A0404, #F2EBE3, #C2185B)' }}
                />
              </div>

              {/* Title */}
              <input
                ref={titleRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full bg-transparent text-3xl lg:text-4xl font-light border-none outline-none mb-6"
                style={{ color: isLight ? 'rgba(0,0,0,0.85)' : '#F2EBE3' }}
              />

              {/* Body */}
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Let your thoughts flow freely..."
                className="w-full h-48 lg:h-64 bg-transparent text-lg border-none outline-none resize-none leading-relaxed"
                style={{ color: isLight ? 'rgba(0,0,0,0.7)' : 'rgba(242,235,227,0.8)' }}
              />

              {/* Tags */}
              <div className="mt-6 pt-6" style={{ borderTop: `1px solid ${isLight ? 'rgba(0,0,0,0.06)' : 'rgba(242,235,227,0.05)'}` }}>
                <input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Tags (comma separated): gratitude, work, calm"
                  className="w-full bg-transparent text-sm border-none outline-none"
                  style={{ color: isLight ? 'rgba(0,0,0,0.5)' : 'rgba(242,235,227,0.6)' }}
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 border-t flex gap-3" style={{ borderColor: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(242,235,227,0.05)' }}>
              <button className="p-3 rounded-xl border transition-all" style={{ background: isLight ? 'rgba(0,0,0,0.03)' : '#0A0A0A', borderColor: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(242,235,227,0.05)', color: isLight ? 'rgba(0,0,0,0.3)' : 'rgba(242,235,227,0.3)' }}>
                <ImageIcon size={18} />
              </button>
              <button className="p-3 rounded-xl border transition-all" style={{ background: isLight ? 'rgba(0,0,0,0.03)' : '#0A0A0A', borderColor: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(242,235,227,0.05)', color: isLight ? 'rgba(0,0,0,0.3)' : 'rgba(242,235,227,0.3)' }}>
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
  const textPrimary = isLight ? '#1a1a1a' : '#F2EBE3';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      onClick={onClick}
      className={clsx(
        'break-inside-avoid p-6 rounded-2xl border cursor-pointer group relative overflow-hidden transition-shadow glass-card',
        moodBorder(entry.mood, isLight),
      )}
    >
      {/* Top gradient based on mood */}
      <div className={clsx('absolute top-0 left-0 w-full h-24 bg-gradient-to-b pointer-events-none', moodGradient(entry.mood, isLight))} />

      {/* Action buttons — always visible */}
      <div className="absolute top-3 right-3 flex gap-1 z-10">
        <button onClick={(e) => { e.stopPropagation(); onEdit(entry); }}
          style={{ color: isLight ? 'rgba(26,26,26,0.5)' : 'rgba(242,235,227,0.5)' }}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-all">
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
        <span style={{ color: isLight ? 'rgba(26,26,26,0.45)' : 'rgba(242,235,227,0.45)' }} className="text-xs">{format(due, 'MMM d')}</span>
      </div>

      {/* Title */}
      <h3 style={{ color: textPrimary }} className="font-medium text-lg mb-3 group-hover:opacity-90 transition-colors relative">
        {entry.title}
      </h3>

      {/* Body Preview */}
      <p style={{ color: isLight ? 'rgba(26,26,26,0.4)' : 'rgba(242,235,227,0.4)' }} className="text-sm leading-relaxed mb-5 line-clamp-4 relative">
        {entry.body}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 relative">
        {entry.tags.map(tag => (
          <span key={tag} style={{ color: isLight ? 'rgba(26,26,26,0.5)' : 'rgba(242,235,227,0.5)', borderColor: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)' }} className="text-xs px-2.5 py-1 rounded-full bg-white/5 border">
            {tag}
          </span>
        ))}
      </div>

      <div className={clsx(
        'absolute top-14 right-5 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border',
        entry.mood >= 8 ? 'border-[var(--accent-color)]/30 text-[var(--accent-color)] bg-[var(--accent-color)]/10' :
        entry.mood >= 5 ? (isLight ? 'border-[#333]/10 text-[#333]/50 bg-black/5' : 'border-[#F2EBE3]/10 text-[#F2EBE3]/50 bg-white/5') :
        (isLight ? 'border-[#333]/10 text-[#333]/40 bg-black/5' : 'border-[#F2EBE3]/10 text-[#F2EBE3]/40 bg-white/5')
      )}>
        {entry.mood}
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN JOURNAL PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function MithraJournal() {
  const { theme } = useData();
  const isLight = theme === 'light';
  const [entries, setEntries] = useState(() => {
    try {
      const saved = localStorage.getItem(getUserScopedKey('journal-entries'));
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map(e => ({ ...e, date: new Date(e.date) }));
      }
    } catch {}
    return ENTRIES;
  });
  const [isEditorOpen, setEditorOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'high' | 'low'
  const [selectedEntry, setSelectedEntry] = useState(null);

  // Persist entries to localStorage
  useEffect(() => {
    try {
      try {
        localStorage.setItem(getUserScopedKey('journal-entries'), JSON.stringify(entries));
      } catch (e) {
        console.warn('Failed to save journal entries:', e.message);
      }
    } catch {}
  }, [entries]);

  const filteredEntries = entries.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.tags || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    if (activeFilter === 'high') return matchesSearch && e.mood >= 7;
    if (activeFilter === 'low') return matchesSearch && e.mood < 5;
    return matchesSearch;
  });

  const handleSaveEntry = (entry) => {
    if (editingEntry) {
      setEntries(prev => prev.map(e => e.id === entry.id ? entry : e));
      if (selectedEntry?.id === entry.id) setSelectedEntry(entry);
    } else {
      setEntries(prev => [entry, ...prev]);
    }
    setEditingEntry(null);
  };

  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    setSelectedEntry(null);
    setEditorOpen(true);
  };

  const handleDeleteEntry = (id) => {
    setEntries(prev => prev.filter(e => e.id !== id));
    if (selectedEntry?.id === id) setSelectedEntry(null);
  };

  // Stats
  const avgMood = entries.length > 0 ? (entries.reduce((a, e) => a + e.mood, 0) / entries.length).toFixed(1) : 0;
  // Real streak: count consecutive days with entries from today backwards
  const streakDays = (() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const entryDates = new Set(entries.map(e => {
      const d = new Date(e.date);
      d.setHours(0,0,0,0);
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
            >
              <div className={clsx('absolute top-0 left-0 w-full h-1', selectedEntry.mood >= 8 ? 'bg-accent-visor' : isLight ? 'bg-[#333]/30' : 'bg-[#F2EBE3]/30')} />
              <div className="absolute top-4 right-4 flex items-center gap-1.5">
                <button onClick={() => handleEditEntry(selectedEntry)}
                  style={{ color: isLight ? 'rgba(26,26,26,0.3)' : 'rgba(242,235,227,0.3)' }}
                  className="p-2 rounded-lg hover:bg-white/10 transition-all" title="Edit">
                  <Pencil size={18} />
                </button>
                <button onClick={() => handleDeleteEntry(selectedEntry.id)}
                  style={{ color: isLight ? 'rgba(26,26,26,0.3)' : 'rgba(242,235,227,0.3)' }}
                  className="p-2 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-all" title="Delete">
                  <Trash2 size={18} />
                </button>
                <button onClick={() => setSelectedEntry(null)} style={{ color: isLight ? 'rgba(26,26,26,0.5)' : 'rgba(242,235,227,0.5)' }} className="p-2 rounded-lg hover:bg-white/10">
                  <X size={20} />
                </button>
              </div>
              <div style={{ color: isLight ? 'rgba(26,26,26,0.4)' : 'rgba(242,235,227,0.4)' }} className="flex items-center gap-3 mb-6 text-sm">
                <span className="text-3xl">{moodEmoji(selectedEntry.mood)}</span>
                <span>{format(selectedEntry.date, 'EEEE, MMMM d, yyyy')}</span>
                <span style={{ borderColor: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(242,235,227,0.1)' }} className="ml-auto px-3 py-1 rounded-full border text-xs">Mood: {selectedEntry.mood}/10</span>
              </div>
              <h2 style={{ color: 'var(--text-primary)' }} className="text-2xl lg:text-3xl font-light mb-6">{selectedEntry.title}</h2>
              <p style={{ color: isLight ? 'rgba(26,26,26,0.7)' : 'rgba(242,235,227,0.7)' }} className="leading-relaxed text-lg whitespace-pre-wrap">{selectedEntry.body}</p>
              <div style={{ borderColor: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(242,235,227,0.05)' }} className="flex flex-wrap gap-2 mt-8 pt-6 border-t">
                {selectedEntry.tags.map(t => (
                  <span key={t} style={{ color: isLight ? 'rgba(26,26,26,0.5)' : 'rgba(242,235,227,0.5)' }} className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/5">{t}</span>
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
              <Book size={28} className="text-[#C2185B]" /> Journal
            </h1>
            <p style={{ color: isLight ? 'rgba(26,26,26,0.3)' : 'rgba(242,235,227,0.3)' }} className="mt-1 text-sm">Capture your mind. Track your soul.</p>
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
                    ? 'border-[#C2185B]/30 text-[#C2185B] bg-[#C2185B]/5'
                    : isLight ? 'border-[#333]/5 text-[#333]/30 hover:border-[#333]/15' : 'border-[#F2EBE3]/5 text-[#F2EBE3]/30 hover:border-[#F2EBE3]/15'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </header>

        {/* Search */}
        <div className="relative group">
          <Search style={{ color: isLight ? 'rgba(26,26,26,0.2)' : 'rgba(242,235,227,0.2)' }} className="absolute left-4 top-3.5 group-focus-within:text-[#C2185B] transition-colors" size={18} />
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
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(139,26,43,0.04)' }}
            onClick={() => setEditorOpen(true)}
            style={{ borderColor: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(242,235,227,0.1)', color: isLight ? 'rgba(26,26,26,0.3)' : 'rgba(242,235,227,0.3)', background: isLight ? 'rgba(255,255,255,0.5)' : 'rgba(10,10,10,0.3)', backdropFilter: 'blur(12px)' }}
            className="break-inside-avoid p-8 rounded-2xl border border-dashed flex flex-col items-center justify-center gap-4 cursor-pointer min-h-[220px] hover:text-[#C2185B] hover:border-[#C2185B]/30 transition-all group"
          >
            <div style={{ background: isLight ? 'rgba(245,245,245,1)' : 'rgba(10,10,10,1)', borderColor: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(242,235,227,0.05)' }} className="p-4 rounded-full border group-hover:border-[#C2185B]/30 group-hover:bg-[#C2185B]/5 transition-all">
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
          <div className="text-center py-20">
            <Feather size={48} style={{ color: isLight ? 'rgba(26,26,26,0.1)' : 'rgba(242,235,227,0.1)' }} className="mx-auto mb-4" />
            <p style={{ color: isLight ? 'rgba(26,26,26,0.2)' : 'rgba(242,235,227,0.2)' }} className="text-sm">No entries yet. Start writing.</p>
          </div>
        )}
      </div>

      {/* ── SIDEBAR: SOUL ANALYTICS ── */}
      <aside className="w-72 hidden xl:flex flex-col gap-6 flex-shrink-0">
        <div className="rounded-2xl p-5 flex flex-col gap-6 h-full overflow-y-auto glass-card glass-shine">

          {/* Average Mood */}
          <div className="text-center py-4">
            <div className="text-5xl mb-2">{moodEmoji(Math.round(avgMood))}</div>
            <div style={{ color: 'var(--text-primary)' }} className="text-2xl font-light">{avgMood}</div>
            <div style={{ color: isLight ? 'rgba(26,26,26,0.3)' : 'rgba(242,235,227,0.3)' }} className="text-xs mt-1 uppercase tracking-wider">Avg Mood</div>
          </div>

          {/* Mood Bars */}
          <div>
            <h4 style={{ color: isLight ? 'rgba(26,26,26,0.3)' : 'rgba(242,235,227,0.3)' }} className="text-xs uppercase tracking-wider font-bold mb-4 flex items-center gap-2">
              <BarChart2 size={14} /> This Week
            </h4>
            <div style={{ borderColor: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(242,235,227,0.05)' }} className="h-32 flex items-end justify-between gap-1.5 border-b pb-2">
              {weekMoods.map((val, i) => (
                <div key={i} style={{ background: isLight ? 'rgba(0,0,0,0.05)' : '#111' }} className="w-full rounded-t-sm relative group h-full flex items-end">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${val * 10}%` }}
                    transition={{ delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className={clsx(
                    'w-full rounded-t-sm transition-opacity',
                    val >= 8 ? 'bg-accent-visor' : isLight ? 'bg-[#333]' : 'bg-[#F2EBE3]',
                    'opacity-40 group-hover:opacity-100'
                  )}
                  />
                </div>
              ))}
            </div>
            <p style={{ color: isLight ? 'rgba(26,26,26,0.3)' : 'rgba(242,235,227,0.3)' }} className="text-xs text-center mt-3">
              Trending <span className="text-[#C2185B]">upward</span> this week
            </p>
          </div>

          {/* Tag Cloud */}
          <div>
            <h4 style={{ color: isLight ? 'rgba(26,26,26,0.3)' : 'rgba(242,235,227,0.3)' }} className="text-xs uppercase tracking-wider font-bold mb-4">Mind Patterns</h4>
            <div className="flex flex-wrap gap-2">
              {['Work', 'Peace', 'Gym', 'Anxiety', 'Code', 'Gratitude', 'Calm', 'Meetings', 'Win'].map((word, i) => (
                <span
                  key={word}
                  className={clsx(
                    'text-xs px-2.5 py-1 rounded-full border transition-colors cursor-default',
                  i % 3 === 0 ? 'border-accent-visor/20 text-accent-visor/60 hover:bg-accent-visor/5' :
                    isLight ? 'border-[#333]/10 text-[#333]/40 hover:bg-black/5' : 'border-[#F2EBE3]/10 text-[#F2EBE3]/40 hover:bg-white/5'
                  )}
                >
                  {word}
                </span>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div style={{ borderColor: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(242,235,227,0.05)' }} className="mt-auto pt-4 border-t space-y-3">
            <div className="flex justify-between text-xs">
              <span style={{ color: isLight ? 'rgba(26,26,26,0.3)' : 'rgba(242,235,227,0.3)' }}>Total Entries</span>
              <span style={{ color: isLight ? 'rgba(26,26,26,0.6)' : 'rgba(242,235,227,0.6)' }}>{entries.length}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span style={{ color: isLight ? 'rgba(26,26,26,0.3)' : 'rgba(242,235,227,0.3)' }}>Writing Streak</span>
              <span className="text-[#C2185B]/60">{streakDays} days</span>
            </div>
            <div className="flex justify-between text-xs">
              <span style={{ color: isLight ? 'rgba(26,26,26,0.3)' : 'rgba(242,235,227,0.3)' }}>Best Day</span>
              <span style={{ color: isLight ? 'rgba(26,26,26,0.6)' : 'rgba(242,235,227,0.6)' }}>🌟 9/10</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
