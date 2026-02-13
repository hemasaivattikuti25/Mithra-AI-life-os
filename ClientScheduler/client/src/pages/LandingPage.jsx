
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowRight, Check, ChevronDown, Github,
    Menu, X, Globe, Zap, Shield, Users,
    Layout, Calendar, BookOpen, Clock, Smile, Sparkles, Linkedin, Instagram, Code, Database, Cpu
} from 'lucide-react';

export default function LandingPage() {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeFeature, setActiveFeature] = useState(0);

    const features = [
        {
            title: "Task Management",
            desc: "Organize your life with precision.",
            icon: Layout,
            image: "/assets/tasks.png",
            details: [
                "Deep hierarchy support",
                "Priority-based sorting",
                "AI-driven suggestions"
            ]
        },
        {
            title: "Unified Calendar",
            desc: "Time-blocking made simple.",
            icon: Calendar,
            image: "/assets/calender.png",
            details: [
                "Drag-and-drop scheduling",
                "Google Calendar sync",
                "Smart conflict detection"
            ]
        },
        {
            title: "Habit Tracking",
            desc: "Build consistency that lasts.",
            icon: Zap,
            image: "/assets/habbits.png",
            details: [
                "Streak visualization",
                "Daily check-ins",
                "Progress analytics"
            ]
        },
        {
            title: "Mood Journal",
            desc: "Reflect and understand yourself.",
            icon: Smile,
            image: "/assets/journals.png",
            details: [
                "Sentiment analysis",
                "Emotional trends",
                "Private & secure"
            ]
        },
        {
            title: "Focus Timer",
            desc: "Deep work, distraction free.",
            icon: Clock,
            image: "/assets/focus_timer.png",
            details: [
                "Pomodoro technique",
                "Custom intervals",
                "Focus statistics"
            ]
        },
        {
            title: "Dost AI",
            desc: "Your personal AI companion.",
            icon: BookOpen,
            image: "/assets/dosth(ai).png",
            details: [
                "Context-aware chat",
                "Task automation",
                "Personalized advice"
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden">

            {/* Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] opacity-40 animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] opacity-30"></div>
                <div className="absolute top-[40%] left-[50%] translate-x-[-50%] w-[800px] h-[400px] bg-indigo-600/10 rounded-full blur-[150px] opacity-20"></div>
            </div>

            {/* Navbar */}
            <nav className="fixed top-0 w-full bg-[#050505]/80 backdrop-blur-xl z-50 border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/')}>
                        <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-lg blur opacity-40 group-hover:opacity-75 transition duration-200"></div>
                            <div className="relative w-8 h-8 rounded-lg flex items-center justify-center border border-white/10" style={{ background: 'linear-gradient(135deg, #06b6d4, #2563eb)' }}>
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Mithra AI</span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
                        <a href="#features" className="hover:text-cyan-400 transition-colors">Product</a>
                        <a href="#about" className="hover:text-cyan-400 transition-colors">About</a>
                        <a href="https://github.com/hemasaivattikuti25/Mithra-AI-life-os" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub</a>
                        <div className="h-4 w-px bg-white/10"></div>
                        <button onClick={() => navigate('/auth')} className="hover:text-white transition-colors">Log in</button>
                        <button
                            onClick={() => navigate('/auth')}
                            className="bg-white text-black px-4 py-2 rounded-lg hover:bg-cyan-50 hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all font-semibold"
                        >
                            Get Mithra free
                        </button>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button className="md:hidden text-gray-300" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 top-16 bg-[#0A0A0A] z-40 p-6 md:hidden border-t border-white/10"
                    >
                        <div className="flex flex-col gap-6 text-lg font-medium text-gray-300">
                            <a href="#features" onClick={() => setIsMenuOpen(false)} className="hover:text-cyan-400">Product</a>
                            <a href="#about" onClick={() => setIsMenuOpen(false)} className="hover:text-cyan-400">About</a>
                            <a href="https://github.com/hemasaivattikuti25/Mithra-AI-life-os" onClick={() => setIsMenuOpen(false)} className="hover:text-cyan-400">GitHub</a>
                            <hr className="border-white/10" />
                            <div className="flex flex-col gap-4">
                                <button onClick={() => navigate('/auth')}>Log in</button>
                                <button
                                    onClick={() => navigate('/auth')}
                                    className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-3 rounded-lg text-center font-bold"
                                >
                                    Get Mithra free
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hero Section */}
            <header className="pt-32 pb-20 px-6 text-center max-w-6xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                        </span>
                        <span className="text-xs font-medium text-cyan-300 uppercase tracking-widest">v2.0 Now Live</span>
                    </div>

                    <h1 className="text-5xl md:text-8xl font-bold tracking-tight mb-8 leading-[1.1]">
                        <span className="block text-white">One workspace.</span>
                        <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                            Your entire life.
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed font-light">
                        Mithra is the precision-engineered OS for high achievers.
                        <br className="hidden md:block" />
                        Tasks, habits, notes, and AI — synchronized in <span className="text-white font-medium">real-time</span>.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
                        <button
                            onClick={() => navigate('/auth')}
                            className="bg-white text-black px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all flex items-center gap-2 group"
                        >
                            Start Using Mithra
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <a
                            href="https://github.com/hemasaivattikuti25/Mithra-AI-life-os"
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 px-8 py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/30 transition-all font-medium text-lg text-white"
                        >
                            <Github className="w-5 h-5" />
                            Star on GitHub
                        </a>
                    </div>
                </motion.div>

                {/* Hero Image with Glow */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 1 }}
                    className="relative"
                >
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur-lg opacity-30"></div>
                    <div className="relative rounded-xl border border-white/10 shadow-2xl overflow-hidden bg-[#0A0A0A]">
                        <img
                            src="/assets/home_1.png"
                            alt="Mithra Dashboard"
                            className="w-full h-auto opacity-90 hover:opacity-100 transition-opacity duration-700"
                            loading="eager"
                        />
                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-60"></div>
                    </div>
                </motion.div>
            </header>

            {/* Social Proof */}
            <section className="border-y border-white/5 bg-white/[0.02] py-12 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-8">Trusted by students & engineers at</p>
                    <div className="flex flex-wrap justify-center gap-12 md:gap-20 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                        {['VIT-AP', 'DRDO', 'Google', 'Microsoft', 'Notion'].map((brand) => (
                            <span key={brand} className="text-xl font-bold font-mono text-white/80">{brand}</span>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-32 px-6 max-w-7xl mx-auto">
                <div className="mb-24 text-center">
                    <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-600">
                        Precision Tools. <br />
                        Zero Friction.
                    </h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Stop fighting with clunky software. Mithra is built for speed and flow.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="group relative p-1 rounded-2xl bg-gradient-to-br from-white/10 to-transparent hover:from-cyan-500/50 hover:to-blue-600/50 transition-all duration-500"
                        >
                            <div className="bg-[#0A0A0A] h-full rounded-xl p-6 overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <feature.icon className="w-24 h-24 text-white" />
                                </div>
                                <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center mb-6 group-hover:bg-cyan-500 group-hover:text-black transition-colors duration-300">
                                    <feature.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2 text-white">{feature.title}</h3>
                                <p className="text-gray-400 mb-6">{feature.desc}</p>

                                <ul className="space-y-2 mb-8">
                                    {feature.details?.map((detail, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-gray-500 group-hover:text-gray-300 transition-colors">
                                            <div className="w-1 h-1 rounded-full bg-cyan-500"></div>
                                            {detail}
                                        </li>
                                    ))}
                                </ul>

                                <div className="rounded-lg overflow-hidden border border-white/10 aspect-video relative group-hover:border-cyan-500/30 transition-colors">
                                    <img
                                        src={feature.image}
                                        alt={feature.title}
                                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                                        loading="lazy"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* About the Creator - Detailed & Professional */}
            <section id="about" className="py-32 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none"></div>
                <div className="max-w-5xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">Engineered by a Builder</h2>
                        <p className="text-gray-400 text-lg">"I built Mithra because I needed a tool that could keep up."</p>
                    </motion.div>

                    <div className="rounded-3xl bg-white/5 border border-white/10 p-8 md:p-12 backdrop-blur-sm hover:border-cyan-500/30 transition-colors duration-500">
                        <div className="flex flex-col md:flex-row gap-12 items-start">
                            <div className="flex-shrink-0 mx-auto md:mx-0">
                                <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 p-[2px] shadow-2xl shadow-cyan-500/20">
                                    <div className="w-full h-full rounded-2xl overflow-hidden bg-black relative group">
                                        <img src="/assets/hemasai.jpeg" alt="Hemasai Vattikuti" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-center gap-4">
                                    <a href="https://www.linkedin.com/in/hemsaivattikuti" target="_blank" rel="noreferrer" className="p-2 rounded-full bg-white/5 hover:bg-[#0077b5] hover:text-white transition-all text-gray-400">
                                        <Linkedin className="w-5 h-5" />
                                    </a>
                                    <a href="https://github.com/hemasaivattikuti25" target="_blank" rel="noreferrer" className="p-2 rounded-full bg-white/5 hover:bg-white hover:text-black transition-all text-gray-400">
                                        <Github className="w-5 h-5" />
                                    </a>
                                    <a href="https://www.instagram.com/hemasai_chowdary/" target="_blank" rel="noreferrer" className="p-2 rounded-full bg-white/5 hover:bg-[#E4405F] hover:text-white transition-all text-gray-400">
                                        <Instagram className="w-5 h-5" />
                                    </a>
                                </div>
                            </div>

                            <div className="flex-1 space-y-6">
                                <div>
                                    <h3 className="text-3xl font-bold text-white mb-2">Hemasai Vattikuti</h3>
                                    <p className="text-cyan-400 font-mono text-sm tracking-wide uppercase mb-4">Software Engineer & Data Scientist</p>
                                    <p className="text-gray-300 leading-relaxed text-lg">
                                        I’m a pre-final year <span className="text-white font-semibold">Computer Science</span> student at VIT-AP University, obsessed with building scalable systems and intuitive UIs.
                                        Mithra AI isn't just a project; it's the culmination of my experience in <span className="text-white font-semibold">backend engineering</span>, <span className="text-white font-semibold">machine learning</span>, and <span className="text-white font-semibold">product design</span>.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                                        <div className="flex items-center gap-2 mb-2 text-blue-400 font-semibold">
                                            <Database className="w-4 h-4" />
                                            <span>Internship @ DRDO</span>
                                        </div>
                                        <p className="text-sm text-gray-400">
                                            Designed high-availability distributed database systems and optimized backend pipelines for critical defense applications (MongoDB Replica Sets).
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                                        <div className="flex items-center gap-2 mb-2 text-purple-400 font-semibold">
                                            <Cpu className="w-4 h-4" />
                                            <span>ML & Algorithms</span>
                                        </div>
                                        <p className="text-sm text-gray-400">
                                            Certified in Advanced Learning Algorithms (Andrew Ng). Built "Newton's Playground," a 3D physics engine using React + WebGL.
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/10">
                                    <div className="flex flex-wrap gap-2">
                                        {['React', 'FastAPI', 'Supabase', 'Python', 'Machine Learning', 'System Design'].map((skill) => (
                                            <span key={skill} className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs font-medium text-gray-300">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 px-6 text-center relative">
                <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/20 to-transparent pointer-events-none"></div>
                <div className="max-w-4xl mx-auto relative z-10">
                    <h2 className="text-4xl md:text-6xl font-bold mb-8 text-white">
                        Get your life back. <br />
                        <span className="text-gray-500">For free. Forever.</span>
                    </h2>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/auth')}
                        className="px-12 py-5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:shadow-[0_0_50px_rgba(34,211,238,0.4)] transition-all font-bold text-xl text-white inline-flex items-center gap-3"
                    >
                        Launch Mithra
                        <ArrowRight className="w-6 h-6" />
                    </motion.button>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-white/10 bg-[#050505]">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 opacity-60 hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-2">
                        <img src="/assets/logo.png" alt="Mithra" className="w-6 h-6 rounded grayscale hover:grayscale-0 transition-all" />
                        <span className="font-semibold text-sm">Mithra AI © 2026</span>
                    </div>

                    <div className="text-xs text-gray-500 font-mono">
                        System Status: <span className="text-green-500">Operational</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
