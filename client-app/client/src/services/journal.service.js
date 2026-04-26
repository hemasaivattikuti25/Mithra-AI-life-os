import { apiFetch } from './firebaseClient';

export const journalService = {
  async getEntries() {
    return await apiFetch('/journal');
  },

  async createEntry(data) {
    return await apiFetch('/journal', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateEntry(id, data) {
    return await apiFetch(`/journal/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteEntry(id) {
    return await apiFetch(`/journal/${id}`, {
      method: 'DELETE',
    });
  }
};
