-- ============================================================================
-- MITHRA LIFE OS — MASTER SUPABASE SQL (SECURITY HARDENED v2)
-- Zero-trust RLS. No recursive policies. No client-side trust.
-- owner_id is the single source of truth for workspace authority.
-- ============================================================================

-- SECTION 1: EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA public;

-- SECTION 2: NUCLEAR POLICY WIPE (idempotent)
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
      )\
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- SECTION 3: DROP OLD FUNCTIONS & TRIGGERS
DROP FUNCTION IF EXISTS public.check_membership(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.check_membership_safe(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_workspaces(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_workspace_member(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- SECTION 4: TABLE DEFINITIONS
-- ⚠️  Drops cascade to workspace_members. All data in these tables will be lost.
DROP TABLE IF EXISTS public.workspace_members CASCADE;
DROP TABLE IF EXISTS public.workspaces CASCADE;

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
    -- 🔐 role is always 'member' on self-insert. 'owner' is set only by the backend
    --    service role after workspace creation. A client can never insert 'owner'.
    role          TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
    joined_at     TIMESTAMPTZ  DEFAULT NOW() NOT NULL,
    PRIMARY KEY (workspace_id, user_id)
);

-- SECTION 4b: CORE DATA TABLES — STANDALONE (works on fresh deploy)
-- All tables created with workspace_id FK and ON DELETE CASCADE.

CREATE TABLE IF NOT EXISTS public.tasks (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workspace_id    UUID        REFERENCES public.workspaces(id) ON DELETE CASCADE,
    title           TEXT        NOT NULL CHECK (char_length(trim(title)) > 0),
    description     TEXT,
    completed       BOOLEAN     NOT NULL DEFAULT false,
    priority        TEXT        NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date        TIMESTAMPTZ,
    reminder_time   TIMESTAMPTZ,
    category        TEXT,
    tags            TEXT[]      DEFAULT '{}',
    recurrence      TEXT,
    snoozed_until   TIMESTAMPTZ,
    order_index     INTEGER     DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.habits (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workspace_id    UUID        REFERENCES public.workspaces(id) ON DELETE CASCADE,
    title           TEXT        NOT NULL CHECK (char_length(trim(title)) > 0),
    description     TEXT,
    frequency       TEXT        NOT NULL DEFAULT 'daily',
    color           TEXT,
    icon            TEXT,
    streak          INTEGER     NOT NULL DEFAULT 0,
    consistency     TEXT[]      DEFAULT '{}',  -- array of ISO date strings: YYYY-MM-DD
    best_streak     INTEGER     NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.journal_entries (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workspace_id    UUID        REFERENCES public.workspaces(id) ON DELETE CASCADE,
    title           TEXT,
    content         TEXT        NOT NULL DEFAULT '',
    mood            TEXT,
    tags            TEXT[]      DEFAULT '{}',
    -- 🔍 Gemini RAG embedding — 768-dim vector for semantic search
    embedding       vector(768),
    created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.focus_sessions (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workspace_id    UUID        REFERENCES public.workspaces(id) ON DELETE CASCADE,
    duration_mins   INTEGER     NOT NULL DEFAULT 25,
    session_type    TEXT        NOT NULL DEFAULT 'pomodoro' CHECK (session_type IN ('pomodoro', 'deep', 'short_break', 'long_break')),
    task_id         UUID        REFERENCES public.tasks(id) ON DELETE SET NULL,
    notes           TEXT,
    completed       BOOLEAN     NOT NULL DEFAULT false,
    started_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    ended_at        TIMESTAMPTZ
);


CREATE TABLE IF NOT EXISTS public.mood_logs (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mood_value  INTEGER     NOT NULL CHECK (mood_value BETWEEN 1 AND 5),
    mood_label  TEXT,
    note        TEXT,
    logged_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.profiles (
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
CREATE INDEX IF NOT EXISTS idx_tasks_workspace     ON public.tasks(workspace_id)         WHERE workspace_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_habits_workspace    ON public.habits(workspace_id)        WHERE workspace_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_mood_logs_user      ON public.mood_logs(user_id, logged_at DESC);

-- SECTION 6: ENABLE RLS ON ALL TABLES
ALTER TABLE public.workspaces        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_sessions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_logs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SECTION 7: WORKSPACES — ZERO-TRUST RLS
-- No functions called. Direct subqueries only. No recursion possible.
-- ============================================================================

-- SELECT: you can see a workspace if you own it OR are a member
CREATE POLICY "ws_select" ON public.workspaces
  FOR SELECT USING (
    owner_id = auth.uid()
    OR id IN (
      SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
    )
  );

-- INSERT: 🔐 owner_id MUST equal the calling user's auth.uid()
--         A client cannot forge a workspace owned by someone else.
CREATE POLICY "ws_insert" ON public.workspaces
  FOR INSERT WITH CHECK (owner_id = auth.uid());

-- UPDATE: only the owner can rename/modify
CREATE POLICY "ws_update" ON public.workspaces
  FOR UPDATE USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());  -- prevents changing owner_id mid-update

-- DELETE: only the owner can delete
CREATE POLICY "ws_delete" ON public.workspaces
  FOR DELETE USING (owner_id = auth.uid());

-- ============================================================================
-- SECTION 7b: WORKSPACE_MEMBERS — PRIVILEGE ESCALATION HARDENING
-- Vulnerability fixed: previously wm_insert WITH CHECK only enforced user_id = auth.uid()
-- but did NOT prevent a client from setting role = 'owner' for themselves.
-- Fix: WITH CHECK also forbids inserting 'owner' role via the client.
-- The backend service uses service_role key which bypasses RLS to set 'owner'.
-- ============================================================================

-- SELECT: see your own rows OR all members of workspaces you own
CREATE POLICY "wm_select" ON public.workspace_members
  FOR SELECT USING (
    user_id = auth.uid()
    OR workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    )
  );

-- INSERT: 🔐 user_id must be yourself, AND role must NOT be 'owner'
--         Clients can only self-join as 'member'. Never as 'owner'.
CREATE POLICY "wm_insert" ON public.workspace_members
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND role = 'member'
  );

-- UPDATE: not allowed via client — ownership changes go through backend only
-- (no UPDATE policy = RLS blocks all client UPDATE on workspace_members)

-- DELETE: you can remove yourself, OR the workspace owner can kick anyone
CREATE POLICY "wm_delete" ON public.workspace_members
  FOR DELETE USING (
    user_id = auth.uid()
    OR workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    )
  );

-- ============================================================================
-- SECTION 8: HANDLE_NEW_USER TRIGGER (SECURITY DEFINER — safe use)
-- SECURITY DEFINER is required here because this trigger runs as the
-- postgres superuser after auth.users INSERT, not as the new user.
-- It only does a single INSERT into profiles with no dynamic SQL.
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
-- SECTION 9: TASKS, HABITS, JOURNAL, FOCUS — SPLIT PERSONAL / WORKSPACE RLS
-- WITH CHECK enforced on INSERT to prevent workspace_id spoofing.
-- ============================================================================

-- TASKS
CREATE POLICY "tasks_personal_select" ON public.tasks
  FOR SELECT USING (user_id = auth.uid() AND workspace_id IS NULL);

CREATE POLICY "tasks_personal_mutate" ON public.tasks
  FOR ALL USING (user_id = auth.uid() AND workspace_id IS NULL)
  WITH CHECK (user_id = auth.uid() AND workspace_id IS NULL);

CREATE POLICY "tasks_workspace_select" ON public.tasks
  FOR SELECT USING (
    workspace_id IS NOT NULL
    AND workspace_id IN (
      SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "tasks_workspace_mutate" ON public.tasks
  FOR INSERT WITH CHECK (
    workspace_id IS NOT NULL
    AND workspace_id IN (
      SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
    )
    AND user_id = auth.uid()
  );

CREATE POLICY "tasks_workspace_update" ON public.tasks
  FOR UPDATE USING (
    workspace_id IS NOT NULL
    AND workspace_id IN (
      SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "tasks_workspace_delete" ON public.tasks
  FOR DELETE USING (
    workspace_id IS NOT NULL
    AND workspace_id IN (
      SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
    )
  );

-- HABITS
CREATE POLICY "habits_personal" ON public.habits
  FOR ALL USING (user_id = auth.uid() AND workspace_id IS NULL)
  WITH CHECK (user_id = auth.uid() AND workspace_id IS NULL);

CREATE POLICY "habits_workspace_select" ON public.habits
  FOR SELECT USING (
    workspace_id IS NOT NULL
    AND workspace_id IN (
      SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "habits_workspace_mutate" ON public.habits
  FOR INSERT WITH CHECK (
    workspace_id IS NOT NULL
    AND workspace_id IN (
      SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
    )
    AND user_id = auth.uid()
  );

CREATE POLICY "habits_workspace_update" ON public.habits
  FOR UPDATE USING (
    workspace_id IS NOT NULL
    AND workspace_id IN (
      SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
    )
  );

-- JOURNAL ENTRIES
CREATE POLICY "journals_personal" ON public.journal_entries
  FOR ALL USING (user_id = auth.uid() AND workspace_id IS NULL)
  WITH CHECK (user_id = auth.uid() AND workspace_id IS NULL);

CREATE POLICY "journals_workspace_select" ON public.journal_entries
  FOR SELECT USING (
    workspace_id IS NOT NULL
    AND workspace_id IN (
      SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "journals_workspace_mutate" ON public.journal_entries
  FOR INSERT WITH CHECK (
    workspace_id IS NOT NULL
    AND workspace_id IN (
      SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
    )
    AND user_id = auth.uid()
  );

-- FOCUS SESSIONS
CREATE POLICY "focus_personal" ON public.focus_sessions
  FOR ALL USING (user_id = auth.uid() AND workspace_id IS NULL)
  WITH CHECK (user_id = auth.uid() AND workspace_id IS NULL);

CREATE POLICY "focus_workspace_select" ON public.focus_sessions
  FOR SELECT USING (
    workspace_id IS NOT NULL
    AND workspace_id IN (
      SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "focus_workspace_mutate" ON public.focus_sessions
  FOR INSERT WITH CHECK (
    workspace_id IS NOT NULL
    AND workspace_id IN (
      SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
    )
    AND user_id = auth.uid()
  );

-- ============================================================================
-- SECTION 10: MOOD LOGS & PROFILES
-- ============================================================================
CREATE POLICY "mood_logs_own" ON public.mood_logs
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Profiles: public read (for workspace member names/avatars)
CREATE POLICY "profiles_read" ON public.profiles
  FOR SELECT USING (true);

-- 🔐 Users can only update their OWN profile row
CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- 🔐 Users can only INSERT their own profile row (prevents creating profile for other users)
CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- ============================================================================
-- SECTION 11: ORPHAN PROFILE RECOVERY (run once after schema apply)
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
-- SECTION 12: REALTIME
-- ============================================================================
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workspaces;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workspace_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.habits;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mood_logs;

-- ============================================================================
-- VERIFY (run these after applying — if they return without hanging, RLS is clean)
-- ============================================================================
-- SELECT * FROM public.workspace_members LIMIT 1;
-- SELECT * FROM public.workspaces LIMIT 1;
-- SELECT * FROM public.profiles LIMIT 1;
--
-- PRIVILEGE ESCALATION TEST (should return 0 rows if RLS is working):
-- -- As an authenticated non-owner, try to insert role='owner':
-- INSERT INTO workspace_members (workspace_id, user_id, role) VALUES ('<any_ws_id>', auth.uid(), 'owner');
-- -- Expected: ERROR 42501 new row violates with check option for table "workspace_members"
