import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowRight, Check, ChevronDown, Github,
    Menu, X, Globe, Zap, Shield, Users,
    Layout, Calendar, BookOpen, Clock, Smile
} from 'lucide-react';

export default function LandingPage() {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const features = [
        {
            title: "Task Management",
            desc: "Organize your life with precision.",
            icon: Layout,
            image: "/assets/tasks.png"
        },
        {
            title: "Unified Calendar",
            desc: "Time-blocking made simple.",
            icon: Calendar,
            image: "/assets/calender.png"
        },
        {
            title: "Habit Tracking",
            desc: "Build consistency that lasts.",
            icon: Zap,
            image: "/assets/habbits.png"
        },
        {
            title: "Mood Journal",
            desc: "Reflect and understand yourself.",
            icon: Smile,
            image: "/assets/journals.png"
        },
        {
            title: "Focus Timer",
            desc: "Deep work, distraction free.",
            icon: Clock,
            image: "/assets/focus_timer.png"
        },
        {
            title: "Dost AI",
            desc: "Your personal AI companion.",
            icon: BookOpen,
            image: "/assets/dosth(ai).png"
        }
    ];

    return (
        <div className="min-h-screen bg-white text-black font-sans selection:bg-gray-200">
            {/* Navbar */}
            <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <img src="/assets/logo.png" alt="Mithra" className="w-8 h-8 rounded-lg" />
                        <span className="font-semibold text-lg tracking-tight">Mithra AI</span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
                        <a href="#features" className="hover:text-black transition-colors">Product</a>
                        <a href="#about" className="hover:text-black transition-colors">About</a>
                        <a href="https://github.com/hemasaivattikuti25/Mithra-AI-life-os" target="_blank" rel="noreferrer" className="hover:text-black transition-colors">GitHub</a>
                        <div className="h-4 w-px bg-gray-200"></div>
                        <button onClick={() => navigate('/auth')} className="hover:text-black transition-colors">Log in</button>
                        <button
                            onClick={() => navigate('/auth')}
                            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            Get Mithra free
                        </button>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
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
                        className="fixed inset-0 top-16 bg-white z-40 p-6 md:hidden"
                    >
                        <div className="flex flex-col gap-6 text-lg font-medium text-gray-800">
                            <a href="#features" onClick={() => setIsMenuOpen(false)}>Product</a>
                            <a href="#about" onClick={() => setIsMenuOpen(false)}>About</a>
                            <a href="https://github.com/hemasaivattikuti25/Mithra-AI-life-os" onClick={() => setIsMenuOpen(false)}>GitHub</a>
                            <hr className="border-gray-100" />
                            <div className="flex flex-col gap-4">
                                <button onClick={() => navigate('/auth')}>Log in</button>
                                <button
                                    onClick={() => navigate('/auth')}
                                    className="bg-black text-white px-4 py-3 rounded-lg text-center"
                                >
                                    Get Mithra free
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hero Section */}
            <header className="pt-32 pb-20 px-6 text-center max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
                        One workspace. <br className="hidden md:block" />
                        Your entire life.
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Mithra is the all-in-one workspace for your tasks, habits, notes, and goals.
                        Powered by AI to help you achieve more.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => navigate('/auth')}
                            className="bg-black text-white px-8 py-3 rounded-lg font-medium text-lg hover:bg-gray-800 transition-all flex items-center gap-2 group"
                        >
                            Get Mithra free
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <a
                            href="https://github.com/hemasaivattikuti25/Mithra-AI-life-os"
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 px-8 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors font-medium text-lg text-gray-700"
                        >
                            <Github className="w-5 h-5" />
                            Star on GitHub
                        </a>
                    </div>
                </motion.div>

                {/* Hero Image */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="mt-20 relative"
                >
                    <div className="rounded-xl border border-gray-200 shadow-2xl overflow-hidden bg-gray-50">
                        <img
                            src="/assets/home_1.png"
                            alt="Mithra Dashboard"
                            className="w-full h-auto"
                            loading="eager"
                        />
                    </div>
                    {/* Floating Badge */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-xl border border-gray-100 hidden md:block"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white">
                                <Zap className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold">Boost Productivity</p>
                                <p className="text-xs text-gray-500">By up to 40%</p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </header>

            {/* Social Proof */}
            <section className="border-y border-gray-100 bg-gray-50 py-12">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-8">Trusted by students & builders worldwide</p>
                    <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale">
                        {/* Placeholder logos style */}
                        {['VIT-AP', 'Google', 'Microsoft', 'Notion', 'OpenAI'].map((brand) => (
                            <span key={brand} className="text-xl font-bold font-serif">{brand}</span>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
                <div className="mb-20">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">Everything you need to <br /> run your life.</h2>
                    <p className="text-xl text-gray-500 max-w-2xl">
                        Stop switching between 5 different apps. Mithra brings everything into one unified,
                        distraction-free workspace.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="group p-6 rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all bg-white cursor-default"
                        >
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-black group-hover:text-white transition-colors">
                                <feature.icon className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                            <p className="text-gray-500 mb-6">{feature.desc}</p>
                            <div className="rounded-lg overflow-hidden border border-gray-100 bg-gray-50 aspect-video relative">
                                <img
                                    src={feature.image}
                                    alt={feature.title}
                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    loading="lazy"
                                />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Big Feature Showcase */}
            <section className="py-24 px-6 bg-black text-white">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center gap-16">
                        <div className="flex-1">
                            <div className="inline-block px-3 py-1 bg-gray-800 rounded-full text-xs font-medium mb-6">
                                NEW: DOST AI MODE
                            </div>
                            <h2 className="text-4xl md:text-6xl font-bold mb-6">Your personal AI companion.</h2>
                            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                                Dost isn't just a chatbot. It's a context-aware AI that understands your schedule,
                                your habits, and your mood. Ask it to plan your week, and watch the magic happen.
                            </p>
                            <ul className="space-y-4 text-gray-300 mb-10">
                                <li className="flex items-center gap-3">
                                    <Check className="w-5 h-5 text-white" />
                                    <span>Natural language planning</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Check className="w-5 h-5 text-white" />
                                    <span>Mood-based recommendations</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Check className="w-5 h-5 text-white" />
                                    <span>Privacy-first architecture</span>
                                </li>
                            </ul>
                            <button className="bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                                Try Dost AI
                            </button>
                        </div>
                        <div className="flex-1 w-full">
                            <div className="rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
                                <img src="/assets/dosth(ai).png" alt="Dost AI" className="w-full h-auto opacity-90" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 px-6 border-t border-gray-200">
                <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-6">
                            <img src="/assets/logo.png" alt="Mithra" className="w-6 h-6 rounded" />
                            <span className="font-bold text-lg">Mithra AI</span>
                        </div>
                        <p className="text-gray-500 text-sm mb-6">
                            Designed with precision for students and builders.
                        </p>
                        <div className="flex gap-4 text-gray-400">
                            <Github className="w-5 h-5 cursor-pointer hover:text-black" />
                            <Globe className="w-5 h-5 cursor-pointer hover:text-black" />
                        </div>
                    </div>

                    <div className="col-span-1">
                        <h4 className="font-bold mb-6">Product</h4>
                        <ul className="space-y-4 text-sm text-gray-500">
                            <li><a href="#" className="hover:text-black">Tasks</a></li>
                            <li><a href="#" className="hover:text-black">Calendar</a></li>
                            <li><a href="#" className="hover:text-black">Habits</a></li>
                            <li><a href="#" className="hover:text-black">Dost AI</a></li>
                        </ul>
                    </div>

                    <div className="col-span-1">
                        <h4 className="font-bold mb-6">Resources</h4>
                        <ul className="space-y-4 text-sm text-gray-500">
                            <li><a href="#" className="hover:text-black">Community</a></li>
                            <li><a href="#" className="hover:text-black">Help Center</a></li>
                            <li><a href="#" className="hover:text-black">Blog</a></li>
                            <li><a href="#" className="hover:text-black">Status</a></li>
                        </ul>
                    </div>

                    <div className="col-span-1">
                        <h4 className="font-bold mb-6">Company</h4>
                        <ul className="space-y-4 text-sm text-gray-500">
                            <li><a href="#" className="hover:text-black">About</a></li>
                            <li><a href="#" className="hover:text-black">Careers</a></li>
                            <li><a href="#" className="hover:text-black">Privacy</a></li>
                            <li><a href="#" className="hover:text-black">Terms</a></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                    <p>&copy; 2026 Mithra AI. All rights reserved.</p>
                    <p>Made with ❤️ by Hemasai Vattikuti</p>
                </div>
            </footer>
        </div>
    );
}
