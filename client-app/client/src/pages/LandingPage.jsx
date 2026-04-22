import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowRight, Check, Github, Menu, X, Sparkles, Users,
    Layout, Calendar, BookOpen, Clock, Zap, Brain, Terminal,
    Linkedin, Star, ChevronRight, Shield, Globe, Rocket,
    Heart, Target, TrendingUp, MessageCircle, Activity
} from 'lucide-react';

const luxe = [0.22, 1, 0.36, 1];
const lightSpring = { stiffness: 80, damping: 30 };

/* ═══════════════════════════════════════════════════════════════
   ANIMATED COUNTER — Counts up to a number on scroll
   ═══════════════════════════════════════════════════════════════ */
function AnimatedStat({ value, suffix = '', label }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        if (!isInView) return;
        let start = 0;
        const end = parseInt(value);
        const duration = 1500;
        const step = Math.max(Math.floor(duration / end), 10);
        const timer = setInterval(() => {
            start += 1;
            setDisplay(start);
            if (start >= end) clearInterval(timer);
        }, step);
        return () => clearInterval(timer);
    }, [isInView, value]);

    return (
        <div ref={ref} className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                {display}{suffix}
            </div>
            <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">{label}</div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   FEATURE CARD — For the bento grid
   ═══════════════════════════════════════════════════════════════ */
function FeatureCard({ title, desc, icon: Icon, tags, gradient, delay = 0, colSpan = '' }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-80px' });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay, duration: 0.7, ease: luxe }}
            className={`group relative rounded-3xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-500 overflow-hidden backdrop-blur-sm ${colSpan}`}
        >
            {/* Hover gradient overlay */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${gradient || 'bg-gradient-to-br from-cyan-500/10 via-transparent to-transparent'}`} />

            <div className="p-7 h-full flex flex-col relative z-10">
                {/* Icon */}
                <div className="mb-5 w-11 h-11 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center group-hover:bg-cyan-500 group-hover:border-cyan-400 transition-all duration-300">
                    <Icon className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" />
                </div>

                <h3 className="text-xl font-bold text-white mb-1.5">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-5">{desc}</p>

                {/* Tags */}
                {tags && (
                    <div className="flex flex-wrap gap-1.5 mt-auto">
                        {tags.map((tag, i) => (
                            <span key={i} className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/[0.04] text-gray-500 border border-white/[0.06] group-hover:border-cyan-500/30 group-hover:text-cyan-400/70 transition-all">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN LANDING PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function LandingPage() {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Parallax
    const heroRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
    const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);
    const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 80]);

    // 3D tilt
    const rotX = useSpring(0, { stiffness: 100, damping: 30 });
    const rotY = useSpring(0, { stiffness: 100, damping: 30 });
    const handleMouseMove = (e) => {
        const { clientX, clientY, currentTarget } = e;
        rotX.set(((clientY / currentTarget.clientHeight) - 0.5) * 6);
        rotY.set(((clientX / currentTarget.clientWidth) - 0.5) * 6);
    };
    const handleMouseLeave = () => { rotX.set(0); rotY.set(0); };

    const features = [
        {
            title: 'Smart Task Engine',
            desc: 'Subtasks, priorities, recurring schedules, and Kanban views. Never miss a deadline.',
            icon: Layout,
            colSpan: 'md:col-span-2',
            tags: ['Subtasks', 'Priority', 'Recurring', 'Kanban'],
            gradient: 'bg-gradient-to-br from-blue-500/10 via-transparent to-transparent',
        },
        {
            title: 'Unified Calendar',
            desc: 'Time-block your day. Syncs with Google Calendar. AI parses "Study 3pm for 2 hours" instantly.',
            icon: Calendar,
            tags: ['Google Sync', 'AI Parsing', 'Time Blocks'],
            gradient: 'bg-gradient-to-br from-green-500/10 via-transparent to-transparent',
        },
        {
            title: 'Habit Tracking',
            desc: 'GitHub-style heatmaps, streaks, and focus timers. Build consistency that lasts a lifetime.',
            icon: Zap,
            tags: ['Heatmap', 'Streaks', 'Focus Timer'],
            gradient: 'bg-gradient-to-br from-orange-500/10 via-transparent to-transparent',
        },
        {
            title: 'Dost AI — Your Stoic Companion',
            desc: 'Not just a chatbot. A companion that remembers your journal, tasks, and moods using RAG memory.',
            icon: Brain,
            colSpan: 'md:col-span-2',
            tags: ['RAG Memory', 'Context Aware', 'Gemini 1.5', 'Stoic Advice'],
            gradient: 'bg-gradient-to-br from-purple-500/10 via-transparent to-transparent',
        },
        {
            title: 'Mood Journal',
            desc: 'Track your emotional patterns with mood scores, tags, and AI-powered sentiment analysis.',
            icon: BookOpen,
            tags: ['Mood Tracking', 'AI Sentiment'],
            gradient: 'bg-gradient-to-br from-pink-500/10 via-transparent to-transparent',
        },
        {
            title: 'Focus Sessions',
            desc: 'Pomodoro-style deep work timer with analytics. See how productive you actually are.',
            icon: Clock,
            tags: ['Pomodoro', 'Analytics', 'Deep Work'],
            gradient: 'bg-gradient-to-br from-yellow-500/10 via-transparent to-transparent',
        },
        {
            title: 'Mithra Blend',
            desc: 'Share workspaces with friends. Compare habits, track streaks together — like Spotify Blend for productivity.',
            icon: Users,
            colSpan: 'md:col-span-3',
            tags: ['Invite Links', 'Shared Goals', 'Habit Synergy', 'Social Accountability'],
            gradient: 'bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10',
        },
        {
            title: 'Native Mobile Experience',
            desc: 'Download the compiled Android APK directly from GitHub Releases. Feel the tactile haptic feedback and proactive local notifications.',
            icon: Target,
            colSpan: 'md:col-span-3',
            tags: ['Android APK', 'Haptics', 'Offline Notifications', 'Pull-to-Refresh'],
            gradient: 'bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-transparent',
        },
    ];

    return (
        <div className="min-h-screen bg-[#050507] text-white font-sans selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden">

            {/* ═══ Ambient Background ═══ */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-blue-600/15 rounded-full blur-[180px] mix-blend-screen" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[900px] h-[900px] bg-cyan-500/10 rounded-full blur-[160px] mix-blend-screen" />
                <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[200px]" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-40" />
            </div>

            {/* ═══ Navbar ═══ */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/[0.04] bg-[#050507]/80 backdrop-blur-2xl">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                        <img src="/assets/logo.svg" alt="Mithra" className="w-8 h-8 rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.3)] group-hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-shadow" />
                        <span className="font-bold text-lg tracking-tight">
                            Mithra<span className="text-cyan-400"> Life OS</span>
                        </span>
                    </div>

                    {/* Desktop nav */}
                    <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-500">
                        <a href="#features" className="hover:text-white transition-colors">Features</a>
                        <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
                        <a href="#about" className="hover:text-white transition-colors">About</a>
                        <a href="https://github.com/hemasaivattikuti25/Mithra-AI-life-os" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-white transition-colors">
                            <Github className="w-4 h-4" /> Star
                        </a>
                        <div className="h-4 w-px bg-white/10 mx-1" />
                        <button onClick={() => navigate('/auth')} className="hover:text-white transition-colors">Log in</button>
                        <button
                            onClick={() => navigate('/auth')}
                            className="bg-white text-black px-5 py-2 rounded-full hover:bg-cyan-100 transition-all font-semibold text-xs tracking-wide shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                        >
                            Get Started Free
                        </button>
                    </div>

                    {/* Mobile toggle */}
                    <button className="md:hidden text-gray-400" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>

                {/* Mobile menu */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden bg-[#050507]/95 backdrop-blur-2xl border-t border-white/[0.04] px-6 py-6 space-y-4"
                        >
                            <a href="#features" onClick={() => setIsMenuOpen(false)} className="block text-gray-400 hover:text-white">Features</a>
                            <a href="#how-it-works" onClick={() => setIsMenuOpen(false)} className="block text-gray-400 hover:text-white">How It Works</a>
                            <a href="#about" onClick={() => setIsMenuOpen(false)} className="block text-gray-400 hover:text-white">About</a>
                            <button onClick={() => { setIsMenuOpen(false); navigate('/auth'); }} className="w-full bg-white text-black py-3 rounded-full font-bold text-sm">Get Started Free</button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* ═══ Hero Section ═══ */}
            <main ref={heroRef} className="pt-28 md:pt-36 pb-20 px-6 relative z-10">
                <motion.div
                    style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
                    className="max-w-5xl mx-auto text-center"
                >
                    {/* Live badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] mb-8 backdrop-blur-sm"
                    >
                        <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
                        <span className="text-xs font-medium text-gray-400 tracking-wide">v3.0 — Blend + Clean Architecture live</span>
                    </motion.div>

                    {/* Headline */}
                    <h1 className="text-5xl md:text-[5.5rem] font-extrabold tracking-tight mb-8 leading-[1.05]">
                        <motion.span
                            initial={{ opacity: 0, y: 25 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.8, ease: luxe }}
                            className="block text-white"
                        >
                            One workspace.
                        </motion.span>
                        <motion.span
                            initial={{ opacity: 0, y: 25 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25, duration: 0.8, ease: luxe }}
                            className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400"
                            style={{ WebkitBackgroundClip: 'text' }}
                        >
                            Your entire life.
                        </motion.span>
                    </h1>

                    {/* Subtext */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35, duration: 0.8 }}
                        className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed font-light"
                    >
                        Tasks, habits, journals, calendar, AI companion, and collaborative Blend workspaces —
                        synchronized in <span className="text-white font-medium">real-time</span>.
                        Built for <span className="text-white font-medium">high achievers</span>.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45, duration: 0.8 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
                    >
                        <button
                            onClick={() => navigate('/auth')}
                            className="group relative px-8 py-4 bg-white text-black rounded-full font-bold text-base overflow-hidden transition-transform hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.15)]"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <span className="relative z-10 flex items-center gap-2 group-hover:text-white transition-colors">
                                Start Using Mithra <ArrowRight className="w-4 h-4" />
                            </span>
                        </button>
                        <a
                            href="https://github.com/hemasaivattikuti25/Mithra-AI-life-os/releases"
                            target="_blank"
                            rel="noreferrer"
                            className="px-8 py-4 rounded-full bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all font-medium text-base text-cyan-300 flex items-center gap-2 backdrop-blur-sm shadow-[0_0_20px_rgba(6,182,212,0.1)] hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]"
                        >
                            <Target className="w-5 h-5" /> Download Android APK
                        </a>
                        <a
                            href="https://github.com/hemasaivattikuti25/Mithra-AI-life-os"
                            target="_blank"
                            rel="noreferrer"
                            className="px-8 py-4 rounded-full bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.15] transition-all font-medium text-base text-gray-300 flex items-center gap-2 backdrop-blur-sm"
                        >
                            <Github className="w-5 h-5" /> Star on GitHub
                        </a>
                    </motion.div>

                    {/* 3D Dashboard Preview — CSS Mockup */}
                    <motion.div
                        initial={{ opacity: 0, rotateX: 15, y: 60 }}
                        animate={{ opacity: 1, rotateX: 0, y: 0 }}
                        transition={{ delay: 0.6, duration: 1.2, type: 'spring', bounce: 0.15 }}
                        className="relative max-w-6xl mx-auto group"
                        style={{ perspective: 1000 }}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                    >
                        <motion.div
                            style={{ rotateX: rotX, rotateY: rotY }}
                            className="relative rounded-2xl border border-white/[0.08] shadow-[0_20px_80px_rgba(0,0,0,0.6)] bg-zinc-950 overflow-hidden"
                        >
                            <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
                            {/* Live CSS Dashboard Mockup */}
                            <div className="p-6 md:p-8 space-y-4">
                                {/* Top bar */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center">
                                            <Sparkles className="w-4 h-4 text-white" />
                                        </div>
                                        <span className="text-sm font-bold text-white/80">Dashboard</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                                    </div>
                                </div>

                                {/* Stat cards row */}
                                <div className="grid grid-cols-4 gap-3">
                                    {[
                                        { label: 'Tasks Done', value: '24', color: 'from-cyan-500/20 to-blue-500/10' },
                                        { label: 'Streak', value: '12 🔥', color: 'from-orange-500/20 to-red-500/10' },
                                        { label: 'Focus Hrs', value: '8.5', color: 'from-purple-500/20 to-pink-500/10' },
                                        { label: 'Mood', value: '😊', color: 'from-green-500/20 to-emerald-500/10' },
                                    ].map((s, i) => (
                                        <div key={i} className={`rounded-xl bg-gradient-to-br ${s.color} border border-white/[0.06] p-3`}>
                                            <div className="text-[10px] text-gray-500 uppercase tracking-wider">{s.label}</div>
                                            <div className="text-lg font-bold text-white mt-1">{s.value}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Chart + Tasks */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="col-span-2 rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 h-32">
                                        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-3">Weekly Progress</div>
                                        <div className="flex items-end gap-1.5 h-16">
                                            {[40, 65, 55, 80, 70, 90, 60].map((h, i) => (
                                                <div key={i} className="flex-1 bg-gradient-to-t from-cyan-500/40 to-cyan-500/10 rounded-t" style={{ height: `${h}%` }} />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 h-32">
                                        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Today</div>
                                        <div className="space-y-2">
                                            {['Review notes', 'Gym session', 'Build feature'].map((t, i) => (
                                                <div key={i} className="flex items-center gap-2">
                                                    <div className={`w-3 h-3 rounded border ${i === 0 ? 'bg-cyan-500 border-cyan-400' : 'border-white/20'}`} />
                                                    <span className={`text-[11px] ${i === 0 ? 'text-gray-500 line-through' : 'text-gray-400'}`}>{t}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-transparent to-transparent opacity-50 pointer-events-none" />
                        </motion.div>
                        {/* Glow */}
                        <div className="absolute -inset-12 bg-cyan-500/12 blur-[80px] opacity-25 -z-10 rounded-full" />
                    </motion.div>
                </motion.div>
            </main>

            {/* ═══ Stats Strip ═══ */}
            <section className="border-y border-white/[0.04] py-16 relative overflow-hidden bg-white/[0.01]">
                <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
                    <AnimatedStat value="690" suffix="+" label="Active Users" />
                    <AnimatedStat value="7" suffix="+" label="Core Features" />
                    <AnimatedStat value="100" suffix="%" label="Zero-Trust Security" />
                    <AnimatedStat value="50" suffix="ms" label="RAG Response Time" />
                </div>
            </section>

            {/* ═══ Tech Stack Strip ═══ */}
            <div className="w-full overflow-hidden py-5 bg-black/30 border-b border-white/[0.04]">
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-center gap-8 md:gap-12 text-gray-600 text-xs font-mono uppercase tracking-widest flex-wrap">
                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#61DAFB]" /> React 18</span>
                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#FFCA28]" /> Firebase</span>
                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#3ECF8E]" /> Neon DB</span>
                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#009688]" /> FastAPI</span>
                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#8E51DA]" /> Gemini AI</span>
                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#F7DF1E]" /> Framer Motion</span>
                </div>
            </div>

            {/* ═══ Features Bento Grid ═══ */}
            <section id="features" className="py-24 md:py-32 px-6 max-w-7xl mx-auto relative">
                <div className="mb-16 text-center max-w-3xl mx-auto">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-bold mb-5 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500"
                    >
                        Everything you need.<br />In one workspace.
                    </motion.h2>
                    <p className="text-lg text-gray-500 max-w-xl mx-auto">
                        Stop switching between 6 apps. Mithra replaces them all with one intelligent, beautiful interface.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 auto-rows-[minmax(280px,auto)]">
                    {features.map((f, i) => (
                        <FeatureCard key={i} {...f} delay={i * 0.08} />
                    ))}
                </div>
            </section>

            {/* ═══ How It Works ═══ */}
            <section id="how-it-works" className="py-24 px-6 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-xl h-[300px] bg-cyan-500/8 blur-[120px] rounded-full pointer-events-none" />
                <div className="max-w-5xl mx-auto relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">How It Works</h2>
                        <p className="text-gray-500 text-lg">Three steps to take control of your life.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { step: '01', title: 'Sign Up Free', desc: 'Create your account with email or Google OAuth. Takes 10 seconds.', icon: Rocket, color: 'from-cyan-500 to-blue-500' },
                            { step: '02', title: 'Set Up Your System', desc: 'Add tasks, build habits, start journaling. Dost AI learns your patterns.', icon: Target, color: 'from-blue-500 to-purple-500' },
                            { step: '03', title: 'Blend With Friends', desc: 'Invite friends to shared workspaces. Track goals together and stay accountable.', icon: Users, color: 'from-purple-500 to-pink-500' },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.15 }}
                                className="relative p-8 rounded-3xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all group"
                            >
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <item.icon className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-xs font-mono text-gray-600 uppercase tracking-widest mb-2">{item.step}</div>
                                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ Dost AI Spotlight ═══ */}
            <section className="py-24 md:py-32 px-6 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-purple-500/8 blur-[120px] rounded-full pointer-events-none" />

                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center relative z-10">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6 text-purple-400 text-xs font-mono uppercase tracking-widest">
                            <Brain className="w-3 h-3" /> Dost AI Engine
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                            It doesn't just chat.<br />
                            <span className="text-gray-600">It remembers.</span>
                        </h2>
                        <p className="text-base text-gray-500 mb-8 leading-relaxed">
                            Most AI bots forget you instantly. Dost uses <span className="text-white font-medium">RAG (Retrieval Augmented Generation)</span> to build long-term memory from your journals, tasks, and moods.
                        </p>

                        <ul className="space-y-4">
                            {[
                                "Ask: 'When was the last time I felt happy?'",
                                "Command: 'Schedule deep work for tomorrow morning.'",
                                "Advice: 'I'm stressed about exams.' → Stoic guidance.",
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-gray-400 text-sm">
                                    <div className="mt-0.5 w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-3 h-3 text-cyan-400" />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Mock Chat */}
                    <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-2xl blur opacity-15" />
                        <div className="relative rounded-2xl bg-zinc-950 border border-white/[0.08] p-6 shadow-2xl">
                            <div className="flex items-center justify-between mb-6 border-b border-white/[0.04] pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-500" />
                                    <div>
                                        <div className="font-bold text-sm">Dost AI</div>
                                        <div className="text-xs text-green-400 flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Online
                                        </div>
                                    </div>
                                </div>
                                <Terminal className="w-4 h-4 text-gray-600" />
                            </div>

                            <div className="space-y-4 text-sm">
                                <div className="bg-white/[0.04] p-3 rounded-lg rounded-tl-none border border-white/[0.06] text-gray-400">
                                    I'm feeling overwhelmed with the project deadline.
                                </div>
                                <div className="bg-cyan-500/10 p-3 rounded-lg rounded-tr-none border border-cyan-500/20 text-cyan-100">
                                    I see you've mentioned "Project Alpha" 3 times this week in your journal.<br /><br />
                                    Let's break it down. I found a 2-hour slot tomorrow morning. Should I schedule a focus session?
                                </div>
                                <div className="flex gap-2">
                                    <button className="px-3 py-1.5 rounded-lg bg-white/[0.06] text-xs hover:bg-white/[0.1] transition text-gray-300">Yes, schedule it</button>
                                    <button className="px-3 py-1.5 rounded-lg bg-white/[0.06] text-xs hover:bg-white/[0.1] transition text-gray-300">Break it further</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ Creator Profile ═══ */}
            <section id="about" className="py-24 px-6 relative">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative rounded-3xl bg-white/[0.02] border border-white/[0.06] overflow-hidden backdrop-blur-sm p-8 md:p-12"
                    >
                        <div className="flex flex-col md:flex-row gap-10 relative z-10">
                            <div className="flex-shrink-0">
                                <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl">
                                    <img src="/assets/hemasai.jpeg" alt="Hemasai" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex gap-3 mt-4 justify-center">
                                    <a href="https://github.com/hemasaivattikuti25" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-white/[0.05] hover:bg-white hover:text-black transition-all"><Github className="w-4 h-4" /></a>
                                    <a href="https://linkedin.com/in/hemsaivattikuti" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-white/[0.05] hover:bg-[#0077B5] hover:text-white transition-all"><Linkedin className="w-4 h-4" /></a>
                                    <a href="https://hemasai-vattikuti-portfolio.vercel.app" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-white/[0.05] hover:bg-cyan-500 hover:text-black transition-all"><Globe className="w-4 h-4" /></a>
                                </div>
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-2xl font-bold text-white">Hemasai Vattikuti</h3>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 uppercase tracking-wide">Builder</span>
                                </div>
                                <p className="text-gray-500 font-mono text-xs mb-6">BACKEND & APPLIED AI ENGINEER</p>
                                <p className="text-gray-400 mb-8 leading-relaxed max-w-xl">
                                    "I architected production systems at DRDL–DRDO (Ministry of Defence, Government of India) with distributed databases and zero-trust security. Now shipping Mithra Life OS — an AI productivity platform with 690+ users, RAG semantic search, and Row-Level Security at the database layer."
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 rounded-xl bg-black/40 border border-white/[0.05]">
                                        <div className="text-xs text-gray-600 uppercase tracking-wider mb-1">Experience</div>
                                        <div className="font-semibold text-sm">DRDL–DRDO</div>
                                        <div className="text-xs text-gray-500 mt-1">Distributed Database Systems</div>
                                    </div>
                                    <div className="p-3 rounded-xl bg-black/40 border border-white/[0.05]">
                                        <div className="text-xs text-gray-600 uppercase tracking-wider mb-1">Shipping</div>
                                        <div className="font-semibold text-sm">Mithra Life OS</div>
                                        <div className="text-xs text-gray-500 mt-1">690+ Active Users</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ═══ Final CTA ═══ */}
            <section className="py-32 px-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/8 to-transparent pointer-events-none" />
                <div className="max-w-3xl mx-auto relative z-10">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-7xl font-bold mb-8 tracking-tight"
                    >
                        Get your life back.<br />
                        <span className="text-gray-700">Start today.</span>
                    </motion.h2>

                    <button
                        onClick={() => navigate('/auth')}
                        className="group relative px-12 py-6 bg-white text-black rounded-full font-bold text-xl overflow-hidden transition-transform hover:scale-105 shadow-[0_0_50px_rgba(255,255,255,0.2)]"
                    >
                        <span className="relative z-10 flex items-center gap-3">
                            Launch Mithra <ArrowRight className="w-5 h-5" />
                        </span>
                    </button>
                    <p className="mt-8 text-sm text-gray-600 font-mono">
                        Free forever • No credit card • Open Source
                    </p>
                </div>
            </section>

            {/* ═══ Footer ═══ */}
            <footer className="py-12 px-6 border-t border-white/[0.04] bg-[#050507]">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <img src="/assets/logo.svg" alt="Mithra" className="w-6 h-6 rounded" />
                        <span className="font-semibold text-sm tracking-wide text-gray-500">Mithra Life OS © 2025</span>
                    </div>
                    <div className="flex gap-8 text-xs text-gray-600 font-medium">
                        <a href="#/privacy" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#/terms" className="hover:text-white transition-colors">Terms</a>
                        <a href="https://github.com/hemasaivattikuti25/Mithra-AI-life-os" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub</a>
                        <a href="mailto:sivasaiohm2005@gmail.com" className="hover:text-white transition-colors">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
