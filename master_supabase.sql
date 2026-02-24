-- ============================================================================
-- MITHRA LIFE OS — MASTER SUPABASE SQL
-- Single source of truth for ALL schema, RLS, and Supabase configuration.
-- ============================================================================

-- SECTION 1: EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA public;

-- SECTION 2: NUCLEAR POLICY WIPE
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
DROP FUNCTION IF EXISTS public.check_membership(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.check_membership_safe(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_workspaces(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_workspace_member(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- SECTION 4: TABLE DEFINITIONS
DROP TABLE IF EXISTS public.workspace_members CASCADE;
DROP TABLE IF EXISTS public.workspaces CASCADE;

CREATE TABLE public.workspaces (
    id              UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
    name            TEXT        NOT NULL,
    owner_id        UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    join_code       TEXT        UNIQUE,
    share_link_hash TEXT        UNIQUE NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.workspace_members (
    workspace_id  UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role          TEXT NOT NULL CHECK (role IN ('owner', 'member')),
    joined_at     TIMESTAMPTZ  DEFAULT NOW() NOT NULL,
    PRIMARY KEY (workspace_id, user_id)
);

-- ADD workspace_id TO OTHER TABLES
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

CREATE TABLE IF NOT EXISTS public.mood_logs (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mood_value  INTEGER     NOT NULL CHECK (mood_value BETWEEN 1 AND 5),
    mood_label  TEXT,
    note        TEXT,
    logged_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    display_name TEXT,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SECTION 5: INDEXES
CREATE INDEX IF NOT EXISTS idx_wm_user_id          ON public.workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_wm_workspace_id     ON public.workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_owner    ON public.workspaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_joincode ON public.workspaces(join_code);
CREATE INDEX IF NOT EXISTS idx_tasks_workspace     ON public.tasks(workspace_id)         WHERE workspace_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_habits_workspace    ON public.habits(workspace_id)        WHERE workspace_id IS NOT NULL;
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

-- SECTION 7: CRITICAL RLS POLICIES FOR WORKSPACES & WORKSPACE_MEMBERS
CREATE POLICY "ws_select" ON public.workspaces FOR SELECT USING (owner_id = auth.uid() OR id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()));
CREATE POLICY "ws_insert" ON public.workspaces FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "ws_update" ON public.workspaces FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "ws_delete" ON public.workspaces FOR DELETE USING (owner_id = auth.uid());

CREATE POLICY "wm_select" ON public.workspace_members FOR SELECT USING (user_id = auth.uid() OR workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));
CREATE POLICY "wm_insert" ON public.workspace_members FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "wm_delete" ON public.workspace_members FOR DELETE USING (user_id = auth.uid() OR workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

-- SECTION 8: NEW USER TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- SECTION 9: TASKS, HABITS, JOURNAL, FOCUS SESSIONS RLS
CREATE POLICY "tasks_personal" ON public.tasks FOR ALL USING (user_id = auth.uid() AND workspace_id IS NULL);
CREATE POLICY "tasks_workspace" ON public.tasks FOR ALL USING (workspace_id IS NOT NULL AND workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));

CREATE POLICY "habits_personal" ON public.habits FOR ALL USING (user_id = auth.uid() AND workspace_id IS NULL);
CREATE POLICY "habits_workspace" ON public.habits FOR ALL USING (workspace_id IS NOT NULL AND workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));

CREATE POLICY "journals_personal" ON public.journal_entries FOR ALL USING (user_id = auth.uid() AND workspace_id IS NULL);
CREATE POLICY "journals_workspace" ON public.journal_entries FOR ALL USING (workspace_id IS NOT NULL AND workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));

CREATE POLICY "focus_personal" ON public.focus_sessions FOR ALL USING (user_id = auth.uid() AND workspace_id IS NULL);
CREATE POLICY "focus_workspace" ON public.focus_sessions FOR ALL USING (workspace_id IS NOT NULL AND workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));

-- SECTION 10: MOOD LOGS & PROFILES RLS
CREATE POLICY "mood_logs_own" ON public.mood_logs FOR ALL USING (user_id = auth.uid());

CREATE POLICY "profiles_read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (id = auth.uid());

-- SECTION 11: ORPHAN PROFILE RECOVERY
INSERT INTO public.profiles (id, email, display_name, avatar_url)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
  u.raw_user_meta_data->>'avatar_url'
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)
ON CONFLICT (id) DO NOTHING;

-- SECTION 12: REALTIME
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workspaces;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workspace_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.habits;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mood_logs;

-- TO VERIFY: Run this after the script. If it returns without hanging, recursion is gone:
-- SELECT * FROM public.workspace_members LIMIT 1;
-- SELECT * FROM public.workspaces LIMIT 1;
