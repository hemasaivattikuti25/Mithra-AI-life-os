import React, { useEffect, useState } from 'react';
import { Flame, Users, CheckCircle2, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { workspaceService } from '../services/workspaceService';
import { supabase } from '../services/supabaseClient';

export const BlendOverview = ({ workspaceId }) => {
    const [members, setMembers] = useState([]);
    const [sharedHabits, setSharedHabits] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!workspaceId) { setLoading(false); return; }

        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch members
                const memberData = await workspaceService.getMembers(workspaceId);
                setMembers(memberData || []);

                // Fetch real habits shared in this workspace
                const { data: habitsData, error } = await supabase
                    .from('habits')
                    .select('id, title, streak, longest_streak, completed_dates, user_id, category')
                    .eq('workspace_id', workspaceId);

                if (error) {
                    console.error('[BlendOverview] Supabase query failed:', error);
                } else {
                    setSharedHabits(habitsData || []);
                }

            } catch (err) {
                console.error('[BlendOverview] Failed to fetch data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Listen for realtime habit changes in this workspace
        const channel = supabase.channel(`ws_habits_${workspaceId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'habits', filter: `workspace_id=eq.${workspaceId}` }, () => {
                fetchData(); // Refetch heavily relies on local cache visually, this is safer 
            }).subscribe();

        return () => supabase.removeChannel(channel);
    }, [workspaceId]);

    // Loading skeleton
    if (loading) return (
        <div className="rounded-2xl p-6 space-y-4" style={{ background: 'var(--glass-bg)' }}>
            <div className="h-5 w-40 rounded-lg animate-pulse" style={{ background: 'var(--glass-border)' }} />
            <div className="flex justify-between px-8">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-full animate-pulse" style={{ background: 'var(--glass-border)' }} />
                    <div className="h-3 w-16 rounded animate-pulse" style={{ background: 'var(--glass-border)' }} />
                </div>
                <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-full animate-pulse" style={{ background: 'var(--glass-border)' }} />
                    <div className="h-3 w-16 rounded animate-pulse" style={{ background: 'var(--glass-border)' }} />
                </div>
            </div>
            <div className="h-2.5 w-full rounded-full animate-pulse" style={{ background: 'var(--glass-border)' }} />
        </div>
    );

    if (!members || members.length < 2) {
        return (
            <div className="rounded-2xl p-6 text-center border border-dashed border-[var(--glass-border)]" style={{ background: 'var(--glass-bg)' }}>
                <Users className="w-8 h-8 mx-auto mb-3 text-[var(--accent-color)] opacity-50" />
                <h2 className="text-base font-bold text-[var(--text-primary)] mb-1">Waiting for your Blend partner</h2>
                <p className="text-[var(--text-dim)] text-xs mb-3">
                    {members?.length === 1
                        ? "Share the invite link above — once they join, you'll see your habit synergy here!"
                        : "Invite a friend to blend your habits!"}
                </p>
            </div>
        );
    }

    // Helper to get today's YYYY-MM-DD
    const todayStr = (() => {
        const d = new Date();
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    })();

    // Helper: calculate user metrics
    const getUserMetrics = (userId) => {
        const userHabits = sharedHabits.filter(h => h.user_id === userId);
        const total = userHabits.length;

        let completedTodayCount = 0;
        let highestStreak = 0;

        userHabits.forEach(h => {
            if (h.streak > highestStreak) highestStreak = h.streak;
            const dates = Array.isArray(h.completed_dates) ? h.completed_dates : [];
            if (dates.includes(todayStr)) {
                completedTodayCount++;
            }
        });

        const pct = total === 0 ? 0 : Math.round((completedTodayCount / total) * 100);
        return { total, completedTodayCount, pct, highestStreak };
    };

    const a = members[0];
    const b = members[1];

    const statsA = getUserMetrics(a.userId);
    const statsB = getUserMetrics(b.userId);

    // Calculate Synergy Logic
    // If both have 0 habits, show a nice 50/50 empty state
    // If one has habits and the other 0, offset it
    const totalCompletionRaw = statsA.pct + statsB.pct;
    const aWidth = totalCompletionRaw === 0 ? 50 : (statsA.pct / totalCompletionRaw) * 100;
    const bWidth = totalCompletionRaw === 0 ? 50 : (statsB.pct / totalCompletionRaw) * 100;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl p-6 border border-[var(--glass-border)]"
            style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)' }}
        >
            <h2 className="text-lg font-bold mb-6 text-[var(--accent-color)] flex items-center justify-between">
                <span>Habit Blend Synergy</span>
                {sharedHabits.length > 0 && (
                    <span className="text-xs font-medium px-2 py-1 rounded bg-white/5 text-[var(--text-dim)] border border-[var(--glass-border)]">
                        {sharedHabits.length} Shared Tasks
                    </span>
                )}
            </h2>

            {/* Avatars & Streaks */}
            <div className="flex justify-between items-center gap-4 px-2 sm:px-4 w-full">
                {[
                    { m: a, s: statsA },
                    { m: b, s: statsB }
                ].map(({ m, s }) => (
                    <div key={m.userId} className="flex flex-col items-center flex-1">
                        {m.avatarUrl ? (
                            <img src={m.avatarUrl} alt={m.fullName} className="w-16 h-16 rounded-full object-cover shadow-lg border-2 border-[var(--glass-border)]" />
                        ) : (
                            <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold border-2 border-[var(--glass-border)] bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg">
                                {m.fullName.substring(0, 2).toUpperCase()}
                            </div>
                        )}
                        <span className="mt-3 text-sm font-medium text-[var(--text-primary)] truncate max-w-[120px] text-center">{m.fullName.split(' ')[0]}</span>

                        {/* Real dynamic streak/completion */}
                        <div className="flex items-center gap-2 mt-1">
                            {s.total > 0 ? (
                                <>
                                    <div className="flex items-center gap-1 text-orange-400" title="Highest Workspace Streak">
                                        <Flame size={14} className={s.highestStreak > 2 ? "fill-orange-500" : ""} />
                                        <span className="font-bold text-xs">{s.highestStreak}</span>
                                    </div>
                                    <span className="text-[10px] text-[var(--text-dim)] hidden sm:inline">&bull;</span>
                                    <div className="flex items-center gap-1 text-green-400" title="Today's Completion">
                                        <CheckCircle2 size={13} />
                                        <span className="font-bold text-xs">{s.completedTodayCount}/{s.total}</span>
                                    </div>
                                </>
                            ) : (
                                <span className="text-[10px] font-medium text-[var(--text-dim)] uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-sm">
                                    No Habits
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* True Dynamic Synergy Bar */}
            <div className="mt-8 w-full bg-[var(--glass-border)] h-2.5 rounded-full overflow-hidden flex shadow-inner relative">
                <motion.div
                    initial={{ width: '50%' }}
                    animate={{ width: `${aWidth}%` }}
                    transition={{ duration: 1, type: 'spring', stiffness: 50, damping: 15 }}
                    className={`bg-blue-500/80 h-full backdrop-blur-sm ${statsA.pct > 0 ? 'shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'opacity-40'}`}
                />
                <motion.div
                    initial={{ width: '50%' }}
                    animate={{ width: `${bWidth}%` }}
                    transition={{ duration: 1, type: 'spring', stiffness: 50, damping: 15 }}
                    className={`bg-purple-500/80 h-full backdrop-blur-sm ${statsB.pct > 0 ? 'shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'opacity-40'}`}
                />

                {/* Center marker */}
                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/20 z-10" />
            </div>

            <div className="flex justify-between mt-2 px-1 text-[10px] font-bold text-[var(--text-dim)] uppercase">
                <span className={statsA.pct === 100 ? "text-blue-400" : ""}>{statsA.pct}% Done</span>
                <span className={statsB.pct === 100 ? "text-purple-400" : ""}>{statsB.pct}% Done</span>
            </div>

            {/* List of Shared Habits */}
            {sharedHabits.length > 0 ? (
                <div className="mt-6 space-y-2 border-t border-[var(--glass-border)] pt-4 max-h-[250px] overflow-y-auto pr-1">
                    <h3 className="text-xs text-[var(--text-dim)] uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
                        <Activity size={12} /> Live Workspace Habits
                    </h3>
                    <AnimatePresence>
                        {sharedHabits.map((habit, i) => {
                            const isA = habit.user_id === a.userId;
                            const owner = isA ? a : b;
                            const dates = Array.isArray(habit.completed_dates) ? habit.completed_dates : [];
                            const doneToday = dates.includes(todayStr);

                            return (
                                <motion.div
                                    key={habit.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${doneToday ? 'bg-white/5 border-white/10' : 'bg-[var(--glass-bg)] border-[var(--glass-border)] opacity-80'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${isA ? 'bg-blue-500' : 'bg-purple-500'} ${doneToday ? 'shadow-[0_0_8px_currentColor]' : 'opacity-40'}`} />
                                        <div>
                                            <p className={`text-sm font-medium ${doneToday ? 'text-[var(--text-primary)]' : 'text-[var(--text-dim)]'}`}>
                                                {habit.title}
                                            </p>
                                            <p className="text-[10px] text-[var(--text-dim)]">
                                                By {owner.fullName.split(' ')[0]} &bull; {habit.streak} day streak
                                            </p>
                                        </div>
                                    </div>
                                    {doneToday && (
                                        <CheckCircle2 size={16} className={isA ? "text-blue-400" : "text-purple-400"} />
                                    )}
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </div>
            ) : (
                <p className="text-center text-xs text-[var(--text-dim)] mt-6 bg-white/5 py-3 rounded-lg border border-[var(--glass-border)]">
                    Create a habit and select this workspace inside the habit modal to see live synergy!
                </p>
            )}
        </motion.div>
    );
};
