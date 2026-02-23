import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Zap, Crown, BarChart3, AlertCircle } from 'lucide-react';

/**
 * AIUsageDashboard — Shows daily AI usage, plan limits, and Pro upgrade prompt.
 * Fetches data from Supabase `usage_tracking` and `plans` tables.
 *
 * Usage: <AIUsageDashboard userId={user.id} />
 */

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AIUsageDashboard({ supabase, userId }) {
    const [plan, setPlan] = useState(null);
    const [weeklyData, setWeeklyData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!supabase || !userId) {
            setLoading(false);
            return;
        }

        async function fetchData() {
            try {
                // Get plan info via RPC
                const { data: planData } = await supabase.rpc('get_user_plan_limits', { p_user_id: userId });
                setPlan(planData || { plan_id: 'free', daily_ai_limit: 20, today_ai_calls: 0 });

                // Get last 7 days of usage
                const today = new Date();
                const weekAgo = new Date(today);
                weekAgo.setDate(today.getDate() - 6);
                const dateStr = weekAgo.toISOString().split('T')[0];

                const { data: usageData } = await supabase
                    .from('usage_tracking')
                    .select('date, ai_calls, tokens_used')
                    .eq('user_id', userId)
                    .gte('date', dateStr)
                    .order('date', { ascending: true });

                // Fill missing days with zeros
                const filled = [];
                for (let i = 6; i >= 0; i--) {
                    const d = new Date(today);
                    d.setDate(today.getDate() - i);
                    const key = d.toISOString().split('T')[0];
                    const found = (usageData || []).find(u => u.date === key);
                    filled.push({
                        day: DAYS[d.getDay()],
                        date: key,
                        calls: found?.ai_calls || 0,
                        tokens: found?.tokens_used || 0,
                    });
                }
                setWeeklyData(filled);
            } catch (err) {
                console.error('[AIUsage]', err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [supabase, userId]);

    if (loading) {
        return (
            <div className="rounded-2xl p-6 border border-[var(--glass-border)] animate-pulse"
                style={{ background: 'var(--glass-bg)' }}>
                <div className="h-5 w-40 rounded-lg mb-4" style={{ background: 'var(--glass-border)' }} />
                <div className="h-32 w-full rounded-xl" style={{ background: 'var(--glass-border)' }} />
            </div>
        );
    }

    const todayCalls = plan?.today_ai_calls || 0;
    const dailyLimit = plan?.daily_ai_limit;
    const planId = plan?.plan_id || 'free';
    const isUnlimited = dailyLimit === null;
    const usagePercent = isUnlimited ? 0 : Math.min(100, (todayCalls / dailyLimit) * 100);
    const isNearLimit = !isUnlimited && usagePercent >= 80;
    const maxBar = Math.max(...weeklyData.map(d => d.calls), dailyLimit || 20, 1);

    return (
        <div className="rounded-2xl p-6 border border-[var(--glass-border)]"
            style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)' }}>

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[var(--accent-color)]" />
                    <h3 className="text-base font-bold text-[var(--text-primary)]">AI Usage</h3>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    style={{
                        background: planId === 'free' ? 'rgba(255,255,255,0.05)' : 'var(--accent-glow)',
                        color: planId === 'free' ? 'var(--text-dim)' : 'var(--accent-color)',
                    }}>
                    {planId === 'free' ? <Zap size={12} /> : <Crown size={12} />}
                    {planId}
                </div>
            </div>

            {/* Today's Usage Bar */}
            <div className="mb-6">
                <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-[var(--text-dim)]">Today</span>
                    <span className={`font-mono font-bold ${isNearLimit ? 'text-amber-400' : 'text-[var(--text-primary)]'}`}>
                        {todayCalls}{isUnlimited ? '' : `/${dailyLimit}`}
                    </span>
                </div>
                {!isUnlimited && (
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--glass-border)' }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${usagePercent}%` }}
                            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                            className="h-full rounded-full"
                            style={{
                                background: isNearLimit
                                    ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                                    : 'linear-gradient(90deg, var(--accent-color), #818cf8)',
                            }}
                        />
                    </div>
                )}
                {isUnlimited && (
                    <div className="text-xs text-[var(--accent-color)] flex items-center gap-1">
                        <Crown size={12} /> Unlimited access
                    </div>
                )}
            </div>

            {/* Weekly Chart */}
            <div className="mb-4">
                <p className="text-xs text-[var(--text-dim)] mb-3 font-medium">Last 7 Days</p>
                <div className="flex items-end gap-1.5 h-24">
                    {weeklyData.map((d, i) => {
                        const height = Math.max(4, (d.calls / maxBar) * 100);
                        const isToday = i === weeklyData.length - 1;
                        return (
                            <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                                <span className="text-[10px] font-mono text-[var(--text-dim)]">{d.calls || ''}</span>
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${height}%` }}
                                    transition={{ delay: i * 0.05, duration: 0.5 }}
                                    className="w-full rounded-t-md min-h-[4px]"
                                    style={{
                                        background: isToday
                                            ? 'var(--accent-color)'
                                            : 'var(--glass-border)',
                                    }}
                                />
                                <span className={`text-[10px] ${isToday ? 'text-[var(--accent-color)] font-bold' : 'text-[var(--text-dim)]'}`}>
                                    {d.day}
                                </span>
                            </div>
                        );
                    })}
                </div>
                {/* Limit line */}
                {!isUnlimited && dailyLimit && (
                    <div className="relative -mt-24 h-24 pointer-events-none">
                        <div
                            className="absolute w-full border-t border-dashed"
                            style={{
                                bottom: `${(dailyLimit / maxBar) * 100}%`,
                                borderColor: 'rgba(245,158,11,0.3)',
                            }}
                        >
                            <span className="absolute right-0 -top-3 text-[9px] text-amber-500/60 font-mono">limit</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Upgrade prompt for free users */}
            {planId === 'free' && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 rounded-xl border border-[var(--accent-color)]/20 flex items-start gap-3"
                    style={{ background: 'var(--accent-glow)' }}
                >
                    <AlertCircle className="w-4 h-4 text-[var(--accent-color)] flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-xs font-semibold text-[var(--text-primary)]">Upgrade to Pro</p>
                        <p className="text-[11px] text-[var(--text-dim)] mt-0.5">
                            Unlimited AI messages, priority support, and more.
                        </p>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
