import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import {
    ArrowRight, CheckCircle2, Sparkles, Brain, Target, CalendarDays,
    Users, Shield, Zap, ChevronRight, Activity, LineChart, Globe,
    Sun, Moon, Code, Play, ArrowUpRight, Inbox, Clock, Github, Twitter, Heart
} from 'lucide-react';

// --- Enhanced Background ---
const AnimatedBackground = ({ theme }) => {
    const isLight = theme === 'light';
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-[var(--body-bg)] transition-colors duration-500">
            {/* Deep mesh gradient */}
            <div className={`absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-500/20 blur-[60px] ${isLight ? 'mix-blend-multiply opacity-50' : 'mix-blend-screen'} `} style={{ transform: 'translate3d(0,0,0)', willChange: 'transform' }} />
            <div className={`absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/20 blur-[60px] ${isLight ? 'mix-blend-multiply opacity-50' : 'mix-blend-screen'}`} style={{ transform: 'translate3d(0,0,0)', willChange: 'transform' }}  />
            <div className={`absolute top-[40%] left-[60%] w-[40%] h-[40%] rounded-full bg-purple-500/20 blur-[60px] ${isLight ? 'mix-blend-multiply opacity-50' : 'mix-blend-screen'} `} style={{ transform: 'translate3d(0,0,0)', willChange: 'transform' }} />
            
            {/* Noise Texture */}
            <div className={`absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] ${isLight ? 'opacity-[0.03] invert' : 'opacity-[0.03]'}`} />
            
            {/* Floating Orbs (Subtle) */}
            <motion.div 
                animate={{ y: [0, -20, 0], x: [0, 10, 0] }} 
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[20%] left-[15%] w-32 h-32 rounded-full bg-cyan-400/5 blur-3xl"
            />
            <motion.div 
                animate={{ y: [0, 30, 0], x: [0, -15, 0] }} 
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute bottom-[30%] right-[20%] w-40 h-40 rounded-full bg-purple-500/5 blur-3xl"
            />
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
        <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[var(--nav-bg)] backdrop-blur-md border-b border-[var(--glass-border)] py-4 shadow-sm' : 'bg-transparent py-6'}`}>
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

// --- World-Class Hero Section ---
const Hero = ({ navigate, isAuthenticated }) => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = (e) => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        mouseX.set((clientX / innerWidth - 0.5) * 2);
        mouseY.set((clientY / innerHeight - 0.5) * 2);
    };

    // Deep parallax transforms
    const cardRotateX = useTransform(mouseY, [-1, 1], [10, -10]);
    const cardRotateY = useTransform(mouseX, [-1, 1], [-10, 10]);
    const floatY1 = useTransform(mouseY, [-1, 1], [-20, 20]);
    const floatX1 = useTransform(mouseX, [-1, 1], [-20, 20]);
    const floatY2 = useTransform(mouseY, [-1, 1], [30, -30]);
    const floatX2 = useTransform(mouseX, [-1, 1], [30, -30]);

    return (
        <section 
            className="relative pt-40 pb-32 px-6 overflow-hidden min-h-[100vh] flex items-center"
            onMouseMove={handleMouseMove}
        >
            <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center z-10">
                {/* Left Content */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="relative z-10"
                >
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] text-xs font-bold text-cyan-400 mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.15)]"
                    >
                        <Sparkles size={14} className="animate-pulse" /> The Ultimate Life OS
                    </motion.div>
                    
                    <h1 
                        className="text-4xl sm:text-6xl lg:text-[5.5rem] font-extrabold tracking-tight text-[var(--text-primary)] mb-6 sm:mb-8 leading-[1.1]" 
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                        Master<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 animate-gradient-x relative inline-block">
                            your reality.
                            <motion.div 
                                className="absolute -bottom-2 left-0 right-0 h-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-full blur-sm opacity-50"
                                animate={{ opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 3, repeat: Infinity }}
                            />
                        </span>
                    </h1>
                    
                    <p className="text-xl text-[var(--text-dim)] mb-10 max-w-xl leading-relaxed font-medium">
                        Replace your scattered apps with one beautiful, AI-native operating system. Manage tasks, build atomic habits, track your mood, and let Dost AI auto-schedule your success.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-5">
                        <button
                            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/auth')}
                            className="group relative flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-base font-bold text-[var(--text-primary)] overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(59,130,246,0.3)] bg-gradient-to-r from-blue-600 to-purple-600 border border-[var(--glass-border)]"
                        >
                            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            Start for free <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                        </button>
                        <Link to="/promo-video" className="group flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-base font-bold bg-[var(--glass-bg)] text-[var(--text-primary)] border border-[var(--glass-border)] hover:bg-[var(--glass-bg-hover)] transition-all backdrop-blur-md">
                            <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Play size={14} className="text-cyan-400 ml-0.5" /> 
                            </div>
                            Watch Demo
                        </Link>
                    </div>
                </motion.div>

                {/* Right Content - 3D Floating Layers */}
                <div className="relative h-[550px] sm:h-[600px] lg:h-[700px] w-full perspective-1000">
                    <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 via-blue-500/10 to-purple-600/20 rounded-full blur-[60px] -z-10 " style={{ transform: 'translate3d(0,0,0)', willChange: 'transform' }} />
                    
                    {/* Main Dashboard Card */}
                    <motion.div 
                        style={{ rotateX: cardRotateX, rotateY: cardRotateY, transformStyle: "preserve-3d" }}
                        className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
                    >
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="relative w-full max-w-lg h-[500px] rounded-3xl border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-lg shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
                        >
                            {/* Mac OS Window Header */}
                            <div className="h-12 border-b border-[var(--glass-border)] flex items-center px-5 gap-2 bg-[var(--glass-bg)]">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                                    <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                                </div>
                                <div className="mx-auto px-4 py-1 rounded-md bg-[var(--glass-bg)] text-[10px] text-[var(--text-dim)] opacity-80 font-mono flex items-center gap-2">
                                    <Lock size={10} /> mithra-lifeos.com
                                </div>
                            </div>
                            
                            {/* Inner UI */}
                            <div className="p-6 flex-1 flex flex-col gap-5 relative bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-90">
                                <div className="flex justify-between items-end mb-2">
                                    <div>
                                        <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-1 tracking-tight">Good morning, Alex</h3>
                                        <p className="text-sm text-[var(--text-dim)]">Here's your optimized day.</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-purple-600 border-2 border-[var(--glass-border)] shadow-[0_0_20px_rgba(168,85,247,0.4)] p-0.5">
                                        <div className="w-full h-full bg-[var(--glass-bg)] rounded-full" />
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)] relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-500" />
                                        <div className="flex items-center gap-2 mb-2"><Target size={14} className="text-cyan-400" /><span className="text-xs font-semibold text-[var(--text-dim)] uppercase">Deep Work</span></div>
                                        <div className="text-3xl font-bold text-[var(--text-primary)]">4h 20m</div>
                                        <div className="text-[11px] font-medium text-green-400 mt-2 flex items-center gap-1"><ArrowUpRight size={12}/> +12% this week</div>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)] relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-pink-500" />
                                        <div className="flex items-center gap-2 mb-2"><Activity size={14} className="text-purple-400" /><span className="text-xs font-semibold text-[var(--text-dim)] uppercase">Energy</span></div>
                                        <div className="text-3xl font-bold text-[var(--text-primary)]">92<span className="text-lg text-[var(--text-dim)] opacity-60">/100</span></div>
                                        <div className="text-[11px] font-medium text-[var(--text-dim)] mt-2">Optimal state</div>
                                    </div>
                                </div>
                                
                                <div className="flex-1 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)] p-5 flex flex-col mt-2">
                                    <h4 className="text-xs font-bold text-[var(--text-dim)] opacity-80 uppercase tracking-wider mb-4">Auto-Scheduled Today</h4>
                                    <div className="space-y-3">
                                        {[
                                            { t: 'Deep Work (Code)', time: '09:00 AM', tag: 'Focus', color: 'cyan' },
                                            { t: 'Team Sync', time: '11:30 AM', tag: 'Meeting', color: 'purple' },
                                            { t: 'Gym Session', time: '05:00 PM', tag: 'Habit', color: 'green' }
                                        ].map((task, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-2 h-2 rounded-full bg-${task.color}-400 shadow-[0_0_8px_var(--tw-shadow-color)] shadow-${task.color}-400`} />
                                                    <span className="text-sm font-medium text-[var(--text-primary)]">{task.t}</span>
                                                </div>
                                                <span className="text-xs font-mono text-[var(--text-dim)] opacity-60">{task.time}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Floating Element 1 - AI Suggestion */}
                    <motion.div
                        style={{ x: floatX1, y: floatY1, z: 50 }}
                        className="absolute left-2 sm:left-4 md:-left-12 top-1/4 z-30 max-w-[280px] pointer-events-none scale-90 sm:scale-100"
                    >
                        <motion.div
                            animate={{ y: [0, -8, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                            className="bg-[var(--surface-bg)] opacity-95 backdrop-blur-md border border-[var(--glass-border)] p-4 rounded-2xl shadow-2xl flex items-center gap-4 pointer-events-auto"
                        >
                            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 border border-purple-500/30">
                                <Brain size={18} className="text-purple-400" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-purple-400 mb-1">Dost AI</div>
                                <div className="text-xs text-[var(--text-primary)] opacity-80 leading-tight">I noticed you're tired. Moved your 3PM meeting to tomorrow.</div>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Floating Element 2 - Habit Streak */}
                    <motion.div
                        style={{ x: floatX2, y: floatY2, z: 80 }}
                        className="absolute right-2 sm:right-4 md:-right-8 bottom-1/4 z-30 pointer-events-none scale-90 sm:scale-100"
                    >
                        <motion.div
                            animate={{ y: [0, 8, 0] }}
                            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                            className="bg-[var(--surface-bg)] opacity-95 backdrop-blur-md border border-[var(--glass-border)] p-4 rounded-2xl shadow-2xl flex items-center gap-4 pointer-events-auto"
                        >
                            <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0 border border-orange-500/30">
                                <span className="text-lg">🔥</span>
                            </div>
                            <div>
                                <div className="text-xs font-bold text-orange-400 mb-1">12 Day Streak</div>
                                <div className="text-xs text-[var(--text-primary)] opacity-80 leading-tight">Meditation habit completed.</div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
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

// --- Premium Bento Grid Features Section ---
const Features = () => {
    const [hoveredHabitCell, setHoveredHabitCell] = useState(null);
    const [selectedThemeColor, setSelectedThemeColor] = useState('cyan');

    // Heatmap data with activity level and motivational notes
    const heatmapCells = [
        { level: 3, note: "Completed Gym & Reading! 🔥" }, { level: 1, note: "Meditation done! 🧘" }, { level: 4, note: "Super productive day! 🚀" }, { level: 0, note: "Rest day 💤" }, { level: 2, note: "Workout done! 💪" }, { level: 3, note: "Coding streak maintained! 💻" }, { level: 4, note: "Perfect score on all habits! 🎉" },
        { level: 1, note: "Hydrated & walked! 💧" }, { level: 2, note: "Gym day completed! 🏋️" }, { level: 0, note: "Break day ☕" }, { level: 4, note: "Unstoppable momentum! 🔥" }, { level: 3, note: "Deep work session complete! 📚" }, { level: 2, note: "Yoga routine check! 🧘‍♀️" }, { level: 3, note: "Healthy meals tracked! 🍎" },
        { level: 3, note: "Read 30 pages! 📖" }, { level: 4, note: "All daily targets hit! 🌟" }, { level: 1, note: "Quick stretch! 🤸" }, { level: 2, note: "Mindfulness checked! ✨" }, { level: 0, note: "Offline rest day 🌿" }, { level: 3, note: "Cardio workout done! 🏃‍♂️" }, { level: 4, note: "Amazing 100% streak! 🔥" }
    ];

    const calendarEvents = [
        { time: "08:00 AM", title: "Morning Run", type: "habit", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
        { time: "10:00 AM", title: "Deep Work (Code)", type: "task", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
        { time: "02:00 PM", title: "Standup Sync", type: "event", color: "text-orange-400 bg-orange-500/10 border-orange-500/20" }
    ];

    return (
        <section id="features" className="py-32 px-6 relative z-10 bg-[var(--glass-bg)]">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-20 max-w-2xl mx-auto"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-bold text-cyan-400 mb-6 backdrop-blur-md">
                        <Zap size={14} /> Highlighted Features
                    </div>
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[var(--text-primary)] mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Six Core Engines of <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500">
                            Mithra Life OS.
                        </span>
                    </h2>
                    <p className="text-[var(--text-dim)] text-lg max-w-2xl mx-auto leading-relaxed">
                        Six premium, unified engines collaborate flawlessly in a stunning, responsive, and equal‑sized layout.
                    </p>
                </motion.div>

                {/* 3x2 Grid of equal-sized cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                    
                    {/* 1. Dost AI Co-Pilot */}
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0 }}
                        className="rounded-3xl p-5 bg-[var(--surface-bg)] backdrop-blur-md border border-[var(--glass-border)] hover:border-purple-500/50 shadow-2xl hover:shadow-[0_0_40px_rgba(168,85,247,0.2)] transition-all duration-500 flex flex-col justify-between group overflow-hidden relative"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 opacity-50 blur-[80px] rounded-full pointer-events-none group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-6 border border-purple-500/30 group-hover:scale-110 transition-transform duration-500">
                                <Brain size={24} className="text-purple-400" />
                            </div>
                            <h3 className="text-3xl font-extrabold text-[var(--text-primary)] mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>Dost AI Co-Pilot</h3>
                            <p className="text-[var(--text-dim)] text-sm leading-relaxed mb-6">
                                Not just a chatbot. Dost analyzes your habits, calendar, and mood to auto-schedule your success and prevent burnout before it happens.
                            </p>
                        </div>

                        <div className="mt-auto bg-[var(--glass-bg)] rounded-2xl border border-[var(--glass-border)] p-4 shadow-inner group-hover:-translate-y-2 transition-transform duration-500 relative z-10">
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="flex gap-3 mb-3"
                            >
                                <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0 text-[10px] font-bold text-cyan-400">U</div>
                                <div className="bg-[var(--glass-bg)] rounded-xl rounded-tl-sm p-3 text-xs text-[var(--text-primary)] opacity-80 border border-[var(--glass-border)] flex-1">
                                    I feel stressed. 3 major deadlines...
                                </div>
                            </motion.div>
                            <motion.div 
                                initial={{ opacity: 0, x: 10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.7 }}
                                className="flex gap-3"
                            >
                                <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0"><Brain size={12} className="text-purple-400"/></motion.div>
                                <div className="bg-purple-500/10 rounded-xl rounded-tl-sm p-3 text-xs text-purple-400 font-medium border border-purple-500/20 flex-1 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--glass-bg)] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                    I've auto-scheduled a 30m run & blocked focus time! ✨
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* 2. Smart Tasks Analyzer */}
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
                        className="rounded-3xl p-5 bg-[var(--surface-bg)] backdrop-blur-md border border-[var(--glass-border)] hover:border-blue-500/50 shadow-2xl hover:shadow-[0_0_40px_rgba(59,130,246,0.2)] transition-all duration-500 flex flex-col justify-between group overflow-hidden relative"
                    >
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 opacity-50 blur-[80px] rounded-full pointer-events-none group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-6 border border-blue-500/30 group-hover:scale-110 transition-transform duration-500">
                                <LineChart size={24} className="text-blue-400" />
                            </div>
                            <h3 className="text-3xl font-extrabold text-[var(--text-primary)] mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>Smart Tasks Analyzer</h3>
                            <p className="text-[var(--text-dim)] text-sm leading-relaxed mb-6">
                                Have deep analysis of your tasks data. Get detailed metrics on completion velocity, detect bottleneck items, and optimize your workload.
                            </p>
                        </div>

                        <div className="mt-auto bg-[var(--glass-bg)] rounded-2xl border border-[var(--glass-border)] p-5 shadow-inner group-hover:-translate-y-2 transition-transform duration-500 relative z-10">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-xs font-bold text-[var(--text-dim)] opacity-80 uppercase tracking-wider">Weekly Velocity</span>
                                <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-md border border-green-400/20">87% Done</span>
                            </div>
                            
                            <div className="flex items-end justify-between gap-2 h-20 pt-2">
                                {[35, 60, 45, 80, 50, 95, 70].map((h, i) => (
                                    <div key={i} className="flex-1 bg-[var(--glass-bg)] rounded-t-md h-full flex flex-col justify-end overflow-hidden group/bar">
                                        <motion.div 
                                            initial={{ height: 0 }}
                                            whileInView={{ height: `${h}%` }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                                            className={`rounded-t-md w-full relative ${i === 5 ? 'bg-gradient-to-t from-blue-600 to-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'bg-blue-500/40 group-hover/bar:bg-blue-500/60 transition-colors'}`}
                                        >
                                            {i === 5 && <div className="absolute inset-0 bg-white/20 animate-pulse" />}
                                        </motion.div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* 3. Smart Calendar */}
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
                        className="rounded-3xl p-5 bg-[var(--surface-bg)] backdrop-blur-md border border-[var(--glass-border)] hover:border-orange-500/50 shadow-2xl hover:shadow-[0_0_40px_rgba(249,115,22,0.2)] transition-all duration-500 flex flex-col justify-between group overflow-hidden relative"
                    >
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-orange-500/20 opacity-50 blur-[80px] rounded-full pointer-events-none group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center mb-6 border border-orange-500/30 group-hover:scale-110 transition-transform duration-500">
                                <CalendarDays size={24} className="text-orange-400" />
                            </div>
                            <h3 className="text-3xl font-extrabold text-[var(--text-primary)] mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>Smart Calendar</h3>
                            <p className="text-[var(--text-dim)] text-sm leading-relaxed mb-6">
                                See all your habits, tasks, and events synced natively at one place. Full bi-directional sync coordinates items in unified time slots.
                            </p>
                        </div>

                        <div className="mt-auto bg-[var(--glass-bg)] rounded-2xl border border-[var(--glass-border)] p-4 shadow-inner group-hover:-translate-y-2 transition-transform duration-500 space-y-3 relative z-10">
                            {calendarEvents.map((item, idx) => (
                                <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold backdrop-blur-md ${item.color} transition-all hover:brightness-110`}>
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-2 h-2 rounded-full bg-current shadow-[0_0_8px_currentColor]" />
                                        <span>{item.title}</span>
                                    </div>
                                    <span className="font-mono text-[10px] bg-[var(--glass-bg)] px-2 py-1 rounded-md">{item.time}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* 4. Atomic Habits & Heatmap */}
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.3 }}
                        className="rounded-3xl p-5 bg-[var(--surface-bg)] backdrop-blur-md border border-[var(--glass-border)] hover:border-cyan-500/50 shadow-2xl hover:shadow-[0_0_40px_rgba(6,182,212,0.2)] transition-all duration-500 flex flex-col justify-between group overflow-hidden relative"
                    >
                        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-cyan-500/20 opacity-50 blur-[80px] rounded-full pointer-events-none group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-6 border border-cyan-500/30 group-hover:scale-110 transition-transform duration-500">
                                <Target size={24} className="text-cyan-400" />
                            </div>
                            <h3 className="text-3xl font-extrabold text-[var(--text-primary)] mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>Atomic Habit Hub</h3>
                            <p className="text-[var(--text-dim)] text-sm leading-relaxed mb-6">
                                Visualize your consistency. Track streaks, view dynamic heatmaps, and let the system intelligently remind you to maintain your momentum over time.
                            </p>
                        </div>

                        <div className="mt-auto bg-[var(--glass-bg)] rounded-2xl border border-[var(--glass-border)] p-4 shadow-inner group-hover:-translate-y-2 transition-transform duration-500 relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-bold text-[var(--text-dim)] opacity-80 uppercase tracking-wider">Habit Consistency</span>
                                <span className="text-xs font-bold text-cyan-400 flex items-center gap-1 bg-cyan-400/10 px-2 py-1 rounded-md border border-cyan-400/20">🔥 12d Streak</span>
                            </div>
                            
                            {/* Activity Rings + Wave Bars */}
                            <div className="flex items-center justify-between gap-4">
                                {/* SVG Activity Rings */}
                                <div className="relative w-20 h-20 shrink-0">
                                    <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                                        {/* Ring 3 - outer */}
                                        <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(6,182,212,0.15)" strokeWidth="5"/>
                                        <motion.circle cx="40" cy="40" r="36" fill="none" stroke="url(#cyanGrad)" strokeWidth="5" strokeLinecap="round"
                                            strokeDasharray="226" strokeDashoffset="226"
                                            animate={{ strokeDashoffset: 226 * (1 - 0.87) }}
                                            transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
                                        />
                                        {/* Ring 2 - middle */}
                                        <circle cx="40" cy="40" r="27" fill="none" stroke="rgba(168,85,247,0.15)" strokeWidth="5"/>
                                        <motion.circle cx="40" cy="40" r="27" fill="none" stroke="url(#purpleGrad)" strokeWidth="5" strokeLinecap="round"
                                            strokeDasharray="170" strokeDashoffset="170"
                                            animate={{ strokeDashoffset: 170 * (1 - 0.72) }}
                                            transition={{ duration: 1.5, delay: 0.4, ease: "easeOut" }}
                                        />
                                        {/* Ring 1 - inner */}
                                        <circle cx="40" cy="40" r="18" fill="none" stroke="rgba(251,146,60,0.15)" strokeWidth="5"/>
                                        <motion.circle cx="40" cy="40" r="18" fill="none" stroke="url(#orangeGrad)" strokeWidth="5" strokeLinecap="round"
                                            strokeDasharray="113" strokeDashoffset="113"
                                            animate={{ strokeDashoffset: 113 * (1 - 0.95) }}
                                            transition={{ duration: 1.5, delay: 0.6, ease: "easeOut" }}
                                        />
                                        <defs>
                                            <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#06b6d4"/>
                                                <stop offset="100%" stopColor="#3b82f6"/>
                                            </linearGradient>
                                            <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#a855f7"/>
                                                <stop offset="100%" stopColor="#ec4899"/>
                                            </linearGradient>
                                            <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#fb923c"/>
                                                <stop offset="100%" stopColor="#f59e0b"/>
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-[10px] font-black text-cyan-400">87%</span>
                                    </div>
                                </div>

                                {/* Right: habit list + animated bars */}
                                <div className="flex-1 space-y-2">
                                    {[
                                        { label: 'Workout', pct: 87, color: 'bg-cyan-400', delay: 0.2 },
                                        { label: 'Meditation', pct: 72, color: 'bg-purple-400', delay: 0.35 },
                                        { label: 'Reading', pct: 95, color: 'bg-orange-400', delay: 0.5 },
                                    ].map(({ label, pct, color, delay }) => (
                                        <div key={label}>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-[10px] font-semibold text-[var(--text-dim)]">{label}</span>
                                                <span className="text-[10px] font-bold text-[var(--text-primary)] opacity-70">{pct}%</span>
                                            </div>
                                            <div className="h-1.5 rounded-full bg-[var(--glass-border)] overflow-hidden">
                                                <motion.div
                                                    className={`h-full rounded-full ${color}`}
                                                    initial={{ width: 0 }}
                                                    whileInView={{ width: `${pct}%` }}
                                                    viewport={{ once: true }}
                                                    transition={{ duration: 1.2, delay, ease: 'easeOut' }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* 5. Local-First Architecture */}
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.4 }}
                        className="rounded-3xl p-5 bg-[var(--surface-bg)] backdrop-blur-md border border-[var(--glass-border)] hover:border-green-500/50 shadow-2xl hover:shadow-[0_0_40px_rgba(34,197,94,0.2)] transition-all duration-500 flex flex-col justify-between group overflow-hidden relative"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/20 opacity-50 blur-[80px] rounded-full pointer-events-none group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mb-6 border border-green-500/30 group-hover:scale-110 transition-transform duration-500">
                                <Shield size={24} className="text-green-400" />
                            </div>
                            <h3 className="text-3xl font-extrabold text-[var(--text-primary)] mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>Local-First Architecture</h3>
                            <p className="text-[var(--text-dim)] text-sm leading-relaxed mb-6">
                                Works 100% offline. Your data is stored locally first, remaining safe and responsive, and syncs seamlessly whenever you reconnect to the internet.
                            </p>
                        </div>

                        <div className="mt-auto bg-[var(--glass-bg)] rounded-2xl border border-[var(--glass-border)] p-5 shadow-inner group-hover:-translate-y-2 transition-transform duration-500 flex items-center justify-between relative z-10 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                            <div className="flex items-center gap-3 relative z-10">
                                <Shield size={18} className="text-green-400" />
                                <span className="text-xs font-bold text-[var(--text-primary)]">Offline State</span>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-green-400 bg-green-400/10 px-3 py-1.5 rounded-full flex items-center gap-2 border border-green-400/20 relative z-10">
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" /> 
                                ENCRYPTED
                            </span>
                        </div>
                    </motion.div>

                    {/* 6. Tailored Personalization */}
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.5 }}
                        className="rounded-3xl p-5 bg-[var(--surface-bg)] backdrop-blur-md border border-[var(--glass-border)] hover:border-pink-500/50 shadow-2xl hover:shadow-[0_0_40px_rgba(244,63,94,0.2)] transition-all duration-500 flex flex-col justify-between group overflow-hidden relative"
                    >
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/20 opacity-50 blur-[80px] rounded-full pointer-events-none group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center mb-6 border border-pink-500/30 group-hover:scale-110 transition-transform duration-500">
                                <Zap size={24} className="text-pink-400" />
                            </div>
                            <h3 className="text-3xl font-extrabold text-[var(--text-primary)] mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>Tailored Personalization</h3>
                            <p className="text-[var(--text-dim)] text-sm leading-relaxed mb-6">
                                Choose your signature interface color and accent glows. Dynamic glassmorphism automatically adapts styling rules to match your aesthetic mood.
                            </p>
                        </div>

                        <div className="mt-auto bg-[var(--glass-bg)] rounded-2xl border border-[var(--glass-border)] p-4 shadow-inner group-hover:-translate-y-2 transition-transform duration-500 flex items-center justify-between gap-2 relative z-10">
                            <span className="text-xs font-bold text-pink-400 capitalize">Active: {selectedThemeColor}</span>
                            <div className="flex gap-2">
                                {[
                                    { name: 'cyan', color: 'bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.6)]' },
                                    { name: 'rose', color: 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)]' },
                                    { name: 'purple', color: 'bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.6)]' },
                                    { name: 'emerald', color: 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)]' }
                                ].map((col) => (
                                    <button 
                                        key={col.name}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedThemeColor(col.name);
                                        }}
                                        className={`w-6 h-6 rounded-full ${col.color} border-2 transition-all duration-300 hover:scale-125 ${selectedThemeColor === col.name ? 'border-white scale-110' : 'border-transparent'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
};

// --- Animated Counter ---
const useCountUp = (target, duration = 1800, shouldStart = false) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!shouldStart) return;
        let startTime = null;
        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [shouldStart, target, duration]);
    return count;
};

const StatCard = ({ label, numericValue, suffix, duration, delay, i }) => {
    const [inView, setInView] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setInView(true); },
            { threshold: 0.3 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);
    const count = useCountUp(numericValue, duration, inView);
    
    // Live increasing logic for Active Users
    const [liveCount, setLiveCount] = useState(null);
    useEffect(() => {
        if (i === 0 && count >= numericValue) {
            if (liveCount === null) setLiveCount(numericValue);
            const interval = setInterval(() => {
                setLiveCount(prev => prev + Math.floor(Math.random() * 2) + 1);
            }, 3000 + Math.random() * 3000);
            return () => clearInterval(interval);
        }
    }, [count, i, numericValue, liveCount]);

    const displayVal = i === 0 && liveCount !== null ? liveCount : count;

    return (
        <motion.div
            ref={ref}
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            className="text-center px-4 pt-4 md:pt-0 relative group"
        >
            <div className="text-4xl sm:text-5xl font-extrabold text-[var(--text-primary)] mb-2 flex items-center justify-center gap-1.5" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {inView ? displayVal.toLocaleString() : '0'}{suffix}
                {i === 0 && liveCount !== null && (
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                    </span>
                )}
            </div>
            <div className="text-xs sm:text-sm text-cyan-500 font-bold uppercase tracking-wider flex items-center justify-center gap-1.5">
                {label}
                {i === 0 && liveCount !== null && <span className="text-[10px] text-green-500 font-medium lowercase tracking-normal bg-green-500/10 px-1.5 py-0.5 rounded-full">live rising</span>}
            </div>
        </motion.div>
    );
};

// --- Stats Section ---
const Stats = () => (
    <section className="py-20 px-6 border-y border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 divide-y md:divide-y-0 md:divide-x divide-[var(--glass-border)]">
            <StatCard label="Active Users" numericValue={1300} suffix="+" duration={1800} delay={0} i={0} />
            <StatCard label="Tasks Auto-Scheduled" numericValue={45000} suffix="+" duration={2000} delay={0.1} i={1} />
            <StatCard label="System Uptime" numericValue={99} suffix=".9%" duration={1200} delay={0.2} i={2} />
            <StatCard label="Avg Time Saved / Week" numericValue={5} suffix="hrs" duration={1000} delay={0.3} i={3} />
        </div>
    </section>
);

// --- Cinematic AI Demo Section ---
const AIDemo = () => {
    const [applied, setApplied] = useState(false);
    return (
        <section id="ai" className="py-32 px-6 relative z-10 overflow-hidden bg-[var(--glass-bg)] border-y border-[var(--glass-border)]">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[500px] bg-purple-500/20 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-bold text-purple-400 mb-8 backdrop-blur-md">
                        <Brain size={14} /> Advanced AI Engine
                    </div>
                    <h2 className="text-5xl sm:text-6xl font-extrabold text-[var(--text-primary)] mb-6 leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Meet Dost.<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Your cognitive co-pilot.</span>
                    </h2>
                    <p className="text-[var(--text-dim)] text-lg mb-10 leading-relaxed font-medium">
                        Dost has full context of your tasks, habits, and calendar. It proactively suggests schedule changes, breaks down complex projects, and identifies patterns in your mood before you do.
                    </p>
                    <ul className="space-y-6 mb-8">
                        {[
                            'Auto-schedules tasks into free calendar slots',
                            'Detects burnout patterns before they happen',
                            'Breaks down overwhelming goals into atomic steps'
                        ].map((item, i) => (
                            <li key={i} className="flex items-center gap-4 group">
                                <div className="w-10 h-10 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center shrink-0 group-hover:bg-purple-500/20 group-hover:border-purple-500/30 transition-all duration-300">
                                    <CheckCircle2 size={18} className="text-purple-400" />
                                </div>
                                <span className="text-[var(--text-primary)] opacity-80 font-medium">{item}</span>
                            </li>
                        ))}
                    </ul>
                </motion.div>

                {/* Glasspane Terminal Mockup */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, rotateY: -10 }}
                    whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative perspective-1000"
                >
                    <div className="relative rounded-3xl border border-[var(--glass-border)] bg-[var(--surface-bg)] backdrop-blur-lg overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.15)] p-8">
                        {/* Terminal Header */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500" />
                        
                        <div className="space-y-6 pt-2">
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="flex gap-4"
                            >
                                <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/30 shrink-0 flex items-center justify-center text-sm font-bold text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]">U</div>
                                <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl rounded-tl-sm p-4 text-[var(--text-primary)]/90">
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
                                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 border border-purple-500/20 rounded-2xl rounded-tl-sm p-5 text-[var(--text-primary)]/90 w-full relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 blur-3xl -mr-10 -mt-10 pointer-events-none" />
                                    
                                    <p className="mb-4 relative z-10">I see you're stressed. Let's fix this. Looking at your calendar, Thursday is completely packed, but tomorrow morning is light.</p>
                                    <p className="mb-3 font-semibold text-purple-400 relative z-10">I've proactively generated a revised schedule:</p>
                                    
                                    <div className="bg-[var(--glass-bg)] rounded-xl p-4 border border-[var(--glass-border)] font-mono text-sm text-[var(--text-dim)] space-y-3 relative z-10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                                            Moved "Project A Review" to Wed 9AM.
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                            Scheduled a 30m run for tomorrow at 7AM.
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                                            Blocked Thursday afternoon for deep work.
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={() => setApplied(true)}
                                        disabled={applied}
                                        className={`mt-5 w-full font-bold py-3 rounded-xl transition-all border relative z-10 ${
                                            applied 
                                            ? 'bg-green-500/20 border-green-500/40 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.2)]' 
                                            : 'bg-[var(--glass-bg)] hover:bg-[var(--glass-bg-hover)] text-[var(--text-primary)] border-[var(--glass-border)] hover:scale-[1.02] active:scale-95 hover:border-purple-500/50'
                                        }`}
                                    >
                                        {applied ? '✓ Changes Applied Successfully!' : 'Apply these changes'}
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
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, cubicBezier: [0.22, 1, 0.36, 1] }}
                className="relative rounded-3xl border border-[var(--glass-border)] bg-[var(--surface-bg)] backdrop-blur-lg p-8 sm:p-12 shadow-2xl overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 pointer-events-none rounded-3xl" />
                <div className="relative flex flex-col lg:flex-row items-center gap-12">
                    {/* Photo with glowing ring */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8, rotate: -3 }}
                        whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.1, cubicBezier: [0.22, 1, 0.36, 1] }}
                        className="shrink-0 group"
                    >
                        <div className="relative w-48 h-48 sm:w-56 sm:h-56">
                            <div className="absolute -inset-2 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full blur-xl opacity-50 group-hover:opacity-80 transition-opacity duration-500 " />
                            <motion.img
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                src="/assets/hemasai.jpeg"
                                alt="Hemasai Vattikuti"
                                className="relative w-full h-full rounded-full object-cover border-4 border-[var(--body-bg)] shadow-2xl transition-all duration-500 group-hover:scale-105"
                            />
                        </div>
                    </motion.div>

                    {/* Story */}
                    <div className="flex-1 text-center lg:text-left">
                        <motion.h2 
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] mb-2" 
                            style={{ fontFamily: "'Outfit', sans-serif" }}
                        >
                            Built by a developer, <br className="hidden lg:block"/>for high performers.
                        </motion.h2>
                        <motion.p 
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.25 }}
                            className="text-cyan-400 text-sm font-bold mb-6 tracking-wide uppercase"
                        >
                            Hemasai Vattikuti • Applied AI Engineer
                        </motion.p>
                        
                        <motion.p 
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="text-[var(--text-primary)] opacity-85 leading-relaxed mb-6 text-lg"
                        >
                            "I built Mithra Life OS because I was tired of fighting scattered tools. I wanted one unified, AI-native space to optimize productivity, build habits, and gain self-awareness without the friction."
                        </motion.p>
                        
                        <motion.p 
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.35 }}
                            className="text-[var(--text-dim)] leading-relaxed mb-6"
                        >
                            As a Computer Science major (Class of 2027) specializing in RAG and LLMs, I have engineered FastAPI backends for Defence Asset Management at DRDL-DRDO and designed AI pipelines at Embrizon. I built Mithra to put secure, high-performance cognitive productivity tools in the hands of professionals worldwide.
                        </motion.p>
                        
                        <motion.div 
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="flex flex-wrap justify-center lg:justify-start gap-3"
                        >
                            <a href="https://hemasai-vattikuti-portfolio.vercel.app" target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-sm font-bold text-[var(--text-primary)] shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:opacity-90 transition-all hover:-translate-y-1">
                                <Sparkles size={16} /> Portfolio
                            </a>
                            <a href="https://github.com/hemasaivattikuti25" target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--glass-bg-hover)] transition-all hover:-translate-y-1">
                                <Globe size={16} /> GitHub
                            </a>
                            <a href="https://www.linkedin.com/in/hemasaivattikuti" target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0a66c2]/10 border border-[#0a66c2]/20 text-sm font-medium text-[#0a66c2] hover:bg-[#0a66c2]/20 transition-all hover:-translate-y-1">
                                <Users size={16} /> LinkedIn
                            </a>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </div>
    </section>
);

