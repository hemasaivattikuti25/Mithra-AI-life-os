import { apiFetch } from './firebaseClient';

export const tasksService = {
  async getTasks() {
    return await apiFetch('/tasks');
  },

  async createTask(data) {
    return await apiFetch('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateTask(id, data) {
    return await apiFetch(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteTask(id) {
    return await apiFetch(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },
  
  async deleteCompleted() {
    return await apiFetch('/tasks/completed', {
      method: 'DELETE',
    });
  }
};
