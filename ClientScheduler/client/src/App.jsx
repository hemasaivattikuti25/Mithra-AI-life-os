import React, { useEffect, useState, lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { DataProvider } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';
import SearchDialog from './components/SearchDialog';
import AuthPage from './pages/AuthPage';
import Onboarding from './pages/Onboarding';
import { setupBackButton, isNative } from './native';

/* Lazy-load heavy page components for faster initial paint */
const Dashboard = lazy(() => import('./pages/Dashboard'));
const MithraCalendar = lazy(() => import('./pages/Calendar'));
const MithraTasks = lazy(() => import('./pages/Tasks'));
const MithraJournal = lazy(() => import('./pages/Journal'));
const DostMode = lazy(() => import('./pages/DostMode'));
const Settings = lazy(() => import('./pages/Settings'));
const HabitFocusHub = lazy(() => import('./pages/HabitFocusHub'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));

/* Lightweight page loading fallback (shows instantly, no cumulative layout shift) */
const PageLoader = () => (
  <div className="h-full w-full flex items-center justify-center" style={{ minHeight: '60vh' }}>
    <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent-color, #C2185B)', borderTopColor: 'transparent' }} />
  </div>
);

/* Guard: redirect to /login if not authenticated */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('mithra-onboarding-done');
  });
  const [timedOut, setTimedOut] = useState(false);

  // Safety timeout — if auth loading takes longer than 6s, stop waiting
  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => setTimedOut(true), 6000);
    return () => clearTimeout(timer);
  }, [loading]);

  // Wait for Supabase session to be checked (OAuth callback, token refresh, etc.)
  if (loading && !timedOut) {
    return (
      <div className="h-screen w-screen flex items-center justify-center" style={{ background: 'var(--bg-primary, #0A0A0A)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent-color, #C2185B)', borderTopColor: 'transparent' }} />
          <p className="text-sm" style={{ color: 'var(--text-dim, #888)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (showOnboarding) return <Onboarding onComplete={() => setShowOnboarding(false)} />;
  return children;
};

/* Guard: redirect to / if already authenticated */
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  // While loading, show the auth page (don't redirect yet)
  if (loading) return children;
  if (isAuthenticated) return <Navigate to="/" replace />;
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
  return (
    <>
      <BackButtonHandler />
      <GlobalSearch />
      <Routes>
        {/* Auth routes — no sidebar/layout */}
        <Route path="/login" element={<PublicRoute><AuthPage /></PublicRoute>} />
        <Route path="/reset-password" element={<AuthPage isPasswordReset={true} />} />

        {/* Protected app routes */}
        <Route path="/" element={<ProtectedRoute><Layout><Suspense fallback={<PageLoader />}><Dashboard /></Suspense></Layout></ProtectedRoute>} />
        <Route path="/dost" element={<ProtectedRoute><Layout><Suspense fallback={<PageLoader />}><DostMode /></Suspense></Layout></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute><Layout><Suspense fallback={<PageLoader />}><MithraCalendar /></Suspense></Layout></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute><Layout><Suspense fallback={<PageLoader />}><MithraTasks /></Suspense></Layout></ProtectedRoute>} />
        <Route path="/habits" element={<ProtectedRoute><Layout><Suspense fallback={<PageLoader />}><HabitFocusHub /></Suspense></Layout></ProtectedRoute>} />
        <Route path="/journal" element={<ProtectedRoute><Layout><Suspense fallback={<PageLoader />}><MithraJournal /></Suspense></Layout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Layout><Suspense fallback={<PageLoader />}><Settings /></Suspense></Layout></ProtectedRoute>} />

        {/* Public Pages */}
        <Route path="/privacy" element={<Suspense fallback={<PageLoader />}><Privacy /></Suspense>} />
        <Route path="/terms" element={<Suspense fallback={<PageLoader />}><Terms /></Suspense>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <DataProvider>
          <ToastProvider>
            <Router>
              <AppRoutes />
            </Router>
          </ToastProvider>
        </DataProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
