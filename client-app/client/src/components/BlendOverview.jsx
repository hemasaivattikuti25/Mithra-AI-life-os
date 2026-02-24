import React from 'react';
import { Users, Check } from 'lucide-react';
import { motion } from 'framer-motion';

function statusBadge(pct) {
    if (pct === 100) return { label: 'Perfect Day', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' };
    if (pct >= 50) return { label: 'On Track', color: '#22d3ee', bg: 'rgba(34,211,238,0.1)' };
    if (pct > 0) return { label: 'In Progress', color: '#facc15', bg: 'rgba(250,204,21,0.1)' };
    return { label: 'Not Started', color: '#6b7280', bg: 'rgba(107,114,128,0.1)' };
}

/* ═══════════════════════════════════════════════════════════════
   BLEND OVERVIEW — Shows member cards, synergy bar, habit list
   Props: workspaceId, members[], habits[]
   ═══════════════════════════════════════════════════════════════ */

export function BlendOverview({ workspaceId, members = [], habits = [] }) {
    const todayStr = new Date().toISOString().split('T')[0];

    // Calculate stats per member
    const memberStats = members.map(m => {
        const memberHabits = habits.filter(h => h.user_id === m.userId);
        const completedToday = memberHabits.filter(h =>
            Array.isArray(h.consistency) && h.consistency.includes(todayStr)
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
        </div>
    );
}

export default BlendOverview;
