import { apiFetch } from './firebaseClient';

export const habitsService = {
  async getHabits() {
    return await apiFetch('/habits');
  },

  async createHabit(data) {
    return await apiFetch('/habits', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateHabit(id, data) {
    return await apiFetch(`/habits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteHabit(id) {
    return await apiFetch(`/habits/${id}`, {
      method: 'DELETE',
    });
  }
};
