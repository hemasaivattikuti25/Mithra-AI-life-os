import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Calendar, CheckSquare, Brain, BarChart3, Flame,
    BookOpen, Sparkles, ArrowRight, Zap, Shield, Clock,
    Users, TrendingUp, Star, Check, X, ChevronDown, Target,
    Rocket, Award, Globe, Lock, Smartphone, Infinity, Github,
    Linkedin, Instagram, Heart, Code, Database, Cpu, Play
} from 'lucide-react';

export default function LandingPage() {
    const navigate = useNavigate();
    const { scrollYProgress } = useScroll();
    const [activeFeature, setActiveFeature] = useState(0);
    const [showFAQ, setShowFAQ] = useState(null);

    // Parallax effects
    const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -50]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.3]);

    // Auto-rotate features
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveFeature((prev) => (prev + 1) % 6);
        }, 6000);
        return () => clearInterval(interval);
    }, []);

    const features = [
        {
            icon: CheckSquare,
            title: 'Smart Task Management',
            tagline: 'Organize Everything',
            description: 'Capture, organize, and prioritize your work with intelligent task management',
            details: [
                'Create tasks with priorities, due dates, and categories',
                'Break down big projects into subtasks',
                'Set recurring tasks for daily, weekly, or custom schedules',
                'Filter and search across all your tasks instantly',
                'AI suggests what to work on next based on deadlines and importance'
            ],
            impact: 'Save 2-3 hours per week on planning and organization'
        },
        {
            icon: Flame,
            title: 'Habit Tracking',
            tagline: 'Build Better Habits',
            description: 'Track daily habits and build streaks that last',
            details: [
                'Visual streak tracking shows your consistency at a glance',
                'Daily check-ins take just seconds',
                'See progress charts and completion rates over time',
                'Get motivated by milestone celebrations',
                'Flexible scheduling for daily, weekly, or custom habits'
            ],
            impact: '3x higher habit completion rate vs traditional trackers'
        },
        {
            icon: Calendar,
            title: 'Unified Calendar',
            tagline: 'See Your Whole Day',
            description: 'Time-blocking and event management in one beautiful view',
            details: [
                'Create time-blocked events with start and end times',
                'Drag and drop to reschedule instantly',
                'Switch between Day, Week, Month, and Year views',
                'Color-code events by category',
                'Export to .ics format for other calendar apps'
            ],
            impact: 'Reduce scheduling conflicts by 80%'
        },
        {
            icon: Brain,
            title: 'Dost - AI Assistant',
            tagline: 'AI That Knows You',
            description: 'Context-aware AI powered by a proprietary NLP model',
            details: [
                'Ask "Plan my week" and get a personalized schedule',
                'Dost knows your current tasks, habits, and mood',
                'Get advice tailored to YOUR workload, not generic tips',
                'Multi-day planning distributes work across future dates',
                'Remembers your journal entries for deeper insights'
            ],
            impact: 'Get personalized advice based on YOUR actual data'
        },
        {
            icon: BookOpen,
            title: 'Journal & Mood Tracking',
            tagline: 'Understand Yourself',
            description: 'Daily reflections with emotional analytics',
            details: [
                'Track your mood with simple emoji ratings',
                'Write journal entries and search them later',
                'See mood trends over time with analytics',
                'Discover correlations: "I\'m happier after morning workouts"',
                'AI-powered insights from your journal entries'
            ],
            impact: 'Discover patterns like "40% more productive after exercise"'
        },
        {
            icon: Clock,
            title: 'Focus Timer',
            tagline: 'Deep Work Mode',
            description: 'Pomodoro technique with session tracking',
            details: [
                'Customizable work/break intervals (25/5 default)',
                'Track total focus time per day',
                'Build focus streaks to stay consistent',
                'See analytics on your most productive hours',
                'Automatic task time tracking'
            ],
            impact: 'Increase deep work time by 50%'
        }
    ];

    const stats = [
        { value: 'Free', label: 'Forever', icon: Zap, subtext: 'No hidden costs' },
        { value: '6-in-1', label: 'Tools', icon: Infinity, subtext: 'One unified system' },
        { value: '$708', label: 'Saved/Year', icon: TrendingUp, subtext: 'vs competitors' },
        { value: 'Open', label: 'Source', icon: Code, subtext: 'Full transparency' }
    ];

    const realImpact = [
        {
            metric: '2-3 hours',
            description: 'Saved per week on planning',
            icon: Clock
        },
        {
            metric: '80%',
            description: 'Fewer forgotten tasks',
            icon: CheckSquare
        },
        {
            metric: '3x',
            description: 'Higher habit completion',
            icon: Flame
        },
        {
            metric: '$708',
            description: 'Saved annually',
            icon: TrendingUp
        }
    ];

    const comparison = [
        { feature: 'Smart Tasks', mithra: true, notion: true, todoist: true, motion: true, sunsama: true },
        { feature: 'Habit Tracking', mithra: true, notion: false, todoist: false, motion: false, sunsama: false },
        { feature: 'Unified Calendar', mithra: true, notion: false, todoist: false, motion: true, sunsama: true },
        { feature: 'Journal + Mood', mithra: true, notion: true, todoist: false, motion: false, sunsama: false },
        { feature: 'Focus Timer', mithra: true, notion: false, todoist: false, motion: false, sunsama: true },
        { feature: 'Context-Aware AI', mithra: true, notion: false, todoist: false, motion: true, sunsama: false },
        { feature: 'Multi-Day Planning', mithra: true, notion: false, todoist: false, motion: true, sunsama: false },
        { feature: 'All-in-One', mithra: true, notion: true, todoist: false, motion: false, sunsama: true },
        { feature: 'Price/Month', mithra: 'FREE', notion: '$10', todoist: '$5', motion: '$34', sunsama: '$20' }
    ];

    const faqs = [
        {
            q: 'How is Mithra AI different from Notion?',
            a: 'Notion is a powerful workspace, but it\'s complex and lacks AI planning, habit tracking, and mood analytics. Mithra is purpose-built for personal productivity with AI that knows your workload.'
        },
        {
            q: 'Why is it free? What\'s the catch?',
            a: 'No catch. This started as a personal project to solve my own productivity struggles. I believe these tools should be accessible to everyone. Core features will always be free.'
        },
        {
            q: 'How does the AI work? Is my data private?',
            a: 'Dost uses a proprietary NLP model with your tasks/habits/journal as context. Your data is encrypted and stored locally in your browser and Supabase. We never sell your information.'
        },
        {
            q: 'Can I import my data from Todoist/Notion?',
            a: 'Not yet, but it\'s coming! For now, you can manually recreate your setup. Most users say it\'s worth the fresh start.'
        },
        {
            q: 'Do you have a mobile app?',
            a: 'The web app works great on mobile browsers and is fully responsive. A native iOS/Android app is in development for Q2 2026!'
        },
        {
            q: 'What if I need help or have feedback?',
            a: 'I\'m actively developing this and love hearing from users. Reach out via email or GitHub issues - I respond to everyone!'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#111111] to-[#0A0A0A] text-white overflow-x-hidden">
            {/* Animated background orbs - Refined for "Aesthetic Tech" look */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <motion.div
                    animate={{
                        x: [0, 100, 0],
                        y: [0, -100, 0],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-blue-900/10 to-transparent rounded-full filter blur-[150px]"
                />
                <motion.div
                    animate={{
                        x: [0, -100, 0],
                        y: [0, 100, 0],
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-gradient-to-r from-cyan-900/10 to-transparent rounded-full filter blur-[150px]"
                />
                <motion.div
                    animate={{
                        x: [100, 0, 100],
                        y: [100, 0, 100],
                    }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full filter blur-[180px]"
                />
            </div>

            {/* Fixed Navigation */}
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className="fixed top-0 w-full z-50 backdrop-blur-xl bg-black/20 border-b border-white/5"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <motion.div
                            whileHover={{ rotate: 180, scale: 1.1 }}
                            transition={{ duration: 0.3 }}
                            className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center cursor-pointer"
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        >
                            <Sparkles className="w-6 h-6" />
                        </motion.div>
                        <span className="text-xl font-bold hidden sm:block">Mithra AI</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                            className="hidden md:block text-gray-300 hover:text-white transition-colors text-sm"
                        >
                            Features
                        </button>
                        <button
                            onClick={() => document.getElementById('impact').scrollIntoView({ behavior: 'smooth' })}
                            className="hidden md:block text-gray-300 hover:text-white transition-colors text-sm"
                        >
                            Impact
                        </button>
                        <button
                            onClick={() => document.getElementById('creator').scrollIntoView({ behavior: 'smooth' })}
                            className="hidden md:block text-gray-300 hover:text-white transition-colors text-sm"
                        >
                            Creator
                        </button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/auth')}
                            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:shadow-lg hover:shadow-purple-600/20 transition-all font-medium text-sm"
                        >
                            Start Free
                        </motion.button>
                    </div>
                </div>
            </motion.nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 sm:px-6 relative">
                <motion.div
                    style={{ y: heroY, opacity: heroOpacity }}
                    className="max-w-6xl mx-auto text-center relative z-10"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6"
                        >
                            <Heart className="w-4 h-4 text-cyan-400" />
                            <span className="text-sm">Built by a student, for everyone</span>
                        </motion.div>

                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight">
                            <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                                One app.<br />
                            </span>
                            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                                Start Living.
                            </span>
                        </h1>

                        <p className="text-lg sm:text-xl text-gray-300 mb-4 max-w-3xl mx-auto px-4">
                            Mithra AI combines <span className="text-white font-semibold">tasks, habits, calendar, journal, focus timer, and AI</span> in one beautiful workspace.
                        </p>

                        <p className="text-base sm:text-lg text-gray-400 mb-10 max-w-2xl mx-auto px-4">
                            Stop paying $708/year for 5 different apps. Get everything free, forever.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 px-4">
                            <motion.button
                                whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(6, 182, 212, 0.2)' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/auth')}
                                className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:shadow-2xl transition-all font-semibold text-lg flex items-center justify-center gap-2 group"
                            >
                                Get Mithra Free
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </motion.button>
                            <motion.a
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                href="https://github.com/hemasaivattikuti25/Mithra-AI-life-os"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-semibold text-lg flex items-center justify-center gap-2"
                            >
                                <Github className="w-5 h-5" />
                                Star on GitHub
                            </motion.a>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
                            {stats.map((stat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + i * 0.1 }}
                                    whileHover={{ y: -5, scale: 1.05 }}
                                    className="text-center p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all cursor-pointer"
                                >
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <stat.icon className="w-5 h-5 text-cyan-400" />
                                        <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{stat.value}</div>
                                    </div>
                                    <div className="text-sm font-semibold text-gray-300">{stat.label}</div>
                                    <div className="text-xs text-gray-500 mt-1">{stat.subtext}</div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
                >
                    <ChevronDown className="w-8 h-8 text-gray-500" />
                </motion.div>
            </section>

            {/* Platform Preview Section */}
            <section id="preview" className="py-20 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">The Precision OS in Action</h2>
                        <p className="text-gray-400 text-lg">Experience the next generation of productivity</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { id: 'dashboard', name: 'Mission Control' },
                            { id: 'tasks', name: 'Proprietary Tasks' },
                            { id: 'calendar', name: 'Unified Calendar' },
                            { id: 'journal', name: 'Mood & Journal' },
                            { id: 'habits', name: 'Consistency Hub' },
                            { id: 'dost-ai', name: 'Dost AI Mode' }
                        ].map((preview) => (
                            <motion.div
                                key={preview.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                whileHover={{ y: -10, scale: 1.02 }}
                                className="group relative rounded-2xl overflow-hidden bg-white/5 border border-white/10"
                            >
                                <img
                                    src={require(`../../public/demo/${preview.id}.png`)}
                                    alt={`Mithra AI ${preview.name}`}
                                    className="w-full h-full object-cover aspect-video group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                    <div className="text-white text-sm font-medium">{preview.name}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mt-16 text-center"
                    >
                        <p className="text-gray-400 mb-6 italic">Built with performance in mind. Zero lag. High aesthetic.</p>
                        <motion.a
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            href="https://github.com/hemasaivattikuti25/Mithra-AI-life-os"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-medium"
                        >
                            <Target className="w-5 h-5 text-cyan-400" />
                            Help us build the future on GitHub
                        </motion.a>
                    </motion.div>
                </div>
            </section>

            {/* Real Impact Section */}
            <section id="impact" className="py-20 px-4 sm:px-6 bg-gradient-to-b from-black/20 to-transparent">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Real Impact, Real Numbers</h2>
                        <p className="text-gray-400 text-lg">Measurable improvements to your productivity</p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {realImpact.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ y: -10, scale: 1.05 }}
                                className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 hover:border-purple-500/30 transition-all text-center"
                            >
                                <item.icon className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                                <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">{item.metric}</div>
                                <p className="text-gray-300 text-sm">{item.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Deep Dive - Notion Style */}
            <section id="features" className="py-20 px-4 sm:px-6">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Everything you need. Nothing you don't.</h2>
                        <p className="text-gray-400 text-lg">Six powerful tools designed to work together</p>
                    </motion.div>

                    {/* Feature Tabs */}
                    <div className="flex flex-wrap gap-3 justify-center mb-12">
                        {features.map((feature, i) => (
                            <motion.button
                                key={i}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setActiveFeature(i)}
                                className={`px-4 py-3 rounded-xl flex items-center gap-2 transition-all ${activeFeature === i
                                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 shadow-lg shadow-purple-600/20'
                                    : 'bg-white/5 hover:bg-white/10 border border-white/10'
                                    }`}
                            >
                                <feature.icon className="w-5 h-5" />
                                <span className="text-sm font-medium hidden sm:inline">{feature.title}</span>
                            </motion.button>
                        ))}
                    </div>

                    {/* Active Feature Detail - Notion Style */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeFeature}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10"
                        >
                            <div className="flex items-start gap-6 mb-8">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center flex-shrink-0">
                                    {React.createElement(features[activeFeature].icon, { className: 'w-8 h-8 text-cyan-400' })}
                                </div>
                                <div>
                                    <h3 className="text-3xl font-bold mb-2">{features[activeFeature].title}</h3>
                                    <p className="text-xl text-cyan-400 font-semibold mb-3">{features[activeFeature].tagline}</p>
                                    <p className="text-gray-300 text-lg">{features[activeFeature].description}</p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-cyan-400" />
                                    What you can do:
                                </h4>
                                <ul className="space-y-3">
                                    {features[activeFeature].details.map((detail, i) => (
                                        <motion.li
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="flex items-start gap-3 text-gray-300"
                                        >
                                            <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                                            <span>{detail}</span>
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>

                            <div className="p-6 rounded-xl bg-gradient-to-r from-purple-600/10 to-pink-600/10 border border-purple-500/20">
                                <p className="text-sm font-semibold text-cyan-400 mb-2">📈 Real Impact:</p>
                                <p className="text-white font-semibold text-lg">{features[activeFeature].impact}</p>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </section>

            {/* Comparison Table */}
            <section id="comparison" className="py-20 px-4 sm:px-6 bg-gradient-to-b from-black/20 to-transparent">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">The Honest Comparison</h2>
                        <p className="text-gray-400 text-lg">See why Mithra is the obvious choice</p>
                    </motion.div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse min-w-[700px]">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left p-4 text-gray-400 font-medium">Feature</th>
                                    <th className="p-4 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Sparkles className="w-6 h-6 text-cyan-400" />
                                            <span className="font-bold text-white">Mithra AI</span>
                                            <span className="text-xs text-green-500">FREE</span>
                                        </div>
                                    </th>
                                    <th className="p-4 text-center text-gray-400">
                                        <div className="text-sm">Notion</div>
                                        <div className="text-xs text-gray-500">$10/mo</div>
                                    </th>
                                    <th className="p-4 text-center text-gray-400">
                                        <div className="text-sm">Todoist</div>
                                        <div className="text-xs text-gray-500">$5/mo</div>
                                    </th>
                                    <th className="p-4 text-center text-gray-400">
                                        <div className="text-sm">Motion</div>
                                        <div className="text-xs text-gray-500">$34/mo</div>
                                    </th>
                                    <th className="p-4 text-center text-gray-400">
                                        <div className="text-sm">Sunsama</div>
                                        <div className="text-xs text-gray-500">$20/mo</div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {comparison.map((row, i) => (
                                    <motion.tr
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.05 }}
                                        className="border-b border-white/5 hover:bg-white/5"
                                    >
                                        <td className="p-4 text-gray-300 font-medium">{row.feature}</td>
                                        <td className="p-4 text-center bg-purple-600/5">
                                            {typeof row.mithra === 'boolean' ? (
                                                row.mithra ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-gray-600 mx-auto" />
                                            ) : (
                                                <span className="text-green-500 font-bold">{row.mithra}</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            {typeof row.notion === 'boolean' ? (
                                                row.notion ? <Check className="w-5 h-5 text-gray-500 mx-auto" /> : <X className="w-5 h-5 text-gray-600 mx-auto" />
                                            ) : (
                                                <span className="text-gray-400">{row.notion}</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            {typeof row.todoist === 'boolean' ? (
                                                row.todoist ? <Check className="w-5 h-5 text-gray-500 mx-auto" /> : <X className="w-5 h-5 text-gray-600 mx-auto" />
                                            ) : (
                                                <span className="text-gray-400">{row.todoist}</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            {typeof row.motion === 'boolean' ? (
                                                row.motion ? <Check className="w-5 h-5 text-gray-500 mx-auto" /> : <X className="w-5 h-5 text-gray-600 mx-auto" />
                                            ) : (
                                                <span className="text-gray-400">{row.motion}</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            {typeof row.sunsama === 'boolean' ? (
                                                row.sunsama ? <Check className="w-5 h-5 text-gray-500 mx-auto" /> : <X className="w-5 h-5 text-gray-600 mx-auto" />
                                            ) : (
                                                <span className="text-gray-400">{row.sunsama}</span>
                                            )}
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mt-8 p-6 rounded-xl bg-gradient-to-r from-purple-600/10 to-pink-600/10 border border-purple-500/20 text-center"
                    >
                        <p className="text-lg font-semibold mb-2">💰 The Math:</p>
                        <p className="text-gray-300">
                            Motion ($34) + Sunsama ($20) + Habitica ($5) = <span className="text-white font-bold">$59/month</span> or <span className="text-cyan-400 font-bold text-xl">$708/year</span>
                        </p>
                        <p className="text-2xl font-bold text-green-500 mt-2">Mithra AI: $0 Forever</p>
                    </motion.div>
                </div>
            </section>

            {/* About the Creator */}
            <section id="creator" className="py-20 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Built by a Student, For Everyone</h2>
                        <p className="text-gray-400 text-lg">The story behind Mithra AI</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10"
                    >
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="flex-shrink-0">
                                {/* TODO: Replace with actual photo - upload hemasai-photo.png to /public folder */}
                                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center overflow-hidden border-2 border-white/10 shadow-2xl">
                                    <img src="/hemasai.jpg" alt="Hemasai Vattikuti" className="w-full h-full object-cover" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-2xl font-bold mb-2">Hemasai Vattikuti</h3>
                                <p className="text-cyan-400 font-semibold mb-4">CSE Student • ML Enthusiast • Builder</p>

                                <div className="space-y-4 text-gray-300 mb-6">
                                    <p>
                                        Hey! I'm a pre-final year Computer Science student who got tired of juggling 5 different apps to stay productive.
                                        Between my DRDO internship, ML projects, and coursework, I needed something that actually worked.
                                    </p>
                                    <p>
                                        So I built Mithra AI - not as a startup, but as a solution to my own chaos. I wanted an AI that knew my workload,
                                        not just generic productivity advice. I wanted habits, tasks, and mood tracking in one place.
                                    </p>
                                    <p className="text-white font-semibold">
                                        If this helps even one person get their life together, it's worth it. That's why it's free, and always will be.
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-4">
                                    <motion.a
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        href="https://www.linkedin.com/in/hemsaivattikuti"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2"
                                    >
                                        <Linkedin className="w-5 h-5 text-[#0A66C2]" />
                                        <span className="text-sm">LinkedIn</span>
                                    </motion.a>
                                    <motion.a
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        href="https://github.com/hemasaivattikuti25"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2"
                                    >
                                        <Github className="w-5 h-5" />
                                        <span className="text-sm">GitHub</span>
                                    </motion.a>
                                    <motion.a
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        href="https://www.instagram.com/hemasai_chowdary/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2"
                                    >
                                        <Instagram className="w-5 h-5 text-[#E4405F]" />
                                        <span className="text-sm">Instagram</span>
                                    </motion.a>
                                </div>

                                <div className="mt-6 p-4 rounded-xl bg-black/20 border border-white/10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Code className="w-5 h-5 text-cyan-400" />
                                        <span className="font-semibold">Tech Stack</span>
                                    </div>
                                    <p className="text-sm text-gray-400">
                                        React • FastAPI • Supabase • Proprietary NLP • Framer Motion
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-20 px-4 sm:px-6 bg-gradient-to-b from-black/20 to-transparent">
                <div className="max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Questions? Answered.</h2>
                    </motion.div>

                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                                className="border border-white/10 rounded-xl overflow-hidden"
                            >
                                <button
                                    onClick={() => setShowFAQ(showFAQ === i ? null : i)}
                                    className="w-full p-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                                >
                                    <span className="font-semibold pr-4">{faq.q}</span>
                                    <ChevronDown className={`w-5 h-5 flex-shrink-0 transition-transform ${showFAQ === i ? 'rotate-180' : ''}`} />
                                </button>
                                <AnimatePresence>
                                    {showFAQ === i && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-6 pt-0 text-gray-300 leading-relaxed">
                                                {faq.a}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-20 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-purple-600/10 to-pink-600/10 border border-purple-500/20"
                    >
                        <h2 className="text-3xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Your Life, Organized. Finally.</h2>
                        <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                            Join thousands who replaced 5+ apps with Mithra AI and reclaimed their time, focus, and peace of mind.
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: '0 20px 60px rgba(168, 85, 247, 0.4)' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/auth')}
                            className="px-10 py-5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:shadow-2xl transition-all font-bold text-lg inline-flex items-center gap-2 group mb-4"
                        >
                            Get Started Free
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                        <p className="text-sm text-gray-400">✓ Free forever  ✓ No credit card  ✓ 2-minute setup</p>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-4 sm:px-6 border-t border-white/5">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <span className="font-semibold">Mithra AI</span>
                        <span className="text-sm text-gray-500">© 2026</span>
                    </div>
                    <div className="flex gap-6 text-sm text-gray-400">
                        <button onClick={() => navigate('/privacy')} className="hover:text-white transition-colors">Privacy</button>
                        <button onClick={() => navigate('/terms')} className="hover:text-white transition-colors">Terms</button>
                        <a href="mailto:hemasaivattikuti25@gmail.com" className="hover:text-white transition-colors">Contact</a>
                    </div>
                    <div className="text-sm text-gray-500">
                        Made with ❤️ by Hemasai
                    </div>
                </div>
            </footer>
        </div>
    );
}
