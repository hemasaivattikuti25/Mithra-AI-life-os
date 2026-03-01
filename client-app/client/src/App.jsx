import React, { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { DataProvider } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider, useToast } from './components/Toast';
import { DashboardSkeleton, TasksSkeleton, HabitsSkeleton, JournalSkeleton, PageSkeleton } from './components/LoadingSkeleton';
import OnboardingTour from './components/OnboardingTour';
import SearchDialog from './components/SearchDialog';
import AuthPage from './pages/AuthPage';
import Onboarding from './pages/Onboarding';
import { setupBackButton, isNative } from './native';
import { initAnalytics } from './services/analytics';
import { registerServiceWorker } from './services/notifications';
import { checkSupabaseHealth, isSupabaseConfigured } from './services/supabaseClient';

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
  const { isAuthenticated, loading } = useAuth();
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

  // Wait for Supabase session to be checked (OAuth callback, token refresh, etc.)
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
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<OAuthCallbackGuard><Suspense fallback={<PageLoader />}><LandingPage /></Suspense></OAuthCallbackGuard>} />

        {/* Auth routes — no sidebar/layout */}
        <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
        <Route path="/login" element={<Navigate to="/auth" replace />} />
        <Route path="/reset-password" element={<AuthPage isPasswordReset={true} />} />

        {/* Protected app routes — page-specific skeleton fallbacks */}
        <Route path="/dashboard" element={<ProtectedRoute><Layout><Suspense fallback={<DashboardSkeleton />}><Dashboard /></Suspense></Layout></ProtectedRoute>} />
        <Route path="/dost" element={<ProtectedRoute><Layout><Suspense fallback={<PageSkeleton />}><DostMode /></Suspense></Layout></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute><Layout><Suspense fallback={<PageSkeleton />}><MithraCalendar /></Suspense></Layout></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute><Layout><Suspense fallback={<TasksSkeleton />}><MithraTasks /></Suspense></Layout></ProtectedRoute>} />
        <Route path="/habits" element={<ProtectedRoute><Layout><Suspense fallback={<HabitsSkeleton />}><HabitFocusHub /></Suspense></Layout></ProtectedRoute>} />
        <Route path="/journal" element={<ProtectedRoute><Layout><Suspense fallback={<JournalSkeleton />}><MithraJournal /></Suspense></Layout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Layout><Suspense fallback={<PageSkeleton />}><Settings /></Suspense></Layout></ProtectedRoute>} />
        <Route path="/blend" element={<ProtectedRoute><Layout><Suspense fallback={<PageSkeleton />}><MithraBlend /></Suspense></Layout></ProtectedRoute>} />

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
  // Initialize analytics + service worker on app mount
  useEffect(() => { initAnalytics(); registerServiceWorker(); }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <DataProvider>
          <ToastProvider>
            <SupabaseHealthGate />
            <Router>
              <AppRoutes />
            </Router>
          </ToastProvider>
        </DataProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

/** Runs once on mount — pings Supabase and warns if latency > 2s */
function SupabaseHealthGate() {
  const { addToast } = useToast();
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    checkSupabaseHealth().then(({ ok, latency }) => {
      if (ok && latency > 2000) {
        addToast({ message: 'Slow connection detected. Some features may load slowly.', type: 'warning', duration: 6000 });
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

export default App;
