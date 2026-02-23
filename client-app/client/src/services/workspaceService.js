import { supabase } from './supabaseClient';

/**
 * Workspace Service — Manages Mithra Blend workspaces
 * All operations are null-safe (gracefully handles offline/no-supabase mode)
 */

// Timeout wrapper — prevents Supabase queries from hanging forever
const withTimeout = (promise, ms = 8000) =>
    Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timed out. Please check your connection.')), ms)
        ),
    ]);

export const workspaceService = {
    createWorkspace: async (name, userId) => {
        if (!supabase) throw new Error('Supabase not configured. Cannot create workspace in offline mode.');

        const shareHash = crypto.randomUUID().replace(/-/g, '').substring(0, 12);

        // Step 1: Insert workspace
        const { data: workspace, error } = await withTimeout(
            supabase
                .from('workspaces')
                .insert({ name, created_by: userId, share_link_hash: shareHash })
                .select()
                .single()
        );

        if (error) {
            console.error('[Blend] Create workspace failed:', error);
            throw new Error(error.message || 'Failed to create workspace');
        }

        // Step 2: Auto-join creator as owner
        const { error: memberError } = await withTimeout(
            supabase
                .from('workspace_members')
                .insert({ workspace_id: workspace.id, user_id: userId, role: 'owner' })
        );

        if (memberError) {
            console.error('[Blend] Auto-join as owner failed:', memberError);
            // Workspace was created but join failed — try to clean up
            await supabase.from('workspaces').delete().eq('id', workspace.id);
            throw new Error('Created workspace but failed to join as owner. Please try again.');
        }

        return workspace;
    },

    joinWorkspace: async (shareHashOrUrl, userId) => {
        if (!supabase) throw new Error('Supabase not configured.');

        // Extract hash from either a full URL or bare hash
        let shareHash = shareHashOrUrl;
        if (shareHashOrUrl.includes('join=')) {
            const match = shareHashOrUrl.match(/join=([a-zA-Z0-9]+)/);
            shareHash = match ? match[1] : shareHashOrUrl;
        }

        const { data: workspace, error: wsError } = await withTimeout(
            supabase
                .from('workspaces')
                .select('id, name')
                .eq('share_link_hash', shareHash)
                .single()
        );

        if (wsError || !workspace) {
            console.error('[Blend] Workspace lookup failed:', wsError);
            throw new Error('Invalid or expired invite link');
        }

        // Check if already a member
        const { data: existing } = await withTimeout(
            supabase
                .from('workspace_members')
                .select('workspace_id')
                .eq('workspace_id', workspace.id)
                .eq('user_id', userId)
                .maybeSingle()
        );

        if (existing) {
            return { id: workspace.id, name: workspace.name, alreadyMember: true };
        }

        const { error: joinError } = await withTimeout(
            supabase
                .from('workspace_members')
                .insert({ workspace_id: workspace.id, user_id: userId, role: 'member' })
        );

        if (joinError) {
            console.error('[Blend] Join failed:', joinError);
            throw new Error(joinError.message || 'Could not join workspace');
        }

        return { id: workspace.id, name: workspace.name, alreadyMember: false };
    },

    getWorkspaces: async (userId) => {
        if (!supabase) return [];

        try {
            const { data, error } = await withTimeout(
                supabase
                    .from('workspace_members')
                    .select('workspace_id, role, workspaces(id, name, share_link_hash, created_by, created_at)')
                    .eq('user_id', userId)
            );

            if (error) {
                console.error('[Blend] Get workspaces failed:', error);
                return [];
            }

            // Flatten the nested response
            return (data || [])
                .map(d => d.workspaces)
                .filter(Boolean);
        } catch (err) {
            console.error('[Blend] Get workspaces error:', err.message);
            return [];
        }
    },

    getMembers: async (workspaceId) => {
        if (!supabase) return [];

        try {
            const { data, error } = await withTimeout(
                supabase
                    .from('workspace_members')
                    .select('user_id, role, joined_at, profiles:user_id(full_name, avatar_url, email)')
                    .eq('workspace_id', workspaceId)
            );

            if (error) {
                console.error('[Blend] Get members failed:', error);
                return [];
            }

            return (data || []).map(d => ({
                userId: d.user_id,
                role: d.role,
                joinedAt: d.joined_at,
                fullName: d.profiles?.full_name || 'User',
                avatarUrl: d.profiles?.avatar_url || null,
                email: d.profiles?.email || '',
            }));
        } catch (err) {
            console.error('[Blend] Get members error:', err.message);
            return [];
        }
    },
};
