import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

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
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-mithra-merino mb-2">Something went wrong</h2>
              <p className="text-mithra-merino/50 text-sm leading-relaxed">
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
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium glass-card text-mithra-merino/70 hover:text-mithra-merino transition-all"
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
