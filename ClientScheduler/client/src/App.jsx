import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { DataProvider } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';
import SearchDialog from './components/SearchDialog';
import Dashboard from './pages/Dashboard';
import MithraCalendar from './pages/Calendar';
import MithraTasks from './pages/Tasks';
import MithraJournal from './pages/Journal';
import DostMode from './pages/DostMode';
import Settings from './pages/Settings';
import HabitFocusHub from './pages/HabitFocusHub';
import AuthPage from './pages/AuthPage';
import Onboarding from './pages/Onboarding';
import { setupBackButton, isNative } from './native';

/* Guard: redirect to /login if not authenticated */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('mithra-onboarding-done');
  });

  // Wait for Supabase session to be checked (OAuth callback, token refresh, etc.)
  if (loading) {
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
        <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/dost" element={<ProtectedRoute><Layout><DostMode /></Layout></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute><Layout><MithraCalendar /></Layout></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute><Layout><MithraTasks /></Layout></ProtectedRoute>} />
        <Route path="/habits" element={<ProtectedRoute><Layout><HabitFocusHub /></Layout></ProtectedRoute>} />
        <Route path="/journal" element={<ProtectedRoute><Layout><MithraJournal /></Layout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />

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
