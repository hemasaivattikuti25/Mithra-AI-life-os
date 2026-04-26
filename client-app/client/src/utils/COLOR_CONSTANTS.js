/**
 * Centralized color palette for theme consistency
 * Eliminates hardcoded hex values throughout codebase
 * All components should import and use these instead of hardcoded colors
 */

// Status badge colors (theme-independent semantic colors)
export const STATUS_COLORS = {
  perfect: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', label: 'Perfect Day' },
  onTrack: { color: 'var(--accent-color)', bg: 'rgba(34,211,238,0.1)', label: 'On Track' },
  inProgress: { color: '#facc15', bg: 'rgba(250,204,21,0.1)', label: 'In Progress' },
  notStarted: { color: '#6b7280', bg: 'rgba(107,114,128,0.1)', label: 'Not Started' },
};

// Habit colors used throughout the app
export const HABIT_COLORS = [
  'var(--accent-color)',  // Accent (theme-aware)
  '#3b82f6',              // Blue
  '#f97316',              // Orange
  '#a855f7',              // Purple
  '#06b6d4',              // Cyan
  '#ef4444',              // Red
  '#eab308',              // Yellow
  '#ec4899',              // Pink
  '#14b8a6',              // Teal
  'var(--text-primary)',  // Text primary (theme-aware)
];

// Habit focus mode buttons (dark mode only currently)
export const HABIT_MODE_COLORS = {
  timer: {
    active: 'border-[var(--accent-color)]/30 text-[var(--accent-color)] bg-[var(--accent-color)]/10',
    inactive: 'border-[var(--text-primary)]/10 text-[var(--text-primary)]/35',
  },
  stopwatch: {
    active: 'border-[var(--accent-color)]/30 text-[var(--accent-color)] bg-[var(--accent-color)]/10',
    inactive: 'border-[var(--text-primary)]/10 text-[var(--text-primary)]/35',
  },
};

// Gradient backgrounds (use CSS variables for theme awareness)
export const GRADIENTS = {
  accentToPrimary: 'linear-gradient(90deg, var(--accent-color), var(--text-primary))',
  accentToBlue: 'linear-gradient(90deg, var(--accent-color), #2563eb)',
  diagonalAccent: 'linear-gradient(135deg, var(--accent-color), #2563eb)',
  radialAccent: 'radial-gradient(circle, var(--accent-color) 0%, transparent 70%)',
  accentGlow: 'linear-gradient(135deg, var(--glass-bg) 0%, rgba(34,211,238,0.05) 100%)',
};

// Theme variables (for reference/documentation)
export const THEME = {
  dark: {
    bg: '#050505',
    surface: '#0A0C10',
    text: '#F2EBE3',
    textDim: 'rgba(242, 235, 227, 0.6)',
    accent: '#22d3ee',
    accentSoft: '#0891b2',
    accentSecondary: '#38bdf8',
  },
  light: {
    bg: '#F8FAFC',
    surface: '#ffffff',
    text: '#0F172A',
    textDim: 'rgba(15, 23, 42, 0.65)',
    accent: '#06b6d4',
    accentSoft: '#0891b2',
    accentSecondary: '#0ea5e9',
  },
};

export default {
  STATUS_COLORS,
  HABIT_COLORS,
  HABIT_MODE_COLORS,
  GRADIENTS,
  THEME,
};
