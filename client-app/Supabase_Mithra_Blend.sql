-- Mithra Blend & Workspaces Schema Update
-- Instructions: Run this script in your Supabase SQL Editor.

-- 1. Create Workspaces Table
CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    share_link_hash TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Workspace Members Table
CREATE TABLE workspace_members (
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('owner', 'member')) DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (workspace_id, user_id)
);

-- 3. Modify existing tables to support Workspaces
ALTER TABLE tasks ADD COLUMN workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;
ALTER TABLE habits ADD COLUMN workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;
ALTER TABLE journal_entries ADD COLUMN workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;

-- 5. Define RLS Policies

-- Workspaces: Users can view workspaces they are members of
CREATE POLICY "View workspaces if member" ON workspaces
    FOR SELECT USING (
        id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
    );

-- Workspaces: Only owners can update workspaces
CREATE POLICY "Update workspaces if owner" ON workspaces
    FOR UPDATE USING (
        created_by = auth.uid()
    );

-- Workspace Members: Members can view other members in their shared workspaces
CREATE POLICY "View workspace members" ON workspace_members
    FOR SELECT USING (
        workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
    );

-- Workspace Members: Users can insert themselves when joining via invite link
CREATE POLICY "Insert workspace member" ON workspace_members
    FOR INSERT WITH CHECK (user_id = auth.uid());
