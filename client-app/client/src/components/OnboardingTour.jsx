import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

const TOUR_KEY = 'mithra_onboarding_complete';

const steps = [
    {
        target: '#nav-dashboard',
        title: 'Welcome to Mithra! 🎉',
        body: 'This is your Dashboard — your daily command center. See tasks, habits, and streaks at a glance.',
        position: 'bottom',
    },
    {
        target: '#nav-tasks',
        title: 'Smart Task Engine',
        body: 'Create tasks with priorities, subtasks, and due dates. Mithra keeps you on track.',
        position: 'bottom',
    },
    {
        target: '#nav-habits',
        title: 'Habit Tracking',
        body: 'Build habits with GitHub-style heatmaps and streak counters. Consistency is everything.',
        position: 'bottom',
    },
    {
        target: '#nav-dost',
        title: 'Meet Dost AI 🤖',
        body: "Your Stoic AI companion. Ask for advice, schedule tasks, or just vent — Dost remembers everything.",
        position: 'bottom',
    },
    {
        target: '#nav-blend',
        title: 'Mithra Blend',
        body: 'Invite friends to shared workspaces. Track goals together and stay accountable — like Spotify Blend for productivity!',
        position: 'bottom',
    },
];

export default function OnboardingTour({ onComplete }) {
    const [active, setActive] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [tooltipStyle, setTooltipStyle] = useState({});

    // Only show on first login
    useEffect(() => {
        const done = localStorage.getItem(TOUR_KEY);
        if (!done) {
            const timer = setTimeout(() => setActive(true), 1200); // Wait for page to render
            return () => clearTimeout(timer);
        }
    }, []);

    // Position tooltip relative to target element
    const positionTooltip = useCallback(() => {
        const step = steps[currentStep];
        if (!step?.target) return;

        const el = document.querySelector(step.target);
        if (!el) {
            // Fallback: center on screen
            setTooltipStyle({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
            return;
        }

        const rect = el.getBoundingClientRect();
        const pad = 12;

        if (step.position === 'bottom') {
            setTooltipStyle({
                top: rect.bottom + pad,
                left: Math.max(16, Math.min(rect.left + rect.width / 2 - 160, window.innerWidth - 336)),
            });
        } else {
            setTooltipStyle({
                top: Math.max(16, rect.top - pad - 200),
                left: Math.max(16, Math.min(rect.left + rect.width / 2 - 160, window.innerWidth - 336)),
            });
        }

        // Highlight target
        el.style.position = 'relative';
        el.style.zIndex = '10001';
        el.style.boxShadow = '0 0 0 4px var(--accent-color, #22d3ee), 0 0 20px rgba(34,211,238,0.3)';
        el.style.borderRadius = '12px';
        el.style.transition = 'box-shadow 0.3s ease';
    }, [currentStep]);

    useEffect(() => {
        if (!active) return;
        positionTooltip();
        window.addEventListener('resize', positionTooltip);
        return () => window.removeEventListener('resize', positionTooltip);
    }, [active, positionTooltip]);

    // Cleanup highlight when step changes
    useEffect(() => {
        return () => {
            steps.forEach(s => {
                const el = document.querySelector(s.target);
                if (el) {
                    el.style.zIndex = '';
                    el.style.boxShadow = '';
                }
            });
        };
    }, [currentStep]);

    const finish = () => {
        setActive(false);
        localStorage.setItem(TOUR_KEY, 'true');
        // Clean up all highlights
        steps.forEach(s => {
            const el = document.querySelector(s.target);
            if (el) { el.style.zIndex = ''; el.style.boxShadow = ''; }
        });
        onComplete?.();
    };

    const next = () => {
        // Remove current highlight
        const currentEl = document.querySelector(steps[currentStep].target);
        if (currentEl) { currentEl.style.zIndex = ''; currentEl.style.boxShadow = ''; }

        if (currentStep >= steps.length - 1) {
            finish();
        } else {
            setCurrentStep(prev => prev + 1);
        }
    };

    const prev = () => {
        const currentEl = document.querySelector(steps[currentStep].target);
        if (currentEl) { currentEl.style.zIndex = ''; currentEl.style.boxShadow = ''; }
        setCurrentStep(prev => Math.max(0, prev - 1));
    };

    if (!active) return null;

    const step = steps[currentStep];

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm"
                onClick={finish}
            />

            {/* Tooltip */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="fixed z-[10002] w-80 rounded-2xl p-5 border border-[var(--glass-border)] shadow-2xl"
                    style={{
                        ...tooltipStyle,
                        background: 'var(--glass-bg, rgba(15,15,25,0.95))',
                        backdropFilter: 'blur(40px)',
                    }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-[var(--accent-color)]" />
                            <span className="text-xs font-mono text-[var(--text-dim)] uppercase tracking-wider">
                                Step {currentStep + 1}/{steps.length}
                            </span>
                        </div>
                        <button onClick={finish} className="text-[var(--text-dim)] hover:text-[var(--text-primary)] transition-colors">
                            <X size={16} />
                        </button>
                    </div>

                    {/* Content */}
                    <h3 className="text-base font-bold text-[var(--text-primary)] mb-2">{step.title}</h3>
                    <p className="text-sm text-[var(--text-dim)] leading-relaxed mb-5">{step.body}</p>

                    {/* Progress dots */}
                    <div className="flex items-center justify-center gap-1.5 mb-4">
                        {steps.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep
                                        ? 'w-6 bg-[var(--accent-color)]'
                                        : i < currentStep
                                            ? 'w-1.5 bg-[var(--accent-color)] opacity-50'
                                            : 'w-1.5 bg-[var(--glass-border)]'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center justify-between">
                        <button
                            onClick={finish}
                            className="text-xs text-[var(--text-dim)] hover:text-[var(--text-primary)] transition-colors"
                        >
                            Skip tour
                        </button>
                        <div className="flex gap-2">
                            {currentStep > 0 && (
                                <button
                                    onClick={prev}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--text-dim)] hover:text-[var(--text-primary)] transition-colors bg-[var(--glass-bg)] border border-[var(--glass-border)]"
                                >
                                    <ChevronLeft size={14} /> Back
                                </button>
                            )}
                            <button
                                onClick={next}
                                className="flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-semibold text-white transition-all"
                                style={{ background: 'var(--accent-color, #22d3ee)' }}
                            >
                                {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                                {currentStep < steps.length - 1 && <ChevronRight size={14} />}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </>
    );
}
