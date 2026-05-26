import React, { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { DataProvider } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ErrorBoundary, PageErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider, useToast } from './components/Toast';
import { DashboardSkeleton, TasksSkeleton, HabitsSkeleton, JournalSkeleton, PageSkeleton, CalendarSkeleton } from './components/LoadingSkeleton';
import SearchDialog from './components/SearchDialog';
import KeyboardShortcuts from './components/KeyboardShortcuts';

import AuthPage from './pages/AuthPage';
import Onboarding from './pages/Onboarding';
import { setupBackButton, isNative } from './native';
import { initAnalytics } from './services/analytics';
import { checkBackendHealth } from './services/firebaseClient';

/* Lazy-load heavy page components for faster initial paint */
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const MithraCalendar = lazy(() => import('./pages/Calendar'));
const MithraTasks = lazy(() => import('./pages/Tasks'));
const MithraJournal = lazy(() => import('./pages/Journal'));
const DostMode = lazy(() => import('./pages/DostMode'));
const Settings = lazy(() => import('./pages/Settings'));
const HabitFocusHub = lazy(() => import('./pages/HabitFocusHub'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const PromoVideo = lazy(() => import('./pages/PromoVideo'));
const MithraBlend = lazy(() => import('./pages/MithraBlend'));
const Diagnostics = lazy(() => import('./pages/Diagnostics'));

/* Lightweight page loading fallback (shows instantly, no cumulative layout shift) */
const PageLoader = () => (
  <div className="h-full w-full flex items-center justify-center" style={{ minHeight: '60vh' }}>
    <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent-color, #22d3ee)', borderTopColor: 'transparent' }} />
  </div>
);

/* OAuth Callback Handler — detects ?code= and waits for auth before redirecting */
const OAuthCallbackGuard = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const hasCode = new URLSearchParams(window.location.search).has('code');

  // If this is an OAuth callback (?code= in URL), show loading while AuthContext exchanges it
  if (hasCode) {
    if (loading) {
      return (
        <div className="h-screen w-screen flex items-center justify-center" style={{ background: 'var(--bg-primary, #0A0A0A)' }}>
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent-color, #22d3ee)', borderTopColor: 'transparent' }} />
            <p className="text-sm" style={{ color: 'var(--text-dim, #888)' }}>Signing you in...</p>
          </div>
        </div>
      );
    }
    // Auth exchange done — redirect to dashboard
    if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  }

  // Also redirect if already authenticated and visiting landing page
  if (!loading && isAuthenticated) return <Navigate to="/dashboard" replace />;

  return children;
};

/* Guard: redirect to /auth if not authenticated */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const { addToast } = useToast();
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('mithra-onboarding-done');
  });
  const [timedOut, setTimedOut] = useState(false);

  // Safety timeout — if auth loading takes longer than 10s, stop waiting
  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => setTimedOut(true), 10000);
    return () => clearTimeout(timer);
  }, [loading]);

  // Wait for Firebase session to be checked (token refresh, etc.)
  if (loading && !timedOut) {
    return (
      <div className="h-screen w-screen flex items-center justify-center" style={{ background: 'var(--bg-primary, #0A0A0A)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent-color, #22d3ee)', borderTopColor: 'transparent' }} />
          <p className="text-sm" style={{ color: 'var(--text-dim, #888)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/auth" replace />;

  // Firebase email verification gate
  if (user?.emailVerified === false && !user?.providerData?.some(p => p.providerId === 'google.com')) {
    return (
      <div className="h-screen w-screen flex items-center justify-center p-6" style={{ background: 'var(--bg-primary, #0A0A0A)' }}>
        <div className="max-w-sm w-full text-center" style={{ background: '#131313', border: '1px solid #222', borderRadius: 16, padding: 32 }}>
          <div className="text-4xl mb-4">📧</div>
          <h2 className="text-xl font-bold text-white mb-2">Verify your email</h2>
          <p className="text-sm mb-6" style={{ color: '#888' }}>
            A verification link was sent to <strong className="text-white">{user?.email}</strong>. Click it to continue.
          </p>
          <button
            onClick={async () => {
              const { sendEmailVerification } = await import('firebase/auth');
              const { firebaseAuth } = await import('./services/firebaseClient');
              if (firebaseAuth?.currentUser) {
                await sendEmailVerification(firebaseAuth.currentUser);
                addToast({ message: 'Verification email resent!', type: 'success' });
              }
            }}
            className="text-sm px-4 py-2 rounded-lg"
            style={{ background: '#7c3aed', color: '#fff' }}
          >
            Resend verification email
          </button>
        </div>
      </div>
    );
  }

  if (showOnboarding) return <Onboarding onComplete={() => setShowOnboarding(false)} />;
  return children;
};

/* Guard: redirect to /dashboard if already authenticated */
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  // While loading, show the auth page (don't redirect yet)
  if (loading) return children;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

/* Android hardware back button handler */
const BackButtonHandler = () => {
  const navigate = useNavigate();
  useEffect(() => {
    if (!isNative) return;
    const listener = setupBackButton(() => navigate(-1));
    return () => { listener?.remove?.(); };
  }, [navigate]);
  return null;
};

/* Global Cmd+K search */
const GlobalSearch = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(p => !p);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return <SearchDialog open={open} onClose={() => setOpen(false)} />;
};

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Global redirect safety net: if authenticated and on public page, go to dashboard
  useEffect(() => {
    if (!loading && isAuthenticated) {
      if (location.pathname === '/' || location.pathname === '/auth') {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, loading, location, navigate]);

  return (
    <>
      <BackButtonHandler />
      <GlobalSearch />
      <KeyboardShortcuts />
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<OAuthCallbackGuard><Suspense fallback={<PageLoader />}><LandingPage /></Suspense></OAuthCallbackGuard>} />

        {/* Auth routes — no sidebar/layout */}
        <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
        <Route path="/login" element={<Navigate to="/auth" replace />} />
        <Route path="/reset-password" element={<AuthPage isPasswordReset={true} />} />

        {/* Protected app routes — page-specific skeleton fallbacks + error boundaries */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<PageErrorBoundary pageName="Dashboard"><Suspense fallback={<DashboardSkeleton />}><Dashboard /></Suspense></PageErrorBoundary>} />
          <Route path="/dost" element={<PageErrorBoundary pageName="Dost"><Suspense fallback={<PageSkeleton />}><DostMode /></Suspense></PageErrorBoundary>} />
          <Route path="/calendar" element={<PageErrorBoundary pageName="Calendar"><Suspense fallback={<CalendarSkeleton />}><MithraCalendar /></Suspense></PageErrorBoundary>} />
          <Route path="/tasks" element={<PageErrorBoundary pageName="Tasks"><Suspense fallback={<TasksSkeleton />}><MithraTasks /></Suspense></PageErrorBoundary>} />
          <Route path="/habits" element={<PageErrorBoundary pageName="Habits"><Suspense fallback={<HabitsSkeleton />}><HabitFocusHub /></Suspense></PageErrorBoundary>} />
          <Route path="/journal" element={<PageErrorBoundary pageName="Journal"><Suspense fallback={<JournalSkeleton />}><MithraJournal /></Suspense></PageErrorBoundary>} />
          <Route path="/settings" element={<PageErrorBoundary pageName="Settings"><Suspense fallback={<PageSkeleton />}><Settings /></Suspense></PageErrorBoundary>} />
          <Route path="/blend" element={<PageErrorBoundary pageName="Blend"><Suspense fallback={<PageSkeleton />}><MithraBlend /></Suspense></PageErrorBoundary>} />
          <Route path="/diagnostics" element={<PageErrorBoundary pageName="Diagnostics"><Suspense fallback={<PageSkeleton />}><Diagnostics /></Suspense></PageErrorBoundary>} />
        </Route>

        {/* Public Pages */}
        <Route path="/privacy" element={<Suspense fallback={<PageLoader />}><Privacy /></Suspense>} />
        <Route path="/terms" element={<Suspense fallback={<PageLoader />}><Terms /></Suspense>} />
        <Route path="/promo-video" element={<Suspense fallback={<PageLoader />}><PromoVideo /></Suspense>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  useEffect(() => { 
    initAnalytics(); 
    
    // Prompt for notification permission on start if not already answered
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <DataProvider>
          <ToastProvider>
            <BackendHealthGate />
            <Router>
              <AppRoutes />
            </Router>
          </ToastProvider>
        </DataProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

/** Runs once on mount — pings backend and warns if latency > 2s */
function BackendHealthGate() {
  const { addToast } = useToast();
  useEffect(() => {
    checkBackendHealth().then(({ ok, latency }) => {
      if (ok && latency > 2000) {
        addToast({ message: 'Slow connection detected. Some features may load slowly.', type: 'warning', duration: 6000 });
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

export default App;
