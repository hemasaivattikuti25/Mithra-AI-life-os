import { supabase } from './supabaseClient';

export const workspaceService = {
    createWorkspace: async (name, userId) => {
        const shareHash = Math.random().toString(36).substring(2, 15);

        const { data: workspace, error } = await supabase
            .from('workspaces')
            .insert({ name, created_by: userId, share_link_hash: shareHash })
            .select()
            .single();

        if (error) throw error;

        // Auto-join creator as owner
        await supabase
            .from('workspace_members')
            .insert({ workspace_id: workspace.id, user_id: userId, role: 'owner' });

        return workspace;
    },

    joinWorkspace: async (shareHash, userId) => {
        const { data: workspace, error: wsError } = await supabase
            .from('workspaces')
            .select('id')
            .eq('share_link_hash', shareHash)
            .single();

        if (wsError || !workspace) throw new Error("Invalid or expired invite link");

        const { error: joinError } = await supabase
            .from('workspace_members')
            .insert({ workspace_id: workspace.id, user_id: userId, role: 'member' });

        if (joinError) throw joinError;
        return workspace.id;
    },

    getWorkspaces: async (userId) => {
        const { data, error } = await supabase
            .from('workspace_members')
            .select('workspaces(*)')
            .eq('user_id', userId);
        if (error) throw error;
        // Postgres query shape might bury it in 'workspaces', so return cleanly
        return data.map(d => d.workspaces);
    }
};
