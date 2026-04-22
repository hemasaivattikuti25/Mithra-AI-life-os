import React, { useState } from 'react';
import { Calendar, Loader2 } from 'lucide-react';
import { apiFetch } from '../services/firebaseClient';

/**
 * GoogleCalendarAuth Component
 * 
 * Displays OAuth button for Google Calendar integration.
 * Redirects to Google's consent screen when clicked.
 * On successful authorization, stores refresh token on backend.
 */

export function GoogleCalendarAuth({ onSuccess, onError, isConnected = false }) {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleAuthorize = async () => {
    try {
      setIsLoading(true);
      
      // Get OAuth URL from backend
      const response = await apiFetch('/api/calendar/auth-url', {
        method: 'GET',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to get authorization URL');
      }
      
      // Store state for verification after callback
      localStorage.setItem('oauth_state', data.state);
      localStorage.setItem('oauth_redirect_time', Date.now().toString());
      
      // Redirect to Google OAuth consent screen
      window.location.href = data.auth_url;
    } catch (error) {
      console.error('OAuth authorization error:', error);
      setIsLoading(false);
      if (onError) onError(error.message);
    }
  };
  
  return (
    <button
      onClick={handleAuthorize}
      disabled={isLoading || isConnected}
      className={`
        flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all
        ${isConnected
          ? 'bg-green-500/20 text-green-400 border border-green-500/30 cursor-default'
          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 active:scale-95'
        }
      `}
      title={isConnected ? 'Google Calendar connected' : 'Click to connect Google Calendar'}
    >
      {isLoading ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          Authorizing...
        </>
      ) : (
        <>
          <Calendar size={16} />
          {isConnected ? 'Connected' : 'Connect Google Calendar'}
        </>
      )}
    </button>
  );
}

export default GoogleCalendarAuth;
