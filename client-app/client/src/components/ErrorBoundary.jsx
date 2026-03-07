import React from 'react';
import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8" style={{ background: 'var(--bg-primary, #050505)' }}>
          <div className="max-w-md w-full text-center space-y-6 glass-card rounded-3xl p-10">
            <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <AlertTriangle size={32} className="text-[var(--accent-color)]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Something went wrong</h2>
              <p className="text-[var(--text-dim)] text-sm leading-relaxed opacity-50">
                An unexpected error occurred. Your data is safe — try refreshing the app.
              </p>
            </div>
            {this.state.error && (
              <pre className="text-xs text-red-400/60 bg-red-500/5 rounded-xl p-3 text-left overflow-auto max-h-32">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{ background: 'var(--accent-color, #C2185B)', color: 'white' }}
              >
                <RefreshCw size={16} /> Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium glass-card text-[var(--text-dim)] hover:text-[var(--text-primary)] opacity-70 hover:opacity-100 transition-all"
              >
                Reload App
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/* ─── Per-page inline error boundary (lighter weight) ─── */
export class PageErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[PageErrorBoundary]', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 m-4 rounded-2xl border border-red-500/20 text-center gap-4"
          style={{ background: 'rgba(239,68,68,0.04)', minHeight: '200px' }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)' }}>
            <WifiOff size={24} className="text-red-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">
              {this.props.pageName ? `${this.props.pageName} failed to load` : 'Page failed to load'}
            </h3>
            <p className="text-sm text-[var(--text-dim)] opacity-60">
              {this.state.error?.message || 'An unexpected error occurred on this page.'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{ background: 'var(--accent-color)', color: 'white' }}
            >
              <RefreshCw size={14} /> Retry
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium glass-card text-[var(--text-dim)] opacity-70 hover:opacity-100 transition-all"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
