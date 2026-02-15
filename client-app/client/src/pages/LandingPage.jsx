

import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowRight, Check, ChevronDown, Github,
    Menu, X, Globe, Zap, Shield, Users,
    Layout, Calendar, BookOpen, Clock, Smile, Sparkles, Linkedin, Instagram, Code, Database, Cpu, Brain,
    Terminal, Layers, Command
} from 'lucide-react';

export default function LandingPage() {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Scroll Animations
    const targetRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: targetRef, offset: ["start start", "end start"] });
    const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
    const yRange = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

    // 3D Tilt Effect for Hero Image
    const x = useSpring(0, { stiffness: 100, damping: 30 });
    const y = useSpring(0, { stiffness: 100, damping: 30 });

    const handleMouseMove = (e) => {
        const { clientX, clientY, currentTarget } = e;
        const width = currentTarget.clientWidth;
        const height = currentTarget.clientHeight;
        const xPct = clientX / width - 0.5;
        const yPct = clientY / height - 0.5;
        x.set(xPct * 4); // Rotation intensity
        y.set(yPct * 4);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    const features = [
        {
            title: "Task Management",
            desc: "Organize your life with precision.",
            icon: Layout,
            colSpan: "md:col-span-2",
            image: "/assets/tasks.png",
            tags: ["Subtasks", "Priority", "Kanban"]
        },
        {
            title: "Unified Calendar",
            desc: "Time-blocking made simple.",
            icon: Calendar,
            colSpan: "md:col-span-1",
            image: "/assets/calender.png",
            tags: ["Google Sync", "Smart Schedule"]
        },
        {
            title: "Habit Tracking",
            desc: "Build consistency that lasts.",
            icon: Zap,
            colSpan: "md:col-span-1",
            image: "/assets/habbits.png",
            tags: ["GitHub Heatmap", "Streaks"]
        },
        {
            title: "Dost AI Memory",
            desc: "A companion that remembers everything.",
            icon: Brain,
            colSpan: "md:col-span-2",
            image: "/assets/dosth(ai).png",
            tags: ["RAG Memory", "Context Aware", "Gemini 1.5"]
        },
        {
            title: "Mood Journal",
            desc: "Understand your emotional patterns.",
            icon: Smile,
            colSpan: "md:col-span-1",
            image: "/assets/journals.png",
            tags: ["Sentiment Analysis"]
        },
        {
            title: "Focus Timer",
            desc: "Deep work sessions.",
            icon: Clock,
            colSpan: "md:col-span-2",
            image: "/assets/focus_timer.png",
            tags: ["Pomodoro", "Analytics"]
        }
    ];

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden">

            {/* Ambient Background - Neon Blue & Deep Space */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-blue-600/20 rounded-full blur-[150px] opacity-40 mix-blend-screen"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[1000px] h-[1000px] bg-cyan-500/10 rounded-full blur-[150px] opacity-30 mix-blend-screen"></div>
                <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[800px] h-[800px] bg-indigo-900/10 rounded-full blur-[180px] opacity-20"></div>

                {/* Grid Overlay for Tech feel */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
            </div>

            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                        <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-[0_0_15px_rgba(6,182,212,0.3)] group-hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-shadow duration-300">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-lg tracking-tight text-white">Mithra<span className="text-cyan-400">.ai</span></span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-400">
                        <a href="#features" className="hover:text-white transition-colors">Features</a>
                        <a href="#about" className="hover:text-white transition-colors">Manifesto</a>
                        <a href="https://github.com/hemasaivattikuti25/Mithra-AI-life-os" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                            <Github className="w-4 h-4" />
                            <span>Star</span>
                        </a>
                        <div className="h-4 w-px bg-white/10 mx-2"></div>
                        <button onClick={() => navigate('/auth')} className="hover:text-white transition-colors">Log in</button>
                        <button
                            onClick={() => navigate('/auth')}
                            className="bg-white text-black px-4 py-2 rounded-full hover:bg-cyan-50 transition-all font-semibold text-xs tracking-wide hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                        >
                            Get Started
                        </button>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button className="md:hidden text-gray-300" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <main ref={targetRef} className="pt-32 pb-20 px-6 relative z-10 perspective-1000">
                <motion.div
                    style={{ opacity: heroOpacity, scale: heroScale, y: yRange }}
                    className="max-w-5xl mx-auto text-center"
                >
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm hover:border-cyan-500/30 transition-colors cursor-default"
                    >
                        <span className="flex h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_5px_#22d3ee]"></span>
                        <span className="text-xs font-medium text-cyan-100/80 tracking-wide">Mithra OS v2.0 is live</span>
                    </motion.div>

                    {/* Headline */}
                    <h1 className="text-5xl md:text-8xl font-bold tracking-tight mb-8 leading-[1.05]">
                        <motion.span
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.8 }}
                            className="block text-white"
                        >
                            One workspace.
                        </motion.span>
                        <motion.span
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                            className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 animate-gradient"
                        >
                            Your entire life.
                        </motion.span>
                    </h1>

                    {/* Subtext */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed font-light"
                    >
                        The precision-engineered operating system for high achievers.
                        Tasks, habits, notes, and AI — synchronized in <span className="text-white font-medium">real-time</span>.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24"
                    >
                        <button
                            onClick={() => navigate('/auth')}
                            className="group relative px-8 py-4 bg-white text-black rounded-full font-bold text-lg overflow-hidden transition-all hover:scale-105"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <span className="relative z-10 flex items-center gap-2 group-hover:text-white transition-colors">
                                Start Using Mithra <ArrowRight className="w-4 h-4" />
                            </span>
                        </button>
                        <a
                            href="https://github.com/hemasaivattikuti25/Mithra-AI-life-os"
                            target="_blank"
                            rel="noreferrer"
                            className="px-8 py-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all font-medium text-lg text-white flex items-center gap-2 backdrop-blur-sm"
                        >
                            <Github className="w-5 h-5" />
                            <span>Star on GitHub</span>
                        </a>
                    </motion.div>

                    {/* 3D Dashboard Preview */}
                    <motion.div
                        initial={{ opacity: 0, rotateX: 20, y: 50 }}
                        animate={{ opacity: 1, rotateX: 0, y: 0 }}
                        transition={{ delay: 0.6, duration: 1, type: "spring" }}
                        className="relative max-w-6xl mx-auto perspective-1000 group"
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                    >
                        <motion.div
                            style={{ rotateX: x, rotateY: y }}
                            className="relative rounded-xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-zinc-950 overflow-hidden"
                        >
                            <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
                            <img
                                src="/assets/home_1.png"
                                alt="Mithra Dashboard"
                                className="w-full h-auto opacity-90 group-hover:opacity-100 transition-opacity duration-700"
                            />
                            {/* Reflection Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-40"></div>
                        </motion.div>
                        {/* Glow underneath */}
                        <div className="absolute -inset-10 bg-cyan-500/20 blur-[100px] opacity-20 -z-10 rounded-full"></div>
                    </motion.div>
                </motion.div>
            </main>

            {/* Social Proof Strip */}
            <section className="border-y border-white/5 bg-white/[0.02] py-10 relative overflow-hidden backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Built for Engineers at</p>
                    <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        {['VIT-AP', 'DRDO', 'Google', 'Microsoft', 'Notion'].map((brand) => (
                            <span key={brand} className="text-lg font-bold font-mono text-white tracking-tighter">{brand}</span>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tech Stack Strip */}
            <div className="w-full overflow-hidden py-4 bg-black/20 border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-center gap-8 text-gray-600 text-xs font-mono uppercase tracking-widest">
                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#61DAFB]"></div> React 18</span>
                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#3ECF8E]"></div> Supabase</span>
                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#4B8BBE]"></div> Python</span>
                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#8E51DA]"></div> Gemini AI</span>
                </div>
            </div>


            {/* Bento Grid Features */}
            <section id="features" className="py-32 px-6 max-w-7xl mx-auto relative">
                {/* Section Header */}
                <div className="mb-20 text-center max-w-3xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500">
                        Everything you need. <br /> In one place.
                    </h2>
                    <p className="text-xl text-gray-400">
                        Stop context switching. Mithra unifies your entire workflow into a single, intelligent interface.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(250px,auto)]">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className={`group relative rounded-3xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-500 overflow-hidden ${feature.colSpan || ''}`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                            <div className="p-8 h-full flex flex-col relative z-10">
                                <div className="mb-6 w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-cyan-500 group-hover:border-cyan-400 group-hover:text-black transition-all duration-300">
                                    <feature.icon className="w-6 h-6 text-white group-hover:text-black transition-colors" />
                                </div>

                                <h3 className="text-2xl font-bold mb-2 text-white">{feature.title}</h3>
                                <p className="text-gray-400 mb-6 text-sm leading-relaxed">{feature.desc}</p>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2 mt-auto mb-6">
                                    {feature.tags?.map((tag, i) => (
                                        <span key={i} className="text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded bg-white/5 text-gray-400 border border-white/5">
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                {/* Image Preview (Bottom aligned) */}
                                <div className="relative mt-4 rounded-lg overflow-hidden border border-white/5 group-hover:border-cyan-500/30 transition-colors">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-50 z-10"></div>
                                    <img
                                        src={feature.image}
                                        alt={feature.title}
                                        className="w-full h-40 object-cover object-top opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* AI Spotlight Section */}
            <section className="py-32 px-6 relative overflow-hidden bg-black">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none"></div>

                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center relative z-10">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6 text-purple-400 text-xs font-mono uppercase tracking-widest">
                            <Sparkles className="w-3 h-3" /> Dost AI Engine
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">
                            It doesn't just chat. <br />
                            <span className="text-gray-500">It remembers.</span>
                        </h2>
                        <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                            Most AI bots forget you the moment you close the tab. Dost uses <span className="text-white">RAG (Retrieval Augmented Generation)</span> to build a long-term memory of your life from your journals and tasks.
                        </p>

                        <ul className="space-y-4">
                            {[
                                "Ask: 'When was the last time I felt happy?'",
                                "Command: 'Schedule deep work for tomorrow morning.'",
                                "Advice: 'I'm stressed about exams.' -> Stoic guidance."
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-gray-300">
                                    <div className="mt-1 w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-3 h-3 text-cyan-400" />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Mock Chat Interface */}
                    <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-2xl blur opacity-20"></div>
                        <div className="relative rounded-2xl bg-zinc-950 border border-white/10 p-6 shadow-2xl">
                            <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-500"></div>
                                    <div>
                                        <div className="font-bold text-sm">Dost AI</div>
                                        <div className="text-xs text-green-400 flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div> Online
                                        </div>
                                    </div>
                                </div>
                                <Terminal className="w-4 h-4 text-gray-600" />
                            </div>

                            <div className="space-y-4 font-mono text-sm">
                                <div className="bg-white/5 p-3 rounded-lg rounded-tl-none border border-white/5 text-gray-300">
                                    User: I'm feeling overwhelmed with the project deadline.
                                </div>
                                <div className="bg-cyan-500/10 p-3 rounded-lg rounded-tr-none border border-cyan-500/20 text-cyan-100">
                                    Dost: I see you've mentioned "Project Alpha" 3 times this week in your journal. <br /><br />
                                    Let's break it down. I've found a 2-hour slot tomorrow morning. Should I schedule a focus session?
                                </div>
                                <div className="flex gap-2 mt-2">
                                    <button className="px-3 py-1 rounded bg-white/10 text-xs hover:bg-white/20 transition">Yes, schedule it</button>
                                    <button className="px-3 py-1 rounded bg-white/10 text-xs hover:bg-white/20 transition">Break it down</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* Creator Profile - "ID Card" Style */}
            <section id="about" className="py-24 px-6 relative">
                <div className="max-w-4xl mx-auto">
                    <div className="relative rounded-3xl bg-white/[0.02] border border-white/10 overflow-hidden backdrop-blur-sm p-8 md:p-12">
                        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                            <Code className="w-64 h-64" />
                        </div>

                        <div className="flex flex-col md:flex-row gap-10 relative z-10">
                            <div className="flex-shrink-0">
                                <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl relative">
                                    <img src="/assets/hemasai.jpeg" alt="Hemasai" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex gap-3 mt-4 justify-center">
                                    <a href="https://github.com/hemasaivattikuti25" className="p-2 rounded bg-white/5 hover:bg-white hover:text-black transition-all"><Github className="w-4 h-4" /></a>
                                    <a href="https://linkedin.com/in/hemsaivattikuti" className="p-2 rounded bg-white/5 hover:bg-[#0077B5] hover:text-white transition-all"><Linkedin className="w-4 h-4" /></a>
                                </div>
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-2xl font-bold text-white">Hemasai Vattikuti</h3>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 uppercase tracking-wide">Builder</span>
                                </div>
                                <p className="text-gray-400 font-mono text-xs mb-6 max-w-lg">
                                    ENGINEERING STUDENT • FULL STACK DEVELOPER • AI RESEARCHER
                                </p>

                                <p className="text-gray-300 mb-8 leading-relaxed max-w-xl">
                                    "I built Mithra because existing tools forced me to adapt to them. I wanted a system that adapted to me. Built from scratch with <span className="text-white font-semibold">React, FastAPI, and Supabase</span> to solve my own chaos."
                                </p>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 rounded bg-black/40 border border-white/5">
                                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Internship</div>
                                        <div className="font-semibold text-sm">DRDO (Defense R&D)</div>
                                        <div className="text-xs text-gray-400 mt-1">Distributed DB Systems</div>
                                    </div>
                                    <div className="p-3 rounded bg-black/40 border border-white/5">
                                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Research</div>
                                        <div className="font-semibold text-sm">Newton's Playground</div>
                                        <div className="text-xs text-gray-400 mt-1">Physics Engine in WebGL</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final Large CTA */}
            <section className="py-32 px-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/10 to-transparent pointer-events-none"></div>
                <div className="max-w-3xl mx-auto relative z-10">
                    <h2 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight text-white">
                        Get your life back. <br />
                        <span className="text-gray-600">Start today.</span>
                    </h2>

                    <div className="flex justify-center">
                        <button
                            onClick={() => navigate('/auth')}
                            className="group relative px-12 py-6 bg-white text-black rounded-full font-bold text-xl overflow-hidden transition-transform hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                Launch Mithra <ArrowRight className="w-5 h-5" />
                            </span>
                        </button>
                    </div>
                    <p className="mt-8 text-sm text-gray-500 font-mono">
                        Free for personal use • No credit card required • Open Source
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-white/5 bg-black">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 opacity-60 hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-gradient-to-br from-cyan-500 to-blue-600"></div>
                        <span className="font-semibold text-sm tracking-wide">Mithra AI © 2026</span>
                    </div>

                    <div className="flex gap-8 text-xs text-gray-400 font-medium">
                        <a href="#" className="hover:text-white">Privacy</a>
                        <a href="#" className="hover:text-white">Terms</a>
                        <a href="#" className="hover:text-white">Twitter</a>
                        <a href="#" className="hover:text-white">Email</a>
                    </div>
                </div>
            </footer>
        </div >
    );
}
