import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, X } from 'lucide-react';

const SHORTCUTS = [
  { keys: ['⌘', 'K'], label: 'Search', action: 'search' },
  { keys: ['G', 'D'], label: 'Go to Dashboard', action: '/dashboard' },
  { keys: ['G', 'T'], label: 'Go to Tasks', action: '/tasks' },
  { keys: ['G', 'H'], label: 'Go to Habits', action: '/habits' },
  { keys: ['G', 'J'], label: 'Go to Journal', action: '/journal' },
  { keys: ['G', 'C'], label: 'Go to Calendar', action: '/calendar' },
  { keys: ['G', 'A'], label: 'Go to Dost AI', action: '/dost' },
  { keys: ['G', 'S'], label: 'Go to Settings', action: '/settings' },
  { keys: ['G', 'B'], label: 'Go to Blend', action: '/blend' },
  { keys: ['?'], label: 'Show shortcuts', action: 'help' },
];

export default function KeyboardShortcuts() {
  const [showHelp, setShowHelp] = useState(false);
  const [gPressed, setGPressed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isInputFocused = useCallback(() => {
    const el = document.activeElement;
    if (!el) return false;
    const tag = el.tagName.toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select' || el.isContentEditable;
  }, []);

  useEffect(() => {
    let gTimer = null;

    const handler = (e) => {
      if (isInputFocused()) return;

      // ? — show help
      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setShowHelp(p => !p);
        return;
      }

      // Escape — close help
      if (e.key === 'Escape' && showHelp) {
        setShowHelp(false);
        return;
      }

      // 'g' prefix — start navigation chord
      if (e.key === 'g' && !e.metaKey && !e.ctrlKey && !gPressed) {
        setGPressed(true);
        gTimer = setTimeout(() => setGPressed(false), 1000);
        return;
      }

      // Navigation targets after 'g'
      if (gPressed) {
        setGPressed(false);
        if (gTimer) clearTimeout(gTimer);
        const map = { d: '/dashboard', t: '/tasks', h: '/habits', j: '/journal', c: '/calendar', a: '/dost', s: '/settings', b: '/blend' };
        const target = map[e.key.toLowerCase()];
        if (target && location.pathname !== target) {
          e.preventDefault();
          navigate(target);
        }
        return;
      }
    };

    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
      if (gTimer) clearTimeout(gTimer);
    };
  }, [gPressed, showHelp, navigate, location, isInputFocused]);

  return (
    <AnimatePresence>
      {showHelp && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowHelp(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md rounded-2xl p-6 space-y-4"
            style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', backdropFilter: 'blur(20px)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Keyboard size={18} style={{ color: 'var(--accent-color)' }} />
                <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Keyboard Shortcuts</h2>
              </div>
              <button onClick={() => setShowHelp(false)} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
                <X size={18} style={{ color: 'var(--text-dim)' }} />
              </button>
            </div>

            <div className="space-y-2">
              {SHORTCUTS.map(s => (
                <div key={s.label} className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ background: 'var(--glass-border)' }}>
                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{s.label}</span>
                  <div className="flex items-center gap-1">
                    {s.keys.map((k, i) => (
                      <React.Fragment key={i}>
                        {i > 0 && <span className="text-[10px] mx-0.5" style={{ color: 'var(--text-dim)' }}>then</span>}
                        <kbd className="px-2 py-0.5 rounded text-xs font-mono" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }}>
                          {k}
                        </kbd>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-center text-[10px]" style={{ color: 'var(--text-dim)' }}>
              Press <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono" style={{ background: 'var(--bg-primary)', border: '1px solid var(--glass-border)' }}>?</kbd> to toggle this overlay
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
