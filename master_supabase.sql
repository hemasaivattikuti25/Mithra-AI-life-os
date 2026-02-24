-- ============================================================================
-- MITHRA LIFE OS — MASTER SUPABASE SQL
-- ============================================================================
--
-- ⚠️  WARNING: DESTRUCTIVE SCRIPT
-- ⚠️  This script DROPS and RECREATES the workspaces and workspace_members
-- ⚠️  tables. All existing workspace data will be permanently deleted.
-- ⚠️  Run this ONCE in the Supabase SQL Editor.
-- ⚠️  Do NOT run again on a database with real workspace data.
--
-- What this script does:
--   1. Wipes all RLS policies on workspace-related tables
--   2. Drops old helper functions
--   3. Recreates workspaces table with join_code + created_by
--   4. Recreates workspace_members table referencing auth.users
--   5. Adds workspace_id to tasks and habits (if not exists)
--   6. Creates zero-recursion RLS policies
--   7. Restores orphaned profiles
--
-- ============================================================================


-- ============================================================================
-- SECTION 1: EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA public;


-- ============================================================================
-- SECTION 2: NUCLEAR POLICY WIPE
-- ============================================================================
-- Drop ALL existing RLS policies on workspace-related tables to start clean.
-- This prevents "policy already exists" errors and eliminates leftover
-- recursive policies from previous attempts.

DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname, tablename FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'workspaces', 'workspace_members',
        'tasks', 'habits',
        'journal_entries', 'focus_sessions'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;


-- ============================================================================
-- SECTION 3: DROP OLD FUNCTIONS
-- ============================================================================
-- These functions caused infinite RLS recursion in previous iterations.

DROP FUNCTION IF EXISTS public.check_membership(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.check_membership_safe(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_workspaces(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_workspace_member(uuid) CASCADE;


-- ============================================================================
-- SECTION 4: DROP AND RECREATE WORKSPACES TABLE
-- ============================================================================
-- Key change: created_by references auth.users(id) directly,
-- NOT profiles(id). This eliminates the 23503 orphan profile bug.
-- New column: join_code — 6 uppercase characters for easy sharing.

DROP TABLE IF EXISTS public.workspace_members CASCADE;
DROP TABLE IF EXISTS public.workspaces CASCADE;

CREATE TABLE public.workspaces (
    id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name          TEXT NOT NULL,
    created_by    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    join_code     TEXT UNIQUE NOT NULL,
    share_link_hash TEXT UNIQUE NOT NULL,
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

COMMENT ON COLUMN public.workspaces.join_code IS '6-char uppercase code (excludes O/0/I/l) for easy manual entry';
COMMENT ON COLUMN public.workspaces.created_by IS 'References auth.users directly — NOT profiles — to avoid FK issues';


-- ============================================================================
-- SECTION 5: DROP AND RECREATE WORKSPACE_MEMBERS TABLE
-- ============================================================================

CREATE TABLE public.workspace_members (
    workspace_id  UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role          TEXT NOT NULL CHECK (role IN ('owner', 'member')),
    joined_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    PRIMARY KEY (workspace_id, user_id)
);


-- ============================================================================
-- SECTION 6: ADD workspace_id TO TASKS AND HABITS
-- ============================================================================
-- These columns may already exist from a previous migration.
-- workspace_id = NULL → personal item (only owner sees it)
-- workspace_id = set  → shared item (all workspace members see it)

DO $$
BEGIN
    -- Tasks
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'workspace_id'
    ) THEN
        ALTER TABLE public.tasks ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
    END IF;

    -- Habits
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'habits' AND column_name = 'workspace_id'
    ) THEN
        ALTER TABLE public.habits ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
    END IF;
END $$;


-- ============================================================================
-- SECTION 7: INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_wm_user_id
    ON public.workspace_members(user_id);

CREATE INDEX IF NOT EXISTS idx_wm_workspace_id
    ON public.workspace_members(workspace_id);

CREATE INDEX IF NOT EXISTS idx_workspaces_created_by
    ON public.workspaces(created_by);

CREATE INDEX IF NOT EXISTS idx_workspaces_join_code
    ON public.workspaces(join_code);

CREATE INDEX IF NOT EXISTS idx_tasks_workspace_id
    ON public.tasks(workspace_id)
    WHERE workspace_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_habits_workspace_id
    ON public.habits(workspace_id)
    WHERE workspace_id IS NOT NULL;


-- ============================================================================
-- SECTION 8: SECURITY DEFINER MEMBERSHIP CHECK FUNCTION
-- ============================================================================
-- This function is used ONLY in tasks/habits/journal/focus policies.
-- It is NEVER used inside workspace_members policies (that would recurse).
-- SECURITY DEFINER bypasses RLS when this function queries workspace_members.

CREATE OR REPLACE FUNCTION public.is_workspace_member(p_workspace_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.workspace_members
        WHERE workspace_id = p_workspace_id
          AND user_id = auth.uid()
    );
$$;


-- ============================================================================
-- SECTION 9: ENABLE RLS ON ALL RELEVANT TABLES
-- ============================================================================

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- SECTION 10: WORKSPACE_MEMBERS RLS POLICIES
-- ============================================================================
-- CRITICAL: These policies use ONLY "user_id = auth.uid()" for SELECT/INSERT.
-- No function calls. No subqueries on other RLS-protected tables.
-- This is the ONLY way to guarantee zero recursion.

-- Members can only see their OWN memberships
CREATE POLICY "wm_select" ON public.workspace_members
    FOR SELECT USING (user_id = auth.uid());

-- Users can only add THEMSELVES to a workspace
CREATE POLICY "wm_insert" ON public.workspace_members
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Members can leave (delete own row), owners can remove anyone
CREATE POLICY "wm_delete" ON public.workspace_members
    FOR DELETE USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.workspaces
            WHERE id = workspace_id AND created_by = auth.uid()
        )
    );


