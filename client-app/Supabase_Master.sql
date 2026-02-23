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

-- Add plan column if table already exists without it
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan text DEFAULT 'free';

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
-- 4. MITHRA BLEND — WORKSPACES
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

-- Helper function to avoid infinite recursion in RLS policies
-- SECURITY DEFINER bypasses RLS while checking membership
CREATE OR REPLACE FUNCTION public.check_membership(p_workspace_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_id = p_workspace_id
    AND user_id = auth.uid()
  );
END;
$$;

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
    public.check_membership(id)
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
    public.check_membership(workspace_id)
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
-- 5. GOOGLE CALENDAR TOKENS (secure OAuth storage)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.google_calendar_tokens (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  access_token text NOT NULL,
  refresh_token text NOT NULL,
  token_type text DEFAULT 'Bearer',
  expires_at timestamptz NOT NULL,
  scope text,
  calendar_id text DEFAULT 'primary',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.google_calendar_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own calendar tokens" ON public.google_calendar_tokens;
CREATE POLICY "Users manage own calendar tokens" ON public.google_calendar_tokens
  USING (auth.uid() = user_id);


-- ============================================================
-- 6. JOURNAL ENTRIES + VECTOR SEARCH (for Dost AI / RAG)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  content text NOT NULL,
  mood integer,
  tags text,
  embedding vector(768),
  date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Add workspace_id if table already exists without it
ALTER TABLE public.journal_entries ADD COLUMN IF NOT EXISTS workspace_id uuid;

ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own journal" ON public.journal_entries;
CREATE POLICY "Users can manage own journal"
  ON public.journal_entries
  USING (
    auth.uid() = user_id
    OR (
      workspace_id IS NOT NULL
      AND public.check_membership(workspace_id)
    )
  );

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
-- 7. TASKS TABLE (with workspace support)
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
  created_at timestamptz DEFAULT now()
);

-- Add workspace_id if table already exists without it
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS workspace_id uuid REFERENCES public.workspaces(id) ON DELETE SET NULL;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_tasks_workspace ON public.tasks(workspace_id) WHERE workspace_id IS NOT NULL;
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Personal tasks: only the owner can see them
DROP POLICY IF EXISTS "Users can manage own tasks" ON public.tasks;
CREATE POLICY "Users can manage own tasks"
  ON public.tasks
  USING (
    auth.uid() = user_id
    OR (
      workspace_id IS NOT NULL
      AND public.check_membership(workspace_id)
    )
  );


-- ============================================================
-- 8. HABITS TABLE (with workspace support)
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
  created_at timestamptz DEFAULT now()
);

-- Add workspace_id if table already exists without it
ALTER TABLE public.habits ADD COLUMN IF NOT EXISTS workspace_id uuid REFERENCES public.workspaces(id) ON DELETE SET NULL;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_habits_workspace ON public.habits(workspace_id) WHERE workspace_id IS NOT NULL;
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

-- Own habits OR workspace shared habits
DROP POLICY IF EXISTS "Users can manage own habits" ON public.habits;
CREATE POLICY "Users can manage own habits"
  ON public.habits
  USING (
    auth.uid() = user_id
    OR (
      workspace_id IS NOT NULL
      AND public.check_membership(workspace_id)
    )
  );


-- ============================================================
-- 9. NOTIFICATION SETTINGS
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
-- 10. PLANS & SUBSCRIPTIONS (Multi-tier SaaS)
-- ============================================================

-- Plan definitions: single source of truth for limits
CREATE TABLE IF NOT EXISTS public.plans (
  id text PRIMARY KEY,             -- 'free', 'pro', 'team', 'enterprise'
  display_name text NOT NULL,
  daily_ai_limit integer,          -- NULL = unlimited
  monthly_ai_limit integer,        -- NULL = unlimited
  max_workspaces integer DEFAULT 1,
  max_members_per_workspace integer DEFAULT 5,
  price_monthly integer DEFAULT 0, -- cents
  price_yearly integer DEFAULT 0,  -- cents
  features jsonb DEFAULT '{}',     -- extensible feature flags
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Seed default plans (idempotent)
INSERT INTO public.plans (id, display_name, daily_ai_limit, monthly_ai_limit, max_workspaces, max_members_per_workspace, price_monthly, price_yearly, features)
VALUES
  ('free',       'Free',       20,   500,   1,  5,     0,      0,     '{"rag_memory": true, "export": false}'),
  ('pro',        'Pro',        NULL, NULL,  5,  20,    999,    9990,  '{"rag_memory": true, "export": true, "priority_support": true}'),
  ('team',       'Team',       NULL, NULL,  20, 50,    2999,   29990, '{"rag_memory": true, "export": true, "priority_support": true, "admin_dashboard": true}'),
  ('enterprise', 'Enterprise', NULL, NULL,  -1, -1,    0,      0,     '{"rag_memory": true, "export": true, "priority_support": true, "admin_dashboard": true, "sso": true}')
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  daily_ai_limit = EXCLUDED.daily_ai_limit,
  monthly_ai_limit = EXCLUDED.monthly_ai_limit,
  max_workspaces = EXCLUDED.max_workspaces,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  features = EXCLUDED.features;

-- No RLS on plans — public read-only
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Plans are public" ON public.plans;
CREATE POLICY "Plans are public" ON public.plans FOR SELECT USING (true);


-- Subscriptions: Stripe-ready state machine
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id text REFERENCES public.plans(id) DEFAULT 'free',
  status text CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'expired')) DEFAULT 'active',
  stripe_customer_id text,
  stripe_subscription_id text UNIQUE,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at timestamptz,           -- scheduled cancellation
  grace_period_end timestamptz,    -- access continues until this date after cancellation
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)                  -- one active subscription per user
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own subscription" ON public.subscriptions;
CREATE POLICY "Users manage own subscription" ON public.subscriptions
  USING (auth.uid() = user_id);


