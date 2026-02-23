import { supabase } from './supabaseClient';

/**
 * Workspace Service — Manages Mithra Blend workspaces
 * Connecting directly to Supabase to bypass FastAPI routing issues 
 * and expose real RLS errors.
 */

export const workspaceService = {
    createWorkspace: async (name, userId) => {
        try {
            // 1. Generate hash
            const shareHash = crypto.randomUUID().replace(/-/g, '').slice(0, 12);

            // 2. Insert Workspace
            const { data: ws, error: wsErr } = await supabase
                .from('workspaces')
                .insert({ name, owner_id: userId, share_link_hash: shareHash })
                .select()
                .single();

            if (wsErr) {
                console.error('[Blend] Supabase insert workspace error:', wsErr);
                throw new Error(`Create workspace failed: ${wsErr.message} (Code: ${wsErr.code})`);
            }

            // 3. Insert Owner Member
            const { error: memErr } = await supabase
                .from('workspace_members')
                .insert({ workspace_id: ws.id, user_id: userId, role: 'owner' });

            if (memErr) {
                console.error('[Blend] Supabase insert member error:', memErr);
                throw new Error(`Add owner member failed: ${memErr.message} (Code: ${memErr.code})`);
            }

            return ws;
        } catch (err) {
            console.error('[Blend] createWorkspace FATAL:', err);
            // Propagate exact message up to the UI
            throw err;
        }
    },

    joinWorkspace: async (shareHashOrUrl, userId) => {
        try {
            let shareHash = shareHashOrUrl.trim();
            if (shareHash.includes('join=')) {
                const match = shareHash.match(/join=([a-zA-Z0-9_-]+)/);
                if (match) shareHash = match[1];
            } else if (shareHash.includes('/')) {
                shareHash = shareHash.split('/').pop().split('?')[0];
            }

            // 1. Find the workspace
            const { data: ws, error: findErr } = await supabase
                .from('workspaces')
                .select('id')
                .eq('share_link_hash', shareHash)
                .single();

            if (findErr) {
                console.error('[Blend] Find workspace by hash error:', findErr);
                throw new Error(`Join failed (Find WS): ${findErr.message} (Code: ${findErr.code})`);
            }

            if (!ws) throw new Error('Invalid or expired invite link (Workspace not found)');

            // 2. Check existing membership
            const { data: existing, error: checkErr } = await supabase
                .from('workspace_members')
                .select('workspace_id')
                .eq('workspace_id', ws.id)
                .eq('user_id', userId)
                .single();

            if (checkErr && checkErr.code !== 'PGRST116') {
                console.error('[Blend] Check existing member error:', checkErr);
                throw new Error(`Join failed (Check Member): ${checkErr.message} (Code: ${checkErr.code})`);
            }

            if (existing) {
                return { success: true, alreadyMember: true, workspaceId: ws.id };
            }

            // 3. Insert membership
            const { error: joinErr } = await supabase
                .from('workspace_members')
                .insert({ workspace_id: ws.id, user_id: userId, role: 'member' });

            if (joinErr) {
                console.error('[Blend] Insert new member error:', joinErr);
                throw new Error(`Join failed (Insert Member): ${joinErr.message} (Code: ${joinErr.code})`);
            }

            return { success: true, workspaceId: ws.id };
        } catch (err) {
            console.error('[Blend] joinWorkspace FATAL:', err);
            throw err;
        }
    },

    getWorkspaces: async (userId) => {
        try {
            console.log('[Blend Service] getWorkspaces START for user:', userId);
            // Query 1: Get memberships
            console.log('[Blend Service] Firing workspace_members query...');

            const start1 = performance.now();
            const { data: memberships, error: err1 } = await supabase
                .from('workspace_members')
                .select('workspace_id, role')
                .eq('user_id', userId);
            console.log(`[Blend Service] workspace_members query finished in ${(performance.now() - start1).toFixed(2)}ms. Error:`, err1);

            if (err1) {
                console.error('[Blend] Get memberships error:', err1);
                throw new Error(`Members query failed: ${err1.message} (Code: ${err1.code})`);
            }

            if (!memberships || memberships.length === 0) return [];

            const workspaceIds = memberships.map(m => m.workspace_id);
            console.log('[Blend Service] Found workspace IDs:', workspaceIds);

            // Query 2: Get workspace details
            console.log('[Blend Service] Firing workspaces query...');
            const start2 = performance.now();
            const { data: workspaces, error: err2 } = await supabase
                .from('workspaces')
                .select('id, name, share_link_hash, owner_id, created_at')
                .in('id', workspaceIds);
            console.log(`[Blend Service] workspaces query finished in ${(performance.now() - start2).toFixed(2)}ms. Error:`, err2);

            if (err2) {
                console.error('[Blend] Get workspaces error:', err2);
                throw new Error(`Workspaces query failed: ${err2.message} (Code: ${err2.code})`);
            }

            // Merge data
            return (workspaces || []).map(ws => ({
                ...ws,
                userRole: memberships.find(m => m.workspace_id === ws.id)?.role || 'member'
            }));
        } catch (err) {
            console.error('[Blend] getWorkspaces FATAL:', err);
            throw err;
        }
    },

    getMembers: async (workspaceId) => {
        try {
            const { data, error } = await supabase
                .from('workspace_members')
                .select('user_id, role, joined_at')
                .eq('workspace_id', workspaceId);

            if (error) {
                console.error('[Blend] getMembers query error:', error);
                throw new Error(`Get members failed: ${error.message} (Code: ${error.code})`);
            }

            if (!data) return [];

            return data.map(m => ({
                userId: m.user_id,
                role: m.role,
                fullName: `User ${m.user_id.substring(0, 4)}`, // Fallback
                avatarUrl: null
            }));
        } catch (err) {
            console.error('[Blend] getMembers FATAL:', err);
            throw err;
        }
    },

    leaveWorkspace: async (workspaceId, userId) => {
        try {
            const { error } = await supabase
                .from('workspace_members')
                .delete()
                .eq('workspace_id', workspaceId)
                .eq('user_id', userId);

            if (error) {
                console.error('[Blend] leaveWorkspace error:', error);
                throw new Error(`Leave workspace failed: ${error.message} (Code: ${error.code})`);
            }
            return { success: true };
        } catch (err) {
            console.error('[Blend] leaveWorkspace FATAL:', err);
            throw err;
        }
    },

    deleteWorkspace: async (workspaceId, userId) => {
        try {
            const { error } = await supabase
                .from('workspaces')
                .delete()
                .eq('id', workspaceId)
                .eq('owner_id', userId);

            if (error) {
                console.error('[Blend] deleteWorkspace error:', error);
                throw new Error(`Delete workspace failed: ${error.message} (Code: ${error.code})`);
            }
            return { success: true };
        } catch (err) {
            console.error('[Blend] deleteWorkspace FATAL:', err);
            throw err;
        }
    }
};
