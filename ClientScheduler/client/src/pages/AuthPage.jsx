import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, ChevronLeft, Check, AlertCircle, Loader2, Sparkles, Shield, Zap, Calendar, Heart, Brain, Bot, Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

/* ═══════════════════════════════════════════════════════════════
   MITHRA AUTH — Premium Dark/Cyan Aesthetic
   ═══════════════════════════════════════════════════════════════ */

const heroParticles = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2.5 + 0.5,
  duration: Math.random() * 25 + 10,
  delay: Math.random() * 8,
}));

/* ── Floating Input ── */
const FloatingInput = ({ icon: Icon, type = 'text', placeholder, value, onChange, error, autoFocus }) => {
  const [focused, setFocused] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="relative group">
      <div className={`relative flex items-center rounded-2xl transition-all duration-500 ${error ? 'ring-2 ring-red-500/50' : focused ? 'ring-2 ring-cyan-500/50' : 'ring-1 ring-white/[0.08]'
        }`}
        style={{
          background: focused ? 'rgba(34, 211, 238, 0.05)' : 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="pl-4 pr-2 py-4">
          <Icon size={18} className="transition-colors duration-300" style={{ color: focused ? '#22d3ee' : 'rgba(255,255,255,0.3)' }} />
        </div>
        <input
          type={isPassword ? (showPw ? 'text' : 'password') : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoFocus={autoFocus}
          autoComplete={isPassword ? 'current-password' : type === 'email' ? 'email' : 'off'}
          className="flex-1 bg-transparent py-4 pr-4 text-sm text-white placeholder:text-white/25 outline-none font-medium"
        />
        {isPassword && (
          <button type="button" onClick={() => setShowPw(!showPw)} tabIndex={-1}
            className="pr-4 text-white/30 hover:text-white/60 transition-colors">
            {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      <motion.div
        className="absolute bottom-0 left-1/2 h-[2px] rounded-full -translate-x-1/2 bg-cyan-400"
        animate={{ width: focused ? '60%' : '0%', opacity: focused ? 1 : 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      />
      {error && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1.5 text-xs text-red-400 mt-2 pl-1 font-medium">
          <AlertCircle size={12} /> {error}
        </motion.p>
      )}
    </div>
  );
};

/* ── Password Strength Meter ── */
const PasswordStrength = ({ password }) => {
  const getStrength = (pw) => {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    if (pw.length >= 12) s++;
    return s;
  };
  const strength = getStrength(password);
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
  const colors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#22d3ee'];
  if (!password) return null;
  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2 px-1">
      <div className="flex gap-1 mb-1.5">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex-1 h-1 rounded-full transition-all duration-500"
            style={{ background: i <= strength ? colors[strength] : 'rgba(255,255,255,0.06)' }} />
        ))}
      </div>
      <p className="text-[10px] font-medium tracking-wide" style={{ color: colors[strength] }}>
        {labels[strength]}
      </p>
    </motion.div>
  );
};

/* ── Feature Cards for Hero Panel ── */
const features = [
  { icon: Brain, title: 'Your AI Life Companion', desc: 'Mithra learns your patterns and helps you plan smarter every day' },
  { icon: Calendar, title: 'Unified Dashboard', desc: 'Tasks, habits, journal & calendar — all in one beautiful view' },
  { icon: Flame, title: 'Build Streaks & Habits', desc: 'Track consistency with GitHub-style maps & never break your streak' },
  { icon: Zap, title: 'Dost Focus Mode', desc: 'AI-powered deep work sessions with your personal focus companion' },
];

export default function AuthPage({ isPasswordReset = false }) {
  const navigate = useNavigate();
  const { signIn, signUp, resetPassword, confirmResetPassword, signInWithGoogle } = useAuth();
  const [view, setView] = useState('login');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPw, setConfirmNewPw] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Check for password recovery session on mount
  React.useEffect(() => {
    const isRecovery = sessionStorage.getItem('mithra-password-recovery');
    const recoveryEmail = sessionStorage.getItem('mithra-recovery-email');
    if (isPasswordReset || isRecovery) {
      setView('resetNew');
      if (recoveryEmail) {
        setEmail(recoveryEmail);
      }
      // Clear the flags
      sessionStorage.removeItem('mithra-password-recovery');
      sessionStorage.removeItem('mithra-recovery-email');
    }
  }, [isPasswordReset]);

  const clearForm = () => {
    setFullName(''); setEmail(''); setPassword(''); setConfirmPw('');
    setNewPassword(''); setConfirmNewPw('');
    setFieldErrors({}); setGlobalError(''); setAgreeTerms(false);
  };
  const switchView = (v) => { clearForm(); setView(v); };

  const validate = () => {
    const errs = {};
    if (view === 'signup' && !fullName.trim()) errs.fullName = 'Full name is required';
    if (view !== 'resetNew' && !email.trim()) errs.email = 'Email is required';
    else if (view !== 'resetNew' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email';
    if (view !== 'forgot' && view !== 'resetSent' && view !== 'resetNew') {
      if (!password) errs.password = 'Password is required';
      else if (password.length < 6) errs.password = 'Min 6 characters';
    }
    if (view === 'signup') {
      if (password !== confirmPw) errs.confirmPw = 'Passwords do not match';
      if (!agreeTerms) errs.terms = 'You must agree to continue';
    }
    if (view === 'resetNew') {
      if (!newPassword) errs.newPassword = 'New password is required';
      else if (newPassword.length < 6) errs.newPassword = 'Min 6 characters';
      if (newPassword !== confirmNewPw) errs.confirmNewPw = 'Passwords do not match';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Helper to convert Supabase error messages to user-friendly messages
  const getReadableError = (message) => {
    const errorMap = {
      'Invalid login credentials': 'Email or password is incorrect',
      'Email not confirmed': 'Please verify your email first. Check inbox & spam folder for the confirmation link.',
      'User already registered': 'An account with this email already exists. Try signing in instead.',
      'Password should be at least 6 characters': 'Password must be at least 6 characters',
      'Unable to validate email address': 'Please enter a valid email address',
      'Token has expired': 'Your session has expired. Please sign in again.',
      'invalid_grant': 'Your session has expired. Please sign in again.',
      'Refresh Token Not Found': 'Your session has expired. Please sign in again.',
      'JWT expired': 'Your session has expired. Please sign in again.',
      'Database error saving new user': 'Account created successfully! Please sign in now.',
      'Database error': 'Account created! Please try signing in.',
      'rate limit exceeded': 'Too many attempts. Please wait a few minutes and try again.',
      'email rate limit exceeded': 'Email limit reached. Please wait 5 minutes or try a different email address.',
      'over_email_send_rate_limit': 'Email limit reached. Please wait 5 minutes and try again.',
      'Auth session missing': 'Password reset link expired. Please request a new one.',
      'session missing': 'Your session expired. Please sign in again.',
    };

    for (const [key, value] of Object.entries(errorMap)) {
      if (message?.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }
    return message || 'Something went wrong. Please try again.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true); setGlobalError('');
    try {
      if (view === 'login') {
        await signIn({ email, password });
        navigate('/dashboard');
      } else if (view === 'signup') {
        await signUp({ fullName, email, password });
        navigate('/dashboard');
      } else if (view === 'forgot') {
        await resetPassword(email);
        setView('resetSent');
      } else if (view === 'resetNew') {
        const resetEmail = localStorage.getItem('mithra-reset-email') || email;
        await confirmResetPassword(resetEmail, newPassword);
        setView('resetSuccess');
      }
    } catch (err) {
      setGlobalError(getReadableError(err.message));
    } finally { setLoading(false); }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setGlobalError('');
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      setGlobalError(getReadableError(err.message));
    } finally {
      setGoogleLoading(false);
    }
  };

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 300 : -300, opacity: 0, scale: 0.95 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir) => ({ x: dir > 0 ? -300 : 300, opacity: 0, scale: 0.95 }),
  };
  const direction = view === 'signup' ? 1 : view === 'forgot' ? 1 : -1;

  return (
    <div className="min-h-screen w-full flex relative overflow-hidden" style={{ background: '#050505' }}>

      {/* ══════════ LEFT PANEL — Hero / Branding (desktop only) ══════════ */}
      <div className="hidden lg:flex w-[52%] relative flex-col items-center justify-center p-12 overflow-hidden bg-[#0A0A0A]">
        {/* Mesh gradient background */}
        <div className="absolute inset-0">
          <motion.div className="absolute w-[800px] h-[800px] rounded-full blur-[250px]"
            style={{ background: '#22d3ee', opacity: 0.12, top: '-30%', left: '-20%' }}
            animate={{ x: [0, 80, 0], y: [0, -50, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div className="absolute w-[600px] h-[600px] rounded-full blur-[200px]"
            style={{ background: '#3b82f6', opacity: 0.08, bottom: '-20%', right: '-10%' }}
            animate={{ x: [0, -60, 0], y: [0, 60, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }} />
          {heroParticles.map(p => (
            <motion.div key={p.id} className="absolute rounded-full"
              style={{
                width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%`,
                background: p.id % 3 === 0 ? '#22d3ee' : 'rgba(255,255,255,0.12)'
              }}
              animate={{ y: [0, -80, 0], opacity: [0.08, 0.5, 0.08] }}
              transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }} />
          ))}
          <div className="absolute inset-0 opacity-[0.02]"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-lg text-center">
          <motion.div className="w-24 h-24 mx-auto rounded-3xl flex items-center justify-center mb-8 relative"
            style={{
              background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
              boxShadow: '0 20px 60px rgba(34,211,238,0.3)'
            }}
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
            <Sparkles className="w-11 h-11 text-white" />
            <div className="absolute inset-0 rounded-3xl border border-white/10" />
            <motion.div className="absolute -inset-1 rounded-[28px]"
              style={{ border: '1px solid rgba(34,211,238,0.5)' }}
              animate={{ opacity: [0.4, 0, 0.4], scale: [1, 1.08, 1] }}
              transition={{ duration: 3, repeat: Infinity }} />
          </motion.div>

          <motion.h1 className="text-5xl font-bold text-white tracking-tight mb-4"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}>Mithra</motion.h1>
          <motion.p className="text-lg text-white/50 font-light mb-3"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.8 }}>Your AI-Powered Life Operating System</motion.p>
          <motion.div className="w-16 h-[2px] mx-auto rounded-full mb-10 bg-cyan-500"
            initial={{ width: 0 }} animate={{ width: 64 }}
            transition={{ delay: 0.5, duration: 0.6 }} />

          {/* Visuals only - text removed per user request */}
        </div>
      </div>

      {/* ══════════ RIGHT PANEL — Auth Forms ══════════ */}
      <div className="flex-1 flex items-center justify-center relative p-6 lg:p-12">
        <div className="absolute inset-0">
          <motion.div className="absolute w-[500px] h-[500px] rounded-full blur-[200px]"
            style={{ background: '#0e7490', opacity: 0.1, top: '20%', right: '-20%' }}
            animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }} />
          <div className="absolute inset-0 opacity-[0.01]"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        <div className="hidden lg:block absolute left-0 top-[15%] bottom-[15%] w-px"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.06) 30%, rgba(255,255,255,0.06) 70%, transparent)' }} />

        <motion.div initial={{ opacity: 0, y: 30, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-[420px]">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <motion.div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 relative"
              style={{
                background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
                boxShadow: '0 8px 32px rgba(34,211,238,0.3)'
              }}>
              <Sparkles className="w-7 h-7 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Mithra</h1>
            <p className="text-xs text-white/30 mt-1">AI Life Operating System</p>
          </div>

          {/* Glass card */}
          <div className="relative rounded-3xl overflow-hidden"
            style={{
              background: 'rgba(12,10,10,0.6)', backdropFilter: 'blur(40px) saturate(1.4)',
              border: '1px solid rgba(255,255,255,0.06)',
              boxShadow: '0 0 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)'
            }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[2px] rounded-full bg-cyan-500 opacity-50" />

            <div className="p-8 pt-10 pb-10">
              {/* Header */}
              <div className="text-center mb-8">
                <AnimatePresence mode="wait">
                  <motion.div key={view} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                    <h2 className="text-2xl font-bold text-white tracking-tight">
                      {view === 'login' && 'Welcome back'}
                      {view === 'signup' && 'Create account'}
                      {view === 'forgot' && 'Reset password'}
                      {view === 'resetSent' && 'Verify your account'}
                      {view === 'resetNew' && 'Set new password'}
                      {view === 'resetSuccess' && 'Password updated!'}
                    </h2>
                    <p className="text-sm text-white/40 mt-1.5">
                      {view === 'login' && 'Sign in to your Mithra workspace'}
                      {view === 'signup' && 'Start your journey with Mithra'}
                      {view === 'forgot' && "Enter your email to verify your account"}
                      {view === 'resetSent' && 'Account verified — set your new password'}
                      {view === 'resetNew' && 'Choose a strong password for your account'}
                      {view === 'resetSuccess' && 'You can now sign in with your new password'}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Global Error */}
              <AnimatePresence>
                {globalError && (
                  <motion.div initial={{ opacity: 0, y: -8, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    className="mb-5 p-3.5 rounded-xl flex items-center gap-2.5 text-sm"
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#fca5a5' }}>
                    <AlertCircle size={16} className="text-red-400 shrink-0" />
                    {globalError}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Forms */}
              <AnimatePresence mode="wait" custom={direction}>
                {/* LOGIN */}
                {view === 'login' && (
                  <motion.form key="login" custom={direction} variants={slideVariants}
                    initial="enter" animate="center" exit="exit"
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    onSubmit={handleSubmit} className="space-y-4">
                    <FloatingInput icon={Mail} type="email" placeholder="Email address"
                      value={email} onChange={e => setEmail(e.target.value)} error={fieldErrors.email} autoFocus />
                    <FloatingInput icon={Lock} type="password" placeholder="Password"
                      value={password} onChange={e => setPassword(e.target.value)} error={fieldErrors.password} />
                    <div className="flex justify-end">
                      <button type="button" onClick={() => switchView('forgot')}
                        className="text-xs font-medium transition-colors hover:underline underline-offset-4 text-cyan-400">Forgot password?</button>
                    </div>
                    <motion.button type="submit" disabled={loading}
                      className="w-full py-4 rounded-2xl text-white font-semibold text-sm tracking-wide relative overflow-hidden group disabled:opacity-60"
                      style={{
                        background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
                        boxShadow: '0 4px 24px rgba(6,182,212,0.25)'
                      }}
                      whileHover={{ scale: 1.01, boxShadow: '0 8px 40px rgba(6,182,212,0.4)' }}
                      whileTap={{ scale: 0.98 }}>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      <span className="relative flex items-center justify-center gap-2">
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <>Sign In <ArrowRight size={16} /></>}
                      </span>
                    </motion.button>

                    {/* Divider */}
                    <div className="flex items-center gap-3 py-1">
                      <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                      <span className="text-[11px] text-white/30 uppercase tracking-widest">or</span>
                      <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                    </div>

                    {/* Google Sign In */}
                    <motion.button type="button" onClick={handleGoogleSignIn} disabled={googleLoading}
                      className="w-full py-3.5 rounded-2xl text-white/80 font-medium text-sm relative overflow-hidden group disabled:opacity-60 flex items-center justify-center gap-3"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                      whileHover={{ scale: 1.01, background: 'rgba(255,255,255,0.07)' }}
                      whileTap={{ scale: 0.98 }}>
                      {googleLoading ? <Loader2 size={18} className="animate-spin" /> : (
                        <>
                          <svg width="18" height="18" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                          </svg>
                          Continue with Google
                        </>
                      )}
                    </motion.button>

                    <p className="text-center text-sm text-white/30 pt-2">
                      Don't have an account?{' '}
                      <button type="button" onClick={() => switchView('signup')}
                        className="font-semibold transition-colors hover:underline underline-offset-4 text-cyan-400">Sign up</button>
                    </p>
                  </motion.form>
                )}

                {/* SIGN UP */}
                {view === 'signup' && (
                  <motion.form key="signup" custom={direction} variants={slideVariants}
                    initial="enter" animate="center" exit="exit"
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    onSubmit={handleSubmit} className="space-y-4">
                    <FloatingInput icon={User} type="text" placeholder="Full name"
                      value={fullName} onChange={e => setFullName(e.target.value)} error={fieldErrors.fullName} autoFocus />
                    <FloatingInput icon={Mail} type="email" placeholder="Email address"
                      value={email} onChange={e => setEmail(e.target.value)} error={fieldErrors.email} />
                    <div>
                      <FloatingInput icon={Lock} type="password" placeholder="Create password"
                        value={password} onChange={e => setPassword(e.target.value)} error={fieldErrors.password} />
                      <PasswordStrength password={password} />
                    </div>
                    <FloatingInput icon={Lock} type="password" placeholder="Confirm password"
                      value={confirmPw} onChange={e => setConfirmPw(e.target.value)} error={fieldErrors.confirmPw} />
                    <label className="flex items-start gap-3 cursor-pointer group pt-1">
                      <button type="button" onClick={() => setAgreeTerms(!agreeTerms)}
                        className="w-5 h-5 mt-0.5 rounded-md border flex items-center justify-center shrink-0 transition-all"
                        style={{
                          borderColor: fieldErrors.terms ? 'rgba(239,68,68,0.5)' : agreeTerms ? '#22d3ee' : 'rgba(255,255,255,0.12)',
                          background: agreeTerms ? '#22d3ee' : 'transparent'
                        }}>
                        {agreeTerms && <Check size={12} className="text-black" strokeWidth={3} />}
                      </button>
                      <span className="text-xs text-white/40 leading-relaxed">
                        I agree to the <span className="cursor-pointer hover:underline text-cyan-400">Terms of Service</span> and{' '}
                        <span className="cursor-pointer hover:underline text-cyan-400">Privacy Policy</span>
                      </span>
                    </label>
                    {fieldErrors.terms && (
                      <p className="flex items-center gap-1.5 text-xs text-red-400 pl-1">
                        <AlertCircle size={12} /> {fieldErrors.terms}
                      </p>
                    )}
                    <motion.button type="submit" disabled={loading}
                      className="w-full py-4 rounded-2xl text-white font-semibold text-sm tracking-wide relative overflow-hidden group disabled:opacity-60"
                      style={{
                        background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
                        boxShadow: '0 4px 24px rgba(6,182,212,0.25)'
                      }}
                      whileHover={{ scale: 1.01, boxShadow: '0 8px 40px rgba(6,182,212,0.4)' }}
                      whileTap={{ scale: 0.98 }}>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      <span className="relative flex items-center justify-center gap-2">
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <>Create Account <ArrowRight size={16} /></>}
                      </span>
                    </motion.button>

                    {/* Divider */}
                    <div className="flex items-center gap-3 py-1">
                      <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                      <span className="text-[11px] text-white/30 uppercase tracking-widest">or</span>
                      <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                    </div>

                    {/* Google Sign Up */}
                    <motion.button type="button" onClick={handleGoogleSignIn} disabled={googleLoading}
                      className="w-full py-3.5 rounded-2xl text-white/80 font-medium text-sm relative overflow-hidden group disabled:opacity-60 flex items-center justify-center gap-3"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                      whileHover={{ scale: 1.01, background: 'rgba(255,255,255,0.07)' }}
                      whileTap={{ scale: 0.98 }}>
                      {googleLoading ? <Loader2 size={18} className="animate-spin" /> : (
                        <>
                          <svg width="18" height="18" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                          </svg>
                          Continue with Google
                        </>
                      )}
                    </motion.button>

                    <p className="text-center text-sm text-white/30 pt-2">
                      Already have an account?{' '}
                      <button type="button" onClick={() => switchView('login')}
                        className="font-semibold transition-colors hover:underline underline-offset-4 text-cyan-400">Sign in</button>
                    </p>
                  </motion.form>
                )}

                {/* FORGOT PASSWORD */}
                {view === 'forgot' && (
                  <motion.form key="forgot" custom={direction} variants={slideVariants}
                    initial="enter" animate="center" exit="exit"
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    onSubmit={handleSubmit} className="space-y-4">
                    <p className="text-sm text-white/40 mb-2">
                      Enter the email address associated with your account and we'll send you a link to reset your password.
                    </p>
                    <FloatingInput icon={Mail} type="email" placeholder="Email address"
                      value={email} onChange={e => setEmail(e.target.value)} error={fieldErrors.email} autoFocus />
                    <motion.button type="submit" disabled={loading}
                      className="w-full py-4 rounded-2xl text-white font-semibold text-sm tracking-wide relative overflow-hidden group disabled:opacity-60"
                      style={{
                        background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
                        boxShadow: '0 4px 24px rgba(6,182,212,0.25)'
                      }}
                      whileHover={{ scale: 1.01, boxShadow: '0 8px 40px rgba(6,182,212,0.4)' }}
                      whileTap={{ scale: 0.98 }}>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      <span className="relative flex items-center justify-center gap-2">
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <>Send Reset Link <Mail size={16} /></>}
                      </span>
                    </motion.button>
                    <button type="button" onClick={() => switchView('login')}
                      className="flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors mx-auto pt-2">
                      <ChevronLeft size={16} /> Back to sign in
                    </button>
                  </motion.form>
                )}

                {/* RESET SENT → Set New Password */}
                {view === 'resetSent' && (
                  <motion.div key="resetSent" custom={direction} variants={slideVariants}
                    initial="enter" animate="center" exit="exit"
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center space-y-5 py-4">
                    <motion.div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
                      style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.2 }}>
                      <Check size={28} className="text-green-400" />
                    </motion.div>
                    <div>
                      <p className="text-white/70 text-sm">Account verified for</p>
                      <p className="text-white font-semibold mt-1">{email}</p>
                    </div>
                    <motion.button type="button" onClick={() => setView('resetNew')}
                      className="w-full py-4 rounded-2xl text-white font-semibold text-sm tracking-wide relative overflow-hidden group"
                      style={{
                        background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
                        boxShadow: '0 4px 24px rgba(6,182,212,0.25)'
                      }}
                      whileHover={{ scale: 1.01, boxShadow: '0 8px 40px rgba(6,182,212,0.4)' }}
                      whileTap={{ scale: 0.98 }}>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      <span className="relative flex items-center justify-center gap-2">
                        Set New Password <ArrowRight size={16} />
                      </span>
                    </motion.button>
                    <button type="button" onClick={() => switchView('login')}
                      className="flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors mx-auto pt-2">
                      <ChevronLeft size={16} /> Back to sign in
                    </button>
                  </motion.div>
                )}

                {/* RESET NEW PASSWORD FORM */}
                {view === 'resetNew' && (
                  <motion.form key="resetNew" custom={direction} variants={slideVariants}
                    initial="enter" animate="center" exit="exit"
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    onSubmit={handleSubmit} className="space-y-4">
                    <p className="text-sm text-white/40 mb-2">
                      Create a new password for <span className="text-white font-medium">{email || localStorage.getItem('mithra-reset-email')}</span>
                    </p>
                    <div>
                      <FloatingInput icon={Lock} type="password" placeholder="New password"
                        value={newPassword} onChange={e => setNewPassword(e.target.value)} error={fieldErrors.newPassword} autoFocus />
                      <PasswordStrength password={newPassword} />
                    </div>
                    <FloatingInput icon={Lock} type="password" placeholder="Confirm new password"
                      value={confirmNewPw} onChange={e => setConfirmNewPw(e.target.value)} error={fieldErrors.confirmNewPw} />
                    <motion.button type="submit" disabled={loading}
                      className="w-full py-4 rounded-2xl text-white font-semibold text-sm tracking-wide relative overflow-hidden group disabled:opacity-60"
                      style={{
                        background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
                        boxShadow: '0 4px 24px rgba(6,182,212,0.25)'
                      }}
                      whileHover={{ scale: 1.01, boxShadow: '0 8px 40px rgba(6,182,212,0.4)' }}
                      whileTap={{ scale: 0.98 }}>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      <span className="relative flex items-center justify-center gap-2">
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <>Update Password <Shield size={16} /></>}
                      </span>
                    </motion.button>
                    <button type="button" onClick={() => switchView('login')}
                      className="flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors mx-auto pt-2">
                      <ChevronLeft size={16} /> Back to sign in
                    </button>
                  </motion.form>
                )}

                {/* RESET SUCCESS */}
                {view === 'resetSuccess' && (
                  <motion.div key="resetSuccess" custom={direction} variants={slideVariants}
                    initial="enter" animate="center" exit="exit"
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center space-y-5 py-4">
                    <motion.div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
                      style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.2 }}>
                      <Check size={28} className="text-green-400" />
                    </motion.div>
                    <div>
                      <p className="text-white font-semibold text-lg">Password Updated Successfully!</p>
                      <p className="text-white/50 text-sm mt-2">You can now sign in with your new password.</p>
                    </div>
                    <motion.button type="button" onClick={() => switchView('login')}
                      className="w-full py-4 rounded-2xl text-white font-semibold text-sm tracking-wide relative overflow-hidden group"
                      style={{
                        background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
                        boxShadow: '0 4px 24px rgba(6,182,212,0.25)'
                      }}
                      whileHover={{ scale: 1.01, boxShadow: '0 8px 40px rgba(6,182,212,0.4)' }}
                      whileTap={{ scale: 0.98 }}>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      <span className="relative flex items-center justify-center gap-2">
                        Go to Sign In <ArrowRight size={16} />
                      </span>
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Footer — Developed by */}
          <div className="lg:hidden text-center mt-8 space-y-4">
            <div className="flex items-center justify-center gap-4 text-xs text-white/40">
              <a href="#/privacy" className="hover:text-white/70 transition-colors">Privacy Policy</a>
              <span className="w-1 h-1 rounded-full bg-white/10" />
              <a href="#/terms" className="hover:text-white/70 transition-colors">Terms of Service</a>
            </div>
            <p className="text-[11px] text-white/40 tracking-wide">
              Developed by <span className="text-white/60 font-medium">Hemasai Vattikuti</span>
            </p>
          </div>

          {/* Desktop Footer Links (Absolute bottom of right panel) */}
          <div className="hidden lg:flex absolute bottom-6 w-full justify-center gap-6 text-xs text-white/20">
            <a href="#/privacy" className="hover:text-white/50 transition-colors">Privacy Policy</a>
            <a href="#/terms" className="hover:text-white/50 transition-colors">Terms of Service</a>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
