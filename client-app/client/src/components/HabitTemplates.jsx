import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Dumbbell, BookOpen, Brain, Heart, Sparkles, Plus, Check, Flame } from 'lucide-react';

const HABIT_TEMPLATES = [
  {
    id: 'morning',
    name: 'Morning Routine',
    icon: '🌅',
    description: 'Start every day strong',
    color: '#f97316',
    habits: [
      { title: 'Wake up early', category: 'Health', color: '#f97316', scheduleTime: '06:00', focusDuration: 5, repeatDays: [0,1,2,3,4,5,6] },
      { title: 'Drink water', category: 'Health', color: '#06b6d4', scheduleTime: '06:15', focusDuration: 2, repeatDays: [0,1,2,3,4,5,6] },
      { title: 'Stretch / Yoga', category: 'Health', color: '#a855f7', scheduleTime: '06:30', focusDuration: 15, repeatDays: [0,1,2,3,4,5,6] },
      { title: 'Journal 3 gratitudes', category: 'Mindfulness', color: '#C2185B', scheduleTime: '06:50', focusDuration: 5, repeatDays: [0,1,2,3,4,5,6] },
    ],
  },
  {
    id: 'fitness',
    name: '30-Day Fitness',
    icon: '💪',
    description: 'Build your fitness foundation',
    color: '#ef4444',
    habits: [
      { title: '30 min workout', category: 'Health', color: '#ef4444', scheduleTime: '07:00', focusDuration: 30, repeatDays: [1,2,3,4,5] },
      { title: '10K steps', category: 'Health', color: '#f97316', scheduleTime: '12:00', focusDuration: 60, repeatDays: [0,1,2,3,4,5,6] },
      { title: 'Drink 8 glasses of water', category: 'Health', color: '#06b6d4', scheduleTime: '08:00', focusDuration: 1, repeatDays: [0,1,2,3,4,5,6] },
      { title: 'No junk food', category: 'Health', color: '#22c55e', scheduleTime: '12:00', focusDuration: 1, repeatDays: [0,1,2,3,4,5,6] },
    ],
  },
  {
    id: 'study',
    name: 'Study Streak',
    icon: '📚',
    description: 'Ace your exams',
    color: '#3b82f6',
    habits: [
      { title: 'Study for 1 hour', category: 'Learning', color: '#3b82f6', scheduleTime: '09:00', focusDuration: 60, repeatDays: [0,1,2,3,4,5,6] },
      { title: 'Review flashcards', category: 'Learning', color: '#06b6d4', scheduleTime: '14:00', focusDuration: 15, repeatDays: [0,1,2,3,4,5,6] },
      { title: 'Read 20 pages', category: 'Learning', color: '#a855f7', scheduleTime: '21:00', focusDuration: 30, repeatDays: [0,1,2,3,4,5,6] },
      { title: 'Teach someone what I learned', category: 'Learning', color: '#f97316', scheduleTime: '17:00', focusDuration: 10, repeatDays: [1,3,5] },
    ],
  },
  {
    id: 'mindfulness',
    name: 'Mindfulness',
    icon: '🧘',
    description: 'Inner peace daily',
    color: '#C2185B',
    habits: [
      { title: 'Meditate 10 minutes', category: 'Mindfulness', color: '#C2185B', scheduleTime: '07:00', focusDuration: 10, repeatDays: [0,1,2,3,4,5,6] },
      { title: 'Deep breathing exercise', category: 'Mindfulness', color: '#a855f7', scheduleTime: '12:00', focusDuration: 5, repeatDays: [0,1,2,3,4,5,6] },
      { title: 'Digital detox 1 hour', category: 'Mindfulness', color: '#06b6d4', scheduleTime: '20:00', focusDuration: 60, repeatDays: [0,1,2,3,4,5,6] },
      { title: 'Write in gratitude journal', category: 'Mindfulness', color: '#f97316', scheduleTime: '21:30', focusDuration: 10, repeatDays: [0,1,2,3,4,5,6] },
    ],
  },
  {
    id: 'productivity',
    name: 'Productivity Beast',
    icon: '⚡',
    description: 'Maximize your output',
    color: '#FACC15',
    habits: [
      { title: 'Plan top 3 priorities', category: 'Work', color: '#3b82f6', scheduleTime: '08:00', focusDuration: 10, repeatDays: [1,2,3,4,5] },
      { title: 'Deep work block (2hrs)', category: 'Work', color: '#FACC15', scheduleTime: '09:00', focusDuration: 120, repeatDays: [1,2,3,4,5] },
      { title: 'Inbox zero', category: 'Work', color: '#06b6d4', scheduleTime: '16:00', focusDuration: 15, repeatDays: [1,2,3,4,5] },
      { title: 'Evening review / reflect', category: 'Personal', color: '#a855f7', scheduleTime: '21:00', focusDuration: 10, repeatDays: [0,1,2,3,4,5,6] },
    ],
  },
  {
    id: 'selfcare',
    name: 'Self Care',
    icon: '🌸',
    description: 'Nurture yourself',
    color: '#a855f7',
    habits: [
      { title: 'Skincare routine', category: 'Personal', color: '#a855f7', scheduleTime: '07:00', focusDuration: 10, repeatDays: [0,1,2,3,4,5,6] },
      { title: 'Sleep by 11pm', category: 'Health', color: '#3b82f6', scheduleTime: '22:45', focusDuration: 5, repeatDays: [0,1,2,3,4,5,6] },
      { title: 'Cook a healthy meal', category: 'Health', color: '#22c55e', scheduleTime: '18:00', focusDuration: 30, repeatDays: [0,1,2,3,4,5,6] },
      { title: 'No screen 30min before bed', category: 'Mindfulness', color: '#C2185B', scheduleTime: '22:15', focusDuration: 30, repeatDays: [0,1,2,3,4,5,6] },
    ],
  },
];

