import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, Brain, CheckCircle2, ChevronRight } from 'lucide-react';

const SCENES = [
    { id: 'chaos', duration: 4000 },
    { id: 'solution', duration: 4500 },
    { id: 'ai', duration: 6000 },
    { id: 'founder', duration: 5000 },
    { id: 'pricing', duration: 4000 },
    { id: 'cta', duration: 5000 }
];

// Reusable Background Effects
const BackgroundGlow = ({ color, x, y }) => (
    <div
        className="absolute w-[40vw] h-[40vw] rounded-full blur-[120px] mix-blend-screen opacity-20"
        style={{
            background: color,
            left: `${x}%`,
            top: `${y}%`,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none'
        }}
    />
);

const Particles = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-cyan-400 rounded-full"
                    initial={{
                        x: `${Math.random() * 100}vw`,
                        y: `${Math.random() * 100}vh`,
                        opacity: Math.random() * 0.5 + 0.2
                    }}
                    animate={{
                        y: [null, `${Math.random() * -20 - 10}vh`],
                        opacity: [null, 0]
                    }}
                    transition={{
                        duration: Math.random() * 3 + 2,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
            ))}
        </div>
    );
};

// --- Scenes ---

const SceneChaos = () => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center justify-center h-full gap-8"
    >
        <BackgroundGlow color="#ef4444" x={50} y={50} />
        <h2 className="text-4xl md:text-6xl font-bold text-white text-center leading-tight">
            You are managing your life <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                across 5 different apps.
            </span>
        </h2>
        <div className="flex gap-4 md:gap-8 flex-wrap justify-center mt-8">
            {['Calendar', 'Tasks', 'Habits', 'Notes', 'Timers'].map((app, i) => (
                <motion.div
                    key={app}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: i * 0.15, type: "spring" }}
                    className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl text-gray-400 text-lg md:text-xl font-medium shadow-2xl relative overflow-hidden"
                >
                    {app}
                    <motion.div
                        initial={{ opacity: 0, rotate: -15 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        transition={{ delay: 2.5 }}
                        className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm text-red-500 text-3xl font-bold"
                    >
                        ✕
                    </motion.div>
                </motion.div>
            ))}
        </div>
    </motion.div>
);

const SceneSolution = () => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center justify-center h-full gap-8"
    >
        <BackgroundGlow color="#06b6d4" x={30} y={40} />
        <BackgroundGlow color="#3b82f6" x={70} y={60} />
        
        <motion.div 
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", bounce: 0.5, duration: 1 }}
            className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] bg-gradient-to-br from-cyan-400 to-blue-600 p-1 shadow-[0_0_80px_rgba(6,182,212,0.4)]"
        >
            <img src="/assets/logo.png" alt="Mithra Logo" className="w-full h-full rounded-[1.8rem]" />
        </motion.div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400 tracking-tight text-center">
            Mithra Life OS
        </h1>
        <p className="text-xl md:text-2xl text-cyan-400 font-medium tracking-wide uppercase">
            The Ultimate All-in-One System
        </p>
        
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex flex-wrap justify-center gap-3 mt-6"
        >
            {['React', 'FastAPI', 'Neon DB', 'AI Powered'].map(tag => (
                <span key={tag} className="px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-sm font-mono">
                    {tag}
                </span>
            ))}
        </motion.div>
    </motion.div>
);

