-- ============================================================================
-- MITHRA LIFE OS — MASTER SUPABASE SQL
-- Single source of truth for ALL schema, RLS, and Supabase configuration.
-- ============================================================================
--
-- ⚠️  WARNING: SECTIONS 2-5 ARE DESTRUCTIVE
-- ⚠️  They DROP and RECREATE workspace tables. All existing workspace data
-- ⚠️  will be permanently deleted. Profile data is recovered in Section 18.
-- ⚠️  Run this ONCE in the Supabase SQL Editor.
--
-- What this script does:
--   1.  Extensions (uuid-ossp, vector)
--   2.  Nuclear policy wipe (all app tables)
--   3.  Drop old helper functions
--   4.  Recreate workspaces table (created_by + join_code)
--   5.  Recreate workspace_members table
--   6.  Add workspace_id to tasks/habits/journal_entries/focus_sessions
--   7.  Create mood_logs table (Dashboard mood persistence)
--   8.  Indexes
--   9.  SECURITY DEFINER membership check function
--   10. Enable RLS on all tables
--   11. workspace_members RLS
--   12. workspaces RLS
--   13. tasks RLS (personal + workspace)
--   14. habits RLS (personal + workspace)
--   15. journal_entries RLS (personal + workspace)
--   16. focus_sessions RLS (personal + workspace)
--   17. mood_logs RLS
--   18. Orphan profile recovery
--   19. Realtime subscriptions
-- ============================================================================


-- ============================================================================
-- SECTION 1: EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA public;


-- ============================================================================
-- SECTION 2: NUCLEAR POLICY WIPE
-- ============================================================================
-- Drop ALL existing RLS policies on all app tables to start clean.
-- Prevents "policy already exists" errors and eliminates recursive policies.

DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname, tablename FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'workspaces', 'workspace_members',
        'tasks', 'habits',
        'journal_entries', 'focus_sessions',
        'mood_logs', 'profiles'
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
-- join_code: 6 uppercase characters for easy sharing.

DROP TABLE IF EXISTS public.workspace_members CASCADE;
DROP TABLE IF EXISTS public.workspaces CASCADE;

CREATE TABLE public.workspaces (
    id              UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
    name            TEXT        NOT NULL,
    created_by      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    join_code       TEXT        UNIQUE NOT NULL,
    share_link_hash TEXT        UNIQUE NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON COLUMN public.workspaces.join_code   IS '6-char uppercase code (excludes O/0/I/l) for easy manual entry';
COMMENT ON COLUMN public.workspaces.created_by  IS 'References auth.users directly — NOT profiles — to avoid FK 23503 errors';


-- ============================================================================
-- SECTION 5: DROP AND RECREATE WORKSPACE_MEMBERS TABLE
-- ============================================================================

CREATE TABLE public.workspace_members (
    workspace_id  UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role          TEXT NOT NULL CHECK (role IN ('owner', 'member')),
    joined_at     TIMESTAMPTZ  DEFAULT NOW() NOT NULL,
    PRIMARY KEY (workspace_id, user_id)
);


-- ============================================================================
-- SECTION 6: ADD workspace_id TO TASKS, HABITS, JOURNAL ENTRIES, FOCUS SESSIONS
-- ============================================================================
-- workspace_id = NULL  → personal item (only owner sees it via RLS)
-- workspace_id = set   → shared item (all workspace members see it)

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'workspace_id'
    ) THEN
        ALTER TABLE public.tasks ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'habits' AND column_name = 'workspace_id'
    ) THEN
        ALTER TABLE public.habits ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'journal_entries' AND column_name = 'workspace_id'
    ) THEN
        ALTER TABLE public.journal_entries ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'focus_sessions' AND column_name = 'workspace_id'
    ) THEN
        ALTER TABLE public.focus_sessions ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
    END IF;
END $$;


-- ============================================================================
-- SECTION 7: MOOD LOGS TABLE
-- ============================================================================
-- Stores user mood check-ins from the Dashboard mood picker.
-- mood_value: 1 (Stressed) → 5 (Happy), matching MOOD_EMOJIS in Dashboard.jsx
-- Read by: Dashboard.jsx loadMoodHistory (on mount)
-- Written by: Dashboard.jsx handleMoodSelect (on every emoji click)

