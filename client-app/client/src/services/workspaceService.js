import { apiFetch } from './firebaseClient';

// workspaceService now uses apiFetch which handles auth automatically

export const workspaceService = {
    async createWorkspace(name, userId) {
        const data = await apiFetch('/workspaces', {
            method: 'POST',
            body: JSON.stringify({ name: name.trim() })
        });
        return data.workspace;
    },

    async joinByCode(input, userId) {
        let hash = input.trim();
        if (hash.includes('join=')) hash = hash.split('join=').pop().split('&')[0].split('#')[0].trim();
        else if (hash.includes('/')) hash = hash.split('/').pop().split('?')[0].split('#')[0].trim();

        const data = await apiFetch('/workspaces/join', {
            method: 'POST',
            body: JSON.stringify({ hash })
        });

        // Fetch updated workspaces to return the full workspace object
        const wsList = await this.getWorkspaces(userId);
        const joinedWs = wsList.find(w => w.id === data.workspaceId);
        return { workspace: joinedWs, alreadyMember: !!data.alreadyMember };
    },

    async getWorkspaces(userId) {
        const data = await apiFetch('/workspaces');
        return data.workspaces || [];
    },

    async getMembers(workspaceId) {
        const data = await apiFetch(`/workspaces/${workspaceId}/members`);
        return data.members || [];
    },

    async getWorkspaceHabits(workspaceId) {
        const data = await apiFetch(`/habits?workspace_id=${workspaceId}`);
        return data.habits || [];
    },

    async getWorkspaceTasks(workspaceId) {
        const data = await apiFetch(`/tasks?workspace_id=${workspaceId}&completed=false`);
        return data.tasks || [];
    },

    async getWorkspaceJournal(workspaceId) {
        const data = await apiFetch(`/journal?workspace_id=${workspaceId}`);
        return data.entries || [];
    },

    async createWorkspaceJournal(workspaceId, content, mood, tags) {
        const data = await apiFetch('/journal', {
            method: 'POST',
            body: JSON.stringify({ content, mood: mood || 3, tags: tags || [], workspaceId })
        });
        return data.entry;
    },

    async leaveWorkspace(workspaceId, userId) {
        await apiFetch(`/workspaces/${workspaceId}/leave`, { method: 'DELETE' });
        return { success: true };
    },

    async deleteWorkspace(workspaceId, userId) {
        await apiFetch(`/workspaces/${workspaceId}`, { method: 'DELETE' });
        return { success: true };
    },

    async getWorkspaceEvents(workspaceId) {
        const data = await apiFetch(`/events?workspace_id=${workspaceId}`);
        return Array.isArray(data) ? data : [];
    },
};