const SceneAI = () => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center justify-center h-full gap-8 w-full max-w-4xl mx-auto px-6"
    >
        <BackgroundGlow color="#a855f7" x={50} y={50} />
        
        <div className="text-center mb-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
                <Brain className="text-purple-400 w-10 h-10" /> Meet Dost AI
            </h2>
            <p className="text-xl text-gray-400">An AI companion with full memory of your journals and habits.</p>
        </div>

        <div className="w-full bg-[#121212]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-cyan-500" />
            
            <motion.div 
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex gap-4 justify-end mb-8"
            >
                <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-4 rounded-2xl rounded-tr-sm shadow-lg max-w-[80%] text-lg">
                    Why have I been so unmotivated this week?
                </div>
            </motion.div>

            <motion.div 
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="flex gap-4 items-start"
            >
                <img src="/assets/logo.png" className="w-10 h-10 rounded-xl shadow-lg shrink-0" />
                <div className="bg-purple-500/10 border border-purple-500/20 text-gray-200 px-6 py-5 rounded-2xl rounded-tl-sm shadow-lg max-w-[85%] text-lg leading-relaxed">
                    <p className="mb-4">Based on your journals, you've missed your morning workout for 4 days straight and your sleep score dropped.</p>
                    <p>I've proactively cleared your Thursday morning to let you rest. Want me to reschedule your deep work block?</p>
                </div>
            </motion.div>
        </div>
    </motion.div>
);

const SceneFounder = () => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col md:flex-row items-center justify-center h-full gap-12 max-w-5xl mx-auto px-6"
    >
        <BackgroundGlow color="#f59e0b" x={20} y={50} />
        
        <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="relative"
        >
            <div className="absolute -inset-2 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-full blur-xl opacity-50" />
            <img src="/assets/hemasai.jpeg" alt="Hemasai Vattikuti" className="w-48 h-48 md:w-64 md:h-64 object-cover rounded-full border-4 border-[#0a0a0a] relative z-10" />
        </motion.div>

        <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-2">Built Solo by <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Hemasai Vattikuti</span></h2>
            <p className="text-xl text-gray-400 mb-8">From scratch. Zero funding. 100% passion.</p>
            
            <div className="grid grid-cols-2 gap-4">
                {[
                    { label: 'Early Signups', value: '900+' },
                    { label: 'Uptime', value: '99.9%' },
                    { label: 'Shipped Features', value: '20+' },
                    { label: 'Team Size', value: '1' }
                ].map((stat, i) => (
                    <motion.div 
                        key={stat.label}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 + (i * 0.1) }}
                        className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-md"
                    >
                        <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.value}</div>
                        <div className="text-xs md:text-sm text-cyan-400 uppercase tracking-wider font-semibold">{stat.label}</div>
                    </motion.div>
                ))}
            </div>
        </div>
    </motion.div>
);

const ScenePricing = () => (
    <motion.div
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center justify-center h-full gap-8 text-center"
    >
        <BackgroundGlow color="#10b981" x={50} y={50} />
        
        <h2 className="text-3xl text-gray-400 font-medium uppercase tracking-widest mb-4">Pricing</h2>
        
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-6xl md:text-8xl font-bold text-gray-600 line-through decoration-red-500/50"
        >
            ₹999/mo
        </motion.div>
        
        <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, type: "spring", bounce: 0.6 }}
            className="text-7xl md:text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 drop-shadow-[0_0_40px_rgba(16,185,129,0.3)]"
        >
            FREE
        </motion.div>
        
        <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 flex flex-col gap-4 text-xl md:text-2xl text-gray-300"
        >
            <div className="flex items-center justify-center gap-3"><CheckCircle2 className="text-emerald-400 w-6 h-6" /> No credit card required</div>
            <div className="flex items-center justify-center gap-3"><CheckCircle2 className="text-emerald-400 w-6 h-6" /> All premium AI features included</div>
        </motion.div>
    </motion.div>
);

const SceneCTA = () => (
    <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center justify-center h-full gap-10"
    >
        <BackgroundGlow color="#06b6d4" x={50} y={50} />
        
        <img src="/assets/logo.png" alt="Mithra" className="w-32 h-32 rounded-[2rem] shadow-[0_0_60px_rgba(6,182,212,0.5)] animate-pulse" />
        
        <h1 className="text-5xl md:text-7xl font-bold text-white text-center tracking-tight">
            Take control of your life.
        </h1>
        
        <Link 
            to="/auth" 
            className="mt-4 group relative inline-flex items-center justify-center px-10 py-5 font-bold text-white transition-all duration-200 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full hover:scale-105 active:scale-95 text-xl shadow-[0_0_40px_rgba(6,182,212,0.4)]"
        >
            Get Started For Free
            <ChevronRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </Link>
        
        <p className="text-gray-500 font-mono text-sm tracking-widest uppercase mt-8">
            mithra-lifeos.com
        </p>
    </motion.div>
);

