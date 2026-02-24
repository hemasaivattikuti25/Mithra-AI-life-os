-- ============================================================================
-- MITHRA LIFE OS — MASTER SUPABASE SQL (SECURITY HARDENED + REACT COMPATIBLE)
-- Zero-trust RLS. No recursive policies. No client-side trust.
-- Columns match 1:1 with the React frontend codebase.
-- ⚠️  Run this in Supabase SQL Editor → This WILL DROP and recreate tables.
-- ============================================================================

-- SECTION 1: EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA public;

-- SECTION 2: NUCLEAR POLICY WIPE (idempotent — removes old policies first)
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

-- SECTION 3: DROP OLD FUNCTIONS & TRIGGERS
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- SECTION 4: DROP AND RECREATE TABLES (CASCADE removes all dependencies)
DROP TABLE IF EXISTS public.workspace_members CASCADE;
DROP TABLE IF EXISTS public.workspaces CASCADE;
DROP TABLE IF EXISTS public.focus_sessions CASCADE;
DROP TABLE IF EXISTS public.journal_entries CASCADE;
DROP TABLE IF EXISTS public.habits CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.mood_logs CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ─── WORKSPACES ────────────────────────────────────────────────
CREATE TABLE public.workspaces (
    id              UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
    name            TEXT        NOT NULL CHECK (char_length(trim(name)) > 0),
    owner_id        UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    join_code       TEXT        UNIQUE,
    share_link_hash TEXT        UNIQUE NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.workspace_members (
    workspace_id  UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    -- 🔐 role='owner' can only be set via backend service_role. Client INSERT is blocked to 'member' only.
    role          TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
    joined_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (workspace_id, user_id)
);

-- ─── TASKS (React-compatible columns) ────────────────────────────────
CREATE TABLE public.tasks (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workspace_id    UUID        REFERENCES public.workspaces(id) ON DELETE CASCADE,
    title           TEXT        NOT NULL,
    details         TEXT,
    list_id         TEXT        DEFAULT 'default',
    priority        TEXT        DEFAULT 'medium',
    completed       BOOLEAN     DEFAULT false,
    starred         BOOLEAN     DEFAULT false,
    due_date        TIMESTAMPTZ,
    recurrence      TEXT        DEFAULT 'none',
    subtasks        JSONB       DEFAULT '[]'::jsonb,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── HABITS (React-compatible columns) ────────────────────────────────
CREATE TABLE public.habits (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workspace_id    UUID        REFERENCES public.workspaces(id) ON DELETE CASCADE,
    title           TEXT        NOT NULL,
    category        TEXT        DEFAULT 'Personal',
    color           TEXT,
    streak          INTEGER     DEFAULT 0,
    longest_streak  INTEGER     DEFAULT 0,
    completed_dates TEXT[]      DEFAULT '{}',
    repeat_days     JSONB       DEFAULT '[0,1,2,3,4,5,6]'::jsonb,
    frequency       INTEGER     DEFAULT 1,
    reminder        BOOLEAN     DEFAULT false,
    schedule_time   TEXT        DEFAULT '08:00',
    streak_goal     INTEGER     DEFAULT 30,
    streak_unit     TEXT        DEFAULT 'Day',
    focus_duration  INTEGER     DEFAULT 25,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── JOURNAL ENTRIES (date as TEXT — matches React UI) ─────────────────
CREATE TABLE public.journal_entries (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workspace_id    UUID        REFERENCES public.workspaces(id) ON DELETE CASCADE,
    title           TEXT,
    content         TEXT        NOT NULL DEFAULT '',
    mood            INTEGER,
    tags            TEXT[]      DEFAULT '{}',
    date            TEXT,       -- 'YYYY-MM-DD' string — matches React date pickers
    embedding       vector(768),  -- Gemini RAG semantic search
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── FOCUS SESSIONS ────────────────────────────────────────────────────
CREATE TABLE public.focus_sessions (
    id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workspace_id     UUID        REFERENCES public.workspaces(id) ON DELETE CASCADE,
    habit_id         UUID        REFERENCES public.habits(id) ON DELETE SET NULL,
    duration_minutes INTEGER     DEFAULT 25,
    completed_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─── MOOD LOGS ────────────────────────────────────────────────────────
CREATE TABLE public.mood_logs (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mood_value  INTEGER     NOT NULL CHECK (mood_value BETWEEN 1 AND 5),
    mood_label  TEXT,
    note        TEXT,
    logged_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── PROFILES ─────────────────────────────────────────────────────────
CREATE TABLE public.profiles (
    id           UUID    PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email        TEXT,
    display_name TEXT,
    full_name    TEXT,
    avatar_url   TEXT,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- SECTION 5: INDEXES
CREATE INDEX IF NOT EXISTS idx_wm_user_id          ON public.workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_wm_workspace_id     ON public.workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_owner    ON public.workspaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_joincode ON public.workspaces(join_code);
CREATE INDEX IF NOT EXISTS idx_tasks_user          ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_workspace     ON public.tasks(workspace_id) WHERE workspace_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_habits_user         ON public.habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_workspace    ON public.habits(workspace_id) WHERE workspace_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_journal_user        ON public.journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_logs_user      ON public.mood_logs(user_id, logged_at DESC);

-- SECTION 6: ENABLE RLS
ALTER TABLE public.workspaces        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_sessions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_logs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SECTION 7: ZERO-TRUST RLS POLICIES
-- No recursive function calls. Direct subqueries only.
-- ============================================================================

-- ─── WORKSPACES ────────────────────────────────────────────────────────
CREATE POLICY "ws_select" ON public.workspaces
  FOR SELECT USING (
    owner_id = auth.uid()
    OR id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
  );

-- 🔐 owner_id MUST equal auth.uid() — cannot forge another user's workspace
CREATE POLICY "ws_insert" ON public.workspaces
  FOR INSERT WITH CHECK (owner_id = auth.uid());

-- 🔐 WITH CHECK prevents changing owner_id mid-update
CREATE POLICY "ws_update" ON public.workspaces
  FOR UPDATE USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "ws_delete" ON public.workspaces
  FOR DELETE USING (owner_id = auth.uid());

-- ─── WORKSPACE MEMBERS ──────────────────────────────────────────────────
CREATE POLICY "wm_select" ON public.workspace_members
  FOR SELECT USING (
    user_id = auth.uid()
    OR workspace_id IN (SELECT id FROM public.workspaces WHERE owner_id = auth.uid())
  );

-- 🔐 Client may only self-join as 'member'. 'owner' role requires backend service_role.
CREATE POLICY "wm_insert" ON public.workspace_members
  FOR INSERT WITH CHECK (user_id = auth.uid() AND role = 'member');

CREATE POLICY "wm_delete" ON public.workspace_members
  FOR DELETE USING (
    user_id = auth.uid()
    OR workspace_id IN (SELECT id FROM public.workspaces WHERE owner_id = auth.uid())
  );

-- ─── TASKS ──────────────────────────────────────────────────────────────
CREATE POLICY "tasks_personal" ON public.tasks
  FOR ALL
  USING (user_id = auth.uid() AND workspace_id IS NULL)
  WITH CHECK (user_id = auth.uid() AND workspace_id IS NULL);

CREATE POLICY "tasks_workspace" ON public.tasks
  FOR ALL
  USING (
    workspace_id IS NOT NULL
    AND workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
  )
  WITH CHECK (
    workspace_id IS NOT NULL
    AND workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
    AND user_id = auth.uid()
  );

-- ─── HABITS ─────────────────────────────────────────────────────────────
CREATE POLICY "habits_personal" ON public.habits
  FOR ALL
  USING (user_id = auth.uid() AND workspace_id IS NULL)
  WITH CHECK (user_id = auth.uid() AND workspace_id IS NULL);

CREATE POLICY "habits_workspace" ON public.habits
  FOR ALL
  USING (
    workspace_id IS NOT NULL
    AND workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
  )
  WITH CHECK (
    workspace_id IS NOT NULL
    AND workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
    AND user_id = auth.uid()
  );

-- ─── JOURNAL ENTRIES ────────────────────────────────────────────────────
CREATE POLICY "journals_personal" ON public.journal_entries
  FOR ALL
  USING (user_id = auth.uid() AND workspace_id IS NULL)
  WITH CHECK (user_id = auth.uid() AND workspace_id IS NULL);

CREATE POLICY "journals_workspace" ON public.journal_entries
  FOR ALL
  USING (
    workspace_id IS NOT NULL
    AND workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
  )
  WITH CHECK (
    workspace_id IS NOT NULL
    AND workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
    AND user_id = auth.uid()
  );

-- ─── FOCUS SESSIONS ─────────────────────────────────────────────────────
CREATE POLICY "focus_personal" ON public.focus_sessions
  FOR ALL
  USING (user_id = auth.uid() AND workspace_id IS NULL)
  WITH CHECK (user_id = auth.uid() AND workspace_id IS NULL);

CREATE POLICY "focus_workspace" ON public.focus_sessions
  FOR ALL
  USING (
    workspace_id IS NOT NULL
    AND workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
  )
  WITH CHECK (
    workspace_id IS NOT NULL
    AND workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
    AND user_id = auth.uid()
  );

-- ─── MOOD LOGS & PROFILES ───────────────────────────────────────────────
CREATE POLICY "mood_logs_own" ON public.mood_logs
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Public read (needed to show member names/avatars in Blend)
CREATE POLICY "profiles_read" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- ============================================================================
-- SECTION 8: HANDLE_NEW_USER TRIGGER
-- Auto-creates a profile row when a new user signs up.
-- SECURITY DEFINER is safe here — only runs on auth.users INSERT with no dynamic SQL.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================================
-- SECTION 9: ORPHAN PROFILE RECOVERY
-- Creates profiles for any existing users that don't have one.
-- Safe to run multiple times — ON CONFLICT DO NOTHING.
-- ============================================================================
INSERT INTO public.profiles (id, email, display_name, avatar_url)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
  u.raw_user_meta_data->>'avatar_url'
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SECTION 10: REALTIME
-- ============================================================================
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workspaces;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workspace_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.habits;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mood_logs;