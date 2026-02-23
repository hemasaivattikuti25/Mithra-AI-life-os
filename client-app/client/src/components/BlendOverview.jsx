import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Flame } from 'lucide-react';
import { motion } from 'framer-motion';

export const BlendOverview = ({ workspaceId }) => {
    const [membersData, setMembersData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!workspaceId) return;

        const fetchBlend = async () => {
            try {
                // Fetch users and their profiles in this workspace
                const { data, error } = await supabase
                    .from('workspace_members')
                    .select(`
                        user_id,
                        profiles:user_id(full_name, avatar_url)
                    `)
                    .eq('workspace_id', workspaceId);

                if (error) throw error;

                // Set default avatar/name if profile is null
                const cleanData = data.map(d => ({
                    user_id: d.user_id,
                    full_name: d.profiles?.full_name || 'User',
                    avatarUrl: d.profiles?.avatar_url || null
                }));

                setMembersData(cleanData);
            } catch (err) {
                console.error("Failed to fetch blend overview:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchBlend();
    }, [workspaceId]);

    if (loading) return <div className="animate-pulse h-32 bg-[var(--glass-bg)] rounded-2xl w-full" />;

    if (membersData.length < 2) {
        return (
            <div className="glass-card p-6 rounded-2xl text-center">
                <h2 className="text-xl font-bold mb-2">Mithra Blend</h2>
                <p className="text-[var(--text-dim)] text-sm mb-4">Invite a friend to blend your habits!</p>
                <button className="px-4 py-2 bg-[var(--accent-glow)] text-[var(--accent-color)] rounded-lg text-sm font-semibold">
                    Copy Invite Link
                </button>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 rounded-2xl"
        >
            <h2 className="text-xl font-bold mb-6 text-[var(--accent-color)]">Habit Blend Synergy</h2>
            <div className="flex justify-between items-center gap-4 px-4 w-full">
                {membersData.slice(0, 2).map((member, idx) => (
                    <div key={member.user_id} className="flex flex-col items-center flex-1">
                        {member.avatarUrl ? (
                            <img src={member.avatarUrl} alt={member.full_name} className="w-16 h-16 rounded-full object-cover shadow-lg border-2 border-[var(--glass-border)]" />
                        ) : (
                            <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold border-2 border-[var(--glass-border)] bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg">
                                {member.full_name.substring(0, 2).toUpperCase()}
                            </div>
                        )}
                        <span className="mt-3 text-sm font-medium text-[var(--text-primary)]">{member.full_name}</span>
                        <div className="flex items-center gap-1.5 text-orange-400 mt-1">
                            <Flame size={14} className="fill-orange-500/20" />
                            <span className="font-bold text-xs">{idx === 0 ? '12' : '8'} Day Streak</span>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-8 w-full bg-[var(--glass-border)] h-2.5 rounded-full overflow-hidden flex shadow-inner">
                {/* Visual synergy bar (mocked proportions for MVP) */}
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
                You and {membersData[1]?.full_name} have a <span className="text-[var(--text-primary)] font-semibold">74%</span> habit synergy score!
            </p>
        </motion.div>
    );
};
