import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

/**
 * Reusable confirmation dialog for destructive actions
 * Usage: <ConfirmDialog open={bool} onConfirm={fn} onCancel={fn} title="..." message="..." />
 */
export default function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  variant = 'danger', // 'danger' | 'warning' | 'info'
}) {
  const colors = {
    danger: { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.15)', btn: '#ef4444', icon: '#ef4444' },
    warning: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.15)', btn: '#f59e0b', icon: '#f59e0b' },
    info: { bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.15)', btn: 'var(--accent-color)', icon: 'var(--accent-color)' },
  };
  const c = colors[variant] || colors.danger;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 backdrop-blur-xl p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.92, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 12 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl overflow-hidden glass-heavy"
          >
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                  <AlertTriangle size={20} style={{ color: c.icon }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-mithra-merino text-base font-semibold">{title}</h3>
                  <p className="text-mithra-merino/50 text-sm mt-1 leading-relaxed">{message}</p>
                </div>
                <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-white/10 text-mithra-merino/40 flex-shrink-0">
                  <X size={16} />
                </button>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={onCancel}
                  className="px-4 py-2 rounded-xl text-sm font-medium glass-card text-mithra-merino/70 hover:text-mithra-merino transition-all"
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={onConfirm}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                  style={{ backgroundColor: c.btn }}
                >
                  {confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