// --- Main Component ---

export default function PromoVideo() {
    const [currentScene, setCurrentScene] = useState(0);
    const [playing, setPlaying] = useState(false);
    const timerRef = useRef(null);

    const startShowcase = () => {
        setPlaying(true);
        setCurrentScene(0);
    };

    const stopShowcase = () => {
        setPlaying(false);
        if (timerRef.current) clearTimeout(timerRef.current);
        setCurrentScene(0);
    };

    useEffect(() => {
        if (!playing) return;
        
        const advanceScene = () => {
            setCurrentScene(prev => {
                if (prev >= SCENES.length - 1) {
                    setPlaying(false);
                    return 0;
                }
                return prev + 1;
            });
        };

        timerRef.current = setTimeout(advanceScene, SCENES[currentScene].duration);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [currentScene, playing]);

    const renderScene = () => {
        switch (SCENES[currentScene].id) {
            case 'chaos': return <SceneChaos key="chaos" />;
            case 'solution': return <SceneSolution key="solution" />;
            case 'ai': return <SceneAI key="ai" />;
            case 'founder': return <SceneFounder key="founder" />;
            case 'pricing': return <ScenePricing key="pricing" />;
            case 'cta': return <SceneCTA key="cta" />;
            default: return null;
        }
    };

    return (
       <div className="fixed inset-0 bg-[#060810] text-white font-sans overflow-hidden" style={{ fontFamily: "'Outfit', sans-serif" }} data-theme="dark">
            {/* Top Navigation Bar */}
            <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50">
                <Link to="/" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 font-medium bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
                    <ChevronRight className="rotate-180 w-4 h-4" /> Back to App
                </Link>
                
                {playing ? (
                    <button 
                        onClick={stopShowcase}
                        className="text-red-400 hover:text-red-300 font-medium bg-red-500/10 px-6 py-2 rounded-full border border-red-500/20 transition-colors"
                    >
                        Stop Showcase
                    </button>
                ) : (
                    <Link to="/auth" className="text-white font-medium bg-white/10 hover:bg-white/20 px-6 py-2 rounded-full border border-white/20 transition-colors">
                        Sign In
                    </Link>
                )}
            </div>

            {/* Main Stage */}
            <div className="w-full h-full relative flex items-center justify-center">
                <Particles />
                
                {playing ? (
                    <div className="w-full h-full relative z-10">
                        <AnimatePresence mode="wait">
                            {renderScene()}
                        </AnimatePresence>
                        
                        {/* Progress Bar */}
                        <div className="absolute bottom-0 left-0 w-full h-2 bg-white/5">
                            <motion.div 
                                key={`progress-${currentScene}`}
                                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: SCENES[currentScene].duration / 1000, ease: "linear" }}
                            />
                        </div>
                    </div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center z-10 max-w-2xl text-center px-6"
                    >
                        <div className="w-24 h-24 mb-8 rounded-[2rem] bg-gradient-to-br from-cyan-400 to-blue-600 p-1 shadow-[0_0_60px_rgba(6,182,212,0.4)]">
                            <img src="/assets/logo.png" className="w-full h-full rounded-[1.8rem]" />
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">Mithra Life OS</h1>
                        <p className="text-xl text-gray-400 mb-12">Experience the future of personal productivity in a cinematic 30-second showcase.</p>
                        
                        <button 
                            onClick={startShowcase}
                            className="group flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full font-bold text-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                        >
                            <Sparkles className="text-black group-hover:rotate-12 transition-transform" />
                            Play Showcase
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
