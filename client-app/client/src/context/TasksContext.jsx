import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { apiFetch } from '../services/firebaseClient';
import { useAuth } from './AuthContext';

/**
 * TasksContext — isolated context for task state.
 * Decoupled from HabitsContext, JournalContext, etc. to prevent full-tree re-renders.
 */
const TasksContext = createContext(null);

const PAGE_SIZE = 50;

export function TasksProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const offsetRef = useRef(0);
  const abortRef = useRef(null);

  // ── Fetch (paginated) ────────────────────────────────────────────
  const fetchTasks = useCallback(async ({ reset = false, workspaceId = null } = {}) => {
    if (!isAuthenticated) return;
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    const offset = reset ? 0 : offsetRef.current;

    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: PAGE_SIZE, offset });
      if (workspaceId) params.set('workspace_id', workspaceId);

      const data = await apiFetch(`/tasks?${params}`, { signal: abortRef.current.signal });
      const incoming = data.tasks || [];

      setTasks((prev) => reset ? incoming : [...prev, ...incoming]);
      offsetRef.current = offset + incoming.length;
      setHasMore(incoming.length === PAGE_SIZE);
    } catch (err) {
      if (err.name === 'AbortError') return;
      setError(err.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // ── Create ────────────────────────────────────────────────────────
  const createTask = useCallback(async (taskData) => {
    const data = await apiFetch('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
    const newTask = data.task;
    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  }, []);

  // ── Update ────────────────────────────────────────────────────────
  const updateTask = useCallback(async (taskId, updates) => {
    const data = await apiFetch(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    const updated = data.task;
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...updated } : t)));
    return updated;
  }, []);

  // ── Optimistic toggle ─────────────────────────────────────────────
  const toggleTask = useCallback(async (taskId) => {
    let previousState;
    setTasks((prev) => {
      const task = prev.find((t) => t.id === taskId);
      if (!task) return prev;
      previousState = task;
      return prev.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      );
    });
    try {
      await apiFetch(`/tasks/${taskId}/toggle`, { method: 'POST' });
    } catch (err) {
      // Rollback on failure
      if (previousState) {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? previousState : t))
        );
      }
      throw err;
    }
  }, []);

  // ── Delete ────────────────────────────────────────────────────────
  const deleteTask = useCallback(async (taskId) => {
    const snapshot = tasks.find((t) => t.id === taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId)); // optimistic
    try {
      await apiFetch(`/tasks/${taskId}`, { method: 'DELETE' });
    } catch (err) {
      if (snapshot) setTasks((prev) => [snapshot, ...prev]); // rollback
      throw err;
    }
  }, [tasks]);

  // ── Load more (infinite scroll) ──────────────────────────────────
  const loadMore = useCallback(() => {
    if (!loading && hasMore) fetchTasks({ reset: false });
  }, [loading, hasMore, fetchTasks]);

  // ── Reset on auth change ─────────────────────────────────────────
  useEffect(() => {
    if (isAuthenticated) {
      offsetRef.current = 0;
      fetchTasks({ reset: true });
    } else {
      setTasks([]);
      offsetRef.current = 0;
    }
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <TasksContext.Provider value={{
      tasks, loading, error, hasMore,
      fetchTasks, createTask, updateTask, toggleTask, deleteTask, loadMore,
    }}>
      {children}
    </TasksContext.Provider>
  );
}

export const useTasks = () => {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error('useTasks must be used within TasksProvider');
  return ctx;
};
