import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Link2, Plus, Copy, Check, AlertCircle, LogIn, X,
    Hash, Trash2, LogOut, RefreshCcw, Loader2, Eye, EyeOff,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { workspaceService } from '../services/workspaceService';
import { BlendOverview } from '../components/BlendOverview';
import { apiFetch } from '../services/firebaseClient';

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */

const GlassCard = ({ children, className = '' }) => (
    <div
        className={`rounded-2xl p-4 sm:p-6 ${className}`}
        style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--glass-border)',
        }}
    >
        {children}
    </div>
);

const SkeletonPulse = ({ className = '' }) => (
    <div className={`animate-pulse rounded-xl ${className}`} style={{ background: 'var(--glass-border)' }} />
);

const SkeletonLoader = () => (
    <div className="space-y-4 mt-6">
        {[1, 2, 3].map(i => (
            <GlassCard key={i}>
                <div className="flex items-center gap-4">
                    <SkeletonPulse className="w-10 h-10 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                        <SkeletonPulse className="h-4 w-3/4" />
                        <SkeletonPulse className="h-3 w-1/2" />
                    </div>
                </div>
            </GlassCard>
        ))}
    </div>
);

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function MithraBlend() {
    const { user } = useAuth();

    // Data state
    const [workspaces, setWorkspaces] = useState([]);
    const [activeWsId, setActiveWsId] = useState(null);
    const [members, setMembers] = useState([]);
    const [workspaceHabits, setWorkspaceHabits] = useState([]);
    const [workspaceTasks, setWorkspaceTasks] = useState([]);

    // UI state
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [showJoin, setShowJoin] = useState(false);
    const [innerTab, setInnerTab] = useState('overview');

    // Create form
    const [newName, setNewName] = useState('');
    const [creating, setCreating] = useState(false);
    const [createdWs, setCreatedWs] = useState(null);

    // Join form
    const [joinInput, setJoinInput] = useState('');
    const [joining, setJoining] = useState(false);

    // Auto-join
    const [autoJoinAttempted, setAutoJoinAttempted] = useState(false);
    const [autoJoining, setAutoJoining] = useState(false);

    // Management
    const [showCode, setShowCode] = useState(false);
    const [copied, setCopied] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleteInput, setDeleteInput] = useState('');

    // Inline add forms
    const [addingHabit, setAddingHabit] = useState(false);
    const [newHabitTitle, setNewHabitTitle] = useState('');
    const [addingTask, setAddingTask] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');

    const activeWorkspace = workspaces.find(w => w.id === activeWsId) || null;

    // ── Load workspaces ──────────────────────────────────────────

    const load = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        setError('');
        try {
            const ws = await workspaceService.getWorkspaces(user.id);
            setWorkspaces(ws);
            if (ws.length > 0 && (!activeWsId || !ws.find(w => w.id === activeWsId))) {
                setActiveWsId(ws[0].id);
            }
        } catch (err) {
            // Immediately stop loading — do NOT wait for the 60s timeout
            setLoading(false);
            if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError') || err.message?.includes('Network Error')) {
                setError('Network Error: Cannot reach the backend. The server may be waking up — please wait a moment and click Try Again.');
            } else if (err.message?.includes('CORS')) {
                setError('CORS Error: The backend rejected the request. Check ALLOWED_ORIGINS in your Render environment.');
            } else {
                setError(err.message || 'An unknown error occurred.');
            }
            return; // skip finally's setLoading(false) — already done
        } finally {
            setLoading(false);
        }
    }, [user, activeWsId]);


    useEffect(() => { load(); }, [load]);

    // ── Load workspace details when active workspace changes ─────

    useEffect(() => {
        if (!activeWsId || !user) return;
        let cancelled = false;

        const loadDetails = async () => {
            try {
                const [m, h, t] = await Promise.all([
                    workspaceService.getMembers(activeWsId),
                    workspaceService.getWorkspaceHabits(activeWsId),
                    workspaceService.getWorkspaceTasks(activeWsId),
                ]);
                if (!cancelled) {
                    setMembers(m);
                    setWorkspaceHabits(h);
                    setWorkspaceTasks(t);
                }
            } catch { }
        };
        loadDetails();
        return () => { cancelled = true; };
    }, [activeWsId, user]);

    // ── Polling: refresh workspace data periodically (replaces Supabase realtime) ──

    useEffect(() => {
        if (!activeWsId) return;

        const refreshData = () => {
            workspaceService.getMembers(activeWsId).then(setMembers).catch(() => {});
            workspaceService.getWorkspaceHabits(activeWsId).then(setWorkspaceHabits).catch(() => {});
            workspaceService.getWorkspaceTasks(activeWsId).then(setWorkspaceTasks).catch(() => {});
        };

        // Initial load
        refreshData();

        // Poll every 30 seconds for updates
        const interval = setInterval(refreshData, 30000);

        return () => clearInterval(interval);
    }, [activeWsId, load]);

    // ── URL auto-join ────────────────────────────────────────────

    useEffect(() => {
        if (!user || autoJoinAttempted) return;
        const hashParts = window.location.hash.split('?');
        const params = new URLSearchParams(hashParts[1] || '');
        const hash = params.get('join') || params.get('code');
        if (!hash) return;

        setAutoJoinAttempted(true);
        setAutoJoining(true);
        workspaceService.joinByCode(hash, user.id)
            .then(result => {
                if (result.alreadyMember) setInfo('You are already in this workspace.');
                else setInfo(`Joined "${result.workspace.name}" successfully!`);
                load();
                setActiveWsId(result.workspace.id);
            })
            .catch(err => setError(err.message))
            .finally(() => setAutoJoining(false));
    }, [user, autoJoinAttempted, load]);

    // ── 60-second timeout (accounts for Render free-tier cold start) ──────────

    useEffect(() => {
        if (!loading) return;
        const t = setTimeout(() => {
            setLoading(false);
            const timeoutMsg = 'Connection timed out. The server is waking up, please click Try Again.';
            setError(timeoutMsg);
        }, 60000);
        return () => clearTimeout(t);
    }, [loading]);


    // ── Handlers ─────────────────────────────────────────────────

    const handleCreate = async () => {
        if (!newName.trim() || creating) return;
        setCreating(true);
        setError('');
        try {
            const ws = await workspaceService.createWorkspace(newName, user.id);
            setCreatedWs(ws);
            setNewName('');
            await load();
            setActiveWsId(ws.id);
        } catch (err) {
            setError(err.message);
        } finally {
            setCreating(false);
        }
    };

    const handleJoin = async () => {
        if (!joinInput.trim() || joining) return;
        setJoining(true);
        setError('');
        try {
            const result = await workspaceService.joinByCode(joinInput, user.id);
            if (result.alreadyMember) {
                setInfo('You are already in this workspace.');
            } else {
                setInfo(`Joined "${result.workspace.name}" successfully!`);
            }
            setJoinInput('');
            setShowJoin(false);
            await load();
            setActiveWsId(result.workspace.id);
        } catch (err) {
            setError(err.message);
        } finally {
            setJoining(false);
        }
    };

    const handleLeave = async () => {
        if (!activeWorkspace) return;
        try {
            await workspaceService.leaveWorkspace(activeWorkspace.id, user.id);
            setActiveWsId(null);
            setConfirmDelete(false);
            await load();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async () => {
        if (!activeWorkspace || deleteInput !== activeWorkspace.name) return;
        try {
            await workspaceService.deleteWorkspace(activeWorkspace.id, user.id);
            setActiveWsId(null);
            setConfirmDelete(false);
            setDeleteInput('');
            await load();
        } catch (err) {
            setError(err.message);
        }
    };

    const copyInviteLink = (ws) => {
        const link = `${window.location.origin}/#/blend?join=${ws.share_link_hash}`;
        navigator.clipboard.writeText(link).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleAddHabit = async () => {
        if (!newHabitTitle.trim() || !activeWorkspace) return;
        try {
            await apiFetch('/habits', {
                method: 'POST',
                body: JSON.stringify({
                    title: newHabitTitle.trim(),
                    workspace_id: activeWorkspace.id,
                    streak: 0,
                    completed_dates: [],
                })
            });
            setNewHabitTitle('');
            setAddingHabit(false);
            const h = await workspaceService.getWorkspaceHabits(activeWorkspace.id);
            setWorkspaceHabits(h);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleAddTask = async () => {
        if (!newTaskTitle.trim() || !activeWorkspace) return;
        try {
            await apiFetch('/tasks', {
                method: 'POST',
                body: JSON.stringify({
                    title: newTaskTitle.trim(),
                    workspace_id: activeWorkspace.id,
                    completed: false,
                    priority: 'medium',
                })
            });
            setNewTaskTitle('');
            setAddingTask(false);
            const t = await workspaceService.getWorkspaceTasks(activeWorkspace.id);
            setWorkspaceTasks(t);
        } catch (err) {
            setError(err.message);
        }
    };

    const toggleHabitDone = async (habit) => {
        const todayStr = new Date().toISOString().split('T')[0];
        const consistency = Array.isArray(habit.consistency) ? habit.consistency : [];
        const alreadyDone = consistency.includes(todayStr);
        const updated = alreadyDone
            ? consistency.filter(d => d !== todayStr)
            : [...consistency, todayStr];
        try {
            await apiFetch(`/habits/${habit.id}`, {
                method: 'PUT',
                body: JSON.stringify({ consistency: updated })
            });
            const h = await workspaceService.getWorkspaceHabits(activeWorkspace.id);
            setWorkspaceHabits(h);
        } catch (err) {
            setError(err.message);
        }
    };

    const completeTask = async (taskId) => {
        try {
            await apiFetch(`/tasks/${taskId}`, {
                method: 'PUT',
                body: JSON.stringify({ completed: true })
            });
            const t = await workspaceService.getWorkspaceTasks(activeWorkspace.id);
            setWorkspaceTasks(t);
        } catch (err) {
            setError(err.message);
        }
    };

    // Helper: get member name by user_id
    const getMemberName = (userId) => {
        const m = members.find(m => m.userId === userId);
        return m?.fullName || 'Unknown';
    };

    // ═══════════════════════════════════════════════════════════════
    //  RENDER
    // ═══════════════════════════════════════════════════════════════

    return (
        <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto min-h-screen">

            {/* ── HEADER ── */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: 'var(--accent-glow)' }}
                    >
                        <Users size={20} style={{ color: 'var(--accent-color)' }} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-[var(--text-primary)]">Mithra Blend</h1>
                        <p className="text-xs text-[var(--text-dim)] opacity-60">Shared workspaces for habits & goals</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => { setShowJoin(!showJoin); setShowCreate(false); setCreatedWs(null); }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-[var(--text-dim)] hover:text-[var(--text-primary)] transition-colors"
                        style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
                    >
                        <LogIn size={14} /> Join
                    </button>
                    <button
                        onClick={() => { setShowCreate(!showCreate); setShowJoin(false); setCreatedWs(null); }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
                        style={{ background: 'var(--accent-color)' }}
                    >
                        <Plus size={14} /> New Blend
                    </button>
                </div>
            </div>

            {/* ── AUTO-JOIN BANNER ── */}
            <AnimatePresence>
                {autoJoining && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="mb-4 p-3 rounded-xl flex items-center gap-2 text-sm"
                        style={{ background: 'var(--accent-glow)', border: '1px solid var(--accent-color)', color: 'var(--accent-color)' }}>
                        <Loader2 size={16} className="animate-spin" /> Joining workspace...
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── ERROR BANNER ── */}
            <AnimatePresence>
                {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="mb-4 p-3 rounded-xl flex items-center gap-2 text-sm"
                        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
                        <AlertCircle size={16} className="shrink-0" />
                        <span className="flex-1">{error}</span>
                        <button onClick={() => setError('')}><X size={14} /></button>
                        <button onClick={() => { setError(''); load(); }} className="ml-2 flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg"
                            style={{ background: 'rgba(239,68,68,0.15)' }}>
                            <RefreshCcw size={12} /> Try Again
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── INFO BANNER ── */}
            <AnimatePresence>
                {info && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="mb-4 p-3 rounded-xl flex items-center gap-2 text-sm"
                        style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#86efac' }}>
                        <Check size={16} className="shrink-0" />
                        <span className="flex-1">{info}</span>
                        <button onClick={() => setInfo('')}><X size={14} /></button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── CREATE PANEL ── */}
            <AnimatePresence>
                {showCreate && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="mb-4 overflow-hidden">
                        <GlassCard>
                            {!createdWs ? (
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">Create a new Blend</h3>
                                    <div className="flex gap-2">
                                        <input
                                            value={newName}
                                            onChange={e => setNewName(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleCreate()}
                                            placeholder="Workspace name (e.g. Study Group)"
                                            className="flex-1 px-3 py-2 rounded-xl text-sm bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-dim)]/40 outline-none"
                                            style={{ border: '1px solid var(--glass-border)' }}
                                        />
                                        <button onClick={handleCreate} disabled={creating || !newName.trim()}
                                            className="px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-40"
                                            style={{ background: 'var(--accent-color)' }}>
                                            {creating ? <Loader2 size={16} className="animate-spin" /> : 'Create'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center space-y-4 py-2">
                                    <p className="text-xs text-[var(--text-dim)] uppercase tracking-widest">Your Blend Code</p>
                                    <div className="inline-block px-6 py-3 rounded-xl text-2xl font-mono font-bold tracking-[0.3em]"
                                        style={{ color: 'var(--accent-color)', border: '2px solid var(--accent-color)', background: 'var(--accent-glow)' }}>
                                        {createdWs.join_code}
                                    </div>
                                    <p className="text-xs text-[var(--text-dim)]">Share this code with friends so they can join</p>
                                    <div className="flex gap-2 justify-center">
                                        <button onClick={() => copyInviteLink(createdWs)}
                                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
                                            style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-dim)' }}>
                                            {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? 'Copied!' : 'Copy invite link'}
                                        </button>
                                        <button onClick={() => { setShowCreate(false); setCreatedWs(null); }}
                                            className="px-3 py-2 rounded-xl text-xs font-medium text-white"
                                            style={{ background: 'var(--accent-color)' }}>
                                            Done
                                        </button>
                                    </div>
                                </div>
                            )}
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── JOIN PANEL ── */}
            <AnimatePresence>
                {showJoin && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="mb-4 overflow-hidden">
                        <GlassCard>
                            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Join a Blend</h3>
                            <div className="flex gap-2">
                                <input
                                    value={joinInput}
                                    onChange={e => setJoinInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleJoin()}
                                    placeholder="Type code (MX7K29) or paste invite link"
                                    className="flex-1 px-3 py-2 rounded-xl text-sm bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-dim)]/40 outline-none"
                                    style={{ border: '1px solid var(--glass-border)' }}
                                />
                                <button onClick={handleJoin} disabled={joining || !joinInput.trim()}
                                    className="px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-40"
                                    style={{ background: 'var(--accent-color)' }}>
                                    {joining ? <Loader2 size={16} className="animate-spin" /> : 'Join'}
                                </button>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── LOADING SKELETON ── */}
            {loading && <SkeletonLoader />}

            {/* ── EMPTY STATE ── */}
            {!loading && workspaces.length === 0 && !error && (
                <GlassCard className="text-center py-12 mt-4">
                    <Users size={48} className="mx-auto mb-4" style={{ color: 'var(--text-dim)', opacity: 0.3 }} />
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No blends yet</h3>
                    <p className="text-sm text-[var(--text-dim)] opacity-60">
                        Create a workspace or join a friend using their invite code
                    </p>
                </GlassCard>
            )}

            {/* ── WORKSPACE TABS ── */}
            {!loading && workspaces.length > 0 && (
                <>
                    <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
                        {workspaces.map(ws => (
                            <button
                                key={ws.id}
                                onClick={() => { setActiveWsId(ws.id); setInnerTab('overview'); }}
                                className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${ws.id === activeWsId ? 'text-[var(--accent-color)]' : 'text-[var(--text-dim)]'
                                    }`}
                                style={{
                                    background: ws.id === activeWsId ? 'var(--accent-glow)' : 'var(--glass-bg)',
                                    border: `1px solid ${ws.id === activeWsId ? 'var(--accent-color)' : 'var(--glass-border)'}`,
                                }}
                            >
                                <span>{ws.name}</span>
                                <span className="text-[10px] opacity-50">{members.length}m</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${ws.userRole === 'owner' ? 'text-[var(--accent-color)]' : 'text-[var(--text-dim)]'
                                    }`} style={{ background: ws.userRole === 'owner' ? 'var(--accent-glow)' : 'var(--glass-bg)' }}>
                                    {ws.userRole}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* ── ACTIVE WORKSPACE ── */}
                    {activeWorkspace && (
                        <div>
                            {/* Inner tabs */}
                            <div className="flex gap-1 mb-4 p-1 rounded-xl" style={{ background: 'var(--glass-bg)' }}>
                                {['overview', 'habits', 'tasks'].map(tab => (
                                    <button key={tab} onClick={() => setInnerTab(tab)}
                                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize ${innerTab === tab ? 'text-[var(--accent-color)]' : 'text-[var(--text-dim)]'
                                            }`}
                                        style={{ background: innerTab === tab ? 'var(--accent-glow)' : 'transparent' }}>
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            {/* ── OVERVIEW TAB ── */}
                            {innerTab === 'overview' && (
                                <BlendOverview
                                    workspaceId={activeWorkspace.id}
                                    members={members}
                                    habits={workspaceHabits}
                                />
                            )}

                            {/* ── HABITS TAB ── */}
                            {innerTab === 'habits' && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                                            Shared Habits ({workspaceHabits.length})
                                        </h3>
                                        <button onClick={() => setAddingHabit(!addingHabit)}
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                                            style={{ background: 'var(--accent-color)' }}>
                                            <Plus size={12} /> Add Habit
                                        </button>
                                    </div>

                                    <AnimatePresence>
                                        {addingHabit && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                                <div className="flex gap-2 mb-3">
                                                    <input value={newHabitTitle} onChange={e => setNewHabitTitle(e.target.value)}
                                                        onKeyDown={e => e.key === 'Enter' && handleAddHabit()}
                                                        placeholder="Habit title..." autoFocus
                                                        className="flex-1 px-3 py-2 rounded-lg text-sm bg-transparent text-[var(--text-primary)] outline-none"
                                                        style={{ border: '1px solid var(--glass-border)' }} />
                                                    <button onClick={handleAddHabit} className="px-3 py-2 rounded-lg text-xs font-medium text-white"
                                                        style={{ background: 'var(--accent-color)' }}>Add</button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {workspaceHabits.length === 0 ? (
                                        <GlassCard className="text-center py-8">
                                            <p className="text-sm text-[var(--text-dim)] opacity-60">No shared habits yet. Add one!</p>
                                        </GlassCard>
                                    ) : (() => {
                                        const todayStr = new Date().toISOString().split('T')[0];
                                        return workspaceHabits.map(h => {
                                            const done = Array.isArray(h.consistency) && h.consistency.includes(todayStr);
                                            return (
                                                <GlassCard key={h.id} className="flex items-center gap-3">
                                                    <button onClick={() => toggleHabitDone(h)}
                                                        className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors"
                                                        style={{
                                                            background: done ? 'var(--accent-color)' : 'transparent',
                                                            border: `2px solid ${done ? 'var(--accent-color)' : 'var(--glass-border)'}`,
                                                        }}>
                                                        {done && <Check size={12} className="text-white" />}
                                                    </button>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm font-medium ${done ? 'line-through opacity-40' : ''}`}
                                                            style={{ color: 'var(--text-primary)' }}>{h.title}</p>
                                                        <p className="text-[10px] text-[var(--text-dim)] opacity-50">
                                                            by {getMemberName(h.user_id)} · 🔥 {h.streak || 0}
                                                        </p>
                                                    </div>
                                                    <Users size={10} style={{ color: 'var(--text-dim)', opacity: 0.3 }} />
                                                </GlassCard>
                                            );
                                        });
                                    })()}
                                </div>
                            )}

                            {/* ── TASKS TAB ── */}
                            {innerTab === 'tasks' && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                                            Shared Tasks ({workspaceTasks.length})
                                        </h3>
                                        <button onClick={() => setAddingTask(!addingTask)}
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                                            style={{ background: 'var(--accent-color)' }}>
                                            <Plus size={12} /> Add Task
                                        </button>
                                    </div>

                                    <AnimatePresence>
                                        {addingTask && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                                <div className="flex gap-2 mb-3">
                                                    <input value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)}
                                                        onKeyDown={e => e.key === 'Enter' && handleAddTask()}
                                                        placeholder="Task title..." autoFocus
                                                        className="flex-1 px-3 py-2 rounded-lg text-sm bg-transparent text-[var(--text-primary)] outline-none"
                                                        style={{ border: '1px solid var(--glass-border)' }} />
                                                    <button onClick={handleAddTask} className="px-3 py-2 rounded-lg text-xs font-medium text-white"
                                                        style={{ background: 'var(--accent-color)' }}>Add</button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {workspaceTasks.length === 0 ? (
                                        <GlassCard className="text-center py-8">
                                            <p className="text-sm text-[var(--text-dim)] opacity-60">No shared tasks yet. Add one!</p>
                                        </GlassCard>
                                    ) : (
                                        workspaceTasks.map(t => (
                                            <GlassCard key={t.id} className="flex items-center gap-3">
                                                <button onClick={() => completeTask(t.id)}
                                                    className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                                                    style={{ border: '2px solid var(--glass-border)' }}>
                                                </button>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-[var(--text-primary)]">{t.title}</p>
                                                    <p className="text-[10px] text-[var(--text-dim)] opacity-50">
                                                        by {getMemberName(t.user_id)} · {t.priority || 'medium'}
                                                    </p>
                                                </div>
                                                <Users size={10} style={{ color: 'var(--text-dim)', opacity: 0.3 }} />
                                            </GlassCard>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* ── WORKSPACE MANAGEMENT ── */}
                            <GlassCard className="mt-6 space-y-3">
                                <div className="flex flex-wrap gap-2">
                                    <button onClick={() => copyInviteLink(activeWorkspace)}
                                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-[var(--text-dim)]"
                                        style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
                                        {copied ? <Check size={12} /> : <Copy size={12} />}
                                        {copied ? 'Copied!' : 'Copy Invite Link'}
                                    </button>
                                    <button onClick={() => setShowCode(!showCode)}
                                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-[var(--text-dim)]"
                                        style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
                                        {showCode ? <EyeOff size={12} /> : <Eye size={12} />}
                                        {showCode ? 'Hide Code' : 'Show Code'}
                                    </button>
                                </div>

                                <AnimatePresence>
                                    {showCode && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                            className="text-center py-2">
                                            <span className="text-xl font-mono font-bold tracking-[0.3em]"
                                                style={{ color: 'var(--accent-color)' }}>
                                                {activeWorkspace.join_code}
                                            </span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="h-px" style={{ background: 'var(--glass-border)' }} />

                                {activeWorkspace.userRole === 'member' ? (
                                    <button onClick={handleLeave}
                                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors">
                                        <LogOut size={12} /> Leave Workspace
                                    </button>
                                ) : (
                                    <>
                                        {!confirmDelete ? (
                                            <button onClick={() => setConfirmDelete(true)}
                                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors">
                                                <Trash2 size={12} /> Delete Workspace
                                            </button>
                                        ) : (
                                            <div className="space-y-2 p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
                                                <p className="text-xs text-red-300">Type <strong>{activeWorkspace.name}</strong> to confirm deletion:</p>
                                                <div className="flex gap-2">
                                                    <input value={deleteInput} onChange={e => setDeleteInput(e.target.value)}
                                                        className="flex-1 px-2 py-1.5 rounded-lg text-xs bg-transparent text-[var(--text-primary)] outline-none"
                                                        style={{ border: '1px solid rgba(239,68,68,0.3)' }} />
                                                    <button onClick={handleDelete} disabled={deleteInput !== activeWorkspace.name}
                                                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-white disabled:opacity-30"
                                                        style={{ background: '#ef4444' }}>Delete</button>
                                                    <button onClick={() => { setConfirmDelete(false); setDeleteInput(''); }}
                                                        className="px-2 py-1.5 rounded-lg text-xs text-[var(--text-dim)]">Cancel</button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </GlassCard>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
