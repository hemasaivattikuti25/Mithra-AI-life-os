import { apiFetch } from './firebaseClient';

export const aiService = {
  async chat(message, history, context) {
    return await apiFetch('/chat', {
      method: 'POST',
      body: JSON.stringify({ message, history, context }),
    });
  },
  
  async getMemory() {
    return await apiFetch('/chat/memory');
  },
  
  async getPlan() {
    return await apiFetch('/plan/generate', { method: 'POST' });
  }
};
