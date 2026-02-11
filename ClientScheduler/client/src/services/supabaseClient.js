import { createClient } from '@supabase/supabase-js';

/* ═══════════════════════════════════════════════════════════════
   SUPABASE CLIENT — Singleton instance
   
   Gracefully handles missing credentials (offline-only mode).
   When VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are not set,
   the app falls back to localStorage-only operation.
   ═══════════════════════════════════════════════════════════════ */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured = !!(supabaseUrl && supabaseAnonKey);

if (!isConfigured) {
  console.warn(
    '[Mithra] Supabase credentials missing — running in offline mode.\n' +
    'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env to enable cloud sync.'
  );
}

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: localStorage,
        storageKey: 'mithra-supabase-auth',
      },
      realtime: {
        params: { eventsPerSecond: 2 },
      },
    })
  : null;

export const isSupabaseConfigured = isConfigured;

/* ═══════════════════════════════════════════════════════════════
   AUTH SERVICE — Wraps Supabase Auth with offline fallback
   ═══════════════════════════════════════════════════════════════ */
export const authService = {
  /** Sign up with email + password, stores fullName in metadata */
  async signUp(email, password, fullName) {
    if (!supabase) return null; // fall back to localStorage auth
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    // Handle "Database error saving new user" - user was created but trigger failed
    // This happens when the handle_new_user trigger fails, but auth user exists
    if (error) {
      // Check if this is a trigger failure (user was still created)
      if (error.message?.includes('Database error')) {
        // Try to sign in with the newly created credentials
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (signInData?.user) {
          // User exists, manually create profile
          await supabase
            .from('profiles')
            .upsert({
              id: signInData.user.id,
              full_name: fullName || '',
              email: email,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }, { onConflict: 'id' })
            .select();
          
          return { user: signInData.user, session: signInData.session };
        }
      }
      throw error;
    }

    // If signup succeeded, also try to ensure profile exists (belt and suspenders)
    if (data?.user) {
      try {
        await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            full_name: fullName || '',
            email: email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }, { onConflict: 'id' })
          .select();
      } catch {
        // Profile upsert failed, but that's ok - user is created
        console.warn('[Mithra] Could not create profile, but user signup succeeded');
      }
    }

    return data;
  },

  /** Sign in with email + password */
  async signIn(email, password) {
    if (!supabase) return null;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  /** Sign out */
  async signOut() {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /** Get current session (null if not logged in) */
  async getSession() {
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  /** Get current user */
  async getUser() {
    if (!supabase) return null;
    const { data } = await supabase.auth.getUser();
    return data.user;
  },

  /** Subscribe to auth state changes */
  onAuthStateChange(callback) {
    if (!supabase) {
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
    return supabase.auth.onAuthStateChange(callback);
  },

  /** Reset password (sends email) */
  async resetPassword(email) {
    if (!supabase) return null;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/#/reset-password`,
    });
    if (error) throw error;
    return true;
  },

  /** Update password (for logged-in user) */
  async updatePassword(newPassword) {
    if (!supabase) return null;
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return true;
  },
};
