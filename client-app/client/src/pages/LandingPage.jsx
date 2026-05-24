import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import {
    ArrowRight, CheckCircle2, Sparkles, Brain, Target, CalendarDays,
    Users, Shield, Zap, ChevronRight, Activity, LineChart, Globe,
    Sun, Moon, Briefcase, GraduationCap, Mail, Phone, Award, Code
} from 'lucide-react';

// --- Background Components ---
const AnimatedBackground = ({ theme }) => {
    const isLight = theme === 'light';
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-[var(--body-bg)] transition-colors duration-300">
            <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-500/10 blur-[120px] ${isLight ? 'mix-blend-multiply opacity-40' : 'mix-blend-screen'} animate-pulse-slow`} />
            <div className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[150px] ${isLight ? 'mix-blend-multiply opacity-40' : 'mix-blend-screen'}`} style={{ animation: 'pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite reverse' }} />
            <div className={`absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-purple-500/10 blur-[100px] ${isLight ? 'mix-blend-multiply opacity-40' : 'mix-blend-screen'} animate-pulse-slow`} />
            <div className={`absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] ${isLight ? 'opacity-10 invert' : 'opacity-20'}`} />
        </div>
    );
};

// --- Navbar ---
const Navbar = ({ isAuthenticated, navigate, theme, toggleTheme }) => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[var(--nav-bg)] backdrop-blur-md border-b border-[var(--glass-border)] py-4' : 'bg-transparent py-6'}`}>
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <img src="/assets/logo.png" alt="Mithra" className="w-9 h-9 rounded-lg" />
                    <span className="text-xl font-bold tracking-tight text-[var(--text-primary)]" style={{ fontFamily: "'Outfit', sans-serif" }}>Mithra</span>
                </div>
                <div className="hidden md:flex items-center gap-8">
                    <a href="#features" className="text-sm text-[var(--text-dim)] hover:text-[var(--text-primary)] transition-colors">Features</a>
                    <a href="#ai" className="text-sm text-[var(--text-dim)] hover:text-[var(--text-primary)] transition-colors">Dost AI</a>
                    <a href="#founder" className="text-sm text-[var(--text-dim)] hover:text-[var(--text-primary)] transition-colors">About</a>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full bg-[var(--glass-border)] text-[var(--text-dim)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg-hover)] transition-colors border border-[var(--glass-border)]"
                        aria-label="Toggle Theme"
                    >
                        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                    </button>
                    {isAuthenticated ? (
                        <button onClick={() => navigate('/dashboard')} className="px-5 py-2.5 rounded-full text-sm font-medium bg-white text-black hover:bg-gray-100 transition-colors">
                            Go to Dashboard
                        </button>
                    ) : (
                        <>
                            <Link to="/auth" className="text-sm font-medium text-[var(--text-dim)] hover:text-[var(--text-primary)] transition-colors hidden sm:block">Log in</Link>
                            <Link to="/auth" className="px-5 py-2.5 rounded-full text-sm font-medium bg-[var(--text-primary)] text-[var(--body-bg)] hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_var(--accent-glow)]">
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
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 25 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
        }
    };

    return (
        <section className="relative pt-40 pb-20 px-6 overflow-hidden min-h-screen flex items-center">
            <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="relative z-10"
                >
                    <motion.div 
                        variants={itemVariants} 
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--glass-border)] border border-white/10 text-xs font-medium text-cyan-400 mb-6 backdrop-blur-sm"
                    >
                        <Sparkles size={14} /> Introducing Mithra Life OS 2.0
                    </motion.div>
                    <motion.h1 
                        variants={itemVariants} 
                        className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[var(--text-primary)] mb-6 leading-[1.1]" 
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                        Your mind, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
                            beautifully organized.
                        </span>
                    </motion.h1>
                    <motion.p 
                        variants={itemVariants} 
                        className="text-lg text-[var(--text-dim)] mb-8 max-w-xl leading-relaxed"
                    >
                        The world's first AI-native life operating system. Manage tasks, build atomic habits, track your mood, and let Dost AI optimize your schedule autonomously.
                    </motion.p>
                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/auth')}
                            className="group flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-medium bg-[var(--text-primary)] text-[var(--body-bg)] hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-[0_0_25px_rgba(34,211,238,0.15)]"
                        >
                            Start for free <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <Link to="/promo-video" className="flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-medium bg-[var(--glass-border)] text-[var(--text-primary)] border border-[var(--glass-border)] hover:bg-[var(--glass-bg-hover)] transition-colors">
                            Watch Demo
                        </Link>
                    </motion.div>

                    <motion.div variants={itemVariants} className="mt-12 flex items-center gap-6 text-sm text-[var(--text-dim)]">
                        <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-cyan-500" /> No credit card required</div>
                        <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-cyan-500" /> Free forever plan</div>
                    </motion.div>
                </motion.div>

                {/* Dashboard Mockup */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="relative lg:h-[600px] perspective-1000 animate-float"
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 rounded-2xl blur-3xl" />
                    <div className="relative h-full w-full rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xl overflow-hidden shadow-2xl flex flex-col hover:border-[var(--glass-border-hover)] transition-all duration-300">
                        {/* Mockup Header */}
                        <div className="h-12 border-b border-[var(--glass-border)] flex items-center px-4 gap-2 bg-[var(--surface-bg)]">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                            </div>
                            <div className="mx-auto px-4 py-1 rounded-md bg-[var(--glass-bg)] text-[10px] text-[var(--text-dim)] font-mono">mithra-lifeos.com</div>
                        </div>
                        {/* Mockup Body */}
                        <div className="p-6 flex-1 flex flex-col gap-4">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">Good morning, Alex</h3>
                                    <p className="text-xs text-[var(--text-dim)]">Here's your optimized day.</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 border-2 border-black" />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                                <div className="p-4 rounded-xl bg-[var(--glass-border)] border border-white/5">
                                    <div className="flex items-center gap-2 mb-2"><Target size={14} className="text-cyan-400" /><span className="text-xs font-medium text-[var(--text-dim)]">Deep Work</span></div>
                                    <div className="text-2xl font-bold text-[var(--text-primary)]">4h 20m</div>
                                    <div className="text-[10px] text-green-400 mt-1">+12% from yesterday</div>
                                </div>
                                <div className="p-4 rounded-xl bg-[var(--glass-border)] border border-white/5">
                                    <div className="flex items-center gap-2 mb-2"><Activity size={14} className="text-purple-400" /><span className="text-xs font-medium text-[var(--text-dim)]">Energy Score</span></div>
                                    <div className="text-2xl font-bold text-[var(--text-primary)]">92/100</div>
                                    <div className="text-[10px] text-[var(--text-dim)] mt-1">Optimal state</div>
                                </div>
                            </div>
                            <div className="flex-1 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] p-4 mt-2">
                                <h4 className="text-xs font-medium text-[var(--text-dim)] mb-3 uppercase tracking-wider">Up Next</h4>
                                <div className="space-y-2">
                                    {[
                                        { t: 'Review Q3 Metrics', time: '10:00 AM', d: true },
                                        { t: 'Team Standup', time: '11:30 AM', d: false },
                                        { t: 'Workout (Leg Day)', time: '5:00 PM', d: false }
                                    ].map((task, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[var(--surface-bg)] border border-[var(--glass-border)]">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-4 h-4 rounded-full border ${task.d ? 'border-cyan-500 bg-cyan-500/20' : 'border-gray-600'} flex items-center justify-center`}>
                                                    {task.d && <CheckCircle2 size={10} className="text-cyan-400" />}
                                                </div>
                                                <span className={`text-sm ${task.d ? 'text-[var(--text-dim)] line-through' : 'text-[var(--text-primary)]'}`}>{task.t}</span>
                                            </div>
                                            <span className="text-xs text-gray-500 font-mono">{task.time}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

// --- Features Section ---
const FeatureCard = ({ icon: Icon, title, description, color }) => {
    const cardVariants = {
        hidden: { opacity: 0, y: 25 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };

    return (
        <motion.div
            variants={cardVariants}
            whileHover={{ y: -6, scale: 1.01, boxShadow: "0 15px 30px -10px rgba(34, 211, 238, 0.1)" }}
            whileTap={{ scale: 0.99 }}
            className="p-8 rounded-2xl bg-[var(--glass-bg)] border border-white/5 backdrop-blur-md relative overflow-hidden group transition-shadow duration-300"
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} bg-opacity-20 flex items-center justify-center mb-6`}>
                <Icon size={24} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>{title}</h3>
            <p className="text-sm text-[var(--text-dim)] leading-relaxed">{description}</p>
        </motion.div>
    );
};

const Features = () => {
    const containerVariants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <section id="features" className="py-24 px-6 relative z-10">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16 max-w-2xl mx-auto"
                >
                    <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">operate at your peak.</span>
                    </h2>
                    <p className="text-[var(--text-dim)]">Replace 5 different apps with one unified, AI-powered system designed for focus and clarity.</p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    <FeatureCard
                        icon={Brain}
                        title="Dost AI"
                        description="Your proactive AI companion. It analyzes your habits, suggests schedule optimizations, and acts as a sounding board for your thoughts."
                        color="from-purple-500 to-pink-500"
                    />
                    <FeatureCard
                        icon={Target}
                        title="Habit Focus Hub"
                        description="Build atomic habits with beautiful streak tracking, heatmaps, and smart reminders that adapt to your schedule."
                        color="from-cyan-500 to-blue-500"
                    />
                    <FeatureCard
                        icon={CalendarDays}
                        title="Smart Calendar"
                        description="Two-way sync with Google Calendar. Time-block your tasks automatically based on priority and your energy levels."
                        color="from-green-500 to-emerald-500"
                    />
                    <FeatureCard
                        icon={LineChart}
                        title="Life Analytics"
                        description="Quantify your life. See correlations between your sleep, mood, and productivity with gorgeous, interactive charts."
                        color="from-orange-500 to-red-500"
                    />
                    <FeatureCard
                        icon={Users}
                        title="Mithra Blend"
                        description="Collaborate with friends or colleagues. Share specific habit goals, track joint projects, and build accountability."
                        color="from-blue-500 to-indigo-500"
                    />
                    <FeatureCard
                        icon={Shield}
                        title="Local-First Privacy"
                        description="Your data is encrypted and works completely offline. Syncs instantly to the cloud the moment you reconnect."
                        color="from-slate-400 to-slate-600"
                    />
                </motion.div>
            </div>
        </section>
    );
};

// --- Stats Section ---
const Stats = () => (
    <section className="py-20 px-6 border-y border-[var(--glass-border)] bg-[var(--surface-bg)] relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 divide-y md:divide-y-0 md:divide-x divide-[var(--glass-border)]">
            {[
                { label: 'Active Users', value: '1000+' },
                { label: 'Features Shipped', value: '20+' },
                { label: 'Built Solo', value: '1' },
                { label: 'Uptime', value: '99.9%' }
            ].map((stat, i) => (
                <motion.div 
                    key={i} 
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
                    className="text-center px-4 pt-4 md:pt-0"
                >
                    <div className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>{stat.value}</div>
                    <div className="text-xs sm:text-sm text-[var(--text-dim)] font-medium uppercase tracking-wider">{stat.label}</div>
                </motion.div>
            ))}
        </div>
    </section>
);

// --- AI Demo Section ---
const AIDemo = () => {
    const chatContainerVariants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.8
            }
        }
    };

    const chatBubbleVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };

    return (
        <section id="ai" className="py-24 px-6 relative z-10">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-medium text-purple-400 mb-6">
                        <Brain size={14} /> Advanced AI Engine
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-6 leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Meet Dost.<br />
                        Your cognitive co-pilot.
                    </h2>
                    <p className="text-[var(--text-dim)] mb-8 leading-relaxed">
                        Dost isn't just a chatbot. It has full context of your tasks, habits, calendar, and journal entries. It proactively suggests schedule changes, helps you break down complex projects, and identifies patterns in your mood.
                    </p>
                    <ul className="space-y-4 mb-8">
                        {[
                            'Auto-schedules tasks into free calendar slots',
                            'Detects burnout patterns before they happen',
                            'Breaks down overwhelming goals into atomic steps'
                        ].map((item, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                    <CheckCircle2 size={14} className="text-purple-400" />
                                </div>
                                <span className="text-[var(--text-primary)]">{item}</span>
                            </li>
                        ))}
                    </ul>
                </motion.div>

                {/* Chat Mockup */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="relative"
                >
                    <div className="absolute inset-0 bg-purple-500/20 blur-[100px] rounded-full" />
                    <div className="relative rounded-2xl border border-[var(--glass-border)] bg-[var(--surface-bg)] backdrop-blur-xl overflow-hidden shadow-2xl p-6">
                        <motion.div
                            variants={chatContainerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-150px" }}
                            className="space-y-6"
                        >
                            <motion.div variants={chatBubbleVariants} className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-gray-700 shrink-0 flex items-center justify-center text-xs font-bold text-white">U</div>
                                <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl rounded-tl-sm p-4 text-sm text-[var(--text-primary)]">
                                    I feel completely overwhelmed this week. I have 3 major project deadlines and haven't worked out in 4 days.
                                </div>
                            </motion.div>
                            <motion.div variants={chatBubbleVariants} className="flex gap-4">
                                <img src="/assets/logo.png" alt="Dost" className="w-8 h-8 rounded-full shrink-0" />
                                <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl rounded-tl-sm p-4 text-sm text-[var(--text-primary)]">
                                    <p className="mb-3">I see you're stressed. Let's fix this. Looking at your calendar, Thursday is completely packed, but tomorrow morning is light.</p>
                                    <p className="mb-3">I've proactively generated a revised schedule:</p>
                                    <div className="bg-[var(--body-bg)] rounded-lg p-3 border border-[var(--glass-border)] font-mono text-xs text-[var(--text-dim)] space-y-1">
                                        <div className="text-[var(--text-primary)]">1. Moved "Project A Review" to Wed 9AM.</div>
                                        <div>2. Scheduled a 30m run for tomorrow at 7AM.</div>
                                        <div>3. Blocked Thursday afternoon for deep work.</div>
                                    </div>
                                    <p className="mt-3 text-cyan-400 font-medium cursor-pointer hover:underline">Apply these changes?</p>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

// --- Founder Section ---
const Founder = () => {
    const [activeTab, setActiveTab] = useState('about');

    const tabs = [
        { id: 'about', label: 'About & Vision', icon: Brain },
        { id: 'experience', label: 'Experience & Projects', icon: Briefcase },
        { id: 'skills', label: 'Skills & Stack', icon: Code },
        { id: 'education', label: 'Education & Honors', icon: GraduationCap }
    ];

    return (
        <section id="founder" className="py-24 px-6 relative z-10">
            <div className="max-w-6xl mx-auto">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Meet the <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Founder & Engineer</span>
                    </h2>
                    <p className="text-[var(--text-dim)] max-w-xl mx-auto">
                        The developer behind Mithra Life OS, building high-availability distributed backends and AI-native applications.
                    </p>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="relative rounded-3xl border border-[var(--glass-border)] bg-[var(--surface-bg)] backdrop-blur-xl overflow-hidden p-6 sm:p-10 shadow-2xl"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 pointer-events-none" />
                    
                    <div className="relative grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                        {/* Profile Info Left Panel */}
                        <div className="lg:col-span-4 flex flex-col items-center text-center lg:items-start lg:text-left border-b lg:border-b-0 lg:border-r border-[var(--glass-border)] pb-8 lg:pb-0 lg:pr-8">
                            <div className="relative mb-6">
                                <div className="absolute -inset-1.5 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full blur-md opacity-60 animate-pulse-slow" />
                                <img
                                    src="/assets/hemasai.jpeg"
                                    alt="Hemasai Vattikuti"
                                    className="relative w-36 h-36 rounded-full object-cover border-4 border-[#0A0C10] shadow-2xl"
                                />
                            </div>
                            <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                Hemasai Vattikuti
                            </h3>
                            <p className="text-cyan-400 text-sm font-semibold mb-4 uppercase tracking-wider">Backend & Applied AI Engineer</p>
                            
                            <p className="text-xs text-[var(--text-dim)] mb-6 max-w-xs leading-relaxed">
                                Building high-availability distributed systems, zero-trust backend architectures, and production LLM integrations.
                            </p>

                            {/* Contact Info */}
                            <div className="flex flex-col gap-2.5 w-full text-xs text-[var(--text-dim)] mb-6">
                                <a href="mailto:hemasaivattikuti2727@gmail.com" className="flex items-center justify-center lg:justify-start gap-2.5 hover:text-cyan-400 transition-colors">
                                    <Mail size={14} className="text-cyan-400 shrink-0" />
                                    <span>hemasaivattikuti2727@gmail.com</span>
                                </a>
                                <a href="tel:+9179937407469" className="flex items-center justify-center lg:justify-start gap-2.5 hover:text-cyan-400 transition-colors">
                                    <Phone size={14} className="text-cyan-400 shrink-0" />
                                    <span>+91 79937407469</span>
                                </a>
                                <div className="flex items-center justify-center lg:justify-start gap-2.5">
                                    <Globe size={14} className="text-cyan-400 shrink-0" />
                                    <span>mithra-lifeos.com</span>
                                </div>
                            </div>

                            {/* Links Buttons */}
                            <div className="flex flex-wrap justify-center lg:justify-start gap-2 w-full mt-auto">
                                <a href="https://github.com/hemasaivattikuti25" target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] text-xs text-[var(--text-primary)] hover:bg-[var(--glass-bg-hover)] transition-all">
                                    GitHub
                                </a>
                                <a href="https://www.linkedin.com/in/hemasaivattikuti" target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] text-xs text-[var(--text-primary)] hover:bg-[var(--glass-bg-hover)] transition-all">
                                    LinkedIn
                                </a>
                                <a href="https://hemasai-vattikuti-portfolio.vercel.app" target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] text-xs text-[var(--text-primary)] hover:bg-[var(--glass-bg-hover)] transition-all">
                                    Portfolio
                                </a>
                            </div>
                        </div>

                        {/* Interactive Area Right Panel */}
                        <div className="lg:col-span-8 flex flex-col h-full min-h-[380px] w-full">
                            {/* Tabs Header */}
                            <div className="flex flex-wrap gap-1.5 bg-[var(--glass-bg)] p-1 rounded-2xl border border-[var(--glass-border)] mb-6">
                                {tabs.map(tab => {
                                    const TabIcon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all relative ${
                                                isActive ? 'text-black bg-white shadow-sm' : 'text-[var(--text-dim)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg-hover)]'
                                            }`}
                                        >
                                            <TabIcon size={14} />
                                            <span>{tab.label}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Tab Content Container */}
                            <div className="flex-1 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl p-5 sm:p-6 min-h-[320px] flex flex-col justify-between">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeTab}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="h-full flex flex-col justify-between"
                                    >
                                        {activeTab === 'about' && (
                                            <div className="space-y-4">
                                                <h4 className="text-base font-bold text-white flex items-center gap-2">
                                                    <Brain size={16} className="text-cyan-400" />
                                                    The Vision Behind Mithra Life OS
                                                </h4>
                                                <p className="text-sm text-[var(--text-dim)] leading-relaxed">
                                                    I built Mithra because I believe everyone deserves a unified place to remain productive, organized, and self-aware. Scattered apps and disjointed trackers create mental friction. Mithra is a high-availability, AI-native operating system that automates and simplifies personal growth.
                                                </p>
                                                <p className="text-sm text-[var(--text-dim)] leading-relaxed">
                                                    Combining RAG-style semantic vector search (powered by 768-dimensional Gemini embeddings stored in PostgreSQL pgvector), zero-trust Row-Level Security (RLS) for absolute privacy, and a conversational AI copilot (Dost AI), Mithra elevates daily productivity into an effortless, insightful experience.
                                                </p>
                                                <div className="p-3.5 bg-cyan-500/5 border border-cyan-500/10 rounded-xl mt-4">
                                                    <p className="text-xs text-cyan-400 font-medium">
                                                        ⚡ Milestones: Live AI platform with 1000+ active users tracking habits, managing tasks, and building accountability workspaces via Mithra Blend.
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {activeTab === 'experience' && (
                                            <div className="space-y-4">
                                                <h4 className="text-base font-bold text-white flex items-center gap-2">
                                                    <Briefcase size={16} className="text-cyan-400" />
                                                    Experience Highlights & Shipped Code
                                                </h4>
                                                <div className="space-y-5 max-h-[250px] overflow-y-auto pr-1">
                                                    {/* DRDO */}
                                                    <div className="relative pl-4 border-l-2 border-cyan-500/30">
                                                        <div className="absolute -left-[5.5px] top-1.5 w-2.5 h-2.5 rounded-full bg-cyan-400" />
                                                        <div className="flex justify-between items-start flex-wrap gap-1 mb-1">
                                                            <h5 className="text-sm font-bold text-white">Project Intern · Backend & Distributed Systems</h5>
                                                            <span className="text-[10px] text-cyan-400 font-mono">Aug – Nov 2025</span>
                                                        </div>
                                                        <p className="text-xs text-[var(--text-primary)] font-semibold mb-1">Defence Research and Development Laboratory (DRDL – DRDO), Ministry of Defence</p>
                                                        <ul className="list-disc list-inside text-xs text-[var(--text-dim)] space-y-1 pl-1 leading-relaxed">
                                                            <li>Architected a 3-node MongoDB Replica Set with automatic PRIMARY election and sub-10s failover under Scientist ‘E’.</li>
                                                            <li>Built a production-grade FastAPI backend with JWT auth, role-based access control (RBAC), and custom rate limiting.</li>
                                                            <li>Dockerized full stack (3×MongoDB + FastAPI + React/Nginx) with 30s polling background health monitors.</li>
                                                        </ul>
                                                    </div>

                                                    {/* Embrizon */}
                                                    <div className="relative pl-4 border-l-2 border-cyan-500/30">
                                                        <div className="absolute -left-[5.5px] top-1.5 w-2.5 h-2.5 rounded-full bg-cyan-400" />
                                                        <div className="flex justify-between items-start flex-wrap gap-1 mb-1">
                                                            <h5 className="text-sm font-bold text-white">Artificial Intelligence Intern</h5>
                                                            <span className="text-[10px] text-cyan-400 font-mono">Nov 2024 – Jan 2025</span>
                                                        </div>
                                                        <p className="text-xs text-[var(--text-primary)] font-semibold mb-1">Embrizon Technologies Pvt. Ltd. (Remote)</p>
                                                        <ul className="list-disc list-inside text-xs text-[var(--text-dim)] pl-1 leading-relaxed">
                                                            <li>Built custom chatbot training pipelines and FastAPI backends; received Letter of Recommendation from Founder & CEO.</li>
                                                        </ul>
                                                    </div>

                                                    {/* Projects */}
                                                    <div className="relative pl-4 border-l-2 border-cyan-500/30">
                                                        <div className="absolute -left-[5.5px] top-1.5 w-2.5 h-2.5 rounded-full bg-cyan-400" />
                                                        <div className="flex justify-between items-start flex-wrap gap-1 mb-1">
                                                            <h5 className="text-sm font-bold text-white">Featured Project: Projectile Simulator</h5>
                                                            <span className="text-[10px] text-cyan-400 font-mono">Jan 2026</span>
                                                        </div>
                                                        <p className="text-xs text-[var(--text-primary)] font-semibold mb-1">JavaScript · Vercel · Physics Simulation</p>
                                                        <ul className="list-disc list-inside text-xs text-[var(--text-dim)] pl-1 leading-relaxed">
                                                            <li>Real-time physics simulator built for Simverse Hackathon; placed 7th of 200+ participants at VIT-AP and awarded goodies prize.</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {activeTab === 'skills' && (
                                            <div className="space-y-4">
                                                <h4 className="text-base font-bold text-white flex items-center gap-2">
                                                    <Code size={16} className="text-cyan-400" />
                                                    Engineered Skillset
                                                </h4>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <span className="text-[10px] font-bold tracking-wider uppercase text-cyan-400 mb-2 block">AI / LLMs</span>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {['LangChain', 'Agentic AI', 'RAG', 'Vector Embeddings', 'Semantic Search', 'Prompt Engineering', 'OpenAI API', 'Hugging Face'].map(s => (
                                                                <span key={s} className="px-2 py-1 rounded-lg bg-[var(--surface-bg)] border border-[var(--glass-border)] text-[10px] text-[var(--text-primary)]">{s}</span>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <span className="text-[10px] font-bold tracking-wider uppercase text-cyan-400 mb-2 block">Backend & Containers</span>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {['Python', 'FastAPI', 'JWT Auth', 'RBAC', 'Rate Limiting', 'Async Programming', 'REST APIs', 'Docker'].map(s => (
                                                                <span key={s} className="px-2 py-1 rounded-lg bg-[var(--surface-bg)] border border-[var(--glass-border)] text-[10px] text-[var(--text-primary)]">{s}</span>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <span className="text-[10px] font-bold tracking-wider uppercase text-cyan-400 mb-2 block">Databases & Clouds</span>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {['PostgreSQL', 'MongoDB Replica Sets', 'Failover Sets', 'Supabase', 'pgvector'].map(s => (
                                                                <span key={s} className="px-2 py-1 rounded-lg bg-[var(--surface-bg)] border border-[var(--glass-border)] text-[10px] text-[var(--text-primary)]">{s}</span>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <span className="text-[10px] font-bold tracking-wider uppercase text-cyan-400 mb-2 block">Tools & Architecture</span>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {['React.js', 'JavaScript', 'Git', 'Vercel', 'Google Cloud', 'Row-Level Security', 'Zero-Trust', 'High Availability'].map(s => (
                                                                <span key={s} className="px-2 py-1 rounded-lg bg-[var(--surface-bg)] border border-[var(--glass-border)] text-[10px] text-[var(--text-primary)]">{s}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {activeTab === 'education' && (
                                            <div className="space-y-4">
                                                <h4 className="text-base font-bold text-white flex items-center gap-2">
                                                    <GraduationCap size={16} className="text-cyan-400" />
                                                    Academic Background & Hackathons
                                                </h4>
                                                
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-start flex-wrap gap-1">
                                                        <div>
                                                            <h5 className="text-sm font-bold text-white">Vellore Institute of Technology — Andhra Pradesh (VIT-AP)</h5>
                                                            <p className="text-xs text-[var(--text-dim)]">B.Tech, Computer Science and Engineering (2023 – 2027)</p>
                                                        </div>
                                                        <span className="text-[10px] text-cyan-400 font-mono bg-cyan-500/10 px-2.5 py-0.5 rounded-full">Amaravati, AP</span>
                                                    </div>
                                                    <p className="text-xs text-[var(--text-dim)] leading-relaxed">
                                                        <strong>Coursework:</strong> Data Structures & Algorithms, Machine Learning, Natural Language Processing (NLP), DBMS, Linear Algebra, Web Technologies.
                                                    </p>

                                                    <div className="border-t border-[var(--glass-border)] pt-3 mt-1">
                                                        <span className="text-[10px] font-bold tracking-wider uppercase text-cyan-400 mb-2 block">Honors & Achievements</span>
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-2 text-xs">
                                                                <Award size={14} className="text-yellow-500 shrink-0" />
                                                                <span className="text-[var(--text-primary)]"><strong>4th Place</strong> — Google Cloud Hackathon | GoogleDevs Sprint 2K25 (VIT-AP, 486 participants)</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-xs">
                                                                <Award size={14} className="text-yellow-500 shrink-0" />
                                                                <span className="text-[var(--text-primary)]"><strong>7th Place</strong> — Simverse Hackathon (VIT-AP, 200+ participants, Goodies Prize)</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-xs">
                                                                <Award size={14} className="text-cyan-400 shrink-0" />
                                                                <span className="text-[var(--text-dim)]">GSSoC 2025 Tech Contributor | GirlScript Summer of Code (DataSentience-AIML)</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

// --- Footer ---
const Footer = () => (
    <footer className="border-t border-[var(--glass-border)] bg-[var(--surface-bg)] pt-16 pb-8 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2">
                <div className="flex items-center gap-2 mb-4">
                    <img src="/assets/logo.png" alt="Mithra" className="w-7 h-7 rounded-md" />
                    <span className="text-lg font-bold text-[var(--text-primary)]" style={{ fontFamily: "'Outfit', sans-serif" }}>Mithra</span>
                </div>
                <p className="text-sm text-[var(--text-dim)] max-w-xs">
                    The premium life operating system designed for high performers. Organize, automate, and elevate your life.
                </p>
            </div>
            <div>
                <h4 className="text-[var(--text-primary)] font-medium mb-4">Product</h4>
                <ul className="space-y-2 text-sm text-[var(--text-dim)]">
                    <li><a href="#features" className="hover:text-[var(--accent-color)] transition-colors">Features</a></li>
                    <li><a href="#ai" className="hover:text-[var(--accent-color)] transition-colors">Dost AI</a></li>
                    <li><a href="#founder" className="hover:text-[var(--accent-color)] transition-colors">About</a></li>
                </ul>
            </div>
            <div>
                <h4 className="text-[var(--text-primary)] font-medium mb-4">Legal</h4>
                <ul className="space-y-2 text-sm text-[var(--text-dim)]">
                    <li><Link to="/privacy" className="hover:text-[var(--accent-color)] transition-colors">Privacy Policy</Link></li>
                    <li><Link to="/terms" className="hover:text-[var(--accent-color)] transition-colors">Terms of Service</Link></li>
                    <li><a href="https://www.linkedin.com/in/hemasaivattikuti" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent-color)] transition-colors">Contact</a></li>
                </ul>
            </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-[var(--glass-border)] flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[var(--text-dim)]">
            <p>© {new Date().getFullYear()} Mithra AI. All rights reserved.</p>
            <p>Built with ❤️ by <a href="https://hemasai-vattikuti-portfolio.vercel.app" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-color)] hover:underline">Hemasai Vattikuti</a></p>
        </div>
    </footer>
);

export default function LandingPage() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { theme, toggleTheme } = useData();

    return (
        <div className="min-h-screen bg-[var(--body-bg)] text-[var(--text-primary)] selection:bg-[var(--accent-glow)] font-sans transition-colors duration-300">
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
