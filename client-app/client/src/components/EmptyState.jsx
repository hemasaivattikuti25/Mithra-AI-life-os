import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import clsx from 'clsx';

const EmptyState = ({
  icon: Icon = Sparkles,
  title = "Start your journey",
  description = "There is nothing here yet. Take the first step towards a more organized life.",
  actionLabel,
  onAction,
  className = ""
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        "flex flex-col items-center justify-center py-12 px-6 text-center rounded-3xl",
        "glass-card glass-shine",
        className
      )}
    >
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-[var(--accent-glow)] mb-6">
        <Icon className="w-8 h-8 text-[var(--accent-color)]" />
      </div>

      <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 tracking-tight">
        {title}
      </h3>

      <p className="text-[var(--text-dim)] text-sm max-w-sm mb-8 leading-relaxed opacity-60">
        {description}
      </p>

      {actionLabel && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAction}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: 'var(--accent-color)',
            color: 'var(--selection-text)',
            boxShadow: '0 8px 24px var(--accent-glow)'
          }}
        >
          {actionLabel}
          <ArrowRight size={16} />
        </motion.button>
      )}
    </motion.div>
  );
};

export default EmptyState;
