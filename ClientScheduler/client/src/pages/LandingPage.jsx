import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Calendar, CheckSquare, Brain, BarChart3, Flame,
    BookOpen, Sparkles, ArrowRight, Zap, Shield, Clock,
    Users, TrendingUp, Star, Check, X, ChevronDown
} from 'lucide-react';

export default function LandingPage() {
    const navigate = useNavigate();
    const { scrollYProgress } = useScroll();
    const [activeTab, setActiveTab] = useState('tasks');
    const [showFAQ, setShowFAQ] = useState(null);

    // Parallax effect for hero
    const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -50]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.3]);

    const features = [
        {
            id: 'tasks',
            icon: CheckSquare,
            title: 'Smart Tasks',
            description: 'Organize with priorities, due dates, subtasks, and smart lists.',
            demo: 'Create, organize, and conquer your to-do list with drag-and-drop, filters, and AI suggestions.'
        },
        {
            id: 'habits',
            icon: Flame,
            title: 'Habit Tracking',
            description: 'Build streaks, track consistency, and never break the chain.',
            demo: 'Daily check-ins, streak tracking, and visual progress charts keep you motivated.'
        },
        {
            id: 'calendar',
            icon: Calendar,
            title: 'Unified Calendar',
            description: 'Time-blocking, events, and Google Calendar sync in one view.',
            demo: 'See your entire schedule with day, week, and month views. Drag to reschedule.'
        },
        {
            id: 'ai',
            icon: Brain,
            title: 'AI Assistant (Dost)',
            description: 'Context-aware AI that knows your tasks, habits, and helps plan your week.',
            demo: 'Ask "Plan my week" and get a personalized schedule. Dost knows your workload.'
        },
        {
            id: 'journal',
            icon: BookOpen,
            title: 'Journal & Mood',
            description: 'Daily reflections, mood tracking, and AI-powered insights.',
            demo: 'Track emotions, journal thoughts, and see patterns over time with analytics.'
        },
        {
            id: 'focus',
            icon: Clock,
            title: 'Focus Timer',
            description: 'Pomodoro technique with deep work sessions and break reminders.',
            demo: '25-min focus sessions with 5-min breaks. Track total focus time daily.'
        }
    ];

    const stats = [
        { label: 'Features', value: '6-in-1', icon: Zap },
        { label: 'Price', value: 'Free', icon: Shield },
        { label: 'AI-Powered', value: '100%', icon: Brain }
    ];

    const comparison = [
        { feature: 'Tasks & Projects', mithra: true, notion: true, todoist: true, motion: true },
        { feature: 'Habit Tracking', mithra: true, notion: false, todoist: false, motion: false },
        { feature: 'Calendar Integration', mithra: true, notion: false, todoist: false, motion: true },
        { feature: 'Journal & Mood', mithra: true, notion: true, todoist: false, motion: false },
        { feature: 'Focus Timer', mithra: true, notion: false, todoist: false, motion: false },
        { feature: 'Context-Aware AI', mithra: true, notion: false, todoist: false, motion: true },
        { feature: 'Multi-Day Planning', mithra: true, notion: false, todoist: false, motion: true },
        { feature: 'Price', mithra: 'Free', notion: 'Free/$10', todoist: 'Free/$5', motion: '$34/mo' }
    ];

    const faqs = [
        {
            q: 'Is Mithra AI really free?',
            a: 'Yes! Completely free with no hidden costs. We believe productivity tools should be accessible to everyone.'
        },
        {
            q: 'How is the AI different from ChatGPT?',
            a: 'Dost (our AI) knows your actual tasks, habits, and mood. It gives personalized advice based on YOUR data, not generic responses.'
        },
        {
            q: 'Can I use it offline?',
            a: 'Yes! All your data is stored locally. The AI features require internet, but core functionality works offline.'
        },
        {
            q: 'Is my data private?',
            a: 'Absolutely. Your data is encrypted and stored securely. We never sell or share your information.'
        },
        {
            q: 'Do you have a mobile app?',
            a: 'The web app works great on mobile browsers. A native app is coming soon!'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#0F0F0F] to-[#1A1A1A] text-white overflow-x-hidden">
            {/* Fixed Navigation */}
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className="fixed top-0 w-full z-50 backdrop-blur-xl bg-black/20 border-b border-white/5"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <motion.div
                            whileHover={{ rotate: 180 }}
                            transition={{ duration: 0.3 }}
                            className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C2185B] to-[#880E4F] flex items-center justify-center"
                        >
                            <Sparkles className="w-6 h-6" />
                        </motion.div>
                        <span className="text-xl font-bold hidden sm:block">Mithra AI</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                            className="hidden md:block text-gray-300 hover:text-white transition-colors"
                        >
                            Features
                        </button>
                        <button
                            onClick={() => document.getElementById('comparison').scrollIntoView({ behavior: 'smooth' })}
                            className="hidden md:block text-gray-300 hover:text-white transition-colors"
                        >
                            Compare
                        </button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/auth')}
                            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C2185B] to-[#880E4F] hover:shadow-lg hover:shadow-[#C2185B]/20 transition-all font-medium"
                        >
                            Get Started Free
                        </motion.button>
                    </div>
                </div>
            </motion.nav>

            {/* Hero Section with Parallax */}
            <section className="pt-32 pb-20 px-4 sm:px-6 relative overflow-hidden">
                {/* Animated background gradient */}
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#C2185B] rounded-full filter blur-[128px] animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#880E4F] rounded-full filter blur-[128px] animate-pulse" style={{ animationDelay: '1s' }} />
                </div>

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
                            <Zap className="w-4 h-4 text-[#C2185B]" />
                            <span className="text-sm">Your AI-Powered Life Operating System</span>
                        </motion.div>

                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent leading-tight">
                            Master Your Life<br />with AI Intelligence
                        </h1>

                        <p className="text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl mx-auto px-4">
                            Tasks, Habits, Calendar, Journal, Focus Timer, and AI Assistant — all in one beautiful app.
                            <span className="text-[#C2185B] font-semibold"> Completely free.</span>
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 px-4">
                            <motion.button
                                whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(194, 24, 91, 0.3)' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/auth')}
                                className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#C2185B] to-[#880E4F] hover:shadow-2xl transition-all font-semibold text-lg flex items-center justify-center gap-2 group"
                            >
                                Start Free Now
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => document.getElementById('demo').scrollIntoView({ behavior: 'smooth' })}
                                className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-semibold text-lg"
                            >
                                See Demo
                            </motion.button>
                        </div>

                        {/* Animated Stats */}
                        <div className="flex flex-wrap gap-6 sm:gap-8 justify-center">
                            {stats.map((stat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + i * 0.1 }}
                                    className="text-center"
                                >
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <stat.icon className="w-6 h-6 text-[#C2185B]" />
                                        <div className="text-2xl sm:text-3xl font-bold text-[#C2185B]">{stat.value}</div>
                                    </div>
                                    <div className="text-sm text-gray-500">{stat.label}</div>
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

            {/* Interactive Demo Section */}
            <section id="demo" className="py-20 px-4 sm:px-6 bg-gradient-to-b from-transparent to-black/20">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">See It In Action</h2>
                        <p className="text-gray-400 text-lg">Click on each feature to explore</p>
                    </motion.div>

                    {/* Feature Tabs */}
                    <div className="flex flex-wrap gap-3 justify-center mb-8">
                        {features.map((feature) => (
                            <motion.button
                                key={feature.id}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setActiveTab(feature.id)}
                                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${activeTab === feature.id
                                        ? 'bg-gradient-to-r from-[#C2185B] to-[#880E4F] shadow-lg'
                                        : 'bg-white/5 hover:bg-white/10'
                                    }`}
                            >
                                <feature.icon className="w-4 h-4" />
                                <span className="text-sm font-medium hidden sm:inline">{feature.title}</span>
                            </motion.button>
                        ))}
                    </div>

                    {/* Demo Content */}
                    <AnimatePresence mode="wait">
                        {features.map((feature) => (
                            activeTab === feature.id && (
                                <motion.div
                                    key={feature.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10"
                                >
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C2185B]/20 to-[#880E4F]/20 flex items-center justify-center flex-shrink-0">
                                            <feature.icon className="w-6 h-6 text-[#C2185B]" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
                                            <p className="text-gray-400">{feature.description}</p>
                                        </div>
                                    </div>
                                    <div className="mt-6 p-6 rounded-xl bg-black/20 border border-white/5">
                                        <p className="text-gray-300">{feature.demo}</p>
                                    </div>
                                </motion.div>
                            )
                        ))}
                    </AnimatePresence>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-20 px-4 sm:px-6">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything You Need</h2>
                        <p className="text-gray-400 text-lg">Six powerful tools, one seamless experience</p>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
                                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#C2185B]/30 transition-all group cursor-pointer"
                            >
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C2185B]/20 to-[#880E4F]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <feature.icon className="w-6 h-6 text-[#C2185B]" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                <p className="text-gray-400 text-sm">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Comparison Table */}
            <section id="comparison" className="py-20 px-4 sm:px-6 bg-gradient-to-b from-black/20 to-transparent">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">How We Compare</h2>
                        <p className="text-gray-400 text-lg">See why Mithra AI is the best choice</p>
                    </motion.div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left p-4 text-gray-400 font-medium">Feature</th>
                                    <th className="p-4 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Sparkles className="w-6 h-6 text-[#C2185B]" />
                                            <span className="font-bold text-white">Mithra AI</span>
                                        </div>
                                    </th>
                                    <th className="p-4 text-center text-gray-400">Notion</th>
                                    <th className="p-4 text-center text-gray-400">Todoist</th>
                                    <th className="p-4 text-center text-gray-400">Motion</th>
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
                                        <td className="p-4 text-gray-300">{row.feature}</td>
                                        <td className="p-4 text-center">
                                            {typeof row.mithra === 'boolean' ? (
                                                row.mithra ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-gray-600 mx-auto" />
                                            ) : (
                                                <span className="text-[#C2185B] font-semibold">{row.mithra}</span>
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
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 px-4 sm:px-6">
                <div className="max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
                    </motion.div>

                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="border border-white/10 rounded-xl overflow-hidden"
                            >
                                <button
                                    onClick={() => setShowFAQ(showFAQ === i ? null : i)}
                                    className="w-full p-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                                >
                                    <span className="font-semibold">{faq.q}</span>
                                    <ChevronDown className={`w-5 h-5 transition-transform ${showFAQ === i ? 'rotate-180' : ''}`} />
                                </button>
                                <AnimatePresence>
                                    {showFAQ === i && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-6 pt-0 text-gray-400">
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
                        className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#C2185B]/10 to-[#880E4F]/10 border border-[#C2185B]/20"
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Master Your Life?</h2>
                        <p className="text-gray-400 text-lg mb-8">Join thousands optimizing their productivity with AI</p>
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: '0 20px 60px rgba(194, 24, 91, 0.4)' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/auth')}
                            className="px-10 py-5 rounded-xl bg-gradient-to-r from-[#C2185B] to-[#880E4F] hover:shadow-2xl transition-all font-bold text-lg inline-flex items-center gap-2 group"
                        >
                            Get Started Free
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                        <p className="text-sm text-gray-500 mt-4">No credit card required • Free forever</p>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-4 sm:px-6 border-t border-white/5">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C2185B] to-[#880E4F] flex items-center justify-center">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <span className="font-semibold">Mithra AI</span>
                    </div>
                    <div className="flex gap-6 text-sm text-gray-400">
                        <button onClick={() => navigate('/privacy')} className="hover:text-white transition-colors">Privacy</button>
                        <button onClick={() => navigate('/terms')} className="hover:text-white transition-colors">Terms</button>
                    </div>
                    <div className="text-sm text-gray-500">
                        © 2026 Mithra AI. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
