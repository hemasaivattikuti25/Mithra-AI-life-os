import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import {
    ArrowRight, CheckCircle2, Sparkles, Brain, Target, CalendarDays,
    Users, Shield, Zap, ChevronRight, Activity, LineChart, Globe,
    Sun, Moon, Code, Play, ArrowUpRight, Inbox, Clock
} from 'lucide-react';

// --- Background Components ---
const AnimatedBackground = ({ theme }) => {
    const isLight = theme === 'light';
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-[var(--body-bg)] transition-colors duration-300">
            {/* Enhanced Glows */}
            <div className={`absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-500/15 blur-[120px] ${isLight ? 'mix-blend-multiply opacity-50' : 'mix-blend-screen'} animate-pulse-slow`} />
            <div className={`absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/15 blur-[150px] ${isLight ? 'mix-blend-multiply opacity-50' : 'mix-blend-screen'}`} style={{ animation: 'pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite reverse' }} />
            <div className={`absolute top-[30%] left-[50%] w-[40%] h-[40%] rounded-full bg-purple-500/15 blur-[120px] ${isLight ? 'mix-blend-multiply opacity-50' : 'mix-blend-screen'} animate-pulse-slow`} />
            <div className={`absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] ${isLight ? 'opacity-10 invert' : 'opacity-20'}`} />
        </div>
    );
};

