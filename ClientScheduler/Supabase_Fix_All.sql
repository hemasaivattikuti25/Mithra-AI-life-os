-- ==========================================
-- SUPER FIX SCRIPT: Auth, Profiles, Vector & Dost AI
-- ==========================================

-- 1. ENABLE EXTENSIONS (Idempotent)
CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE PROFILES TABLE (If not exists)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name text DEFAULT '',
  email text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. PROFILE RLS POLICIES (Allow users to see their own profile)
-- Drop first to avoid errors
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 4. AUTH HOOK: SYNC AUTH.USERS -> PUBLIC.PROFILES
-- This ensures every signup creates a profile automatically

-- Step 1: Drop existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 2: Create/Update the function
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

-- Step 3: Create the trigger
CREATE TRIGGER on_auth_user_created 
  AFTER INSERT ON auth.users 
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- 5. JOURNAL ENTRIES & VECTOR SEARCH (For Dost AI)
-- Ensure table exists
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  content text NOT NULL,
  mood integer,
  tags text,
  embedding vector(768), -- Make sure this matches Gemini embedding size
  date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- Journal RLS
DROP POLICY IF EXISTS "Users can manage own journal" ON public.journal_entries;
CREATE POLICY "Users can manage own journal"
  ON public.journal_entries
  USING (auth.uid() = user_id);

-- 6. MATCH FUNCTION FOR AI (RPC)
-- This allows the backend to search relevant journal entries
-- Drop first to handle return type changes cleanly
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

-- 7. GRANT PERMISSIONS (Critical for API Access)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- Specifically ensure profiles is accessible
GRANT ALL ON public.profiles TO authenticated, service_role;

-- Done!
