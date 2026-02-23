import React, { useEffect, useState } from 'react';
import { Flame, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { workspaceService } from '../services/workspaceService';

export const BlendOverview = ({ workspaceId }) => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!workspaceId) { setLoading(false); return; }

        const fetchMembers = async () => {
            try {
                const data = await workspaceService.getMembers(workspaceId);
                setMembers(data || []);
            } catch (err) {
                console.error('[BlendOverview] Failed to fetch members:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchMembers();
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

    const a = members[0];
    const b = members[1];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl p-6 border border-[var(--glass-border)]"
            style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)' }}
        >
            <h2 className="text-lg font-bold mb-6 text-[var(--accent-color)]">Habit Blend Synergy</h2>
            <div className="flex justify-between items-center gap-4 px-4 w-full">
                {[a, b].map((member) => (
                    <div key={member.userId} className="flex flex-col items-center flex-1">
                        {member.avatarUrl ? (
                            <img src={member.avatarUrl} alt={member.fullName} className="w-16 h-16 rounded-full object-cover shadow-lg border-2 border-[var(--glass-border)]" />
                        ) : (
                            <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold border-2 border-[var(--glass-border)] bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg">
                                {member.fullName.substring(0, 2).toUpperCase()}
                            </div>
                        )}
                        <span className="mt-3 text-sm font-medium text-[var(--text-primary)]">{member.fullName}</span>
                        <div className="flex items-center gap-1.5 text-orange-400 mt-1">
                            <Flame size={14} className="fill-orange-500/20" />
                            <span className="font-bold text-xs">Active</span>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-8 w-full bg-[var(--glass-border)] h-2.5 rounded-full overflow-hidden flex shadow-inner">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '60%' }}
                    transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
                    className="bg-blue-500/80 h-full backdrop-blur-sm"
                />
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '40%' }}
                    transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
                    className="bg-purple-500/80 h-full backdrop-blur-sm"
                />
            </div>
            <p className="text-center text-xs text-[var(--text-dim)] mt-4 mb-2">
                You and {b.fullName} are blended! Habit synergy data coming soon.
            </p>
        </motion.div>
    );
};
