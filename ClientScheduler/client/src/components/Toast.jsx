import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, X, Undo2 } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
  warning: AlertTriangle,
};

const COLORS = {
  success: { bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)', icon: '#22c55e' },
  error: { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', icon: '#ef4444' },
  info: { bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)', icon: '#3b82f6' },
  warning: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', icon: '#f59e0b' },
};

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const addToast = useCallback(({ message, type = 'info', duration = 4000, undoAction = null }) => {
    const id = ++toastId;
    setToasts(prev => [...prev.slice(-4), { id, message, type, undoAction }]);
    timers.current[id] = setTimeout(() => removeToast(id), duration);
    return id;
  }, [removeToast]);

  const handleUndo = useCallback((toast) => {
    if (toast.undoAction) toast.undoAction();
    removeToast(toast.id);
  }, [removeToast]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(timers.current).forEach(clearTimeout);
    };
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map(toast => {
            const Icon = ICONS[toast.type] || Info;
            const color = COLORS[toast.type] || COLORS.info;
            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl backdrop-blur-xl shadow-2xl"
                style={{ 
                  background: color.bg, 
                  border: `1px solid ${color.border}`,
                  backdropFilter: 'blur(20px) saturate(180%)',
                }}
              >
                <Icon size={18} style={{ color: color.icon }} className="flex-shrink-0" />
                <span className="text-sm text-mithra-merino/90 flex-1">{toast.message}</span>
                {toast.undoAction && (
                  <button
                    onClick={() => handleUndo(toast)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all hover:scale-105"
                    style={{ color: color.icon, background: `${color.icon}15` }}
                  >
                    <Undo2 size={12} /> Undo
                  </button>
                )}
                <button onClick={() => removeToast(toast.id)} className="p-1 rounded-lg hover:bg-white/10 text-mithra-merino/40 hover:text-mithra-merino/70 transition-colors flex-shrink-0">
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
