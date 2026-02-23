import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Link2, Plus, Copy, Check, Loader2, AlertCircle, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { workspaceService } from '../services/workspaceService';
import { BlendOverview } from '../components/BlendOverview';

const luxuryEase = [0.22, 1, 0.36, 1];

const GlassCard = ({ children, className = '' }) => (
    <div
        className={`rounded-2xl p-6 ${className}`}
        style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)' }}
    >
        {children}
    </div>
);

export default function MithraBlend() {
    const { user } = useAuth();
    const [workspaces, setWorkspaces] = useState([]);
    const [activeWorkspace, setActiveWorkspace] = useState(null);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [joining, setJoining] = useState(false);
    const [newName, setNewName] = useState('');
    const [joinHash, setJoinHash] = useState('');
    const [copiedId, setCopiedId] = useState(null);
    const [error, setError] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [showJoin, setShowJoin] = useState(false);

    const load = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await workspaceService.getWorkspaces(user.id);
            setWorkspaces(data || []);
            if (data?.length > 0 && !activeWorkspace) setActiveWorkspace(data[0]);
        } catch (err) {
            setError('Could not load workspaces.');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => { load(); }, [load]);

    const handleCreate = async () => {
        if (!newName.trim()) return;
        setCreating(true);
        setError('');
        try {
            const ws = await workspaceService.createWorkspace(newName.trim(), user.id);
            setWorkspaces(prev => [...prev, ws]);
            setActiveWorkspace(ws);
            setNewName('');
            setShowCreate(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setCreating(false);
        }
    };

    const handleJoin = async () => {
        if (!joinHash.trim()) return;
        setJoining(true);
        setError('');
        try {
            const wsId = await workspaceService.joinWorkspace(joinHash.trim(), user.id);
            await load();
            const joined = workspaces.find(w => w.id === wsId);
            if (joined) setActiveWorkspace(joined);
            setJoinHash('');
            setShowJoin(false);
        } catch (err) {
            setError(err.message || 'Invalid or already joined workspace.');
        } finally {
            setJoining(false);
        }
    };

    const copyLink = (ws) => {
        const link = `${window.location.origin}/#/blend?join=${ws.share_link_hash}`;
        navigator.clipboard.writeText(link);
        setCopiedId(ws.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Auto-join via URL hash
    useEffect(() => {
        const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
        const hash = params.get('join');
        if (hash && user) {
            setJoinHash(hash);
            setShowJoin(true);
        }
    }, [user]);

    return (
        <div className="min-h-screen p-4 sm:p-6 md:p-8 space-y-6 max-w-4xl mx-auto pb-24 md:pb-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: luxuryEase }}
                className="flex items-center justify-between"
            >
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-[var(--accent-glow)]">
                        <Users className="w-5 h-5 text-[var(--accent-color)]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Mithra Blend</h1>
                        <p className="text-xs text-[var(--text-dim)]">Shared workspaces for habits & goals</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { setShowJoin(v => !v); setShowCreate(false); setError(''); }}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-[var(--text-dim)] hover:text-[var(--text-primary)] transition-colors bg-[var(--glass-bg)] border border-[var(--glass-border)]"
                    >
                        <LogIn size={15} /> Join
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { setShowCreate(v => !v); setShowJoin(false); setError(''); }}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-white transition-all"
                        style={{ background: 'var(--accent-color)' }}
                    >
                        <Plus size={15} /> New Blend
                    </motion.button>
                </div>
            </motion.div>

            {/* Error */}
            <AnimatePresence>
                {error && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="flex items-center gap-2 p-3 rounded-xl text-sm text-red-400 bg-red-500/10 border border-red-500/20"
                    >
                        <AlertCircle size={15} /> {error}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Create panel */}
            <AnimatePresence>
                {showCreate && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        <GlassCard className="border border-[var(--glass-border)]">
                            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Create a Blend Workspace</h3>
                            <div className="flex gap-3">
                                <input
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleCreate()}
                                    placeholder="Workspace name (e.g. 'Sai & Priya's Goals')"
                                    className="flex-1 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--accent-color)]"
                                />
                                <button
                                    onClick={handleCreate}
                                    disabled={creating || !newName.trim()}
                                    className="px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-40 flex items-center gap-2"
                                    style={{ background: 'var(--accent-color)', color: 'white' }}
                                >
                                    {creating ? <Loader2 size={14} className="animate-spin" /> : 'Create'}
                                </button>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Join panel */}
            <AnimatePresence>
                {showJoin && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        <GlassCard className="border border-[var(--glass-border)]">
                            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Join via Invite Link</h3>
                            <div className="flex gap-3">
                                <input
                                    value={joinHash}
                                    onChange={e => setJoinHash(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleJoin()}
                                    placeholder="Paste invite code or link here"
                                    className="flex-1 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--accent-color)]"
                                />
                                <button
                                    onClick={handleJoin}
                                    disabled={joining || !joinHash.trim()}
                                    className="px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-40 flex items-center gap-2"
                                    style={{ background: 'var(--accent-color)', color: 'white' }}
                                >
                                    {joining ? <Loader2 size={14} className="animate-spin" /> : 'Join'}
                                </button>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Workspace list */}
            {loading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-color)]" />
                </div>
            ) : workspaces.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-20 text-center gap-4"
                >
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center bg-[var(--accent-glow)]">
                        <Users className="w-9 h-9 text-[var(--accent-color)] opacity-60" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-[var(--text-primary)]">No blends yet</h3>
                        <p className="text-sm text-[var(--text-dim)] mt-1">Create a workspace or join a friend's via invite link.</p>
                    </div>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {/* Workspace tabs */}
                    <div className="flex gap-2 flex-wrap">
                        {workspaces.map(ws => (
                            <button
                                key={ws.id}
                                onClick={() => setActiveWorkspace(ws)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${activeWorkspace?.id === ws.id
                                        ? 'bg-[var(--accent-glow)] border-[var(--accent-color)] text-[var(--accent-color)]'
                                        : 'bg-[var(--glass-bg)] border-[var(--glass-border)] text-[var(--text-dim)] hover:text-[var(--text-primary)]'
                                    }`}
                            >
                                {ws.name}
                            </button>
                        ))}
                    </div>

                    {/* Active workspace details */}
                    {activeWorkspace && (
                        <motion.div
                            key={activeWorkspace.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, ease: luxuryEase }}
                            className="space-y-4"
                        >
                            <GlassCard className="border border-[var(--glass-border)]">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-[var(--text-dim)] uppercase tracking-widest mb-1">Invite Link</p>
                                        <p className="text-sm text-[var(--text-primary)] font-mono truncate max-w-xs">
                                            {`${window.location.origin}/#/blend?join=${activeWorkspace.share_link_hash}`}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => copyLink(activeWorkspace)}
                                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all bg-[var(--accent-glow)] text-[var(--accent-color)]"
                                    >
                                        {copiedId === activeWorkspace.id ? <Check size={14} /> : <Copy size={14} />}
                                        {copiedId === activeWorkspace.id ? 'Copied!' : 'Copy'}
                                    </button>
                                </div>
                            </GlassCard>

                            {/* Habit synergy overview */}
                            <BlendOverview workspaceId={activeWorkspace.id} />
                        </motion.div>
                    )}
                </div>
            )}
        </div>
    );
}
