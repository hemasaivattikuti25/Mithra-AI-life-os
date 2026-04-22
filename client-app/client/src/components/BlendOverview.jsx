import React, { useState } from 'react';
import { Users, Check, Sparkles, Loader2, TrendingUp, Zap, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiFetch } from '../services/firebaseClient';
import { STATUS_COLORS } from '../utils/COLOR_CONSTANTS';

function statusBadge(pct) {
    if (pct === 100) return STATUS_COLORS.perfect;
    if (pct >= 50) return STATUS_COLORS.onTrack;
    if (pct > 0) return STATUS_COLORS.inProgress;
    return STATUS_COLORS.notStarted;
}

/* ═══════════════════════════════════════════════════════════════
   BLEND OVERVIEW — Shows member cards, synergy bar, habit list
   Props: workspaceId, members[], habits[]
   ═══════════════════════════════════════════════════════════════ */

export function BlendOverview({ workspaceId, members = [], habits = [] }) {
    const todayStr = new Date().toISOString().split('T')[0];

    // Calculate stats per member
    const memberStats = members.map(m => {
        const memberHabits = habits.filter(h => h.userId === m.userId);
        const completedToday = memberHabits.filter(h =>
            Array.isArray(h.completedDates) && h.completedDates.includes(todayStr)
        ).length;
        const total = memberHabits.length;
        const pct = total > 0 ? Math.round((completedToday / total) * 100) : 0;
        const maxStreak = memberHabits.reduce((max, h) => Math.max(max, h.streak || 0), 0);
        return { ...m, completedToday, total, pct, maxStreak };
    });

    // ── Less than 2 members → waiting state ──
    if (members.length < 2) {
        return (
            <div className="rounded-2xl p-8 text-center"
                style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)' }}>
                <Users size={40} className="mx-auto mb-4" style={{ color: 'var(--text-dim)', opacity: 0.3 }} />
                <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2">
                    Waiting for your Blend partner
                </h3>
                <p className="text-sm text-[var(--text-dim)] opacity-60 mb-4">
                    Once they join with your code, you'll both see habit synergy here
                </p>
                {members.length === 1 && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs"
                        style={{ background: 'var(--accent-glow)', border: '1px solid var(--accent-color)', color: 'var(--accent-color)' }}>
                        <Users size={12} /> 1 member (you)
                    </div>
                )}
            </div>
        );
    }

    // Get first 2 members for side-by-side display
    const [memberA, memberB] = memberStats.slice(0, 2);

    return (
        <div className="space-y-4">

            {/* ── MEMBER CARDS ── */}
            <div className="grid grid-cols-2 gap-3">
                {[memberA, memberB].map((m, idx) => (
                    <motion.div
                        key={m.userId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="rounded-2xl p-4 text-center"
                        style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)' }}
                    >
                        {/* Avatar */}
                        <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center text-lg font-bold text-white"
                            style={{
                                background: idx === 0
                                    ? 'linear-gradient(135deg, var(--accent-color), #2563eb)'
                                    : 'linear-gradient(135deg, #f97316, #ef4444)',
                            }}>
                            {(m.fullName || '??').substring(0, 2).toUpperCase()}
                        </div>

                        {/* Name + role */}
                        <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{m.fullName}</p>
                        <span className="text-[10px] px-2 py-0.5 rounded-md inline-block mt-1"
                            style={{
                                color: m.role === 'owner' ? 'var(--accent-color)' : 'var(--text-dim)',
                                background: m.role === 'owner' ? 'var(--accent-glow)' : 'var(--glass-bg)',
                            }}>
                            {m.role}
                        </span>

                        {/* Stats */}
                        <div className="mt-3 space-y-1">
                            <p className="text-xs text-[var(--text-dim)]">
                                🔥 {m.maxStreak} streak
                            </p>
                            <p className="text-xs font-medium" style={{ color: 'var(--accent-color)' }}>
                                {m.pct}% today
                            </p>
                            {(() => { const s = statusBadge(m.pct); return <span className="text-[10px] px-2 py-0.5 rounded-full inline-block mt-1" style={{ color: s.color, background: s.bg }}>{s.label}</span>; })()}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* ── SYNERGY BAR ── */}
            <div className="rounded-2xl p-4"
                style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)' }}>
                <p className="text-xs font-semibold text-[var(--text-dim)] uppercase tracking-widest mb-3">
                    Synergy
                </p>

                {memberA.pct === 0 && memberB.pct === 0 ? (
                    <div className="text-center py-2">
                        <p className="text-xs text-[var(--text-dim)] opacity-50">No habits logged yet today</p>
                        <div className="w-full h-3 rounded-full mt-2" style={{ background: 'var(--glass-border)' }} />
                    </div>
                ) : (
                    <>
                        <div className="flex gap-1 h-4 rounded-full overflow-hidden" style={{ background: 'var(--glass-border)' }}>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${memberA.pct}%` }}
                                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                className="rounded-l-full"
                                style={{ background: 'linear-gradient(90deg, var(--accent-color), #2563eb)', minWidth: memberA.pct > 0 ? '2rem' : 0 }}
                            />
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${memberB.pct}%` }}
                                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                                className="rounded-r-full"
                                style={{ background: 'linear-gradient(90deg, #f97316, #ef4444)', minWidth: memberB.pct > 0 ? '2rem' : 0 }}
                            />
                        </div>
                        <div className="flex justify-between mt-2">
                            <span className="text-xs text-[var(--text-dim)]">
                                {memberA.fullName?.split(' ')[0]} {memberA.pct}%
                            </span>
                            <span className="text-xs text-[var(--text-dim)]">
                                {memberB.fullName?.split(' ')[0]} {memberB.pct}%
                            </span>
                        </div>
                    </>
                )}
            </div>

            {/* ── SHARED HABITS LIST ── */}
            {(() => {
                const habitsA = habits.filter(h => h.user_id === memberA.userId).map(h => h.title.toLowerCase().trim());
                const habitsB = habits.filter(h => h.user_id === memberB.userId).map(h => h.title.toLowerCase().trim());
                const sharedTitles = habitsA.filter(t => habitsB.includes(t));
                const sharedHabits = habits.filter(h => sharedTitles.includes(h.title.toLowerCase().trim()));
                return (
                    <div className="rounded-2xl p-4"
                        style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)' }}>
                        <p className="text-xs font-semibold text-[var(--text-dim)] uppercase tracking-widest mb-3">
                            Shared Habits ({sharedTitles.length})
                        </p>
                        {sharedTitles.length === 0 ? (
                            <p className="text-xs text-[var(--text-dim)] opacity-50 text-center py-4">
                                No shared habits yet — add habits to this workspace
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {sharedHabits.map(h => {
                                    const done = Array.isArray(h.consistency) && h.consistency.includes(todayStr);
                                    const creator = members.find(m => m.userId === h.user_id)?.fullName || 'Unknown';
                                    return (
                                        <div key={h.id} className="flex items-center gap-3 py-2 px-3 rounded-xl"
                                            style={{ background: done ? 'var(--accent-glow)' : 'transparent' }}>
                                            <div className={`w-2 h-2 rounded-full shrink-0 ${done ? '' : 'opacity-30'}`}
                                                style={{ background: done ? 'var(--accent-color)' : 'var(--text-dim)' }} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-[var(--text-primary)] truncate">{h.title}</p>
                                                <p className="text-[10px] text-[var(--text-dim)] opacity-50">by {creator} · 🔥 {h.streak || 0}</p>
                                            </div>
                                            {done && <Check size={12} style={{ color: 'var(--accent-color)' }} />}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })()}

            {/* Show all members if more than 2 */}
            {members.length > 2 && (
                <div className="rounded-2xl p-4"
                    style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)' }}>
                    <p className="text-xs font-semibold text-[var(--text-dim)] uppercase tracking-widest mb-3">
                        All Members ({members.length})
                    </p>
                    <div className="space-y-2">
                        {memberStats.slice(2).map(m => (
                            <div key={m.userId} className="flex items-center gap-3 py-1">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                                    style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)' }}>
                                    {(m.fullName || '??').substring(0, 2).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-medium text-[var(--text-primary)]">{m.fullName}</p>
                                    <p className="text-[10px] text-[var(--text-dim)] opacity-50">{m.pct}% today · 🔥 {m.maxStreak}</p>
                                </div>
                                <span className="text-[10px] text-[var(--text-dim)]">{m.role}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── BLEND AI COACH ── */}
            <BlendAICoach memberA={memberA} memberB={memberB} habits={habits} />
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   BLEND AI COACH — Shared accountability coaching
   ═══════════════════════════════════════════════════════════════ */
function BlendAICoach({ memberA, memberB, habits }) {
    const [coaching, setCoaching] = useState(null);
    const [loading, setLoading] = useState(false);

    const generate = async () => {
        setLoading(true);
        try {
            const todayStr = new Date().toISOString().split('T')[0];
            const summaryA = `${memberA.fullName}: ${memberA.pct}% today, ${memberA.maxStreak}-day max streak`;
            const summaryB = `${memberB.fullName}: ${memberB.pct}% today, ${memberB.maxStreak}-day max streak`;
            const sharedCount = habits.filter(h =>
                habits.some(h2 => h2.userId !== h.userId && h2.title.toLowerCase() === h.title.toLowerCase())
            ).length;

            const prompt = `You are a warm, motivating habit accountability coach for a pair called "Blend". Give a short (2-3 sentences MAX), highly personalized message that:
1. Celebrates whoever is doing better today
2. Encourages the other person with specific action
3. Mentions their shared habits if applicable (${sharedCount} shared habits)

Data: ${summaryA}. ${summaryB}. Today: ${todayStr}.
Be specific, warm, and use their first names. No bullet points.`;

            const res = await apiFetch('/chat', {
                method: 'POST',
                body: JSON.stringify({ message: prompt, history: [] }),
            });
            setCoaching(res.reply || null);
        } catch {
            setCoaching("Keep pushing together! Every habit done today is a win for your Blend. 💪");
        } finally {
            setLoading(false);
        }
    };

    const aheadMember = memberA.pct >= memberB.pct ? memberA : memberB;
    const behindMember = memberA.pct >= memberB.pct ? memberB : memberA;
    const gap = Math.abs(memberA.pct - memberB.pct);

    return (
        <div className="rounded-2xl p-4 space-y-3"
            style={{
                background: 'linear-gradient(135deg, var(--glass-bg) 0%, rgba(var(--color-accent-rgb, 194,24,91),0.05) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid var(--glass-border)',
            }}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: 'var(--accent-glow)' }}>
                        <Sparkles size={14} style={{ color: 'var(--accent-color)' }} />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>
                            AI Coach
                        </p>
                        <p className="text-[10px] opacity-40" style={{ color: 'var(--text-dim)' }}>Your Blend accountability partner</p>
                    </div>
                </div>
                <button
                    onClick={generate}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 hover:scale-105 active:scale-95"
                    style={{ background: 'var(--accent-color)', color: 'white' }}
                >
                    {loading ? <Loader2 size={11} className="animate-spin" /> : <Zap size={11} />}
                    {loading ? 'Coaching…' : 'Coach me'}
                </button>
            </div>

            {/* Quick stats strip */}
            {gap > 0 && (
                <div className="flex items-center gap-2 py-2 px-3 rounded-xl text-xs"
                    style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
                    <TrendingUp size={12} style={{ color: 'var(--accent-color)' }} />
                    <span style={{ color: 'var(--text-dim)' }}>
                        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {aheadMember.fullName?.split(' ')[0]}
                        </span>
                        {' '}is ahead by{' '}
                        <span className="font-semibold" style={{ color: 'var(--accent-color)' }}>{gap}%</span>
                        {' '}today
                        {behindMember.pct === 0 && ` — ${behindMember.fullName?.split(' ')[0]} hasn't started yet`}
                    </span>
                    <Star size={11} className="ml-auto" style={{ color: 'var(--accent-color)', opacity: 0.6 }} />
                </div>
            )}

            {/* AI message */}
            {coaching ? (
                <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl p-3 text-sm leading-relaxed"
                    style={{ background: 'var(--accent-glow)', color: 'var(--text-primary)' }}
                >
                    <Sparkles size={11} className="inline mr-1.5 opacity-50" style={{ color: 'var(--accent-color)' }} />
                    {coaching}
                </motion.div>
            ) : (
                <p className="text-xs text-center py-2 opacity-40" style={{ color: 'var(--text-dim)' }}>
                    Tap "Coach me" for personalized accountability
                </p>
            )}
        </div>
    );
}

export default BlendOverview;
