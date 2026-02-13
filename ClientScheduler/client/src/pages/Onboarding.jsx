import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, CheckCircle2, Activity, Calendar, Sparkles, ArrowRight, ChevronLeft } from 'lucide-react';

const luxuryEase = [0.22, 1, 0.36, 1];

/* ═══════════ ONBOARDING SLIDES — Clean & Minimal ═══════════ */
const SLIDES = [
  {
    icon: Bot,
    title: 'Welcome to Mithra',
    subtitle: 'Your intelligent Life OS',
    description: 'Organize tasks, build habits, focus deeply, and reflect — all in one beautiful app.',
    color: 'var(--accent-color)',
  },
  {
    icon: CheckCircle2,
    title: 'Smart Task Management',
    subtitle: 'Never miss a deadline',
    description: 'Create tasks with priorities, due dates, and recurring schedules. Get notified before anything slips.',
    color: '#3b82f6',
  },
  {
    icon: Activity,
    title: 'Habit & Focus Tracking',
    subtitle: 'Build consistency',
    description: 'Track daily habits with streak counters, and use the Pomodoro timer to maintain deep focus.',
    color: '#f97316',
  },
  {
    icon: Calendar,
    title: 'Calendar & Journal',
    subtitle: 'Plan and reflect',
    description: 'Visualize your schedule, sync tasks to your calendar, and journal your thoughts with mood tracking.',
    color: '#a855f7',
  },
  {
    icon: Sparkles,
    title: 'Dost Mode AI',
    subtitle: 'Your AI assistant',
    description: 'Chat with Dost — your AI companion who understands your tasks, habits, and can help you plan.',
    color: 'var(--accent-color)',
  },
];

export default function Onboarding({ onComplete }) {
  const [current, setCurrent] = useState(0);
  const slide = SLIDES[current];
  const Icon = slide.icon;
  const isLast = current === SLIDES.length - 1;

  const handleNext = () => {
    if (isLast) {
      localStorage.setItem('mithra-onboarding-done', 'true');
      onComplete();
    } else {
      setCurrent(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (current > 0) setCurrent(prev => prev - 1);
  };

  const handleSkip = () => {
    localStorage.setItem('mithra-onboarding-done', 'true');
    onComplete();
  };

  /* Helper to handle colors that might be CSS vars or Hex */
  const getSlideColor = (c) => c.startsWith('var') ? c : c;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'var(--body-bg)' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.5, ease: luxuryEase }}
          className="max-w-md w-full text-center space-y-8"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.6, ease: luxuryEase }}
            className="w-24 h-24 rounded-3xl mx-auto flex items-center justify-center"
            style={{
              background: slide.color.startsWith('var') ? `color-mix(in srgb, ${slide.color}, transparent 90%)` : `${slide.color}15`,
              border: `1px solid ${slide.color.startsWith('var') ? `color-mix(in srgb, ${slide.color}, transparent 70%)` : `${slide.color}30`}`
            }}
          >
            <Icon size={40} style={{ color: getSlideColor(slide.color) }} />
          </motion.div>

          {/* Text */}
          <div className="space-y-3">
            <h1 className="text-3xl font-light tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {slide.title}
            </h1>
            <p className="text-sm font-semibold tracking-wide uppercase" style={{ color: getSlideColor(slide.color) }}>
              {slide.subtitle}
            </p>
            <p className="text-sm leading-relaxed max-w-xs mx-auto" style={{ color: 'var(--text-dim)', opacity: 0.8 }}>
              {slide.description}
            </p>
          </div>

          {/* Dots */}
          <div className="flex items-center justify-center gap-2">
            {SLIDES.map((_, i) => (
              <motion.div
                key={i}
                className="rounded-full transition-all"
                style={{
                  width: i === current ? 24 : 8,
                  height: 8,
                  background: i === current ? getSlideColor(slide.color) : 'var(--glass-border)',
                }}
                layout
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Buttons */}
      <div className="mt-12 w-full max-w-md flex items-center justify-between">
        {current > 0 ? (
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-sm transition-colors"
            style={{ color: 'var(--text-dim)', opacity: 0.5 }}
          >
            <ChevronLeft size={16} /> Back
          </button>
        ) : (
          <button
            onClick={handleSkip}
            className="text-sm transition-colors"
            style={{ color: 'var(--text-dim)', opacity: 0.5 }}
          >
            Skip
          </button>
        )}

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleNext}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-semibold text-sm transition-all"
          style={{
            background: getSlideColor(slide.color),
            boxShadow: `0 0 20px ${slide.color.startsWith('var') ? 'var(--accent-glow)' : `${slide.color}33`}`
          }}
        >
          {isLast ? 'Get Started' : 'Next'}
          {isLast ? <Sparkles size={16} /> : <ArrowRight size={16} />}
        </motion.button>
      </div>
    </div>
  );
}
