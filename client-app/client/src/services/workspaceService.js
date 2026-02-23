import { supabase } from './supabaseClient';

/**
 * Workspace Service — Manages Mithra Blend workspaces
 * Refactored to hit the Python Backend API (Clean Architecture)
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const getHeaders = async () => {
    if (!supabase) throw new Error('Supabase not configured. Cannot auth.');
    const { data } = await supabase.auth.getSession();
    if (!data?.session) throw new Error('No active session.');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${data.session.access_token}`
    };
};

export const workspaceService = {
    createWorkspace: async (name, userId) => {
        try {
            const headers = await getHeaders();
            const res = await fetch(`${API_BASE_URL}/api/workspaces`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ name })
            });
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            return data.workspace;
        } catch (err) {
            console.error('[Blend] Create workspace failed:', err);
            throw new Error(err.message || 'Failed to create workspace');
        }
    },

    joinWorkspace: async (shareHashOrUrl, userId) => {
        try {
            // Extract hash from either a full URL or bare hash
            let shareHash = shareHashOrUrl;
            if (shareHashOrUrl.includes('join=')) {
                const match = shareHashOrUrl.match(/join=([a-zA-Z0-9]+)/);
                shareHash = match ? match[1] : shareHashOrUrl;
            }

            const headers = await getHeaders();
            const res = await fetch(`${API_BASE_URL}/api/workspaces/join`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ hash: shareHash })
            });

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(errText || 'Invalid or expired invite link');
            }
            return await res.json();
        } catch (err) {
            console.error('[Blend] Join failed:', err);
            throw err;
        }
    },

    getWorkspaces: async (userId) => {
        try {
            const headers = await getHeaders();
            const res = await fetch(`${API_BASE_URL}/api/workspaces`, {
                headers
            });
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            return data.workspaces || [];
        } catch (err) {
            console.error('[Blend] Get workspaces error:', err);
            return [];
        }
    },

    getMembers: async (workspaceId) => {
        try {
            const headers = await getHeaders();
            const res = await fetch(`${API_BASE_URL}/api/workspaces/${workspaceId}/members`, {
                headers
            });
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            return data.members || [];
        } catch (err) {
            console.error('[Blend] Get members error:', err);
            return [];
        }
    },
};
