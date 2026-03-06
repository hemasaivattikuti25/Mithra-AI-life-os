import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Share2, X, Flame, CheckCircle2, Calendar, Target } from 'lucide-react';
import html2canvas from 'html2canvas';

/**
 * ShareStatsCard — Generates a shareable stats image
 * 
 * Usage:
 *   <ShareStatsCard
 *     isOpen={showShare}
 *     onClose={() => setShowShare(false)}
 *     stats={{ streakDays: 14, habitsCompleted: 45, tasksCompleted: 120 }}
 *     userName="Sai"
 *   />
 */

const ShareStatsCard = ({ isOpen, onClose, stats, userName = 'User' }) => {
  const cardRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    streakDays = 0,
    habitsCompleted = 0,
    tasksCompleted = 0,
    daysActive = 0,
    bestStreak = 0,
    moodAverage = null,
  } = stats || {};

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsGenerating(true);

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      });

      const link = document.createElement('a');
      link.download = `mithra-stats-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      // image generation failed
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    setIsGenerating(true);

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const file = new File([blob], 'mithra-stats.png', { type: 'image/png' });

        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'My Mithra Stats',
            text: `Check out my productivity stats on Mithra! 🔥`,
          });
        } else {
          // Fallback to download
          handleDownload();
        }
        setIsGenerating(false);
      });
    } catch {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="max-w-sm w-full"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X size={20} className="text-white" />
          </button>

          {/* Shareable Card */}
          <div
            ref={cardRef}
            className="rounded-3xl p-6 overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f23 50%, #16213e 100%)',
              border: '1px solid rgba(194, 24, 91, 0.3)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(194, 24, 91, 0.15)',
            }}
          >
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 mb-3">
                <Flame size={14} className="text-orange-500" />
                <span className="text-xs font-semibold text-white/80 tracking-wider uppercase">
                  Mithra Stats
                </span>
              </div>
              <h2 className="text-xl font-bold text-white">
                {userName}'s Journey
              </h2>
              <p className="text-xs text-white/40 mt-1">
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <StatBox
                icon={<Flame className="text-orange-500" size={20} />}
                value={bestStreak || streakDays}
                label="Best Streak"
                unit="days"
                color="#f97316"
              />
              <StatBox
                icon={<CheckCircle2 className="text-emerald-500" size={20} />}
                value={habitsCompleted}
                label="Habits Done"
                color="#10b981"
              />
              <StatBox
                icon={<Target className="text-cyan-500" size={20} />}
                value={tasksCompleted}
                label="Tasks Crushed"
                color="#06b6d4"
              />
              <StatBox
                icon={<Calendar className="text-purple-500" size={20} />}
                value={daysActive}
                label="Days Active"
                color="#8b5cf6"
              />
            </div>

            {/* Motivational quote */}
            <div className="text-center py-3 px-4 rounded-xl bg-white/5">
              <p className="text-xs italic text-white/60">
                "The obstacle is the way."
              </p>
              <p className="text-[10px] text-white/30 mt-1">— Marcus Aurelius</p>
            </div>

            {/* Branding */}
            <div className="text-center mt-4">
              <p className="text-[10px] text-white/30 tracking-widest uppercase">
                mithra.app
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-4">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleDownload}
              disabled={isGenerating}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all"
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <Download size={18} />
              {isGenerating ? 'Generating...' : 'Download'}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              disabled={isGenerating}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all"
              style={{
                background: 'linear-gradient(135deg, #C2185B, #E91E63)',
                color: '#fff',
                boxShadow: '0 4px 20px rgba(194, 24, 91, 0.4)',
              }}
            >
              <Share2 size={18} />
              Share
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const StatBox = ({ icon, value, label, unit, color }) => (
  <div
    className="p-4 rounded-xl text-center"
    style={{
      background: `linear-gradient(135deg, ${color}10, transparent)`,
      border: `1px solid ${color}30`,
    }}
  >
    <div className="flex justify-center mb-2">{icon}</div>
    <div className="text-2xl font-bold text-white">
      {value}
      {unit && <span className="text-xs font-normal text-white/50 ml-1">{unit}</span>}
    </div>
    <div className="text-[10px] text-white/50 uppercase tracking-wider mt-1">{label}</div>
  </div>
);

export default ShareStatsCard;
