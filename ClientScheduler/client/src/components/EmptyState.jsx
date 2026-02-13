import React from 'react';
import { motion } from 'framer-motion';
import { Inbox } from 'lucide-react';

/**
 * Reusable empty state component for lists.
 * Usage: <EmptyState icon={ListTodo} title="No tasks yet" action={{ label: 'Add Task', onClick: fn }} />
 */
export default function EmptyState({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  description = '',
  action = null,  // { label: string, onClick: fn }
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: 'rgba(var(--color-visor, 194 24 91), 0.06)', border: '1px solid rgba(var(--color-visor, 194 24 91), 0.1)' }}
      >
        <Icon size={28} className="text-accent-visor opacity-50" />
      </div>
      <h3 className="text-[var(--text-primary)] text-base font-semibold mb-1 opacity-70">{title}</h3>
      {description && (
        <p className="text-[var(--text-dim)] text-sm max-w-xs leading-relaxed opacity-40">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-5 px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-90 active:scale-95"
          style={{ background: 'var(--accent-color)', color: 'white' }}
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
}
