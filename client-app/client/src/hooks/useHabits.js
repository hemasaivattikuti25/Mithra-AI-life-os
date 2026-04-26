import { useState, useCallback } from 'react';
import { habitsService } from '../services/habits.service';

export function useHabits() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadHabits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await habitsService.getHabits();
      setHabits(data);
    } catch (err) {
      setError(err.message || 'Failed to load habits');
    } finally {
      setLoading(false);
    }
  }, []);

  const addHabit = useCallback(async (habitData) => {
    try {
      const newHabit = await habitsService.createHabit(habitData);
      setHabits(prev => [...prev, newHabit]);
      return newHabit;
    } catch (err) {
      setError(err.message || 'Failed to create habit');
      throw err;
    }
  }, []);

  const updateHabit = useCallback(async (id, habitData) => {
    try {
      const updated = await habitsService.updateHabit(id, habitData);
      setHabits(prev => prev.map(h => h.id === id ? updated : h));
      return updated;
    } catch (err) {
      setError(err.message || 'Failed to update habit');
      throw err;
    }
  }, []);

  const deleteHabit = useCallback(async (id) => {
    try {
      await habitsService.deleteHabit(id);
      setHabits(prev => prev.filter(h => h.id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete habit');
      throw err;
    }
  }, []);

  return {
    habits,
    loading,
    error,
    loadHabits,
    addHabit,
    updateHabit,
    deleteHabit
  };
}
