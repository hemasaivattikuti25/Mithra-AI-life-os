import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { apiFetch } from '../services/firebaseClient';

/**
 * GoogleCalendarCallback Component
 * 
 * Handles OAuth redirect from Google. Exchanges authorization code for refresh token.
 * Shows success/error status and redirects back to settings after completion.
 */

export function GoogleCalendarCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('');
  
  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get authorization code and state from URL
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        
        // Check for OAuth errors
        if (error) {
          setStatus('error');
          setMessage(`Authorization failed: ${error}`);
          return;
        }
        
        if (!code) {
          setStatus('error');
          setMessage('No authorization code received');
          return;
        }
        
        // Verify state matches what we sent
        const savedState = localStorage.getItem('oauth_state');
        if (state !== savedState) {
          setStatus('error');
          setMessage('State mismatch: possible CSRF attack');
          localStorage.removeItem('oauth_state');
          return;
        }
        
        // Exchange code for refresh token
        const response = await apiFetch('/api/calendar/authorize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code,
            redirect_uri: window.location.origin + '/calendar/callback'
          })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          setStatus('error');
          setMessage(data.detail || 'Authorization failed');
          return;
        }
        
        // Success!
        setStatus('success');
        setMessage('Google Calendar connected successfully');
        
        // Clear OAuth state
        localStorage.removeItem('oauth_state');
        localStorage.removeItem('oauth_redirect_time');
        
        // Redirect to settings after 2 seconds
        setTimeout(() => {
          navigate('/settings?tab=calendar');
        }, 2000);
      
      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setMessage(error.message || 'Unexpected error during authorization');
      }
    };
    
    handleCallback();
  }, [searchParams, navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--body-bg)' }}>
      <div className="w-full max-w-md">
        <div
          className="rounded-2xl p-8 text-center"
          style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--glass-border)'
          }}
        >
          {status === 'loading' && (
            <>
              <Loader2 size={48} className="animate-spin mx-auto mb-4" style={{ color: 'var(--accent-color)' }} />
              <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Authorizing...
              </h2>
              <p style={{ color: 'var(--text-dim)' }}>
                Connecting Google Calendar to your Mithra account
              </p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <CheckCircle size={48} className="mx-auto mb-4" style={{ color: '#22c55e' }} />
              <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Connected Successfully!
              </h2>
              <p style={{ color: 'var(--text-dim)' }}>
                {message}
              </p>
              <p className="text-xs mt-4" style={{ color: 'var(--text-dim)' }}>
                Redirecting to settings...
              </p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <AlertCircle size={48} className="mx-auto mb-4" style={{ color: '#ef4444' }} />
              <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Authorization Failed
              </h2>
              <p style={{ color: 'var(--text-dim)' }} className="mb-4">
                {message}
              </p>
              <button
                onClick={() => navigate('/settings?tab=calendar')}
                className="px-4 py-2 rounded-lg font-semibold transition-all"
                style={{
                  background: 'var(--accent-color)',
                  color: 'white'
                }}
              >
                Back to Settings
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default GoogleCalendarCallback;