// --- Footer ---
const Footer = () => (
    <footer className="py-12 border-t border-[var(--glass-border)] bg-[var(--surface-bg)] backdrop-blur-lg relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-10">
            <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 p-0.5">
                        <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center">
                            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 font-serif">M</span>
                        </div>
                    </div>
                    <span className="text-xl font-bold text-[var(--text-primary)] tracking-wide" style={{ fontFamily: "'Outfit', sans-serif" }}>Mithra Life OS</span>
                </div>
                <p className="text-[var(--text-dim)] opacity-80 text-sm max-w-sm leading-relaxed mb-6">
                    A premium life operating system designed for high performers. Organize, automate, and elevate your life today.
                </p>
                <div className="flex gap-4">
                    <a href="#" className="w-10 h-10 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center text-[var(--text-dim)] hover:text-cyan-400 hover:border-cyan-500/30 hover:bg-cyan-500/10 transition-all">
                        <Github size={18} />
                    </a>
                    <a href="#" className="w-10 h-10 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center text-[var(--text-dim)] hover:text-purple-400 hover:border-purple-500/30 hover:bg-purple-500/10 transition-all">
                        <Twitter size={18} />
                    </a>
                </div>
            </div>
            
            <div>
                <h4 className="font-bold text-[var(--text-primary)] mb-6 uppercase tracking-wider text-xs">Product</h4>
                <ul className="space-y-4 text-sm font-medium">
                    <li><a href="#features" className="text-[var(--text-dim)] opacity-80 hover:text-cyan-400 transition-colors">Features</a></li>
                    <li><a href="#ai" className="text-[var(--text-dim)] opacity-80 hover:text-cyan-400 transition-colors">Dost AI</a></li>
                    <li><a href="#founder" className="text-[var(--text-dim)] opacity-80 hover:text-cyan-400 transition-colors">About the Founder</a></li>
                </ul>
            </div>
            
            <div>
                <h4 className="font-bold text-[var(--text-primary)] mb-6 uppercase tracking-wider text-xs">Legal</h4>
                <ul className="space-y-4 text-sm font-medium">
                    <li><Link to="/privacy" className="text-[var(--text-dim)] opacity-80 hover:text-cyan-400 transition-colors">Privacy Policy</Link></li>
                    <li><Link to="/terms" className="text-[var(--text-dim)] opacity-80 hover:text-cyan-400 transition-colors">Terms of Service</Link></li>
                    <li><a href="https://www.linkedin.com/in/hemasaivattikuti" target="_blank" rel="noopener noreferrer" className="text-[var(--text-dim)] opacity-80 hover:text-cyan-400 transition-colors">Contact</a></li>
                </ul>
            </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-[var(--glass-border)] flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-[var(--text-dim)] opacity-80">
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
