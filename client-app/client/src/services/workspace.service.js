import { apiFetch } from './firebaseClient';

export const workspaceService = {
  async getWorkspaces() {
    return await apiFetch('/workspaces');
  },

  async createWorkspace(name) {
    return await apiFetch('/workspaces', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },

  async getMembers(workspaceId) {
    return await apiFetch(`/workspaces/${workspaceId}/members`);
  },

  async joinByCode(code, userId) {
    return await apiFetch('/workspaces/join', {
      method: 'POST',
      body: JSON.stringify({ join_code: code, user_id: userId }),
    });
  },

  async leaveWorkspace(workspaceId, userId) {
    return await apiFetch(`/workspaces/${workspaceId}/members/${userId}`, {
      method: 'DELETE',
    });
  },

  async deleteWorkspace(workspaceId, userId) {
    return await apiFetch(`/workspaces/${workspaceId}?user_id=${userId}`, {
      method: 'DELETE',
    });
  },
  
  async getWorkspaceTasks(workspaceId) {
    return await apiFetch(`/tasks?workspace_id=${workspaceId}`);
  },
  
  async getWorkspaceHabits(workspaceId) {
    return await apiFetch(`/habits?workspace_id=${workspaceId}`);
  },
  
  async getWorkspaceEvents(workspaceId) {
    return await apiFetch(`/events?workspace_id=${workspaceId}`);
  }
};
