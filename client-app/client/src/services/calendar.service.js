import { apiFetch } from './firebaseClient';

export const calendarService = {
  async getEvents() {
    return await apiFetch('/events');
  },

  async createEvent(data) {
    return await apiFetch('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateEvent(id, data) {
    return await apiFetch(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteEvent(id) {
    return await apiFetch(`/events/${id}`, {
      method: 'DELETE',
    });
  },
  
  async getSyncStatus() {
    return await apiFetch('/calendar/sync-status');
  },
  
  async syncGoogleCalendar() {
    return await apiFetch('/calendar/sync', { method: 'POST' });
  }
};
