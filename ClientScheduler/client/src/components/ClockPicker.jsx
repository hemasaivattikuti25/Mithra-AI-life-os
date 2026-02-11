import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, X } from 'lucide-react';
import { useData } from '../context/DataContext';

/* ═══════════════════════════════════════════════════════════════
   MATERIAL DESIGN CLOCK PICKER — Themed & Beautiful
   Circular time picker matching the app's glassmorphism aesthetic
   ═══════════════════════════════════════════════════════════════ */

const ClockPicker = ({ value, onChange, label }) => {
  const { theme, accentColor } = useData();
  const isLight = theme === 'light';

  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('hour'); // 'hour' | 'minute'
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [period, setPeriod] = useState('AM');

  // Parse initial value (HH:mm format)
  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':').map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        setHour(h > 12 ? h - 12 : h === 0 ? 12 : h);
        setMinute(m);
        setPeriod(h >= 12 ? 'PM' : 'AM');
      }
    }
  }, [value]);

  const handleConfirm = useCallback(() => {
    let h24 = hour;
    if (period === 'PM' && hour !== 12) h24 += 12;
    if (period === 'AM' && hour === 12) h24 = 0;
    const timeStr = `${String(h24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    onChange(timeStr);
    setIsOpen(false);
  }, [hour, minute, period, onChange]);

  const handleNumberClick = useCallback((num) => {
    if (mode === 'hour') {
      setHour(num);
      setTimeout(() => setMode('minute'), 400);
    } else {
      setMinute(num);
    }
  }, [mode]);

  // Clock face numbers
  const hourNumbers = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const minuteNumbers = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
  const numbers = mode === 'hour' ? hourNumbers : minuteNumbers;
  const selectedValue = mode === 'hour' ? hour : minute;

  // Circle geometry
  const size = 240;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 95;
  const dotRadius = 18;

  // Calculate positions (12 numbers evenly spaced, starting at top)
  const getPosition = (index) => {
    const angle = ((index * 30) - 90) * (Math.PI / 180);
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  };

  // Selected number position for the hand line
  const selectedIdx = numbers.indexOf(selectedValue);
  const selectedPos = selectedIdx >= 0 ? getPosition(selectedIdx) : null;

  // Display value
  const displayHour = String(hour).padStart(2, '0');
  const displayMinute = String(minute).padStart(2, '0');

  // Formatted display for the button
  const displayTime = value
    ? (() => {
        const [h, m] = value.split(':').map(Number);
        const hr = h > 12 ? h - 12 : h === 0 ? 12 : h;
        const ap = h >= 12 ? 'PM' : 'AM';
        return `${hr}:${String(m).padStart(2, '0')} ${ap}`;
      })()
    : 'Set time';

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => { setIsOpen(true); setMode('hour'); }}
        className="glass-input !py-2.5 !text-sm w-full flex items-center gap-2 cursor-pointer text-left"
      >
        <Clock size={14} style={{ color: 'var(--accent-color)', opacity: 0.7 }} />
        <span style={{ color: value ? 'var(--text-primary)' : 'var(--text-dim)' }}>
          {displayTime}
        </span>
      </button>

      {/* Clock Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-xl"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-3xl overflow-hidden shadow-2xl"
              style={{
                width: 320,
                background: isLight
                  ? 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(245,240,235,0.98) 100%)'
                  : 'linear-gradient(180deg, rgba(20,18,18,0.98) 0%, rgba(12,10,10,0.99) 100%)',
                border: `1px solid ${isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'}`,
                backdropFilter: 'blur(40px)',
              }}
            >
              {/* Header: "Select time" */}
              <div className="px-6 pt-5 pb-2">
                <p className="text-xs font-medium uppercase tracking-widest"
                  style={{ color: 'var(--text-dim)' }}>
                  Select time
                </p>
              </div>

              {/* Time Display */}
              <div className="px-6 pb-4 flex items-center gap-1">
                {/* Hour box */}
                <button
                  onClick={() => setMode('hour')}
                  className="rounded-xl px-4 py-3 text-4xl font-bold transition-all"
                  style={{
                    background: mode === 'hour' ? accentColor.color : (isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)'),
                    color: mode === 'hour' ? '#fff' : 'var(--text-primary)',
                    minWidth: 72,
                  }}
                >
                  {displayHour}
                </button>

                <span className="text-4xl font-light mx-1" style={{ color: 'var(--text-dim)' }}>:</span>

                {/* Minute box */}
                <button
                  onClick={() => setMode('minute')}
                  className="rounded-xl px-4 py-3 text-4xl font-bold transition-all"
                  style={{
                    background: mode === 'minute' ? accentColor.color : (isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)'),
                    color: mode === 'minute' ? '#fff' : 'var(--text-primary)',
                    minWidth: 72,
                  }}
                >
                  {displayMinute}
                </button>

                {/* Spacer */}
                <div className="flex-1" />

                {/* AM/PM Toggle */}
                <div className="flex flex-col rounded-xl overflow-hidden border"
                  style={{ borderColor: isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.12)' }}>
                  <button
                    onClick={() => setPeriod('AM')}
                    className="px-3 py-1.5 text-sm font-bold transition-all"
                    style={{
                      background: period === 'AM' ? accentColor.color : 'transparent',
                      color: period === 'AM' ? '#fff' : 'var(--text-dim)',
                    }}
                  >
                    AM
                  </button>
                  <div style={{ height: 1, background: isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.12)' }} />
                  <button
                    onClick={() => setPeriod('PM')}
                    className="px-3 py-1.5 text-sm font-bold transition-all"
                    style={{
                      background: period === 'PM' ? accentColor.color : 'transparent',
                      color: period === 'PM' ? '#fff' : 'var(--text-dim)',
                    }}
                  >
                    PM
                  </button>
                </div>
              </div>

              {/* Clock Face */}
              <div className="flex items-center justify-center py-4 px-6">
                <div
                  className="relative rounded-full"
                  style={{
                    width: size,
                    height: size,
                    background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)',
                  }}
                >
                  {/* Center dot */}
                  <div
                    className="absolute rounded-full z-10"
                    style={{
                      width: 8,
                      height: 8,
                      top: cy - 4,
                      left: cx - 4,
                      background: accentColor.color,
                    }}
                  />

                  {/* Hand line to selected number */}
                  {selectedPos && (
                    <svg
                      className="absolute inset-0 z-0"
                      width={size}
                      height={size}
                    >
                      <line
                        x1={cx}
                        y1={cy}
                        x2={selectedPos.x}
                        y2={selectedPos.y}
                        stroke={accentColor.color}
                        strokeWidth={2}
                      />
                    </svg>
                  )}

                  {/* Number dots */}
                  {numbers.map((num, i) => {
                    const pos = getPosition(i);
                    const isSelected = num === selectedValue;
                    const displayNum = mode === 'minute' ? String(num).padStart(2, '0') : num;

                    return (
                      <motion.button
                        key={`${mode}-${num}`}
                        onClick={() => handleNumberClick(num)}
                        className="absolute rounded-full flex items-center justify-center z-20 transition-colors"
                        style={{
                          width: dotRadius * 2,
                          height: dotRadius * 2,
                          left: pos.x - dotRadius,
                          top: pos.y - dotRadius,
                          background: isSelected ? accentColor.color : 'transparent',
                          color: isSelected ? '#fff' : 'var(--text-primary)',
                          fontSize: 14,
                          fontWeight: isSelected ? 700 : 400,
                        }}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {displayNum}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Footer: Cancel + OK */}
              <div className="flex items-center justify-end gap-2 px-6 pb-5 pt-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2 rounded-xl text-sm font-medium transition-colors"
                  style={{ color: accentColor.color }}
                  onMouseEnter={(e) => e.currentTarget.style.background = isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.06)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-5 py-2 rounded-xl text-sm font-bold transition-colors"
                  style={{ color: accentColor.color }}
                  onMouseEnter={(e) => e.currentTarget.style.background = isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.06)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  OK
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClockPicker;
