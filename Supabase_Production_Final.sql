-- ==============================================================================
-- MITHRA LIFE OS: PRODUCTION DATABASE SCHEMA
-- This file contains the complete SQL setup for Supabase, including all tables,
-- Row Level Security (RLS) policies, Realtime configuration, and pgvector.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector"; -- Used for RAG Journal Memory

-- 2. TABLES

-- Profiles
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT,
    display_name TEXT,
    avatar_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Workspaces (Mithra Blend)
CREATE TABLE public.workspaces (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    owner_id UUID REFERENCES public.profiles(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

-- Workspace Members
CREATE TABLE public.workspace_members (
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member', -- 'owner' or 'member'
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    PRIMARY KEY (workspace_id, user_id)
);
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- Tasks
CREATE TABLE public.tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    title TEXT NOT NULL,
    priority TEXT DEFAULT 'med',
    list_id TEXT DEFAULT 'default',
    completed BOOLEAN DEFAULT false,
    starred BOOLEAN DEFAULT false,
    due_date TIMESTAMP WITH TIME ZONE,
    recurrence TEXT DEFAULT 'none',
    subtasks JSONB DEFAULT '[]'::JSONB,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE, -- For Mithra Blend
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Habits
CREATE TABLE public.habits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'default',
    streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    completed_dates JSONB DEFAULT '[]'::JSONB,
    history JSONB DEFAULT '[]'::JSONB,
    schedule_time TEXT,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE, -- For Mithra Blend
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

-- Journal Entries (with pgvector for Dost AI RAG Memory)
CREATE TABLE public.journal_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    content TEXT NOT NULL,
    mood INTEGER CHECK (mood >= 1 AND mood <= 5),
    tags TEXT[] DEFAULT '{}',
    date DATE NOT NULL,
    embedding VECTOR(768), -- Gemini Text Embedding Size
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE, -- Group journals (optional)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- Focus Sessions (Timer Analytics)
CREATE TABLE public.focus_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    duration_minutes INTEGER NOT NULL,
    task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;


-- 3. ROW LEVEL SECURITY (RLS) POLICIES

-- Profiles: Users can read and update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Workspaces: Owners and Members can view, but only Owners can update/delete
CREATE POLICY "View accessible workspaces" ON public.workspaces FOR SELECT USING (
    auth.uid() = owner_id OR auth.uid() IN (SELECT user_id FROM public.workspace_members WHERE workspace_id = id)
);
CREATE POLICY "Create workspaces" ON public.workspaces FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Update own workspaces" ON public.workspaces FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Delete own workspaces" ON public.workspaces FOR DELETE USING (auth.uid() = owner_id);

-- Workspace Members: Members can view each other, owners can manage
CREATE POLICY "View workspace members" ON public.workspace_members FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM public.workspace_members m2 WHERE m2.workspace_id = workspace_id) OR
    auth.uid() IN (SELECT owner_id FROM public.workspaces w WHERE w.id = workspace_id)
);
CREATE POLICY "Insert workspace members" ON public.workspace_members FOR INSERT WITH CHECK (
    auth.uid() = user_id OR auth.uid() IN (SELECT owner_id FROM public.workspaces w WHERE w.id = workspace_id)
);
CREATE POLICY "Delete workspace members" ON public.workspace_members FOR DELETE USING (
    auth.uid() = user_id OR auth.uid() IN (SELECT owner_id FROM public.workspaces w WHERE w.id = workspace_id)
);

-- Core Entities (Tasks, Habits, Journals, Focus): 
-- Policy: Restrict to owner OR members of the assigned workspace
CREATE POLICY "Tasks access" ON public.tasks FOR ALL USING (
    auth.uid() = user_id OR 
    (workspace_id IS NOT NULL AND auth.uid() IN (SELECT user_id FROM public.workspace_members WHERE workspace_id = tasks.workspace_id)) OR
    (workspace_id IS NOT NULL AND auth.uid() IN (SELECT owner_id FROM public.workspaces WHERE id = tasks.workspace_id))
);

CREATE POLICY "Habits access" ON public.habits FOR ALL USING (
    auth.uid() = user_id OR 
    (workspace_id IS NOT NULL AND auth.uid() IN (SELECT user_id FROM public.workspace_members WHERE workspace_id = habits.workspace_id)) OR
    (workspace_id IS NOT NULL AND auth.uid() IN (SELECT owner_id FROM public.workspaces WHERE id = habits.workspace_id))
);

CREATE POLICY "Journal access" ON public.journal_entries FOR ALL USING (
    auth.uid() = user_id OR 
    (workspace_id IS NOT NULL AND auth.uid() IN (SELECT user_id FROM public.workspace_members WHERE workspace_id = journal_entries.workspace_id)) OR
    (workspace_id IS NOT NULL AND auth.uid() IN (SELECT owner_id FROM public.workspaces WHERE id = journal_entries.workspace_id))
);

CREATE POLICY "Focus sessions access" ON public.focus_sessions FOR ALL USING (
    auth.uid() = user_id OR 
    (workspace_id IS NOT NULL AND auth.uid() IN (SELECT user_id FROM public.workspace_members WHERE workspace_id = focus_sessions.workspace_id)) OR
    (workspace_id IS NOT NULL AND auth.uid() IN (SELECT owner_id FROM public.workspaces WHERE id = focus_sessions.workspace_id))
);

-- 4. REALTIME CONFIGURATION
-- Enable Realtime for collaborative tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.workspaces;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workspace_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.habits;

-- 5. TRIGGERS
-- Automatically create a profile when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. RAG SIMILARITY SEARCH FUNCTION
-- Used by Dost AI to find relevant journal entries
CREATE OR REPLACE FUNCTION match_journal_entries (
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  p_user_id uuid
)
RETURNS TABLE (
  id uuid,
  content text,
  date date,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    journal_entries.id,
    journal_entries.content,
    journal_entries.date,
    1 - (journal_entries.embedding <=> query_embedding) AS similarity
  FROM journal_entries
  WHERE journal_entries.user_id = p_user_id
    AND 1 - (journal_entries.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
$$;