CREATE TABLE IF NOT EXISTS public.mood_logs (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mood_value  INTEGER     NOT NULL CHECK (mood_value BETWEEN 1 AND 5),
    mood_label  TEXT,
    note        TEXT,
    logged_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- SECTION 8: INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_wm_user_id          ON public.workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_wm_workspace_id     ON public.workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_created  ON public.workspaces(created_by);
CREATE INDEX IF NOT EXISTS idx_workspaces_joincode ON public.workspaces(join_code);
CREATE INDEX IF NOT EXISTS idx_tasks_workspace     ON public.tasks(workspace_id)         WHERE workspace_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_habits_workspace    ON public.habits(workspace_id)        WHERE workspace_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_mood_logs_user      ON public.mood_logs(user_id, logged_at DESC);


-- ============================================================================
-- SECTION 9: SECURITY DEFINER MEMBERSHIP CHECK FUNCTION
-- ============================================================================
-- Used ONLY in tasks/habits/journal/focus policies — NEVER in workspace_members
-- policies (that would cause infinite recursion).
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
-- SECTION 10: ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE public.workspaces        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_sessions    ENABLE ROW LEVEL SECURITY;
-- mood_logs RLS already enabled in Section 7


-- ============================================================================
-- SECTION 11: WORKSPACE_MEMBERS RLS POLICIES
-- ============================================================================
-- CRITICAL: SELECT uses ONLY "user_id = auth.uid()" — no function calls,
-- no subqueries on other RLS-protected tables. Zero recursion guaranteed.

CREATE POLICY "wm_select" ON public.workspace_members
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "wm_insert" ON public.workspace_members
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "wm_delete" ON public.workspace_members
    FOR DELETE USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.workspaces
            WHERE id = workspace_id AND created_by = auth.uid()
        )
    );


-- ============================================================================
-- SECTION 12: WORKSPACES RLS POLICIES
-- ============================================================================

CREATE POLICY "ws_select" ON public.workspaces
    FOR SELECT USING (
        created_by = auth.uid()
        OR id IN (
            SELECT workspace_id FROM public.workspace_members
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "ws_insert" ON public.workspaces
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "ws_update" ON public.workspaces
    FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "ws_delete" ON public.workspaces
    FOR DELETE USING (created_by = auth.uid());


-- ============================================================================
-- SECTION 13: TASKS RLS POLICIES (DUAL — PERSONAL + WORKSPACE)
-- ============================================================================

CREATE POLICY "tasks_personal" ON public.tasks
    FOR ALL USING (user_id = auth.uid() AND workspace_id IS NULL);

CREATE POLICY "tasks_workspace" ON public.tasks
    FOR ALL USING (
        workspace_id IS NOT NULL
        AND public.is_workspace_member(workspace_id)
    );


-- ============================================================================
-- SECTION 14: HABITS RLS POLICIES (DUAL — PERSONAL + WORKSPACE)
-- ============================================================================

CREATE POLICY "habits_personal" ON public.habits
    FOR ALL USING (user_id = auth.uid() AND workspace_id IS NULL);

CREATE POLICY "habits_workspace" ON public.habits
    FOR ALL USING (
        workspace_id IS NOT NULL
        AND public.is_workspace_member(workspace_id)
    );


-- ============================================================================
-- SECTION 15: JOURNAL ENTRIES RLS POLICIES
-- ============================================================================

CREATE POLICY "journals_personal" ON public.journal_entries
    FOR ALL USING (user_id = auth.uid() AND workspace_id IS NULL);

CREATE POLICY "journals_workspace" ON public.journal_entries
    FOR ALL USING (
        workspace_id IS NOT NULL
        AND public.is_workspace_member(workspace_id)
    );


-- ============================================================================
-- SECTION 16: FOCUS SESSIONS RLS POLICIES
-- ============================================================================

CREATE POLICY "focus_personal" ON public.focus_sessions
    FOR ALL USING (user_id = auth.uid() AND workspace_id IS NULL);

CREATE POLICY "focus_workspace" ON public.focus_sessions
    FOR ALL USING (
        workspace_id IS NOT NULL
        AND public.is_workspace_member(workspace_id)
    );


-- ============================================================================
-- SECTION 17: MOOD LOGS RLS POLICY
-- ============================================================================
-- Users can only read and write their own mood logs.

CREATE POLICY "mood_logs_own" ON public.mood_logs
    FOR ALL USING (user_id = auth.uid());


-- ============================================================================
-- SECTION 18: ORPHAN PROFILE RECOVERY
-- ============================================================================
-- Re-creates profile rows for any auth.users missing a profiles row.
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
-- SECTION 19: REALTIME SUBSCRIPTIONS
-- ============================================================================

DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workspaces;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workspace_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.habits;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mood_logs;


-- ============================================================================
-- END OF MASTER SCRIPT
-- ============================================================================
-- VERIFY after running:
--   SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename;
--   SELECT COUNT(*) FROM public.mood_logs;  -- should be 0 or more
-- ============================================================================
