-- ============================================
-- MITHRA LIFE OS: MASTER SUPABASE SQL
-- ============================================
-- This file contains the complete database schema for Mithra Life OS.
-- It is designed to be fully idempotent. You can run this entire file 
-- cleanly in the Supabase SQL Editor.
-- ============================================

-- ============================================
-- SECTION 1: EXTENSIONS
-- ============================================
-- Ensure pgvector is enabled via Supabase dashboard first:
-- Database -> Extensions -> search "vector" -> Enable

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA public;

-- ============================================
-- SECTION 2: UTILITY FUNCTIONS (PRE-REQUISITES)
-- ============================================

DROP FUNCTION IF EXISTS public.update_modified_column() CASCADE;

CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP FUNCTION IF EXISTS public.check_membership_safe(uuid) CASCADE;

CREATE OR REPLACE FUNCTION public.check_membership_safe(p_workspace_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM workspace_members 
        WHERE workspace_id = p_workspace_id AND user_id = auth.uid()
    );
$$;

DROP FUNCTION IF EXISTS public.get_user_workspaces(uuid) CASCADE;

CREATE OR REPLACE FUNCTION public.get_user_workspaces(check_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
    SELECT workspace_id FROM public.workspace_members WHERE user_id = check_user_id
    UNION
    SELECT id FROM public.workspaces WHERE owner_id = check_user_id;
$$;

-- ============================================
-- SECTION 3: TABLES (DEPENDENCY ORDER)
-- ============================================
-- We use CASCADE to safely clear out old constraints if they exist.

DROP TABLE IF EXISTS public.profiles CASCADE;
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

DROP TABLE IF EXISTS public.google_calendar_tokens CASCADE;
CREATE TABLE public.google_calendar_tokens (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    scope TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

DROP TABLE IF EXISTS public.notification_settings CASCADE;
CREATE TABLE public.notification_settings (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    enabled BOOLEAN DEFAULT false NOT NULL,
    reminder_minutes INTEGER DEFAULT 15 NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

DROP TABLE IF EXISTS public.user_events CASCADE;
CREATE TABLE public.user_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

DROP TABLE IF EXISTS public.usage_tracking CASCADE;
CREATE TABLE public.usage_tracking (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    ai_calls INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, date)
);

DROP TABLE IF EXISTS public.workspaces CASCADE;
CREATE TABLE public.workspaces (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    share_link_hash TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

DROP TABLE IF EXISTS public.workspace_members CASCADE;
CREATE TABLE public.workspace_members (
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'member', 'admin')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    PRIMARY KEY (workspace_id, user_id)
);

DROP TABLE IF EXISTS public.tasks CASCADE;
CREATE TABLE public.tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    priority TEXT DEFAULT 'med' CHECK (priority IN ('low', 'med', 'high', 'urgent')),
    list_id TEXT DEFAULT 'default',
    completed BOOLEAN DEFAULT false,
    starred BOOLEAN DEFAULT false,
    due_date TIMESTAMP WITH TIME ZONE,
    recurrence TEXT DEFAULT 'none',
    subtasks JSONB DEFAULT '[]'::JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

DROP TABLE IF EXISTS public.habits CASCADE;
CREATE TABLE public.habits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'default',
    streak INTEGER DEFAULT 0 NOT NULL,
    longest_streak INTEGER DEFAULT 0 NOT NULL,
    completed_dates JSONB DEFAULT '[]'::JSONB NOT NULL,
    history JSONB DEFAULT '[]'::JSONB NOT NULL,
    schedule_time TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

DROP TABLE IF EXISTS public.journal_entries CASCADE;
CREATE TABLE public.journal_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    mood INTEGER CHECK (mood BETWEEN 1 AND 5),
    tags TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    date DATE NOT NULL,
    embedding VECTOR(768),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

DROP TABLE IF EXISTS public.focus_sessions CASCADE;
CREATE TABLE public.focus_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================
-- SECTION 4: INDEXES
-- ============================================

CREATE INDEX idx_workspace_members_user ON public.workspace_members(user_id);
CREATE INDEX idx_workspace_members_workspace_id ON public.workspace_members(workspace_id);
CREATE INDEX idx_workspaces_owner_id ON public.workspaces(owner_id);

CREATE INDEX idx_tasks_user_workspace ON public.tasks(user_id, workspace_id);
CREATE INDEX idx_tasks_user_active ON public.tasks(user_id) WHERE completed = false;

CREATE INDEX idx_habits_workspace_id ON public.habits(workspace_id);
CREATE INDEX idx_habits_user_workspace ON public.habits(user_id, workspace_id);
CREATE INDEX idx_habits_user ON public.habits(user_id);

CREATE INDEX idx_journals_user_date ON public.journal_entries(user_id, date DESC);
CREATE INDEX idx_journals_embedding ON public.journal_entries USING hnsw (embedding vector_cosine_ops);

CREATE INDEX idx_usage_user_date ON public.usage_tracking(user_id, date);
CREATE INDEX idx_user_events_user ON public.user_events(user_id, created_at DESC);
CREATE INDEX idx_user_events_type ON public.user_events(event_type, created_at DESC);

-- ============================================
-- SECTION 5: TRIGGERS (UPDATED_AT & AUTH SYNCS)
-- ============================================

CREATE TRIGGER set_updated_at_profiles 
BEFORE UPDATE ON public.profiles 
FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

CREATE TRIGGER set_updated_at_workspaces 
BEFORE UPDATE ON public.workspaces 
FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

CREATE TRIGGER set_updated_at_tasks 
BEFORE UPDATE ON public.tasks 
FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

CREATE TRIGGER set_updated_at_habits 
BEFORE UPDATE ON public.habits 
FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

CREATE TRIGGER set_updated_at_journals 
BEFORE UPDATE ON public.journal_entries 
FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

CREATE TRIGGER set_updated_at_google_calendar_tokens 
BEFORE UPDATE ON public.google_calendar_tokens 
FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

CREATE TRIGGER set_updated_at_notification_settings 
BEFORE UPDATE ON public.notification_settings 
FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, display_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- SECTION 6: ADVANCED AI FUNCTIONS
-- ============================================

DROP FUNCTION IF EXISTS public.match_journal_entries CASCADE;

CREATE OR REPLACE FUNCTION public.match_journal_entries (
    query_embedding vector(768),
    match_threshold float,
    match_count int,
    p_user_id uuid
)
RETURNS TABLE (
    id uuid,
    content text,
    mood integer,
    date date,
    similarity float
)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
    SELECT
        j.id,
        j.content,
        j.mood,
        j.date,
        1 - (j.embedding <=> query_embedding) AS similarity
    FROM public.journal_entries j
    WHERE
        j.user_id = p_user_id
        AND j.embedding IS NOT NULL
        AND 1 - (j.embedding <=> query_embedding) > match_threshold
    ORDER BY j.embedding <=> query_embedding ASC
    LIMIT match_count;
$$;

-- ============================================
-- SECTION 7: ROW LEVEL SECURITY (RLS) ENABLEMENT
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_calendar_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SECTION 8: RLS POLICIES
-- ============================================

-- PROFILES
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users manage own calendar tokens" ON public.google_calendar_tokens FOR ALL USING (auth.uid() = user_id);

-- NOTIFICATION SETTINGS
CREATE POLICY "Users manage own notifications" ON public.notification_settings FOR ALL USING (auth.uid() = user_id);

-- USER EVENTS
CREATE POLICY "Users see own events" ON public.user_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own events" ON public.user_events FOR INSERT WITH CHECK (auth.uid() = user_id);

-- USAGE TRACKING
CREATE POLICY "Users manage own usage" ON public.usage_tracking FOR ALL USING (auth.uid() = user_id);

-- WORKSPACES
CREATE POLICY "View workspaces" ON public.workspaces FOR SELECT USING (owner_id = auth.uid() OR public.check_membership_safe(id));
CREATE POLICY "Create workspaces" ON public.workspaces FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Update workspaces" ON public.workspaces FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "Delete workspaces" ON public.workspaces FOR DELETE USING (owner_id = auth.uid());

-- WORKSPACE MEMBERS
CREATE POLICY "View workspace members" ON public.workspace_members FOR SELECT USING (
    user_id = auth.uid() 
    OR EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = workspace_id AND w.owner_id = auth.uid())
    OR public.check_membership_safe(workspace_id)
);

CREATE POLICY "Manage workspace members" ON public.workspace_members FOR ALL USING (
    user_id = auth.uid() 
    OR EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = workspace_id AND w.owner_id = auth.uid())
);

