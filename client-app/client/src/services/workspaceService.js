import { supabase } from './supabaseClient';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
console.log('[WorkspaceService] Using API_URL:', API_URL);

const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`
    };
};

export const workspaceService = {
    async createWorkspace(name, userId) {
        const res = await fetch(`${API_URL}/api/workspaces`, {
            method: 'POST',
            headers: await getAuthHeaders(),
            body: JSON.stringify({ name: name.trim() })
        });
        if (!res.ok) throw new Error((await res.json()).detail || 'Failed to create workspace');
        const data = await res.json();
        return data.workspace;
    },

    async joinByCode(input, userId) {
        let hash = input.trim();
        if (hash.includes('join=')) hash = hash.split('join=').pop().split('&')[0].split('#')[0].trim();
        else if (hash.includes('/')) hash = hash.split('/').pop().split('?')[0].split('#')[0].trim();

        const res = await fetch(`${API_URL}/api/workspaces/join`, {
            method: 'POST',
            headers: await getAuthHeaders(),
            body: JSON.stringify({ hash })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Invalid invite link');

        // Fetch updated workspaces to return the full workspace object
        const wsList = await this.getWorkspaces(userId);
        const joinedWs = wsList.find(w => w.id === data.workspaceId);
        return { workspace: joinedWs, alreadyMember: !!data.alreadyMember };
    },

    async getWorkspaces(userId) {
        const res = await fetch(`${API_URL}/api/workspaces`, { headers: await getAuthHeaders() });
        if (!res.ok) throw new Error('Failed to load workspaces');
        const data = await res.json();
        return data.workspaces || [];
    },

    async getMembers(workspaceId) {
        const res = await fetch(`${API_URL}/api/workspaces/${workspaceId}/members`, { headers: await getAuthHeaders() });
        if (!res.ok) throw new Error('Failed to load members');
        const data = await res.json();
        return data.members || [];
    },

    async getWorkspaceHabits(workspaceId) {
        // Safe to use Supabase client directly for SELECT operations
        const { data, error } = await supabase.from('habits').select('*').eq('workspace_id', workspaceId);
        if (error) throw error;
        return data || [];
    },

    async getWorkspaceTasks(workspaceId) {
        // Safe to use Supabase client directly for SELECT operations
        const { data, error } = await supabase.from('tasks').select('*').eq('workspace_id', workspaceId).eq('completed', false);
        if (error) throw error;
        return data || [];
    },

    async leaveWorkspace(workspaceId, userId) {
        const res = await fetch(`${API_URL}/api/workspaces/${workspaceId}/leave`, {
            method: 'DELETE',
            headers: await getAuthHeaders()
        });
        if (!res.ok) throw new Error((await res.json()).detail || 'Failed to leave workspace');
        return { success: true };
    },

    async deleteWorkspace(workspaceId, userId) {
        const res = await fetch(`${API_URL}/api/workspaces/${workspaceId}`, {
            method: 'DELETE',
            headers: await getAuthHeaders()
        });
        if (!res.ok) throw new Error((await res.json()).detail || 'Failed to delete workspace');
        return { success: true };
    }
};
// Manual override
