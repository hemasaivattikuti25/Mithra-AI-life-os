import { supabase } from './supabaseClient';

/**
 * Workspace Service — Manages Mithra Blend workspaces
 * Matches the FastAPI backend endpoints.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

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
            // Smarter hash extraction
            let shareHash = shareHashOrUrl.trim();
            if (shareHash.includes('join=')) {
                const match = shareHash.match(/join=([a-zA-Z0-9_-]+)/);
                if (match) shareHash = match[1];
            } else if (shareHash.includes('/')) {
                // If they pasted a clean URL with hash at the end
                shareHash = shareHash.split('/').pop().split('?')[0];
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
            // Throw so that the UI can catch it and show an error state instead of spinning forever
            throw err;
        }
    },

    getMembers: async (workspaceId) => {
        try {
            const headers = await getHeaders();
            const res = await fetch(`${API_BASE_URL}/api/workspaces/${workspaceId}/members`, {
                headers
            });

            // Fallback: If API fails, try direct Supabase query
            if (!res.ok) {
                throw new Error(await res.text());
            }
            const data = await res.json();
            return data.members || [];
        } catch (err) {
            console.error('[Blend] Get members error - falling back to direct query:', err);

            // Fallback if profiles join fails or backend errors out
            try {
                const { data } = await supabase
                    .from('workspace_members')
                    .select('user_id, role, joined_at')
                    .eq('workspace_id', workspaceId);

                if (!data) return [];

                return data.map(m => ({
                    userId: m.user_id,
                    role: m.role,
                    fullName: `User ${m.user_id.substring(0, 4)}`, // Fallback name
                    avatarUrl: null
                }));
            } catch (fallbackErr) {
                console.error('[Blend] Fallback also failed:', fallbackErr);
                throw fallbackErr;
            }
        }
    },

    leaveWorkspace: async (workspaceId, userId) => {
        try {
            const headers = await getHeaders();
            const res = await fetch(`${API_BASE_URL}/api/workspaces/${workspaceId}/leave`, {
                method: 'DELETE',
                headers
            });
            if (!res.ok) throw new Error(await res.text());
            return await res.json();
        } catch (err) {
            console.error('[Blend] Leave workspace failed:', err);
            throw err;
        }
    },

    deleteWorkspace: async (workspaceId, userId) => {
        try {
            const headers = await getHeaders();
            const res = await fetch(`${API_BASE_URL}/api/workspaces/${workspaceId}`, {
                method: 'DELETE',
                headers
            });
            if (!res.ok) throw new Error(await res.text());
            return await res.json();
        } catch (err) {
            console.error('[Blend] Delete workspace failed:', err);
            throw err;
        }
    }
};