// --- Navbar ---
const Navbar = ({ isAuthenticated, navigate, theme, toggleTheme }) => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[var(--nav-bg)] backdrop-blur-xl border-b border-[var(--glass-border)] py-4 shadow-sm' : 'bg-transparent py-6'}`}>
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo(0,0)}>
                    <div className="relative">
                        <div className="absolute inset-0 bg-cyan-400 blur-md opacity-0 group-hover:opacity-40 transition-opacity" />
                        <img src="/assets/logo.png" alt="Mithra" className="relative w-9 h-9 rounded-lg" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-[var(--text-primary)]" style={{ fontFamily: "'Outfit', sans-serif" }}>Mithra</span>
                </div>
                <div className="hidden md:flex items-center gap-8 bg-[var(--glass-bg)] border border-[var(--glass-border)] px-6 py-2.5 rounded-full backdrop-blur-md">
                    <a href="#features" className="text-sm font-medium text-[var(--text-dim)] hover:text-[var(--text-primary)] transition-colors">Features</a>
                    <a href="#ai" className="text-sm font-medium text-[var(--text-dim)] hover:text-[var(--text-primary)] transition-colors">Dost AI</a>
                    <a href="#founder" className="text-sm font-medium text-[var(--text-dim)] hover:text-[var(--text-primary)] transition-colors">About</a>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full text-[var(--text-primary)] hover:scale-105 transition-all bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-[var(--glass-bg-hover)]"
                        aria-label="Toggle Theme"
                    >
                        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                    </button>
                    {isAuthenticated ? (
                        <button onClick={() => navigate('/dashboard')} className="px-5 py-2.5 rounded-full text-sm font-bold bg-[var(--text-primary)] text-[var(--body-bg)] hover:scale-105 transition-transform shadow-[0_0_20px_var(--accent-glow)]">
                            Dashboard
                        </button>
                    ) : (
                        <>
                            <Link to="/auth" className="text-sm font-medium text-[var(--text-dim)] hover:text-[var(--text-primary)] transition-colors hidden sm:block">Log in</Link>
                            <Link to="/auth" className="px-5 py-2.5 rounded-full text-sm font-bold bg-[var(--text-primary)] text-[var(--body-bg)] hover:scale-105 transition-all shadow-[0_0_20px_var(--accent-glow)]">
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

// --- Hero Section ---
const Hero = ({ navigate, isAuthenticated }) => {
    // Mouse Parallax Logic
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = (e) => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        const x = (clientX / innerWidth - 0.5) * 2; // -1 to 1
        const y = (clientY / innerHeight - 0.5) * 2;
        mouseX.set(x);
        mouseY.set(y);
    };

    // Very subtle rotation for premium feel
    const rotateX = useTransform(mouseY, [-1, 1], [6, -6]);
    const rotateY = useTransform(mouseX, [-1, 1], [-6, 6]);

    return (
        <section 
            className="relative pt-40 pb-20 px-6 overflow-hidden min-h-[90vh] flex items-center"
            onMouseMove={handleMouseMove}
        >
            <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="relative z-10"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] text-xs font-medium text-cyan-500 mb-6 backdrop-blur-md shadow-sm">
                        <Sparkles size={14} className="animate-pulse" /> Meet the Ultimate Life OS
                    </div>
                    <h1 
                        className="text-6xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight text-[var(--text-primary)] mb-6 leading-[1.05]" 
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                        Master<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 animate-gradient-x">
                            your reality.
                        </span>
                    </h1>
                    <p className="text-lg text-[var(--text-dim)] mb-8 max-w-xl leading-relaxed font-medium">
                        Replace your scattered apps with one beautiful, AI-native operating system. Manage tasks, build atomic habits, track your mood, and let Dost AI auto-schedule your success.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/auth')}
                            className="group relative flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-bold bg-[var(--text-primary)] text-[var(--body-bg)] overflow-hidden transition-transform hover:scale-105 active:scale-95"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity" />
                            Start for free <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <Link to="/promo-video" className="group flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-bold bg-[var(--glass-bg)] text-[var(--text-primary)] border border-[var(--glass-border)] hover:bg-[var(--glass-bg-hover)] transition-all">
                            <Play size={18} className="text-cyan-500 group-hover:scale-110 transition-transform" /> Watch Demo
                        </Link>
                    </div>
                    <div className="mt-12 flex items-center gap-6 text-sm text-[var(--text-dim)] font-medium">
                        <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-cyan-500" /> Free forever plan</div>
                        <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-cyan-500" /> No credit card</div>
                    </div>
                </motion.div>

                {/* 3D Dashboard Mockup */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="relative lg:h-[650px]"
                    style={{ perspective: 1200 }}
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/30 to-purple-600/30 rounded-3xl blur-[80px] -z-10 animate-pulse-slow" />
                    
                    <motion.div 
                        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                        className="relative h-full w-full rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-2xl overflow-hidden shadow-2xl flex flex-col"
                    >
                        {/* Mockup Header */}
                        <div className="h-12 border-b border-[var(--glass-border)] flex items-center px-4 gap-2 bg-[var(--surface-bg)]">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                            </div>
                            <div className="mx-auto px-4 py-1 rounded-md bg-[var(--glass-bg)] text-[10px] text-[var(--text-dim)] font-mono flex items-center gap-2">
                                <Lock size={10} /> mithra-lifeos.com
                            </div>
                        </div>
                        {/* Mockup Body */}
                        <div className="p-6 flex-1 flex flex-col gap-5 relative bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')]">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-1 tracking-tight">Good morning, Alex</h3>
                                    <p className="text-sm text-[var(--text-dim)]">Here's your optimized day.</p>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 border-2 border-[var(--glass-border)] shadow-[0_0_15px_rgba(168,85,247,0.4)]" />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                                <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-[var(--glass-bg-hover)] transition-colors">
                                    <div className="flex items-center gap-2 mb-2"><Target size={14} className="text-cyan-400" /><span className="text-xs font-semibold text-[var(--text-dim)] uppercase tracking-wider">Deep Work</span></div>
                                    <div className="text-3xl font-bold text-[var(--text-primary)]">4h 20m</div>
                                    <div className="text-[11px] font-medium text-green-400 mt-1 flex items-center gap-1"><ArrowUpRight size={12}/> 12% vs last week</div>
                                </div>
                                <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-[var(--glass-bg-hover)] transition-colors">
                                    <div className="flex items-center gap-2 mb-2"><Activity size={14} className="text-purple-400" /><span className="text-xs font-semibold text-[var(--text-dim)] uppercase tracking-wider">Energy Score</span></div>
                                    <div className="text-3xl font-bold text-[var(--text-primary)]">92<span className="text-lg text-[var(--text-dim)]">/100</span></div>
                                    <div className="text-[11px] font-medium text-[var(--text-dim)] mt-1">Optimal state achieved</div>
                                </div>
                            </div>
                            <div className="flex-1 rounded-xl bg-[var(--surface-bg)] border border-[var(--glass-border)] p-5 mt-2 flex flex-col shadow-inner">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-xs font-bold text-[var(--text-dim)] uppercase tracking-wider">Up Next</h4>
                                    <button className="text-[10px] bg-[var(--glass-bg)] px-2 py-1 rounded border border-[var(--glass-border)]">Syncing...</button>
                                </div>
                                <div className="space-y-3">
                                    {[
                                        { t: 'Review Q3 Metrics', time: '10:00 AM', d: true, tag: 'Work' },
                                        { t: 'Team Standup', time: '11:30 AM', d: false, tag: 'Meeting' },
                                        { t: 'Workout (Leg Day)', time: '5:00 PM', d: false, tag: 'Health' }
                                    ].map((task, i) => (
                                        <div key={i} className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${task.d ? 'bg-[var(--glass-bg)] border-[var(--glass-border)] opacity-60' : 'bg-[var(--glass-bg-hover)] border-[var(--glass-border-hover)]'}`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded-full border-2 ${task.d ? 'border-cyan-500 bg-cyan-500/20' : 'border-gray-500'} flex items-center justify-center transition-colors`}>
                                                    {task.d && <CheckCircle2 size={12} className="text-cyan-400" />}
                                                </div>
                                                <div>
                                                    <div className={`text-sm font-medium ${task.d ? 'text-[var(--text-dim)] line-through' : 'text-[var(--text-primary)]'}`}>{task.t}</div>
                                                    <div className="text-[10px] text-cyan-500 mt-0.5">{task.tag}</div>
                                                </div>
                                            </div>
                                            <span className="text-xs font-mono font-medium text-[var(--text-dim)] bg-[var(--body-bg)] px-2 py-1 rounded-md">{task.time}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

// --- Dummy Lock Icon for Mockup ---
const Lock = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
);

// --- Modern Bento Grid Features Section ---
const Features = () => {
    return (
        <section id="features" className="py-32 px-6 relative z-10">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16 max-w-2xl mx-auto"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-400 mb-6">
                        <Zap size={14} /> Powerfully Simple
                    </div>
                    <h2 className="text-4xl sm:text-5xl font-extrabold text-[var(--text-primary)] mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Everything you need.<br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Nothing you don't.</span>
                    </h2>
                    <p className="text-[var(--text-dim)] text-lg">Replace 5 different subscriptions with one highly integrated, beautiful workspace designed for deep focus.</p>
                </motion.div>

                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[300px]">
                    
                    {/* Feature 1: Dost AI (Large Box) */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        className="md:col-span-2 lg:col-span-2 row-span-2 rounded-3xl p-8 bg-[var(--glass-bg)] border border-[var(--glass-border)] relative overflow-hidden group hover:border-purple-500/30 transition-colors flex flex-col"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />
                        <div className="relative z-10 mb-auto">
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6 border border-purple-500/30">
                                <Brain size={24} className="text-purple-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>Dost AI Co-Pilot</h3>
                            <p className="text-[var(--text-dim)] text-sm max-w-sm">Not just a chatbot. Dost analyzes your habits, calendar, and mood to auto-schedule your success and prevent burnout before it happens.</p>
                        </div>
                        {/* Mini visual mockup inside the card */}
                        <div className="relative mt-8 bg-[var(--surface-bg)] rounded-t-xl border-x border-t border-[var(--glass-border)] p-4 shadow-2xl translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                            <div className="flex gap-3 mb-3">
                                <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0"><Brain size={12} className="text-purple-400"/></div>
                                <div className="bg-[var(--glass-bg)] rounded-lg p-3 text-xs border border-[var(--glass-border)] w-full">
                                    I noticed you're overwhelmed. I've moved your non-urgent tasks to Friday and blocked 2 hours for deep work today. Sound good?
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <div className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-md text-xs font-medium">Apply Schedule</div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Feature 2: Habit Focus Hub */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ delay: 0.1 }}
                        className="md:col-span-2 lg:col-span-2 row-span-1 rounded-3xl p-8 bg-[var(--glass-bg)] border border-[var(--glass-border)] relative overflow-hidden group hover:border-cyan-500/30 transition-colors"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none" />
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 flex items-center justify-center mb-4 border border-cyan-500/30">
                                    <Target size={20} className="text-cyan-400" />
                                </div>
                                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>Atomic Habit Hub</h3>
                                <p className="text-[var(--text-dim)] text-sm max-w-[200px]">Beautiful streaks, heatmaps, and smart tracking.</p>
                            </div>
                            <div className="flex gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                                {[1,2,3,4,5,6,7].map((i) => (
                                    <div key={i} className={`w-3 h-10 rounded-full ${i > 4 ? 'bg-[var(--glass-border)]' : 'bg-cyan-500/80 shadow-[0_0_10px_rgba(6,182,212,0.5)]'}`} style={{ height: `${20 + i*6}px` }} />
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Feature 3: Smart Calendar */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ delay: 0.2 }}
                        className="md:col-span-1 lg:col-span-1 row-span-1 rounded-3xl p-8 bg-[var(--glass-bg)] border border-[var(--glass-border)] relative overflow-hidden group hover:border-orange-500/30 transition-colors flex flex-col"
                    >
                        <div className="w-10 h-10 rounded-2xl bg-orange-500/20 flex items-center justify-center mb-4 border border-orange-500/30">
                            <CalendarDays size={20} className="text-orange-400" />
                        </div>
                        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>Smart Sync</h3>
                        <p className="text-[var(--text-dim)] text-sm">2-way Google Calendar sync natively built-in.</p>
                    </motion.div>

                    {/* Feature 4: Offline First */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ delay: 0.3 }}
                        className="md:col-span-1 lg:col-span-1 row-span-1 rounded-3xl p-8 bg-[var(--glass-bg)] border border-[var(--glass-border)] relative overflow-hidden group hover:border-green-500/30 transition-colors flex flex-col justify-between"
                    >
                        <div className="w-10 h-10 rounded-2xl bg-green-500/20 flex items-center justify-center mb-4 border border-green-500/30">
                            <Shield size={20} className="text-green-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>Local-First</h3>
                            <p className="text-[var(--text-dim)] text-sm">Works 100% offline. Syncs when you reconnect.</p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

// --- Stats Section ---
const Stats = () => (
    <section className="py-20 px-6 border-y border-[var(--glass-border)] bg-black/20 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 divide-y md:divide-y-0 md:divide-x divide-[var(--glass-border)]">
            {[
                { label: 'Active Users', value: '1,200+' },
                { label: 'Tasks Auto-Scheduled', value: '45k+' },
                { label: 'System Uptime', value: '99.9%' },
                { label: 'Average Time Saved/Wk', value: '5h' }
            ].map((stat, i) => (
                <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="text-center px-4 pt-4 md:pt-0"
                >
                    <div className="text-4xl sm:text-5xl font-extrabold text-[var(--text-primary)] mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>{stat.value}</div>
                    <div className="text-xs sm:text-sm text-cyan-500 font-bold uppercase tracking-wider">{stat.label}</div>
                </motion.div>
            ))}
        </div>
    </section>
);

// --- AI Demo Section ---
const AIDemo = () => {
    return (
        <section id="ai" className="py-32 px-6 relative z-10 overflow-hidden">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-medium text-purple-400 mb-6">
                        <Brain size={14} /> Advanced AI Engine
                    </div>
                    <h2 className="text-4xl sm:text-5xl font-extrabold text-[var(--text-primary)] mb-6 leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Meet Dost.<br />
                        <span className="text-purple-400">Your cognitive co-pilot.</span>
                    </h2>
                    <p className="text-[var(--text-dim)] text-lg mb-8 leading-relaxed">
                        Dost has full context of your tasks, habits, and calendar. It proactively suggests schedule changes, breaks down complex projects, and identifies patterns in your mood before you do.
                    </p>
                    <ul className="space-y-5 mb-8">
                        {[
                            'Auto-schedules tasks into free calendar slots',
                            'Detects burnout patterns before they happen',
                            'Breaks down overwhelming goals into atomic steps'
                        ].map((item, i) => (
                            <li key={i} className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
                                    <CheckCircle2 size={16} className="text-purple-400" />
                                </div>
                                <span className="text-[var(--text-primary)] font-medium pt-1">{item}</span>
                            </li>
                        ))}
                    </ul>
                </motion.div>

                {/* Glasspane Terminal Mockup */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="relative"
                >
                    <div className="absolute inset-0 bg-purple-500/30 blur-[120px] rounded-full -z-10" />
                    <div className="relative rounded-3xl border border-[var(--glass-border)] bg-[var(--surface-bg)] backdrop-blur-2xl overflow-hidden shadow-2xl p-8">
                        <div className="space-y-6">
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="flex gap-4"
                            >
                                <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/30 shrink-0 flex items-center justify-center text-sm font-bold text-cyan-400">U</div>
                                <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl rounded-tl-sm p-4 text-[var(--text-primary)]">
                                    I feel completely overwhelmed. I have 3 major project deadlines and haven't worked out in 4 days.
                                </div>
                            </motion.div>
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.8 }}
                                className="flex gap-4"
                            >
                                <img src="/assets/logo.png" alt="Dost" className="w-10 h-10 rounded-full shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.5)] border border-purple-500/50" />
                                <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl rounded-tl-sm p-5 text-[var(--text-primary)]">
                                    <p className="mb-4">I see you're stressed. Let's fix this. Looking at your calendar, Thursday is completely packed, but tomorrow morning is light.</p>
                                    <p className="mb-3 font-semibold text-purple-400">I've proactively generated a revised schedule:</p>
                                    <div className="bg-[var(--body-bg)] rounded-xl p-4 border border-[var(--glass-border)] font-mono text-sm text-[var(--text-dim)] space-y-2">
                                        <div className="flex items-center gap-2"><ArrowRight size={14} className="text-purple-400"/> Moved "Project A Review" to Wed 9AM.</div>
                                        <div className="flex items-center gap-2"><ArrowRight size={14} className="text-cyan-400"/> Scheduled a 30m run for tomorrow at 7AM.</div>
                                        <div className="flex items-center gap-2"><ArrowRight size={14} className="text-purple-400"/> Blocked Thursday afternoon for deep work.</div>
                                    </div>
                                    <button className="mt-4 w-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 font-bold py-2 rounded-xl transition-colors border border-purple-500/30">
                                        Apply these changes
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

// --- Founder Section ---
const Founder = () => (
    <section id="founder" className="py-32 px-6 relative z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-5xl mx-auto">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="relative rounded-3xl border border-[var(--glass-border)] bg-[var(--surface-bg)] backdrop-blur-2xl p-8 sm:p-12 shadow-2xl"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 pointer-events-none rounded-3xl" />
                <div className="relative flex flex-col lg:flex-row items-center gap-12">
                    {/* Photo with glowing ring */}
                    <div className="shrink-0 group">
                        <div className="relative w-48 h-48 sm:w-56 sm:h-56">
                            <div className="absolute -inset-2 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full blur-xl opacity-50 group-hover:opacity-80 transition-opacity duration-500 animate-pulse-slow" />
                            <img
                                src="/assets/hemasai.jpeg"
                                alt="Hemasai Vattikuti"
                                className="relative w-full h-full rounded-full object-cover border-4 border-[var(--body-bg)] shadow-2xl"
                            />
                        </div>
                    </div>

                    {/* Story */}
                    <div className="flex-1 text-center lg:text-left">
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Built by a developer, <br className="hidden lg:block"/>for high performers.
                        </h2>
                        <p className="text-cyan-400 text-sm font-bold mb-6 tracking-wide uppercase">Hemasai Vattikuti • Applied AI Engineer</p>
                        
                        <p className="text-[var(--text-primary)] opacity-85 leading-relaxed mb-6 text-lg">
                            "I built Mithra Life OS because I was tired of fighting scattered tools. I wanted one unified, AI-native space to optimize productivity, build habits, and gain self-awareness without the friction."
                        </p>
                        
                        <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                            <a href="https://github.com/hemasaivattikuti25" target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--glass-bg-hover)] transition-all hover:-translate-y-1">
                                <Globe size={16} /> GitHub
                            </a>
                            <a href="https://www.linkedin.com/in/hemasaivattikuti" target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0a66c2]/10 border border-[#0a66c2]/20 text-sm font-medium text-[#0a66c2] hover:bg-[#0a66c2]/20 transition-all hover:-translate-y-1">
                                <Users size={16} /> LinkedIn
                            </a>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    </section>
);

// --- Footer ---
const Footer = () => (
    <footer className="border-t border-[var(--glass-border)] bg-[var(--surface-bg)] pt-16 pb-8 px-6 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2">
                <div className="flex items-center gap-2 mb-4">
                    <img src="/assets/logo.png" alt="Mithra" className="w-8 h-8 rounded-lg" />
                    <span className="text-xl font-bold text-[var(--text-primary)]" style={{ fontFamily: "'Outfit', sans-serif" }}>Mithra</span>
                </div>
                <p className="text-sm text-[var(--text-dim)] max-w-sm leading-relaxed">
                    The premium life operating system designed for high performers. Organize, automate, and elevate your life today.
                </p>
            </div>
            <div>
                <h4 className="text-[var(--text-primary)] font-bold mb-4">Product</h4>
                <ul className="space-y-3 text-sm font-medium text-[var(--text-dim)]">
                    <li><a href="#features" className="hover:text-cyan-400 transition-colors">Features</a></li>
                    <li><a href="#ai" className="hover:text-cyan-400 transition-colors">Dost AI</a></li>
                    <li><a href="#founder" className="hover:text-cyan-400 transition-colors">About the Founder</a></li>
                </ul>
            </div>
            <div>
                <h4 className="text-[var(--text-primary)] font-bold mb-4">Legal</h4>
                <ul className="space-y-3 text-sm font-medium text-[var(--text-dim)]">
                    <li><Link to="/privacy" className="hover:text-cyan-400 transition-colors">Privacy Policy</Link></li>
                    <li><Link to="/terms" className="hover:text-cyan-400 transition-colors">Terms of Service</Link></li>
                    <li><a href="https://www.linkedin.com/in/hemasaivattikuti" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">Contact</a></li>
                </ul>
            </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-[var(--glass-border)] flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-medium text-[var(--text-dim)]">
            <p>© {new Date().getFullYear()} Mithra AI. All rights reserved.</p>
            <p className="flex items-center gap-1">Built with <span className="text-red-500">❤️</span> by <a href="https://hemasai-vattikuti-portfolio.vercel.app" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Hemasai Vattikuti</a></p>
        </div>
    </footer>
);

export default function LandingPage() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { theme, toggleTheme } = useData();

    return (
        <div className="min-h-screen bg-[var(--body-bg)] text-[var(--text-primary)] selection:bg-cyan-500/30 font-sans transition-colors duration-300">
            <AnimatedBackground theme={theme} />
            <Navbar isAuthenticated={isAuthenticated} navigate={navigate} theme={theme} toggleTheme={toggleTheme} />
            <main>
                <Hero navigate={navigate} isAuthenticated={isAuthenticated} />
                <Stats />
                <Features />
                <AIDemo />
                <Founder />
            </main>
            <Footer />
        </div>
    );
}
