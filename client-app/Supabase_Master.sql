-- ============================================================
-- MITHRA LIFE OS — MASTER DATABASE SETUP SCRIPT
-- Run this once in your Supabase SQL Editor.
-- Safe to re-run (all statements are idempotent).
-- ============================================================


-- ============================================================
-- 1. EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================
-- 2. PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name text DEFAULT '',
  email text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);


-- ============================================================
-- 3. AUTO-CREATE PROFILE ON SIGNUP (Auth Hook)
-- ============================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- 4. JOURNAL ENTRIES + VECTOR SEARCH (for Dost AI / RAG)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  content text NOT NULL,
  mood integer,
  tags text,
  embedding vector(768),
  workspace_id uuid,  -- Added for Mithra Blend support
  date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own journal" ON public.journal_entries;
CREATE POLICY "Users can manage own journal"
  ON public.journal_entries
  USING (auth.uid() = user_id);

-- Vector search function used by the Dost AI backend
DROP FUNCTION IF EXISTS match_journal_entries;

CREATE OR REPLACE FUNCTION match_journal_entries (
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  filter_user_id uuid
)
RETURNS TABLE (
  id uuid,
  content text,
  mood_score int,
  similarity float
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    journal_entries.id,
    journal_entries.content,
    journal_entries.mood as mood_score,
    1 - (journal_entries.embedding <=> query_embedding) as similarity
  FROM journal_entries
  WHERE 1 - (journal_entries.embedding <=> query_embedding) > match_threshold
  AND journal_entries.user_id = filter_user_id
  ORDER BY journal_entries.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;


-- ============================================================
-- 5. TASKS TABLE (with workspace support)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  title text NOT NULL,
  details text DEFAULT '',
  list_id text DEFAULT 'default',
  priority text DEFAULT 'medium',
  completed boolean DEFAULT false,
  starred boolean DEFAULT false,
  due_date date,
  recurrence text DEFAULT 'none',
  subtasks jsonb DEFAULT '[]',
  workspace_id uuid,  -- Added for Mithra Blend support
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own tasks" ON public.tasks;
CREATE POLICY "Users can manage own tasks"
  ON public.tasks
  USING (auth.uid() = user_id);


-- ============================================================
-- 6. HABITS TABLE (with workspace support)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.habits (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  title text NOT NULL,
  category text DEFAULT 'Personal',
  color text DEFAULT '#22d3ee',
  streak integer DEFAULT 0,
  best_streak integer DEFAULT 0,
  consistency jsonb DEFAULT '[]',
  workspace_id uuid,  -- Added for Mithra Blend support
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own habits" ON public.habits;
CREATE POLICY "Users can manage own habits"
  ON public.habits
  USING (auth.uid() = user_id);


-- ============================================================
-- 7. NOTIFICATION SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notification_settings (
  user_id uuid REFERENCES auth.users(id) PRIMARY KEY,
  enabled boolean DEFAULT false,
  reminder_minutes integer DEFAULT 15,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own notifications" ON public.notification_settings;
CREATE POLICY "Users can manage own notifications"
  ON public.notification_settings
  USING (auth.uid() = user_id);


-- ============================================================
-- 8. MITHRA BLEND — WORKSPACES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.workspaces (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  share_link_hash text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.workspace_members (
  workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text CHECK (role IN ('owner', 'member')) DEFAULT 'member',
  joined_at timestamptz DEFAULT NOW(),
  PRIMARY KEY (workspace_id, user_id)
);

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- Workspace: authenticated users can CREATE workspaces
DROP POLICY IF EXISTS "Create workspaces" ON public.workspaces;
CREATE POLICY "Create workspaces" ON public.workspaces
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Workspace: members can VIEW their workspaces
DROP POLICY IF EXISTS "View workspaces if member" ON public.workspaces;
CREATE POLICY "View workspaces if member" ON public.workspaces
  FOR SELECT USING (
    id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
  );

-- Workspace: anyone can look up a workspace by share_link_hash (needed for join flow)
DROP POLICY IF EXISTS "Lookup workspace by hash" ON public.workspaces;
CREATE POLICY "Lookup workspace by hash" ON public.workspaces
  FOR SELECT USING (true);

-- Workspace: only owners can update
DROP POLICY IF EXISTS "Update workspaces if owner" ON public.workspaces;
CREATE POLICY "Update workspaces if owner" ON public.workspaces
  FOR UPDATE USING (created_by = auth.uid());

-- Workspace: only owners can delete
DROP POLICY IF EXISTS "Delete workspaces if owner" ON public.workspaces;
CREATE POLICY "Delete workspaces if owner" ON public.workspaces
  FOR DELETE USING (created_by = auth.uid());

-- Members: can see who else is in their shared workspaces
DROP POLICY IF EXISTS "View workspace members" ON public.workspace_members;
CREATE POLICY "View workspace members" ON public.workspace_members
  FOR SELECT USING (
    workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
  );

-- Members: users can join a workspace (insert themselves)
DROP POLICY IF EXISTS "Insert workspace member" ON public.workspace_members;
CREATE POLICY "Insert workspace member" ON public.workspace_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Members: users can leave a workspace (delete themselves)
DROP POLICY IF EXISTS "Delete workspace member" ON public.workspace_members;
CREATE POLICY "Delete workspace member" ON public.workspace_members
  FOR DELETE USING (user_id = auth.uid());


-- ============================================================
-- 9. USAGE TRACKING (for rate limits & future paywall)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.usage_tracking (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date DEFAULT CURRENT_DATE NOT NULL,
  ai_calls integer DEFAULT 0,
  tokens_used integer DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own usage" ON public.usage_tracking;
CREATE POLICY "Users can manage own usage"
  ON public.usage_tracking
  USING (auth.uid() = user_id);

-- Helper: increment AI usage for today (call from backend after each AI request)
CREATE OR REPLACE FUNCTION public.increment_ai_usage(
  p_user_id uuid,
  p_tokens integer DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.usage_tracking (user_id, date, ai_calls, tokens_used, updated_at)
  VALUES (p_user_id, CURRENT_DATE, 1, p_tokens, NOW())
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    ai_calls = usage_tracking.ai_calls + 1,
    tokens_used = usage_tracking.tokens_used + p_tokens,
    updated_at = NOW();
END;
$$;

-- Helper: check if user is within daily limit (for paywall)
CREATE OR REPLACE FUNCTION public.check_daily_limit(
  p_user_id uuid,
  p_max_calls integer DEFAULT 50
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_calls integer;
BEGIN
  SELECT COALESCE(ai_calls, 0) INTO current_calls
  FROM public.usage_tracking
  WHERE user_id = p_user_id AND date = CURRENT_DATE;

  RETURN COALESCE(current_calls, 0) < p_max_calls;
END;
$$;


-- ============================================================
-- 10. GRANT PERMISSIONS
-- ============================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- ============================================================
-- Done! Your Mithra Life OS database is fully set up.
-- ============================================================

