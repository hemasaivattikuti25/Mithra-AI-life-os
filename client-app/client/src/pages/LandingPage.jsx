import React, { useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import { ArrowRight, Check, Github, Menu, X, Layout, Calendar, BookOpen, Clock, Zap, Brain, Users, Linkedin, Globe, Rocket } from 'lucide-react';

export default function LandingPage() {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const features = [
        {
            title: 'Smart Task Management',
            desc: 'Subtasks, priorities, recurring schedules, and Kanban views.',
            icon: Layout,
            tags: ['Subtasks', 'Recurring'],
        },
        {
            title: 'Unified Calendar',
            desc: 'Sync with Google Calendar. Time-block your day intelligently.',
            icon: Calendar,
            tags: ['Google Sync', 'Time Blocks'],
        },
        {
            title: 'Habit Tracking',
            desc: 'GitHub-style heatmaps, streaks, and focus timers.',
            icon: Zap,
            tags: ['Heatmap', 'Streaks'],
        },
        {
            title: 'Dost AI Companion',
            desc: 'RAG-powered AI that remembers your tasks, moods, and goals.',
            icon: Brain,
            tags: ['RAG Memory', 'Gemini'],
        },
        {
            title: 'Daily Journaling',
            desc: 'Track emotions with mood scores and AI sentiment analysis.',
            icon: BookOpen,
            tags: ['Mood Track', 'AI'],
        },
        {
            title: 'Mithra Blend',
            desc: 'Share workspaces with friends. Track accountability together.',
            icon: Users,
            tags: ['Shared Goals', 'Social'],
        },
    ];

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans">
            {/* Navbar */}
            <nav className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-200 z-50">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <img src="/assets/logo.svg" alt="Mithra" className="w-6 h-6 rounded" />
                        <span className="font-bold text-sm text-slate-900">Mithra <span className="text-cyan-600">Life OS</span></span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-sm">
                        <a href="#features" className="text-slate-600 hover:text-slate-900">Features</a>
                        <a href="#how-it-works" className="text-slate-600 hover:text-slate-900">How It Works</a>
                        <a href="#about" className="text-slate-600 hover:text-slate-900">About</a>
                        <button onClick={() => navigate('/auth')} className="text-slate-600 hover:text-slate-900">Log in</button>
                        <button onClick={() => navigate('/auth')} className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 text-xs font-semibold">Get Started</button>
                    </div>

                    <button className="md:hidden text-slate-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {isMenuOpen && (
                    <div className="md:hidden bg-white border-t border-slate-200 px-6 py-4 space-y-3">
                        <a href="#features" className="block text-slate-600 py-2">Features</a>
                        <a href="#how-it-works" className="block text-slate-600 py-2">How It Works</a>
                        <button onClick={() => { setIsMenuOpen(false); navigate('/auth'); }} className="w-full bg-cyan-600 text-white py-2 rounded-lg text-sm font-semibold">Get Started</button>
                    </div>
                )}
            </nav>

            {/* Hero */}
            <section className="pt-24 pb-16 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                        One workspace.
                        <br />
                        <span className="text-cyan-600">Your entire life.</span>
                    </h1>

                    <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
                        Tasks, habits, journaling, calendar, AI companion, and collaborative workspaces — all synchronized in real-time.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                        <button onClick={() => navigate('/auth')} className="px-8 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-semibold flex items-center gap-2">
                            Start Using Mithra <ArrowRight size={16} />
                        </button>
                        <a href="https://github.com/hemasaivattikuti25/Mithra-AI-life-os" target="_blank" rel="noreferrer" className="px-8 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-semibold flex items-center gap-2">
                            <Github size={16} /> GitHub
                        </a>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto text-center pt-8 border-t border-slate-200">
                        <div>
                            <div className="text-3xl font-bold text-cyan-600">690+</div>
                            <div className="text-sm text-slate-600 mt-2">Active Users</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-cyan-600">7+</div>
                            <div className="text-sm text-slate-600 mt-2">Core Features</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-cyan-600">100%</div>
                            <div className="text-sm text-slate-600 mt-2">Zero-Trust</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-20 px-6 bg-slate-50">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl font-bold text-center mb-4">Built for Productivity</h2>
                    <p className="text-center text-slate-600 mb-16 max-w-2xl mx-auto">Everything you need in one place. No more app switching.</p>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((f, i) => (
                            <FeatureCard key={i} {...f} />
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="py-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
                    <div className="grid md:grid-cols-3 gap-10">
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
                            <h3 className="font-bold text-lg mb-2">Sign Up</h3>
                            <p className="text-slate-600 text-sm">Create account in 30 seconds. Email or Google OAuth.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
                            <h3 className="font-bold text-lg mb-2">Add Your Life</h3>
                            <p className="text-slate-600 text-sm">Tasks, habits, goals. Dost AI learns your patterns instantly.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
                            <h3 className="font-bold text-lg mb-2">Share & Blend</h3>
                            <p className="text-slate-600 text-sm">Invite friends. Track goals together. Stay accountable.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* AI Spotlight */}
            <section className="py-20 px-6 bg-slate-50">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-4xl font-bold mb-8">Dost AI: Your AI Companion</h2>
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <p className="text-lg text-slate-600 mb-6">
                                Most AI bots forget you instantly. Dost uses <span className="font-semibold">RAG (Retrieval Augmented Generation)</span> to build long-term memory from your journals, tasks, and moods.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <Check size={20} className="text-cyan-600 flex-shrink-0 mt-0.5" />
                                    <span className="text-slate-700">Ask: "When was the last time I felt happy?"</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check size={20} className="text-cyan-600 flex-shrink-0 mt-0.5" />
                                    <span className="text-slate-700">Command: "Schedule deep work for tomorrow morning"</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check size={20} className="text-cyan-600 flex-shrink-0 mt-0.5" />
                                    <span className="text-slate-700">Advice: "I'm stressed" → Stoic guidance based on your history</span>
                                </li>
                            </ul>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                            <div className="text-sm font-semibold text-slate-600 mb-4">Your Conversation</div>
                            <div className="space-y-4">
                                <div className="bg-slate-100 p-3 rounded-lg text-sm text-slate-700">
                                    I'm feeling overwhelmed with the project deadline.
                                </div>
                                <div className="bg-cyan-50 p-3 rounded-lg text-sm text-slate-700">
                                    I see "Project Alpha" mentioned 3 times this week in your journal.<br /><br />
                                    Let's break it down. I found a 2-hour focus slot tomorrow. Schedule it?
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Creator */}
            <section id="about" className="py-20 px-6">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold mb-12 text-center">Built by an Engineer</h2>
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="flex-shrink-0">
                            <img src="/assets/hemasai.jpeg" alt="Hemasai" className="w-28 h-28 rounded-xl object-cover shadow-md" />
                            <div className="flex gap-2 mt-4 justify-center">
                                <a href="https://github.com/hemasaivattikuti25" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200"><Github size={16} /></a>
                                <a href="https://linkedin.com/in/hemasai-vattikuti" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200"><Linkedin size={16} /></a>
                                <a href="https://hemasai-vattikuti-portfolio.vercel.app" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200"><Globe size={16} /></a>
                            </div>
                        </div>

                        <div className="flex-1">
                            <h3 className="text-2xl font-bold mb-1">Hemasai Vattikuti</h3>
                            <p className="text-cyan-600 font-semibold text-sm mb-4">Backend & Applied AI Engineer</p>
                            <p className="text-slate-600 mb-4">
                                Built production systems at DRDL–DRDO (Ministry of Defence, Government of India) with distributed databases and zero-trust security. Now shipping Mithra Life OS — an AI productivity platform with 690+ users, RAG semantic search, and Row-Level Security at the database layer.
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                                    <div className="text-xs text-slate-600 font-semibold mb-1">EXPERIENCE</div>
                                    <div className="font-bold text-sm">DRDL–DRDO</div>
                                </div>
                                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                                    <div className="text-xs text-slate-600 font-semibold mb-1">SHIPPING</div>
                                    <div className="font-bold text-sm">690+ Users</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Footer */}
            <section className="py-20 px-6 bg-slate-900 text-white text-center">
                <h2 className="text-4xl font-bold mb-6">Ready to take control?</h2>
                <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">Join 690+ users. No credit card required. Forever free.</p>
                <button onClick={() => navigate('/auth')} className="px-8 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-semibold flex items-center gap-2 mx-auto">
                    Get Started Now <ArrowRight size={16} />
                </button>
            </section>
        </div>
    );
}

function FeatureCard({ title, desc, icon: Icon, tags }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-all"
        >
            <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center mb-4">
                <Icon size={20} className="text-cyan-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">{title}</h3>
            <p className="text-slate-600 text-sm mb-4">{desc}</p>
            <div className="flex gap-2">
                {tags.map((tag, i) => (
                    <span key={i} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">{tag}</span>
                ))}
            </div>
        </motion.div>
    );
}
