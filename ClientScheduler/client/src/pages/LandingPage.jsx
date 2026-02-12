import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Calendar, CheckSquare, Brain, BarChart3, Flame,
    BookOpen, Sparkles, ArrowRight, Zap, Shield, Clock
} from 'lucide-react';

export default function LandingPage() {
    const navigate = useNavigate();

    const features = [
        {
            icon: CheckSquare,
            title: 'Smart Tasks',
            description: 'Organize, prioritize, and conquer your to-do list with intelligent task management.'
        },
        {
            icon: Flame,
            title: 'Habit Tracking',
            description: 'Build lasting habits with streak tracking and daily reminders.'
        },
        {
            icon: Calendar,
            title: 'Unified Calendar',
            description: 'See your entire schedule at a glance with time-blocking and event management.'
        },
        {
            icon: Brain,
            title: 'AI Assistant (Dost)',
            description: 'Your personal AI companion that knows your tasks, habits, and helps you plan your week.'
        },
        {
            icon: BookOpen,
            title: 'Journal & Mood',
            description: 'Track your thoughts, emotions, and reflect on your journey.'
        },
        {
            icon: Clock,
            title: 'Focus Timer',
            description: 'Pomodoro timer with deep work sessions to maximize productivity.'
        }
    ];

    const stats = [
        { label: 'All-in-One', value: '6 Apps' },
        { label: 'Price', value: 'Free' },
        { label: 'AI-Powered', value: '100%' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#0F0F0F] to-[#1A1A1A] text-white overflow-x-hidden">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-black/20 border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C2185B] to-[#880E4F] flex items-center justify-center">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <span className="text-xl font-bold">Mithra AI</span>
                    </div>
                    <button
                        onClick={() => navigate('/auth')}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C2185B] to-[#880E4F] hover:shadow-lg hover:shadow-[#C2185B]/20 transition-all font-medium"
                    >
                        Get Started Free
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6">
                <div className="max-w-6xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
                            <Zap className="w-4 h-4 text-[#C2185B]" />
                            <span className="text-sm">Your AI-Powered Life Operating System</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent leading-tight">
                            Master Your Life<br />with AI Intelligence
                        </h1>

                        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                            Tasks, Habits, Calendar, Journal, Focus Timer, and AI Assistant — all in one beautiful app.
                            <span className="text-[#C2185B] font-semibold"> Completely free.</span>
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                            <button
                                onClick={() => navigate('/auth')}
                                className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#C2185B] to-[#880E4F] hover:shadow-2xl hover:shadow-[#C2185B]/30 transition-all font-semibold text-lg flex items-center justify-center gap-2 group"
                            >
                                Start Free Now
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                                className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-semibold text-lg"
                            >
                                Learn More
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="flex flex-wrap gap-8 justify-center">
                            {stats.map((stat, i) => (
                                <div key={i} className="text-center">
                                    <div className="text-3xl font-bold text-[#C2185B] mb-1">{stat.value}</div>
                                    <div className="text-sm text-gray-500">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Everything You Need</h2>
                        <p className="text-gray-400 text-lg">Six powerful tools, one seamless experience</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#C2185B]/30 transition-all group"
                            >
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C2185B]/20 to-[#880E4F]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <feature.icon className="w-6 h-6 text-[#C2185B]" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                <p className="text-gray-400">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Mithra Section */}
            <section className="py-20 px-6 bg-gradient-to-b from-transparent to-black/20">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold mb-4">Why Mithra AI?</h2>
                        <p className="text-gray-400 text-lg">The only free Life OS with AI that actually knows you</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#C2185B] to-[#880E4F] flex items-center justify-center mx-auto mb-4">
                                <Brain className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Context-Aware AI</h3>
                            <p className="text-gray-400">Dost knows your tasks, habits, and mood. Get personalized advice, not generic responses.</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#C2185B] to-[#880E4F] flex items-center justify-center mx-auto mb-4">
                                <Shield className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">100% Free</h3>
                            <p className="text-gray-400">No subscriptions, no hidden fees. Competitors charge $20-50/month for similar features.</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#C2185B] to-[#880E4F] flex items-center justify-center mx-auto mb-4">
                                <BarChart3 className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">All-in-One</h3>
                            <p className="text-gray-400">Replace 6 separate apps with one beautiful, unified Life OS.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="p-12 rounded-3xl bg-gradient-to-br from-[#C2185B]/10 to-[#880E4F]/10 border border-[#C2185B]/20"
                    >
                        <h2 className="text-4xl font-bold mb-4">Ready to Master Your Life?</h2>
                        <p className="text-gray-400 text-lg mb-8">Join thousands of users optimizing their productivity with AI</p>
                        <button
                            onClick={() => navigate('/auth')}
                            className="px-10 py-5 rounded-xl bg-gradient-to-r from-[#C2185B] to-[#880E4F] hover:shadow-2xl hover:shadow-[#C2185B]/40 transition-all font-bold text-lg inline-flex items-center gap-2 group"
                        >
                            Get Started Free
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-6 border-t border-white/5">
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
