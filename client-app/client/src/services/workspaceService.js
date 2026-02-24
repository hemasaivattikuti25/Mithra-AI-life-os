import { supabase } from './supabaseClient';

/**
 * Workspace Service — Mithra Blend
 *
 * Shared-workspace architecture:
 *   - workspaces.created_by references auth.users(id) directly
 *   - workspace_members for membership tracking
 *   - join_code (6-char uppercase) for easy sharing
 *   - share_link_hash for URL-based invites
 *
 * All functions throw on error — callers must catch.
 */

// ─── Character set for join codes (excludes O/0/I/1/L to avoid confusion) ───
const JOIN_CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function generateJoinCode() {
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += JOIN_CODE_CHARS[Math.floor(Math.random() * JOIN_CODE_CHARS.length)];
    }
    return code;
}

function ensureSupabase() {
    if (!supabase) {
        throw new Error('Supabase is not configured. Check your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }
}

// ─── Exported Service ───────────────────────────────────────────────────────

export const workspaceService = {

    // ═══════════════════════════════════════════════════════════════
    //  CREATE WORKSPACE
    // ═══════════════════════════════════════════════════════════════
    async createWorkspace(name, userId) {
        ensureSupabase();
        try {
            // Step 0: Ensure profile exists (auto-upsert if trigger failed)
            const { data: profile } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', userId)
                .maybeSingle();

            if (!profile) {
                const { data: userData } = await supabase.auth.getUser();
                const u = userData?.user;
                if (u) {
                    await supabase.from('profiles').upsert({
                        id: u.id,
                        email: u.email,
                        display_name: u.user_metadata?.full_name || u.email?.split('@')[0] || 'User',
                        avatar_url: u.user_metadata?.avatar_url || null,
                    }, { onConflict: 'id', ignoreDuplicates: true });
                }
            }

            // Step 1: Generate unique codes
            const joinCode = generateJoinCode();
            const shareLinkHash = crypto.randomUUID().replace(/-/g, '').substring(0, 16);

            // Step 2: Insert workspace
            const { data: ws, error: wsErr } = await supabase
                .from('workspaces')
                .insert({
                    name: name.trim(),
                    created_by: userId,
                    join_code: joinCode,
                    share_link_hash: shareLinkHash,
                })
                .select()
                .single();

            if (wsErr) {
                // If join_code collision, retry once with a new code
                if (wsErr.code === '23505' && wsErr.message?.includes('join_code')) {
                    const retryCode = generateJoinCode();
                    const { data: ws2, error: wsErr2 } = await supabase
                        .from('workspaces')
                        .insert({
                            name: name.trim(),
                            created_by: userId,
                            join_code: retryCode,
                            share_link_hash: crypto.randomUUID().replace(/-/g, '').substring(0, 16),
                        })
                        .select()
                        .single();
                    if (wsErr2) throw new Error(`Workspace insert failed: ${wsErr2.message} (Code: ${wsErr2.code})`);
                    // Use ws2 for member insert below
                    const { error: memErr } = await supabase
                        .from('workspace_members')
                        .insert({ workspace_id: ws2.id, user_id: userId, role: 'owner' });
                    if (memErr) {
                        await supabase.from('workspaces').delete().eq('id', ws2.id);
                        throw new Error(`Member insert failed: ${memErr.message} (Code: ${memErr.code})`);
                    }
                    return ws2;
                }
                throw new Error(`Workspace insert failed: ${wsErr.message} (Code: ${wsErr.code})`);
            }

            // Step 3: Add creator as owner member
            const { error: memErr } = await supabase
                .from('workspace_members')
                .insert({ workspace_id: ws.id, user_id: userId, role: 'owner' });

            if (memErr) {
                // Rollback workspace if member insert fails
                await supabase.from('workspaces').delete().eq('id', ws.id);
                throw new Error(`Member insert failed: ${memErr.message} (Code: ${memErr.code})`);
            }

            return ws;
        } catch (err) {
            console.error('[Blend] createWorkspace error:', err);
            throw err;
        }
    },

    // ═══════════════════════════════════════════════════════════════
    //  JOIN BY CODE (accepts 6-char code, share hash, or full URL)
    // ═══════════════════════════════════════════════════════════════
    async joinByCode(input, userId) {
        ensureSupabase();
        try {
            let cleaned = input.trim();

            // Extract hash from URL if it contains "join="
            if (cleaned.includes('join=')) {
                const match = cleaned.match(/join=([a-zA-Z0-9_-]+)/);
                if (match) cleaned = match[1];
            } else if (cleaned.includes('/')) {
                // Extract last path segment
                cleaned = cleaned.split('/').pop().split('?')[0];
            }

            let workspace = null;

            // Try 1: Look up by join_code (uppercase the input for case-insensitive matching)
            const upperCleaned = cleaned.toUpperCase();
            if (upperCleaned.length <= 8) {
                const { data: byCode, error: codeErr } = await supabase
                    .from('workspaces')
                    .select('*')
                    .eq('join_code', upperCleaned)
                    .maybeSingle();

                if (codeErr && codeErr.code !== 'PGRST116') {
                    throw new Error(`Lookup failed: ${codeErr.message} (Code: ${codeErr.code})`);
                }
                workspace = byCode;
            }

            // Try 2: Look up by share_link_hash
            if (!workspace) {
                const { data: byHash, error: hashErr } = await supabase
                    .from('workspaces')
                    .select('*')
                    .eq('share_link_hash', cleaned)
                    .maybeSingle();

                if (hashErr && hashErr.code !== 'PGRST116') {
                    throw new Error(`Lookup failed: ${hashErr.message} (Code: ${hashErr.code})`);
                }
                workspace = byHash;
            }

            if (!workspace) {
                throw new Error('Invalid invite code or link. Please check and try again.');
            }

            // Check if already a member
            const { data: existing } = await supabase
                .from('workspace_members')
                .select('workspace_id')
                .eq('workspace_id', workspace.id)
                .eq('user_id', userId)
                .maybeSingle();

            if (existing) {
                return { workspace, alreadyMember: true };
            }

            // Insert as member
            const { error: joinErr } = await supabase
                .from('workspace_members')
                .insert({ workspace_id: workspace.id, user_id: userId, role: 'member' });

            if (joinErr) {
                throw new Error(`Join failed: ${joinErr.message} (Code: ${joinErr.code})`);
            }

            return { workspace, alreadyMember: false };
        } catch (err) {
            console.error('[Blend] joinByCode error:', err);
            throw err;
        }
    },

    // ═══════════════════════════════════════════════════════════════
    //  GET WORKSPACES (two flat queries — no nested joins)
    // ═══════════════════════════════════════════════════════════════
    async getWorkspaces(userId) {
        ensureSupabase();
        try {
            // Query 1: Get memberships
            const { data: memberships, error: err1 } = await supabase
                .from('workspace_members')
                .select('workspace_id, role')
                .eq('user_id', userId);

            if (err1) {
                throw new Error(`Members query failed: ${err1.message} (Code: ${err1.code})`);
            }

            if (!memberships || memberships.length === 0) return [];

            const workspaceIds = memberships.map(m => m.workspace_id);

            // Query 2: Get workspace details
            const { data: workspaces, error: err2 } = await supabase
                .from('workspaces')
                .select('id, name, join_code, share_link_hash, created_by, created_at')
                .in('id', workspaceIds);

            if (err2) {
                throw new Error(`Workspaces query failed: ${err2.message} (Code: ${err2.code})`);
            }

            // Merge role into each workspace
            return (workspaces || []).map(ws => ({
                ...ws,
                userRole: memberships.find(m => m.workspace_id === ws.id)?.role || 'member',
            }));
        } catch (err) {
            console.error('[Blend] getWorkspaces error:', err);
            throw err;
        }
    },

    // ═══════════════════════════════════════════════════════════════
    //  GET MEMBERS (with profile data)
    // ═══════════════════════════════════════════════════════════════
    async getMembers(workspaceId) {
        ensureSupabase();
        try {
            // Get memberships
            const { data: members, error: memErr } = await supabase
                .from('workspace_members')
                .select('user_id, role, joined_at')
                .eq('workspace_id', workspaceId);

            if (memErr) {
                throw new Error(`Get members failed: ${memErr.message} (Code: ${memErr.code})`);
            }

            if (!members || members.length === 0) return [];

            // Batch fetch profiles
            const userIds = members.map(m => m.user_id);
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, email, display_name, avatar_url')
                .in('id', userIds);

            const profileMap = {};
            (profiles || []).forEach(p => { profileMap[p.id] = p; });

            return members.map(m => {
                const p = profileMap[m.user_id];
                return {
                    userId: m.user_id,
                    role: m.role,
                    joinedAt: m.joined_at,
                    fullName: p?.display_name || p?.email?.split('@')[0] || 'User',
                    avatarUrl: p?.avatar_url || null,
                    email: p?.email || null,
                };
            });
        } catch (err) {
            console.error('[Blend] getMembers error:', err);
            throw err;
        }
    },

    // ═══════════════════════════════════════════════════════════════
    //  GET WORKSPACE HABITS
    // ═══════════════════════════════════════════════════════════════
    async getWorkspaceHabits(workspaceId) {
        ensureSupabase();
        const { data, error } = await supabase
            .from('habits')
            .select('*')
            .eq('workspace_id', workspaceId);

        if (error) throw new Error(`Workspace habits query failed: ${error.message} (Code: ${error.code})`);
        return data || [];
    },

    // ═══════════════════════════════════════════════════════════════
    //  GET WORKSPACE TASKS (incomplete only)
    // ═══════════════════════════════════════════════════════════════
    async getWorkspaceTasks(workspaceId) {
        ensureSupabase();
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('workspace_id', workspaceId)
            .eq('completed', false);

        if (error) throw new Error(`Workspace tasks query failed: ${error.message} (Code: ${error.code})`);
        return data || [];
    },

    // ═══════════════════════════════════════════════════════════════
    //  LEAVE WORKSPACE
    // ═══════════════════════════════════════════════════════════════
    async leaveWorkspace(workspaceId, userId) {
        ensureSupabase();
        // Check if user is owner — owners must delete, not leave
        const { data: ws } = await supabase
            .from('workspaces')
            .select('created_by')
            .eq('id', workspaceId)
            .single();

        if (ws?.created_by === userId) {
            throw new Error('You are the owner. Transfer ownership or delete the workspace instead.');
        }

        const { error } = await supabase
            .from('workspace_members')
            .delete()
            .eq('workspace_id', workspaceId)
            .eq('user_id', userId);

        if (error) throw new Error(`Leave workspace failed: ${error.message} (Code: ${error.code})`);
        return { success: true };
    },

    // ═══════════════════════════════════════════════════════════════
    //  DELETE WORKSPACE (owner only — cascade deletes members)
    // ═══════════════════════════════════════════════════════════════
    async deleteWorkspace(workspaceId, userId) {
        ensureSupabase();
        // Verify ownership
        const { data: ws } = await supabase
            .from('workspaces')
            .select('created_by')
            .eq('id', workspaceId)
            .single();

        if (!ws || ws.created_by !== userId) {
            throw new Error('Only the owner can delete this workspace.');
        }

        const { error } = await supabase
            .from('workspaces')
            .delete()
            .eq('id', workspaceId);

        if (error) throw new Error(`Delete workspace failed: ${error.message} (Code: ${error.code})`);
        return { success: true };
    },
};
