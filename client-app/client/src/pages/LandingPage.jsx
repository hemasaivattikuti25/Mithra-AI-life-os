import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Check, Github, Menu, X, Layout, Calendar, BookOpen, Clock, Zap,
  Brain, Users, Linkedin, Globe, Rocket, Sparkles, Shield, TrendingUp
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;

  const features = [
    {
      title: 'Smart Task Management',
      desc: 'Subtasks, priorities, recurring schedules, and Kanban views.',
      icon: Layout,
      gradient: 'from-blue-500 to-cyan-500',
      delay: 0,
    },
    {
      title: 'Unified Calendar',
      desc: 'Sync with Google Calendar. Time-block your day intelligently.',
      icon: Calendar,
      gradient: 'from-purple-500 to-pink-500',
      delay: 0.1,
    },
    {
      title: 'Habit Tracking',
      desc: 'GitHub-style heatmaps, streaks, and focus timers.',
      icon: Zap,
      gradient: 'from-orange-500 to-yellow-500',
      delay: 0.2,
    },
    {
      title: 'Dost AI Companion',
      desc: 'RAG-powered AI that remembers your tasks, moods, and goals.',
      icon: Brain,
      gradient: 'from-indigo-500 to-purple-500',
      delay: 0.3,
    },
    {
      title: 'Daily Journaling',
      desc: 'Track emotions with mood scores and AI sentiment analysis.',
      icon: BookOpen,
      gradient: 'from-red-500 to-pink-500',
      delay: 0.4,
    },
    {
      title: 'Mithra Blend',
      desc: 'Share workspaces with friends. Track accountability together.',
      icon: Users,
      gradient: 'from-teal-500 to-cyan-500',
      delay: 0.5,
    },
  ];

  return (
    <div className={`min-h-screen overflow-hidden ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
      {/* Animated Background Gradient */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-gradient-to-br from-white via-slate-50 to-white'}`} />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute top-0 right-0 w-[500px] h-[500px] opacity-20 pointer-events-none"
          style={{
            background: isDark ? 'radial-gradient(circle, rgba(34,211,238,0.3) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-0 left-0 w-[500px] h-[500px] opacity-20 pointer-events-none"
          style={{
            background: isDark ? 'radial-gradient(circle, rgba(168,85,247,0.3) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
      </div>

      {/* Navbar */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-colors ${isDark ? 'bg-slate-950/80 border-slate-800/50' : 'bg-white/80 border-slate-200/50'}`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <img src="/assets/logo.svg" alt="Mithra" className="w-7 h-7 rounded-lg shadow-lg" />
            <span className={`font-bold text-lg ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
              Mithra <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">Life OS</span>
            </span>
          </motion.div>

          <div className="hidden md:flex items-center gap-8 text-sm">
            {['Features', 'How It Works', 'About'].map((item) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                className={`font-medium transition-colors hover:text-cyan-500 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
                whileHover={{ scale: 1.05 }}
              >
                {item}
              </motion.a>
            ))}
            <motion.button
              onClick={() => navigate('/auth')}
              className={`font-semibold transition-colors ${isDark ? 'text-slate-400 hover:text-slate-50' : 'text-slate-600 hover:text-slate-900'}`}
              whileHover={{ scale: 1.05 }}
            >
              Log in
            </motion.button>
            <motion.button
              onClick={() => navigate('/auth')}
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(6,182,212,0.6)' }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started
            </motion.button>
          </div>

          <button className={`md:hidden ${isDark ? 'text-slate-400' : 'text-slate-600'}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`md:hidden border-t px-6 py-4 space-y-3 ${isDark ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200'}`}
          >
            <a href="#features" className={`block py-2 font-medium ${isDark ? 'text-slate-400 hover:text-slate-50' : 'text-slate-600 hover:text-slate-900'}`}>Features</a>
            <a href="#how-it-works" className={`block py-2 font-medium ${isDark ? 'text-slate-400 hover:text-slate-50' : 'text-slate-600 hover:text-slate-900'}`}>How It Works</a>
            <button onClick={() => { setIsMenuOpen(false); navigate('/auth'); }} className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-2.5 rounded-lg font-semibold">Get Started</button>
          </motion.div>
        )}
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6 min-h-screen flex items-center justify-center">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 mb-6">
              <Sparkles size={16} className="text-cyan-500" />
              <span className="text-sm font-medium text-cyan-500">Introducing Mithra Life OS</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className={`text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight ${isDark ? 'text-slate-50' : 'text-slate-900'}`}
          >
            One Workspace.
            <br />
            <span className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 bg-clip-text text-transparent animate-pulse">Your Entire Life.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={`text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}
          >
            Master your tasks, habits, and emotions with AI. Sync with your calendar, journal beautifully, and stay accountable with friends.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <motion.button
              onClick={() => navigate('/auth')}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold flex items-center gap-2 hover:shadow-2xl hover:shadow-cyan-500/50 transition-all"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Free <ArrowRight size={20} />
            </motion.button>
            <motion.a
              href="https://github.com/hemasaivattikuti25/Mithra-AI-life-os"
              target="_blank"
              rel="noreferrer"
              className={`px-8 py-4 border-2 rounded-xl font-semibold flex items-center gap-2 transition-all ${isDark ? 'border-slate-700 text-slate-200 hover:bg-slate-800/50' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Github size={20} /> GitHub
            </motion.a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className={`grid grid-cols-3 gap-6 max-w-2xl mx-auto pt-12 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}
          >
            {[
              { value: '690+', label: 'Active Users' },
              { value: '7+', label: 'Features' },
              { value: '100%', label: 'Zero-Trust' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 + i * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">{stat.value}</div>
                <div className={`text-sm mt-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={`py-24 px-6 ${isDark ? 'bg-gradient-to-b from-slate-900/50 to-slate-950' : 'bg-gradient-to-b from-slate-50 to-white'}`}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className={`text-5xl md:text-6xl font-bold mb-6 ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>Powerful Features</h2>
            <p className={`text-xl ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Everything built for elite productivity</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <FeatureCard key={i} {...feature} isDark={isDark} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className={`text-5xl md:text-6xl font-bold text-center mb-16 ${isDark ? 'text-slate-50' : 'text-slate-900'}`}
          >
            Get Started in 3 Steps
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Sign Up', desc: 'Create free account in 30 seconds', icon: Rocket },
              { step: '02', title: 'Build Your Life', desc: 'Add tasks, habits, goals, journals', icon: TrendingUp },
              { step: '03', title: 'Stay Accountable', desc: 'Share with friends, track together', icon: Users },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                viewport={{ once: true }}
                className={`relative p-8 rounded-2xl border transition-all hover:shadow-xl ${isDark ? 'border-slate-800 bg-slate-900/50 hover:bg-slate-800/50' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'}`}
              >
                <div className={`text-4xl font-bold mb-4 bg-gradient-to-r ${i === 0 ? 'from-blue-500 to-cyan-500' : i === 1 ? 'from-purple-500 to-pink-500' : 'from-orange-500 to-red-500'} bg-clip-text text-transparent`}>{item.step}</div>
                <h3 className={`text-2xl font-bold mb-2 ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>{item.title}</h3>
                <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Companion */}
      <section className={`py-24 px-6 ${isDark ? 'bg-gradient-to-b from-slate-900/50 to-slate-950' : 'bg-gradient-to-b from-slate-50 to-white'}`}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 mb-6">
                <Sparkles size={16} className="text-purple-500" />
                <span className="text-sm font-medium text-purple-500">AI-Powered</span>
              </div>
              <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>Dost: Your AI Companion</h2>
              <p className={`text-lg mb-8 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Unlike ordinary chatbots, Dost remembers your entire life. Using RAG (Retrieval Augmented Generation), it builds a deep understanding of your tasks, moods, and goals.
              </p>
              <ul className="space-y-4">
                {['RAG-powered memory', 'Stoic guidance', 'Smart scheduling'].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3"
                  >
                    <Check size={24} className="text-cyan-500 flex-shrink-0" />
                    <span className={`text-lg ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{item}</span>
                  </motion.div>
                ))}
              </ul>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className={`rounded-2xl p-6 border ${isDark ? 'border-slate-800 bg-gradient-to-br from-slate-900/50 to-slate-800/50' : 'border-slate-200 bg-gradient-to-br from-white to-slate-50'}`}
            >
              <div className={`text-sm font-semibold mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Sample Conversation</div>
              <div className="space-y-4">
                <div className={`p-4 rounded-lg text-sm ${isDark ? 'bg-slate-700/50 text-slate-200' : 'bg-slate-200/50 text-slate-700'}`}>
                  I'm feeling stressed about the deadline...
                </div>
                <div className="p-4 rounded-lg text-sm bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-slate-50">
                  Based on your journal, you handle pressure well. Let me block 2-hour focus slots tomorrow. What time works?
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className={`text-5xl font-bold text-center mb-16 ${isDark ? 'text-slate-50' : 'text-slate-900'}`}
          >
            Built by Engineers
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className={`rounded-2xl p-12 border ${isDark ? 'border-slate-800 bg-gradient-to-br from-slate-900/50 to-slate-800/50' : 'border-slate-200 bg-gradient-to-br from-slate-50 to-white'}`}
          >
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <img src="/assets/hemasai.jpeg" alt="Hemasai" className="w-32 h-32 rounded-xl object-cover shadow-lg flex-shrink-0" />
              <div className="flex-1">
                <h3 className={`text-3xl font-bold mb-1 ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>Hemasai Vattikuti</h3>
                <p className="text-cyan-500 font-semibold mb-4">Backend & Applied AI Engineer</p>
                <p className={`text-lg leading-relaxed mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Engineered production systems at DRDL–DRDO (Ministry of Defence) with distributed databases and zero-trust security. Now shipping Mithra Life OS to 690+ users with RAG semantic search and enterprise-grade security.
                </p>
                <div className="flex gap-4">
                  <motion.a
                    href="https://github.com/hemasaivattikuti25"
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                    whileHover={{ scale: 1.1 }}
                  >
                    <Github size={20} />
                  </motion.a>
                  <motion.a
                    href="https://linkedin.com/in/hemasai-vattikuti"
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                    whileHover={{ scale: 1.1 }}
                  >
                    <Linkedin size={20} />
                  </motion.a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className={`py-24 px-6 text-center bg-gradient-to-b ${isDark ? 'from-slate-950 to-slate-900' : 'from-white to-slate-50'}`}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className={`text-5xl md:text-6xl font-bold mb-6 ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>Ready to Transform?</h2>
          <p className={`text-xl mb-10 max-w-2xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Join 690+ users. No credit card. Forever free.
          </p>
          <motion.button
            onClick={() => navigate('/auth')}
            className="px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold flex items-center gap-3 mx-auto hover:shadow-2xl hover:shadow-cyan-500/50 transition-all"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started Now <ArrowRight size={20} />
          </motion.button>
        </motion.div>
      </section>
    </div>
  );
}

function FeatureCard({ title, desc, icon: Icon, gradient, delay, isDark }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className={`group relative p-8 rounded-2xl border overflow-hidden transition-all hover:shadow-xl cursor-pointer ${isDark ? 'border-slate-800 bg-slate-900/50 hover:bg-slate-800/50' : 'border-slate-200 bg-white/50 hover:bg-slate-100/50'}`}
      whileHover={{ y: -4 }}
    >
      {/* Gradient Background */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br ${gradient}`} />

      <div className={`relative z-10 w-14 h-14 rounded-lg mb-6 flex items-center justify-center bg-gradient-to-br ${gradient} text-white`}>
        <Icon size={28} />
      </div>

      <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>{title}</h3>
      <p className={`mb-6 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{desc}</p>

      <motion.div
        className="flex items-center gap-2 text-cyan-500 font-semibold group-hover:gap-4 transition-all"
        whileHover={{ x: 8 }}
      >
        Learn More <ArrowRight size={16} />
      </motion.div>
    </motion.div>
  );
}
