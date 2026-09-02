import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updatePassword as firebaseUpdatePassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';

/* ═══════════════════════════════════════════════════════════════
   FIREBASE CLIENT — Singleton instance
   
   Replaces Supabase Auth. Uses Firebase Authentication only.
   Database operations go through the FastAPI backend API.
   Gracefully handles missing credentials (offline-only mode).
   ═══════════════════════════════════════════════════════════════ */

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

const isConfigured = !!(firebaseConfig.apiKey && firebaseConfig.projectId);

// CRITICAL SECURITY: In production, require Firebase auth (no offline fallback)
// Set VITE_REQUIRE_AUTH=true in production .env to enforce this
const REQUIRE_AUTH = import.meta.env.VITE_REQUIRE_AUTH === 'true';

if (!isConfigured && REQUIRE_AUTH) {
  console.error(
    '[Mithra SECURITY] ❌ AUTHENTICATION DISABLED: Firebase not configured but ' +
    'VITE_REQUIRE_AUTH=true. User authentication cannot be verified. This is a ' +
    'CRITICAL SECURITY ISSUE in production. Please set Firebase env variables.'
  );
}

let app = null;
let auth = null;

if (isConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
  } catch (e) {
    console.error('[Mithra] Firebase init failed:', e);
  }
}

export const firebaseApp = app;
export const firebaseAuth = auth;
export const isFirebaseConfigured = isConfigured;
export const isAuthRequired = REQUIRE_AUTH;

/* ═══════════════════════════════════════════════════════════════
   AUTH SERVICE — Wraps Firebase Auth with offline fallback
   ═══════════════════════════════════════════════════════════════ */
export const authService = {
  /** Sign up with email + password */
  async signUp(email, password, fullName) {
    if (!auth) return null;
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (cred.user && fullName) {
      await updateProfile(cred.user, { displayName: fullName });
    }
    return { user: cred.user };
  },

  /** Sign in with email + password */
  async signIn(email, password) {
    if (!auth) return null;
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return { user: cred.user };
  },

  /** Sign out */
  async signOut() {
    if (!auth) return;
    await firebaseSignOut(auth);
  },

  /** Get current user */
  getUser() {
    if (!auth) return null;
    return auth.currentUser;
  },

  /** Get ID token for API calls */
  async getIdToken() {
    if (!auth?.currentUser) return null;
    return await auth.currentUser.getIdToken();
  },

  /** Subscribe to auth state changes */
  onAuthStateChange(callback) {
    if (!auth) {
      return { unsubscribe: () => {} };
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      callback(user ? 'SIGNED_IN' : 'SIGNED_OUT', user);
    });
    return { unsubscribe };
  },

  /** Sign in with Google OAuth */
  async signInWithGoogle() {
    if (!auth) return null;
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return { user: result.user };
  },

  /** Reset password (sends email) */
  async resetPassword(email) {
    if (!auth) return null;
    await sendPasswordResetEmail(auth, email);
    return true;
  },

  /** Update password (for logged-in user) */
  async updatePassword(newPassword) {
    if (!auth?.currentUser) return null;
    await firebaseUpdatePassword(auth.currentUser, newPassword);
    return true;
  },
};

/* ═══════════════════════════════════════════════════════════════
   API HELPER — Makes authenticated requests to backend
   ═══════════════════════════════════════════════════════════════ */
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/+$/, '');
const FETCH_TIMEOUT = 30000;
const TOKEN_EXPIRY_BUFFER_MS = 5 * 60 * 1000; // Refresh if < 5 min left

// Module-level token cache — avoids a Firebase round-trip on every request
let _cachedToken = null;
let _cachedTokenExpiry = 0;

async function _getToken() {
  if (!auth?.currentUser) return null;
  const now = Date.now();
  // Use cached token if still valid with buffer
  if (_cachedToken && now < _cachedTokenExpiry - TOKEN_EXPIRY_BUFFER_MS) {
    return _cachedToken;
  }
  // Token expired or about to — force refresh
  try {
    const result = await auth.currentUser.getIdTokenResult(true);
    _cachedToken = result.token;
    _cachedTokenExpiry = new Date(result.expirationTime).getTime();
    return _cachedToken;
  } catch (e) {
    console.warn('[Mithra] Token refresh failed, trying cached:', e.message);
    // Last resort: use potentially stale token rather than blocking the user
    try { return await auth.currentUser.getIdToken(); } catch { return null; }
  }
}

export async function apiFetch(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const token = await _getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };

    const apiPath = path.startsWith('/api') ? path : `/api${path}`;

    const res = await fetch(`${API_URL}${apiPath}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    if (res.status === 401) {
      // Token may have just expired mid-session — clear cache and retry once
      _cachedToken = null;
      _cachedTokenExpiry = 0;
      const freshToken = await _getToken();
      if (freshToken && freshToken !== token) {
        const retryRes = await fetch(`${API_URL}${apiPath}`, {
          ...options,
          headers: { ...headers, Authorization: `Bearer ${freshToken}` },
          signal: controller.signal,
        });
        if (retryRes.ok) return await retryRes.json();
      }
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const err = new Error(body.detail || `API error ${res.status}`);
      err.status = res.status;
      throw err;
    }

    return await res.json();
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. The server may be waking up — please try again.');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/* ═══════════════════════════════════════════════════════════════
   HEALTH CHECK — Measures latency, called on app startup
   ═══════════════════════════════════════════════════════════════ */
export async function checkBackendHealth() {
  try {
    const start = Date.now();
    const res = await fetch(`${API_URL}/ping`, { signal: AbortSignal.timeout(10000) });
    const latency = Date.now() - start;
    if (res.ok) return { ok: true, latency };
    return { ok: false, error: `Status ${res.status}` };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}