-- ============================================================
-- 10. USAGE TRACKING (Atomic, race-condition-proof)
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
CREATE POLICY "Users can manage own usage" ON public.usage_tracking
  USING (auth.uid() = user_id);

-- Atomic: increment usage AND check limit in one call (prevents race conditions)
CREATE OR REPLACE FUNCTION public.increment_and_check_ai_usage(
  p_user_id uuid,
  p_tokens integer DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan_id text;
  v_daily_limit integer;
  v_current_calls integer;
  v_allowed boolean;
  v_grace timestamptz;
  v_sub_status text;
BEGIN
  -- 1. Get user's active plan (from subscription, fallback to profile.plan, fallback to 'free')
  SELECT
    COALESCE(s.plan_id, p.plan, 'free'),
    s.status,
    s.grace_period_end
  INTO v_plan_id, v_sub_status, v_grace
  FROM public.profiles p
  LEFT JOIN public.subscriptions s ON s.user_id = p.id
  WHERE p.id = p_user_id;

  -- Handle expired/canceled subscriptions with grace period
  IF v_sub_status IN ('canceled', 'expired') AND v_grace IS NOT NULL AND v_grace > NOW() THEN
    -- Still in grace period, keep plan
    NULL;
  ELSIF v_sub_status IN ('canceled', 'expired') THEN
    v_plan_id := 'free';
  END IF;

  -- 2. Get plan limits
  SELECT daily_ai_limit INTO v_daily_limit
  FROM public.plans WHERE id = v_plan_id;

  -- 3. Atomic upsert with row lock
  INSERT INTO public.usage_tracking (user_id, date, ai_calls, tokens_used, updated_at)
  VALUES (p_user_id, CURRENT_DATE, 1, p_tokens, NOW())
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    ai_calls = usage_tracking.ai_calls + 1,
    tokens_used = usage_tracking.tokens_used + p_tokens,
    updated_at = NOW()
  RETURNING ai_calls INTO v_current_calls;

  -- 4. Check limit (NULL = unlimited)
  v_allowed := (v_daily_limit IS NULL) OR (v_current_calls <= v_daily_limit);

  -- If not allowed, rollback the increment
  IF NOT v_allowed THEN
    UPDATE public.usage_tracking
    SET ai_calls = ai_calls - 1,
        tokens_used = tokens_used - p_tokens,
        updated_at = NOW()
    WHERE user_id = p_user_id AND date = CURRENT_DATE;
  END IF;

  RETURN jsonb_build_object(
    'allowed', v_allowed,
    'current', CASE WHEN v_allowed THEN v_current_calls ELSE v_current_calls - 1 END,
    'limit', v_daily_limit,
    'plan', v_plan_id
  );
END;
$$;

-- Convenience: get user's plan + limits (for frontend display)
CREATE OR REPLACE FUNCTION public.get_user_plan_limits(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'plan_id', COALESCE(s.plan_id, p.plan, 'free'),
    'status', COALESCE(s.status, 'active'),
    'daily_ai_limit', pl.daily_ai_limit,
    'monthly_ai_limit', pl.monthly_ai_limit,
    'max_workspaces', pl.max_workspaces,
    'features', pl.features,
    'current_period_end', s.current_period_end,
    'today_ai_calls', COALESCE(u.ai_calls, 0),
    'today_tokens', COALESCE(u.tokens_used, 0)
  ) INTO v_result
  FROM public.profiles p
  LEFT JOIN public.subscriptions s ON s.user_id = p.id
  LEFT JOIN public.plans pl ON pl.id = COALESCE(s.plan_id, p.plan, 'free')
  LEFT JOIN public.usage_tracking u ON u.user_id = p.id AND u.date = CURRENT_DATE
  WHERE p.id = p_user_id;

  RETURN COALESCE(v_result, '{"plan_id":"free","status":"active","daily_ai_limit":20}'::jsonb);
END;
$$;

-- Keep legacy function for backwards compat
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


-- ============================================================
-- 11. PUSH SUBSCRIPTIONS (Multi-device web push)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  endpoint text NOT NULL,
  p256dh text NOT NULL,
  auth text NOT NULL,
  user_agent text,
  created_at timestamptz DEFAULT now(),
  last_used_at timestamptz DEFAULT now(),
  UNIQUE(user_id, endpoint)       -- one subscription per endpoint per user
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own push subs" ON public.push_subscriptions;
CREATE POLICY "Users manage own push subs" ON public.push_subscriptions
  USING (auth.uid() = user_id);


-- ============================================================
-- 12. GRANT PERMISSIONS
-- ============================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- ============================================================
-- Done! Your Mithra Life OS database is fully set up.
-- Run this script in Supabase SQL Editor — it is idempotent.
-- ============================================================