export default function HabitTemplates({ isOpen, onClose, onAddHabits }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [addedTemplates, setAddedTemplates] = useState(new Set());

  if (!isOpen) return null;

  const handleUseTemplate = (template) => {
    const habitsToAdd = template.habits.map(h => ({
      ...h,
      id: crypto.randomUUID(),
      streak: 0,
      bestStreak: 0,
      consistency: [],
      streakGoal: 30,
      streakUnit: 'Day',
      frequency: 1,
      reminder: true,
      todayDone: false,
    }));
    onAddHabits(habitsToAdd);
    setAddedTemplates(prev => new Set([...prev, template.id]));
    setSelectedTemplate(null);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="glass-card glass-shine rounded-2xl p-6 max-w-md w-full max-h-[85vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Sparkles size={20} style={{ color: 'var(--accent-color)' }} />
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                Habit Templates
              </h2>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--glass-bg-hover)]">
              <X size={18} style={{ color: 'var(--text-dim)' }} />
            </button>
          </div>

          <p className="text-xs mb-4" style={{ color: 'var(--text-dim)' }}>
            One-tap habit packs to kickstart your journey
          </p>

          {/* Template detail view */}
          <AnimatePresence mode="wait">
            {selectedTemplate ? (
              <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <button onClick={() => setSelectedTemplate(null)} className="text-xs mb-3 flex items-center gap-1" style={{ color: 'var(--accent-color)' }}>
                  ← Back to templates
                </button>

                <div className="p-4 rounded-xl mb-4" style={{ background: `${selectedTemplate.color}15`, border: `1px solid ${selectedTemplate.color}30` }}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{selectedTemplate.icon}</span>
                    <div>
                      <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>{selectedTemplate.name}</h3>
                      <p className="text-xs" style={{ color: 'var(--text-dim)' }}>{selectedTemplate.description}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {selectedTemplate.habits.map((h, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
                      <div className="w-2 h-8 rounded-full" style={{ background: h.color }} />
                      <div className="flex-1">
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{h.title}</p>
                        <p className="text-[10px]" style={{ color: 'var(--text-dim)' }}>
                          {h.scheduleTime} · {h.focusDuration}min · {h.category}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleUseTemplate(selectedTemplate)}
                  disabled={addedTemplates.has(selectedTemplate.id)}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-40"
                  style={{ background: addedTemplates.has(selectedTemplate.id) ? 'var(--glass-border)' : selectedTemplate.color }}
                >
                  {addedTemplates.has(selectedTemplate.id) ? (
                    <span className="flex items-center justify-center gap-2"><Check size={16} /> Added!</span>
                  ) : (
                    <span className="flex items-center justify-center gap-2"><Plus size={16} /> Add All {selectedTemplate.habits.length} Habits</span>
                  )}
                </button>
              </motion.div>
            ) : (
              <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                {HABIT_TEMPLATES.map(template => (
                  <motion.button
                    key={template.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedTemplate(template)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all"
                    style={{ background: `${template.color}08`, border: `1px solid ${template.color}20` }}
                  >
                    <span className="text-2xl">{template.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {template.name}
                        {addedTemplates.has(template.id) && <Check size={12} className="inline ml-1.5 text-green-400" />}
                      </h3>
                      <p className="text-[11px]" style={{ color: 'var(--text-dim)' }}>{template.description}</p>
                      <p className="text-[10px] mt-1" style={{ color: template.color }}>
                        {template.habits.length} habits · {template.habits.map(h => h.category).filter((v, i, a) => a.indexOf(v) === i).join(', ')}
                      </p>
                    </div>
                    <Flame size={14} style={{ color: template.color, opacity: 0.5 }} />
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
