import { apiFetch } from './firebaseClient';

export const userService = {
  async getProfile() {
    return await apiFetch('/users/me');
  },

  async updateProfile(data) {
    return await apiFetch('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  async getSettings() {
    return await apiFetch('/users/settings');
  },
  
  async updateSettings(data) {
    return await apiFetch('/users/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
};