-- ============================================================================
-- SECTION 11: WORKSPACES RLS POLICIES
-- ============================================================================
-- SELECT uses a subquery on workspace_members, which is safe because
-- workspace_members SELECT policy is just "user_id = auth.uid()" — no recursion.

CREATE POLICY "ws_select" ON public.workspaces
    FOR SELECT USING (
        created_by = auth.uid()
        OR id IN (
            SELECT workspace_id FROM public.workspace_members
            WHERE user_id = auth.uid()
        )
    );

-- Any authenticated user can create a workspace
CREATE POLICY "ws_insert" ON public.workspaces
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Only creator can update
CREATE POLICY "ws_update" ON public.workspaces
    FOR UPDATE USING (created_by = auth.uid());

-- Only creator can delete
CREATE POLICY "ws_delete" ON public.workspaces
    FOR DELETE USING (created_by = auth.uid());


-- ============================================================================
-- SECTION 12: TASKS RLS POLICIES (DUAL — PERSONAL + WORKSPACE)
-- ============================================================================
-- Personal tasks: user_id = auth.uid() AND workspace_id IS NULL
-- Workspace tasks: workspace_id IS NOT NULL AND user is a member
-- These two policies together cover all task operations.

CREATE POLICY "tasks_personal" ON public.tasks
    FOR ALL USING (
        user_id = auth.uid() AND workspace_id IS NULL
    );

CREATE POLICY "tasks_workspace" ON public.tasks
    FOR ALL USING (
        workspace_id IS NOT NULL
        AND public.is_workspace_member(workspace_id)
    );


-- ============================================================================
-- SECTION 13: HABITS RLS POLICIES (DUAL — PERSONAL + WORKSPACE)
-- ============================================================================

CREATE POLICY "habits_personal" ON public.habits
    FOR ALL USING (
        user_id = auth.uid() AND workspace_id IS NULL
    );

CREATE POLICY "habits_workspace" ON public.habits
    FOR ALL USING (
        workspace_id IS NOT NULL
        AND public.is_workspace_member(workspace_id)
    );


-- ============================================================================
-- SECTION 13b: JOURNAL ENTRIES RLS POLICIES
-- ============================================================================

CREATE POLICY "journals_personal" ON public.journal_entries
    FOR ALL USING (
        user_id = auth.uid() AND workspace_id IS NULL
    );

CREATE POLICY "journals_workspace" ON public.journal_entries
    FOR ALL USING (
        workspace_id IS NOT NULL
        AND public.is_workspace_member(workspace_id)
    );


-- ============================================================================
-- SECTION 13c: FOCUS SESSIONS RLS POLICIES
-- ============================================================================

CREATE POLICY "focus_personal" ON public.focus_sessions
    FOR ALL USING (
        user_id = auth.uid() AND workspace_id IS NULL
    );

CREATE POLICY "focus_workspace" ON public.focus_sessions
    FOR ALL USING (
        workspace_id IS NOT NULL
        AND public.is_workspace_member(workspace_id)
    );


-- ============================================================================
-- SECTION 14: ORPHAN PROFILE RECOVERY
-- ============================================================================
-- When DROP TABLE profiles CASCADE runs, existing auth.users lose their
-- profile rows. This query re-creates them from auth.users metadata.
-- Safe to run repeatedly — ON CONFLICT DO NOTHING.

INSERT INTO public.profiles (id, email, display_name, avatar_url, created_at, updated_at)
SELECT
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
    u.raw_user_meta_data->>'avatar_url',
    u.created_at,
    NOW()
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- SECTION 15: REALTIME SUBSCRIPTIONS
-- ============================================================================

DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workspaces;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workspace_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.habits;


-- ============================================================================
-- END OF MASTER SCRIPT
-- ============================================================================
-- NEXT STEPS:
--   1. Run this script in Supabase SQL Editor
--   2. Verify: SELECT * FROM pg_policies WHERE tablename IN ('workspaces','workspace_members','tasks','habits');
--   3. Deploy the updated frontend (workspaceService.js uses created_by, not owner_id)
--   4. Test: Create a workspace, join with code, add shared tasks/habits
-- ============================================================================
