import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { authService, isSupabaseConfigured, supabase } from '../services/supabaseClient';

const AuthContext = createContext(null);

/* ── SHA-256 hashing with salt (Web Crypto API) — used for offline/fallback auth ── */
const generateSalt = () => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
};

const hashPassword = async (password, salt) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const verifyPassword = async (password, salt, storedHash) => {
  const hash = await hashPassword(password, salt);
  return hash === storedHash;
};

/* ── localStorage helpers ── */
const loadAuth = () => {
  try {
    const stored = localStorage.getItem('mithra-auth');
    return stored ? JSON.parse(stored) : null;
  } catch { return null; }
};

const loadProfile = () => {
  try {
    const auth = loadAuth();
    if (auth?.id) {
      const scoped = localStorage.getItem(`mithra-profile-${auth.id}`);
      if (scoped) return JSON.parse(scoped);
    }
    const stored = localStorage.getItem('mithra-profile');
    return stored ? JSON.parse(stored) : null;
  } catch { return null; }
};

const loadUsers = () => {
  try {
    const stored = localStorage.getItem('mithra-users');
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadAuth());
  const [profile, setProfile] = useState(() => loadProfile() || {
    fullName: '',
    email: '',
    phone: '',
    bio: '',
    avatarUrl: '',
    location: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    dateJoined: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(isSupabaseConfigured); // Only loading if Supabase active
  const authListenerRef = useRef(null);

  const isAuthenticated = !!user;

  /* ══════════════════════════════════════════════════════════════
     Supabase Auth State Listener
     — Automatically restores session from cookies/localStorage
     — Handles token refresh, sign-in/out events
     ═══════════════════════════════════════════════════════════ */
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // Check for existing session on mount
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const supaUser = {
            id: session.user.id,
            email: session.user.email,
            provider: 'supabase',
          };
          setUser(supaUser);

          // Pull profile from Supabase
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileData) {
            setProfile(prev => ({
              ...prev,
              fullName: profileData.full_name || prev.fullName,
              email: session.user.email,
              avatarUrl: profileData.avatar_url || prev.avatarUrl,
              dateJoined: profileData.created_at || prev.dateJoined,
            }));
          }
        }
      } catch (err) {
        console.warn('Failed to restore Supabase session:', err);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // Listen for auth state changes (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const supaUser = {
            id: session.user.id,
            email: session.user.email,
            provider: 'supabase',
          };
          setUser(supaUser);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    authListenerRef.current = subscription;

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Persist auth state to localStorage (cache for offline)
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('mithra-auth', JSON.stringify(user));
      } else {
        localStorage.removeItem('mithra-auth');
      }
    } catch {}
  }, [user]);

  // Persist profile scoped to user
  useEffect(() => {
    try {
      if (profile && user?.id) {
        localStorage.setItem(`mithra-profile-${user.id}`, JSON.stringify(profile));
        localStorage.setItem('mithra-profile', JSON.stringify(profile));
      }
    } catch {}
  }, [profile, user]);

  /* ══════════════════════════════════════════════════════════════
     SIGN UP — Supabase-first, localStorage fallback
     ═══════════════════════════════════════════════════════════ */
  const signUp = useCallback(async ({ fullName, email, password }) => {
    // ── Supabase path ──
    if (isSupabaseConfigured) {
      const { user: supaUser, error } = await authService.signUp(email, password, fullName);
      if (error) throw new Error(error.message || 'Sign up failed');

      const authUser = { id: supaUser.id, email: supaUser.email, provider: 'supabase' };
      setUser(authUser);
      setProfile(prev => ({
        ...prev,
        fullName,
        email: supaUser.email,
        dateJoined: new Date().toISOString(),
      }));

      // Also cache in localStorage for offline access
      _cacheUserLocally({ fullName, email, password, id: supaUser.id });

      return authUser;
    }

    // ── localStorage fallback path ──
    const users = loadUsers();
    const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) throw new Error('An account with this email already exists');

    const salt = generateSalt();
    const hashedPassword = await hashPassword(password, salt);

    const newUser = {
      id: `user_${Date.now()}`,
      email: email.toLowerCase(),
      password: hashedPassword,
      salt,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    try {
      localStorage.setItem('mithra-users', JSON.stringify(users));
    } catch {
      try {
        const keysToTrim = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('mood-history') || key.includes('focus-sessions'))) {
            keysToTrim.push(key);
          }
        }
        keysToTrim.forEach(k => localStorage.removeItem(k));
        localStorage.setItem('mithra-users', JSON.stringify(users));
      } catch {
        throw new Error('Storage full — please clear browser data and try again');
      }
    }

    const authUser = { id: newUser.id, email: newUser.email };
    setUser(authUser);
    setProfile(prev => ({
      ...prev,
      fullName,
      email: newUser.email,
      dateJoined: newUser.createdAt,
    }));

    return authUser;
  }, []);

  /* ══════════════════════════════════════════════════════════════
     SIGN IN — Supabase-first, localStorage fallback
     ═══════════════════════════════════════════════════════════ */
  const signIn = useCallback(async ({ email, password }) => {
    // ── Supabase path ──
    if (isSupabaseConfigured) {
      const { session, error } = await authService.signIn(email, password);
      if (error) throw new Error(error.message || 'Sign in failed');

      const supaUser = session.user;
      const authUser = { id: supaUser.id, email: supaUser.email, provider: 'supabase' };
      setUser(authUser);

      // Pull profile from Supabase
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', supaUser.id)
          .single();

        if (profileData) {
          setProfile(prev => ({
            ...prev,
            fullName: profileData.full_name || prev.fullName,
            email: supaUser.email,
            avatarUrl: profileData.avatar_url || prev.avatarUrl,
            dateJoined: profileData.created_at || prev.dateJoined,
          }));
        }
      } catch {}

      return authUser;
    }

    // ── localStorage fallback path ──
    const users = loadUsers();
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!found) throw new Error('No account found with this email');

    if (found.salt) {
      const valid = await verifyPassword(password, found.salt, found.password);
      if (!valid) throw new Error('Incorrect password');
    } else {
      try {
        if (atob(found.password) !== password) throw new Error('Incorrect password');
      } catch { throw new Error('Incorrect password'); }
      const salt = generateSalt();
      found.salt = salt;
      found.password = await hashPassword(password, salt);
      try { localStorage.setItem('mithra-users', JSON.stringify(users)); } catch {}
    }

    const authUser = { id: found.id, email: found.email };
    setUser(authUser);

    try {
      const scopedProfile = localStorage.getItem(`mithra-profile-${found.id}`);
      if (scopedProfile) {
        setProfile(JSON.parse(scopedProfile));
      } else {
        const storedProfile = loadProfile();
        if (storedProfile && storedProfile.email === found.email) {
          setProfile(storedProfile);
        } else {
          setProfile(prev => ({ ...prev, email: found.email }));
        }
      }
    } catch {
      setProfile(prev => ({ ...prev, email: found.email }));
    }

    return authUser;
  }, []);

  /* ══════════════════════════════════════════════════════════════
     SIGN OUT
     ═══════════════════════════════════════════════════════════ */
  const signOut = useCallback(async () => {
    if (isSupabaseConfigured) {
      try { await authService.signOut(); } catch {}
    }
    setUser(null);
  }, []);

  /* ══════════════════════════════════════════════════════════════
     PASSWORD RESET
     ═══════════════════════════════════════════════════════════ */
  const resetPassword = useCallback(async (email) => {
    if (isSupabaseConfigured) {
      const { error } = await authService.resetPassword(email);
      if (error) throw new Error(error.message);
      return true;
    }

    const users = loadUsers();
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!found) throw new Error('No account found with this email');
    localStorage.setItem('mithra-reset-email', email.toLowerCase());
    return true;
  }, []);

  const confirmResetPassword = useCallback(async (email, newPassword) => {
    if (isSupabaseConfigured) {
      // With Supabase, the reset flow is handled via email link + updatePassword
      const { error } = await authService.updatePassword(newPassword);
      if (error) throw new Error(error.message);
      return true;
    }

    const users = loadUsers();
    const idx = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if (idx === -1) throw new Error('No account found with this email');
    if (!newPassword || newPassword.length < 6) throw new Error('Password must be at least 6 characters');

    const salt = generateSalt();
    users[idx].password = await hashPassword(newPassword, salt);
    users[idx].salt = salt;
    try { localStorage.setItem('mithra-users', JSON.stringify(users)); } catch {}
    localStorage.removeItem('mithra-reset-email');
    return true;
  }, []);

  /* ══════════════════════════════════════════════════════════════
     PROFILE & PASSWORD UPDATE
     ═══════════════════════════════════════════════════════════ */
  const updateProfile = useCallback(async (updates) => {
    setProfile(prev => ({ ...prev, ...updates }));

    // Sync profile to Supabase
    if (isSupabaseConfigured && user?.provider === 'supabase') {
      try {
        await supabase.from('profiles').upsert({
          id: user.id,
          full_name: updates.fullName || undefined,
          avatar_url: updates.avatarUrl || undefined,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });
      } catch {}
    }
  }, [user]);

  const updatePassword = useCallback(async (currentPassword, newPassword) => {
    if (!user) throw new Error('Not authenticated');

    if (isSupabaseConfigured && user.provider === 'supabase') {
      // Supabase handles password verification internally
      const { error } = await authService.updatePassword(newPassword);
      if (error) throw new Error(error.message);
      return true;
    }

    // localStorage fallback
    const users = loadUsers();
    const idx = users.findIndex(u => u.email === user.email);
    if (idx === -1) throw new Error('User not found');
    
    if (users[idx].salt) {
      const valid = await verifyPassword(currentPassword, users[idx].salt, users[idx].password);
      if (!valid) throw new Error('Current password is incorrect');
    } else {
      try { if (atob(users[idx].password) !== currentPassword) throw new Error('Current password is incorrect'); }
      catch { throw new Error('Current password is incorrect'); }
    }
    
    const salt = generateSalt();
    users[idx].password = await hashPassword(newPassword, salt);
    users[idx].salt = salt;
    try { localStorage.setItem('mithra-users', JSON.stringify(users)); } catch {}
    return true;
  }, [user]);

  /* ── Helper: cache Supabase user locally for offline access ── */
  const _cacheUserLocally = async ({ fullName, email, password, id }) => {
    try {
      const users = loadUsers();
      if (!users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        const salt = generateSalt();
        const hashedPassword = await hashPassword(password, salt);
        users.push({
          id,
          email: email.toLowerCase(),
          password: hashedPassword,
          salt,
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem('mithra-users', JSON.stringify(users));
      }
    } catch {}
  };

  const value = useMemo(() => ({
    user,
    profile,
    isAuthenticated,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    confirmResetPassword,
    updateProfile,
    updatePassword,
  }), [user, profile, isAuthenticated, loading, signUp, signIn, signOut, resetPassword, confirmResetPassword, updateProfile, updatePassword]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