CREATE POLICY "Insert workspace members" ON public.workspace_members FOR INSERT WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = workspace_id AND w.owner_id = auth.uid())
);

-- TASKS
CREATE POLICY "Task Access" ON public.tasks FOR ALL USING (
    auth.uid() = user_id OR (workspace_id IS NOT NULL AND public.check_membership_safe(workspace_id))
);

-- HABITS
CREATE POLICY "Habit Access" ON public.habits FOR ALL USING (
    auth.uid() = user_id OR (workspace_id IS NOT NULL AND public.check_membership_safe(workspace_id))
);

-- JOURNAL ENTRIES
CREATE POLICY "Journal Access" ON public.journal_entries FOR ALL USING (
    auth.uid() = user_id OR (workspace_id IS NOT NULL AND public.check_membership_safe(workspace_id))
);

-- FOCUS SESSIONS
CREATE POLICY "Focus Access" ON public.focus_sessions FOR ALL USING (
    auth.uid() = user_id OR (workspace_id IS NOT NULL AND public.check_membership_safe(workspace_id))
);

-- ============================================
-- SECTION 9: REALTIME SUBSCRIPTIONS
-- ============================================

DROP PUBLICATION IF EXISTS supabase_realtime;

CREATE PUBLICATION supabase_realtime;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workspaces;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workspace_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.habits;

-- ============================================
-- SECTION 12: RESTORE ORPHANED PROFILES
-- ============================================
-- If `DROP TABLE profiles CASCADE` wiped existing profiles,
-- this query rematches them to their `auth.users` row
-- to prevent foreign key errors on `owner_id`.

INSERT INTO public.profiles (id, email, display_name, avatar_url)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
  u.raw_user_meta_data->>'avatar_url'
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- END OF MASTER SCRIPT
-- ============================================
