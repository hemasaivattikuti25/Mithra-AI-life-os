import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { apiFetch } from '../services/firebaseClient';
import { useAuth } from './AuthContext';

/**
 * HabitsContext — isolated context for habit tracking state.
 */
const HabitsContext = createContext(null);

export function HabitsProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const fetchHabits = useCallback(async ({ workspaceId = null } = {}) => {
    if (!isAuthenticated) return;
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: 100 });
      if (workspaceId) params.set('workspace_id', workspaceId);
      const data = await apiFetch(`/habits?${params}`, { signal: abortRef.current.signal });
      setHabits(data.habits || []);
    } catch (err) {
      if (err.name === 'AbortError') return;
      setError(err.message || 'Failed to load habits');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const createHabit = useCallback(async (habitData) => {
    const data = await apiFetch('/habits', {
      method: 'POST',
      body: JSON.stringify(habitData),
    });
    setHabits((prev) => [data.habit, ...prev]);
    return data.habit;
  }, []);

  const completeHabit = useCallback(async (habitId) => {
    // Optimistic update
    setHabits((prev) =>
      prev.map((h) =>
        h.id === habitId
          ? { ...h, streak: (h.streak || 0) + 1, completedDates: [...(h.completedDates || []), new Date().toISOString().slice(0, 10)] }
          : h
      )
    );
    try {
      const data = await apiFetch(`/habits/${habitId}/complete`, { method: 'POST' });
      // Sync server response (streak may already be done)
      setHabits((prev) =>
        prev.map((h) =>
          h.id === habitId ? { ...h, streak: data.streak, longestStreak: data.longestStreak } : h
        )
      );
      return data;
    } catch (err) {
      // Rollback streak on failure
      setHabits((prev) =>
        prev.map((h) =>
          h.id === habitId
            ? { ...h, streak: Math.max(0, (h.streak || 1) - 1) }
            : h
        )
      );
      throw err;
    }
  }, []);

  const deleteHabit = useCallback(async (habitId) => {
    const snapshot = habits.find((h) => h.id === habitId);
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
    try {
      await apiFetch(`/habits/${habitId}`, { method: 'DELETE' });
    } catch (err) {
      if (snapshot) setHabits((prev) => [snapshot, ...prev]);
      throw err;
    }
  }, [habits]);

  useEffect(() => {
    if (isAuthenticated) fetchHabits();
    else setHabits([]);
    return () => { if (abortRef.current) abortRef.current.abort(); };
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <HabitsContext.Provider value={{
      habits, loading, error,
      fetchHabits, createHabit, completeHabit, deleteHabit,
    }}>
      {children}
    </HabitsContext.Provider>
  );
}

export const useHabits = () => {
  const ctx = useContext(HabitsContext);
  if (!ctx) throw new Error('useHabits must be used within HabitsProvider');
  return ctx;
};
