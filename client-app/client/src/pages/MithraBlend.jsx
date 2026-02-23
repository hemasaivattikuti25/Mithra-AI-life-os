import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Link2, Plus, Copy, Check, Loader2, AlertCircle, LogIn, Trash2, LogOut, RefreshCcw } from 'lucide-react';
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
        setError('');
        try {
            const data = await workspaceService.getWorkspaces(user.id);
            setWorkspaces(data || []);
            if (data && data.length > 0 && !activeWorkspace) {
                setActiveWorkspace(data[0]);
            }
        } catch (err) {
            console.error(err);
            setError(err.message || 'Could not load workspaces.');
        } finally {
            setLoading(false);
        }
    }, [user, activeWorkspace]);

    useEffect(() => { load(); }, [load]);

    // Hard fallback timeout to prevent infinite spinners
    useEffect(() => {
        let timeout;
        if (loading) {
            timeout = setTimeout(() => {
                setLoading(false);
                setError('Connection timed out. Please check your network or try again.');
            }, 12000);
        }
        return () => clearTimeout(timeout);
    }, [loading]);

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

    const handleJoin = async (hashToJoin = joinHash) => {
        if (!hashToJoin || !hashToJoin.trim()) return;
        setJoining(true);
        setError('');
        try {
            const result = await workspaceService.joinWorkspace(hashToJoin.trim(), user.id);
            if (result.alreadyMember) {
                setError('You are already a member of this workspace!');
            }
            await load();
            setJoinHash('');
            setShowJoin(false);

            // Clean up the URL hash if joining succeeded
            if (window.location.hash.includes('join=')) {
                window.history.replaceState(null, '', window.location.pathname + '#/blend');
            }
        } catch (err) {
            setError(err.message || 'Invalid or already joined workspace.');
        } finally {
            setJoining(false);
        }
    };

    const handleLeaveOrDelete = async (ws) => {
        const isOwner = ws.userRole === 'owner';
        const actionText = isOwner ? 'delete' : 'leave';

        if (!window.confirm(`Are you sure you want to ${actionText} "${ws.name}"? ${isOwner ? 'This cannot be undone.' : ''}`)) {
            return;
        }

        setError('');
        setLoading(true);
        try {
            if (isOwner) {
                await workspaceService.deleteWorkspace(ws.id, user.id);
            } else {
                await workspaceService.leaveWorkspace(ws.id, user.id);
            }
            setActiveWorkspace(null);
            await load();
        } catch (err) {
            setError(err.message || `Failed to ${actionText} workspace.`);
        } finally {
            setLoading(false);
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
            handleJoin(hash); // Trigger join automatically
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    return (
        <div className="min-h-screen p-4 sm:p-6 md:p-8 space-y-6 max-w-4xl mx-auto pb-24 md:pb-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: luxuryEase }}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
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

            {/* Error & Retry */}
            <AnimatePresence>
                {error && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="flex items-center justify-between p-3 rounded-xl text-sm text-red-400 bg-red-500/10 border border-red-500/20"
                    >
                        <div className="flex items-center gap-2">
                            <AlertCircle size={15} />
                            <span>{error}</span>
                        </div>
                        <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors text-xs font-semibold">
                            <RefreshCcw size={12} /> Try Again
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Create panel */}
            <AnimatePresence>
                {showCreate && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <GlassCard className="border border-[var(--glass-border)] mt-2">
                            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Create a Blend Workspace</h3>
                            <div className="flex gap-3">
                                <input
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleCreate()}
                                    placeholder="Workspace name (e.g. 'Study Group')"
                                    className="flex-1 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--accent-color)]"
                                    autoFocus
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
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <GlassCard className="border border-[var(--glass-border)] mt-2">
                            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Join via Invite Link</h3>
                            <div className="flex gap-3">
                                <input
                                    value={joinHash}
                                    onChange={e => setJoinHash(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleJoin()}
                                    placeholder="Paste invite code or link here"
                                    className="flex-1 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--accent-color)]"
                                    autoFocus
                                />
                                <button
                                    onClick={() => handleJoin(joinHash)}
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
                        <p className="text-sm text-[var(--text-dim)] mt-1 max-w-sm mx-auto">Create a workspace to sync your habits and goals with friends, or join one via invite link.</p>
                    </div>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 gap-4 mt-8">
                    {/* Workspace tabs */}
                    <div className="flex gap-2 flex-wrap">
                        {workspaces.map(ws => (
                            <button
                                key={ws.id}
                                onClick={() => setActiveWorkspace(ws)}
                                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${activeWorkspace?.id === ws.id
                                    ? 'bg-[var(--accent-glow)] border-[var(--accent-color)] text-[var(--accent-color)]'
                                    : 'bg-[var(--glass-bg)] border-[var(--glass-border)] text-[var(--text-dim)] hover:text-[var(--text-primary)]'
                                    }`}
                            >
                                {ws.name} {ws.memberCount > 1 && <span className="opacity-60 ml-1">({ws.memberCount})</span>}
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
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-[var(--text-dim)] uppercase tracking-widest mb-1 flex items-center gap-2">
                                            <span>Invite Link</span>
                                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${activeWorkspace.userRole === 'owner' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                {activeWorkspace.userRole}
                                            </span>
                                        </p>
                                        <p className="text-sm text-[var(--text-primary)] font-mono truncate max-w-full">
                                            {`${window.location.origin}/#/blend?join=${activeWorkspace.share_link_hash}`}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <button
                                            onClick={() => copyLink(activeWorkspace)}
                                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all bg-[var(--accent-glow)] text-[var(--accent-color)] border border-[var(--accent-color)]/20 hover:bg-[var(--accent-color)] hover:text-white"
                                        >
                                            {copiedId === activeWorkspace.id ? <Check size={14} /> : <Copy size={14} />}
                                            {copiedId === activeWorkspace.id ? 'Copied' : 'Copy Link'}
                                        </button>

                                        <button
                                            onClick={() => handleLeaveOrDelete(activeWorkspace)}
                                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${activeWorkspace.userRole === 'owner' ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500 hover:text-white' : 'bg-[var(--glass-bg)] text-[var(--text-dim)] border-[var(--glass-border)] hover:bg-white/10 hover:text-[var(--text-primary)]'}`}
                                            title={activeWorkspace.userRole === 'owner' ? "Delete Workspace" : "Leave Workspace"}
                                        >
                                            {activeWorkspace.userRole === 'owner' ? <Trash2 size={14} /> : <LogOut size={14} />}
                                        </button>
                                    </div>
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
