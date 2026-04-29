import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    ArrowRight, CheckCircle2, Sparkles, Brain, Target, CalendarDays,
    Users, Shield, Zap, ChevronRight, Activity, LineChart, Globe
} from 'lucide-react';

// --- Background Components ---
const AnimatedBackground = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-[#0a0a0a]">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-500/10 blur-[120px] mix-blend-screen animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[150px] mix-blend-screen" style={{ animation: 'pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite reverse' }} />
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-purple-500/10 blur-[100px] mix-blend-screen animate-pulse-slow" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20" />
    </div>
);

// --- Navbar ---
const Navbar = ({ isAuthenticated, navigate }) => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <img src="/assets/logo.png" alt="Mithra" className="w-9 h-9 rounded-lg" />
                    <span className="text-xl font-bold tracking-tight text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>Mithra</span>
                </div>
                <div className="hidden md:flex items-center gap-8">
                    <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">Features</a>
                    <a href="#ai" className="text-sm text-gray-400 hover:text-white transition-colors">Dost AI</a>
                    <a href="#founder" className="text-sm text-gray-400 hover:text-white transition-colors">About</a>
                </div>
                <div className="flex items-center gap-4">
                    {isAuthenticated ? (
                        <button onClick={() => navigate('/dashboard')} className="px-5 py-2.5 rounded-full text-sm font-medium bg-white text-black hover:bg-gray-100 transition-colors">
                            Go to Dashboard
                        </button>
                    ) : (
                        <>
                            <Link to="/auth" className="text-sm font-medium text-gray-300 hover:text-white transition-colors hidden sm:block">Log in</Link>
                            <Link to="/auth" className="px-5 py-2.5 rounded-full text-sm font-medium bg-white text-black hover:bg-gray-100 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
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
    return (
        <section className="relative pt-40 pb-20 px-6 overflow-hidden min-h-screen flex items-center">
            <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative z-10"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--glass-border)] border border-white/10 text-xs font-medium text-cyan-400 mb-6 backdrop-blur-sm">
                        <Sparkles size={14} /> Introducing Mithra Life OS 2.0
                    </div>
                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Your mind, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
                            beautifully organized.
                        </span>
                    </h1>
                    <p className="text-lg text-gray-400 mb-8 max-w-xl leading-relaxed">
                        The world's first AI-native life operating system. Manage tasks, build atomic habits, track your mood, and let Dost AI optimize your schedule autonomously.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/auth')}
                            className="group flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-medium bg-white text-black hover:bg-gray-100 transition-all hover:scale-105 active:scale-95"
                        >
                            Start for free <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <Link to="/promo-video" className="flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-medium bg-[var(--glass-border)] text-white border border-white/10 hover:bg-[var(--glass-bg-hover)] transition-colors">
                            Watch Demo
                        </Link>
                    </div>
                    
                    <div className="mt-12 flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-cyan-500" /> No credit card required</div>
                        <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-cyan-500" /> Free forever plan</div>
                    </div>
                </motion.div>

                {/* Dashboard Mockup */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, rotateY: 10 }}
                    animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                    transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                    className="relative lg:h-[600px] perspective-1000"
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 rounded-2xl blur-3xl" />
                    <div className="relative h-full w-full rounded-2xl border border-white/10 bg-[#121212]/90 backdrop-blur-xl overflow-hidden shadow-2xl flex flex-col">
                        {/* Mockup Header */}
                        <div className="h-12 border-b border-white/5 flex items-center px-4 gap-2 bg-black/40">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                            </div>
                            <div className="mx-auto px-4 py-1 rounded-md bg-[var(--glass-border)] text-[10px] text-gray-500 font-mono">mithra-lifeos.com</div>
                        </div>
                        {/* Mockup Body */}
                        <div className="p-6 flex-1 flex flex-col gap-4">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">Good morning, Alex</h3>
                                    <p className="text-xs text-gray-400">Here's your optimized day.</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 border-2 border-black" />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                                <div className="p-4 rounded-xl bg-[var(--glass-border)] border border-white/5">
                                    <div className="flex items-center gap-2 mb-2"><Target size={14} className="text-cyan-400" /><span className="text-xs font-medium text-gray-300">Deep Work</span></div>
                                    <div className="text-2xl font-bold text-white">4h 20m</div>
                                    <div className="text-[10px] text-green-400 mt-1">+12% from yesterday</div>
                                </div>
                                <div className="p-4 rounded-xl bg-[var(--glass-border)] border border-white/5">
                                    <div className="flex items-center gap-2 mb-2"><Activity size={14} className="text-purple-400" /><span className="text-xs font-medium text-gray-300">Energy Score</span></div>
                                    <div className="text-2xl font-bold text-white">92/100</div>
                                    <div className="text-[10px] text-gray-400 mt-1">Optimal state</div>
                                </div>
                            </div>
                            <div className="flex-1 rounded-xl bg-[var(--glass-border)] border border-white/5 p-4 mt-2">
                                <h4 className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wider">Up Next</h4>
                                <div className="space-y-2">
                                    {[
                                        { t: 'Review Q3 Metrics', time: '10:00 AM', d: true },
                                        { t: 'Team Standup', time: '11:30 AM', d: false },
                                        { t: 'Workout (Leg Day)', time: '5:00 PM', d: false }
                                    ].map((task, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-4 h-4 rounded-full border ${task.d ? 'border-cyan-500 bg-cyan-500/20' : 'border-gray-600'} flex items-center justify-center`}>
                                                    {task.d && <CheckCircle2 size={10} className="text-cyan-400" />}
                                                </div>
                                                <span className={`text-sm ${task.d ? 'text-gray-500 line-through' : 'text-gray-200'}`}>{task.t}</span>
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
const FeatureCard = ({ icon: Icon, title, description, color }) => (
    <motion.div 
        whileHover={{ y: -5 }}
        className="p-8 rounded-2xl bg-[var(--glass-border)] border border-white/10 backdrop-blur-md relative overflow-hidden group"
    >
        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} bg-opacity-20 flex items-center justify-center mb-6`}>
            <Icon size={24} className="text-white" />
        </div>
        <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>{title}</h3>
        <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
    </motion.div>
);

const Features = () => {
    return (
        <section id="features" className="py-24 px-6 relative z-10">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16 max-w-2xl mx-auto">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">operate at your peak.</span>
                    </h2>
                    <p className="text-gray-400">Replace 5 different apps with one unified, AI-powered system designed for focus and clarity.</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                </div>
            </div>
        </section>
    );
};

// --- Stats Section ---
const Stats = () => (
    <section className="py-20 px-6 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/5">
            {[
                { label: 'Early Sign-ups', value: '900+' },
                { label: 'Features Shipped', value: '20+' },
                { label: 'Built Solo', value: '1' },
                { label: 'Uptime', value: '99.9%' }
            ].map((stat, i) => (
                <div key={i} className="text-center px-4">
                    <div className="text-3xl sm:text-4xl font-bold text-white mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>{stat.value}</div>
                    <div className="text-xs sm:text-sm text-gray-500 font-medium uppercase tracking-wider">{stat.label}</div>
                </div>
            ))}
        </div>
    </section>
);

// --- AI Demo Section ---
const AIDemo = () => {
    return (
        <section id="ai" className="py-24 px-6 relative z-10">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-medium text-purple-400 mb-6">
                        <Brain size={14} /> Advanced AI Engine
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Meet Dost.<br />
                        Your cognitive co-pilot.
                    </h2>
                    <p className="text-gray-400 mb-8 leading-relaxed">
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
                                <span className="text-gray-300">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                
                {/* Chat Mockup */}
                <div className="relative">
                    <div className="absolute inset-0 bg-purple-500/20 blur-[100px] rounded-full" />
                    <div className="relative rounded-2xl border border-white/10 bg-[#1a1a1a]/80 backdrop-blur-xl overflow-hidden shadow-2xl p-6">
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-gray-700 shrink-0" />
                                <div className="bg-[var(--glass-border)] border border-white/10 rounded-2xl rounded-tl-sm p-4 text-sm text-gray-200">
                                    I feel completely overwhelmed this week. I have 3 major project deadlines and haven't worked out in 4 days.
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <img src="/assets/logo.png" alt="Dost" className="w-8 h-8 rounded-full shrink-0" />
                                <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl rounded-tl-sm p-4 text-sm text-gray-200">
                                    <p className="mb-3">I see you're stressed. Let's fix this. Looking at your calendar, Thursday is completely packed, but tomorrow morning is light.</p>
                                    <p className="mb-3">I've proactively generated a revised schedule:</p>
                                    <div className="bg-black/40 rounded-lg p-3 border border-white/5 font-mono text-xs text-gray-400 space-y-1">
                                        <div className="text-white">1. Moved "Project A Review" to Wed 9AM.</div>
                                        <div>2. Scheduled a 30m run for tomorrow at 7AM.</div>
                                        <div>3. Blocked Thursday afternoon for deep work.</div>
                                    </div>
                                    <p className="mt-3 text-cyan-400 font-medium cursor-pointer hover:underline">Apply these changes?</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// --- Founder Section ---
const Founder = () => (
    <section id="founder" className="py-24 px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    Meet the <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Founder</span>
                </h2>
            </div>
            <div className="relative rounded-3xl border border-white/10 bg-[#121212]/60 backdrop-blur-xl overflow-hidden p-8 sm:p-12">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5" />
                <div className="relative flex flex-col lg:flex-row items-center gap-10">
                    {/* Photo */}
                    <div className="shrink-0">
                        <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full blur-md opacity-60" />
                            <img
                                src="/assets/hemasai.jpeg"
                                alt="Hemasai Vattikuti"
                                className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full object-cover border-4 border-[#1a1a1a] shadow-2xl"
                            />
                        </div>
                    </div>

                    {/* Story */}
                    <div className="flex-1 text-center lg:text-left">
                        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Hemasai Vattikuti
                        </h3>
                        <p className="text-cyan-400 text-sm font-medium mb-5 tracking-wide uppercase">Founder & Developer</p>
                        <p className="text-gray-300 leading-relaxed mb-4">
                            I built Mithra because I believe everyone deserves to be productive, organized, and self-aware.
                            Too many people struggle with scattered tools and no real insight into their own patterns.
                        </p>
                        <p className="text-gray-400 leading-relaxed mb-6">
                            Mithra is the system I wished I had — an AI-powered life OS that doesn't just store your tasks,
                            but actually understands your habits, analyzes your mood, and helps you become the best version of yourself.
                            Every feature was designed with one goal: making self-improvement effortless.
                        </p>

                        {/* Social Links */}
                        <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                            <a href="https://github.com/hemasaivattikuti25" target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-all">
                                <Globe size={14} /> GitHub
                            </a>
                            <a href="https://www.linkedin.com/in/hemasaivattikuti" target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-all">
                                <Users size={14} /> LinkedIn
                            </a>
                            <a href="https://hemasai-vattikuti-portfolio.vercel.app" target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-all">
                                <Zap size={14} /> Portfolio
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

// --- Footer ---
const Footer = () => (
    <footer className="border-t border-white/10 bg-black pt-16 pb-8 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2">
                <div className="flex items-center gap-2 mb-4">
                    <img src="/assets/logo.png" alt="Mithra" className="w-7 h-7 rounded-md" />
                    <span className="text-lg font-bold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>Mithra</span>
                </div>
                <p className="text-sm text-gray-400 max-w-xs">
                    The premium life operating system designed for high performers. Organize, automate, and elevate your life.
                </p>
            </div>
            <div>
                <h4 className="text-white font-medium mb-4">Product</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                    <li><a href="#features" className="hover:text-cyan-400 transition-colors">Features</a></li>
                    <li><a href="#ai" className="hover:text-cyan-400 transition-colors">Dost AI</a></li>
                    <li><a href="#founder" className="hover:text-cyan-400 transition-colors">About</a></li>
                </ul>
            </div>
            <div>
                <h4 className="text-white font-medium mb-4">Legal</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                    <li><Link to="/privacy" className="hover:text-cyan-400 transition-colors">Privacy Policy</Link></li>
                    <li><Link to="/terms" className="hover:text-cyan-400 transition-colors">Terms of Service</Link></li>
                    <li><a href="https://www.linkedin.com/in/hemasaivattikuti" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">Contact</a></li>
                </ul>
            </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500">
            <p>© {new Date().getFullYear()} Mithra AI. All rights reserved.</p>
            <p>Built with ❤️ by <a href="https://hemasai-vattikuti-portfolio.vercel.app" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Hemasai Vattikuti</a></p>
        </div>
    </footer>
);

export default function LandingPage() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-gray-200 selection:bg-cyan-500/30 font-sans" data-theme="dark">
            <AnimatedBackground />
            <Navbar isAuthenticated={isAuthenticated} navigate={navigate} />
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
