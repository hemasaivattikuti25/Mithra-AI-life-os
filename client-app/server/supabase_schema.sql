-- ═══════════════════════════════════════════════════════════════════════════
-- MITHRA LIFE OS — SUPABASE MASTER DATABASE INITIALIZATION SCHEMA
-- ═══════════════════════════════════════════════════════════════════════════
-- Project URL:  https://zchpirctpggenpqybgxh.supabase.co
-- Project Ref:  zchpirctpggenpqybgxh
-- SQL Editor:   https://supabase.com/dashboard/project/zchpirctpggenpqybgxh/sql
--
-- CLI Setup:
--   supabase login
--   supabase init
--   supabase link --project-ref zchpirctpggenpqybgxh
--   supabase db push (or execute this script in SQL Editor)
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 0. EXTENSIONS ───────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ─── 1. USER PROFILES ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,                       -- Firebase UID
    email TEXT,
    display_name TEXT,
    avatar_url TEXT,
    timezone TEXT DEFAULT 'UTC',
    referral_code VARCHAR(12) UNIQUE,
    tos_accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code);

-- ─── 2. PLANS & SUBSCRIPTIONS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS plans (
    id VARCHAR(50) PRIMARY KEY,                -- 'free', 'pro'
    name VARCHAR(100) NOT NULL,
    daily_ai_limit INT NOT NULL DEFAULT 20,
    max_tasks INT NOT NULL DEFAULT 100,
    max_habits INT NOT NULL DEFAULT 20,
    max_workspaces INT NOT NULL DEFAULT 1,
    price_cents INT NOT NULL DEFAULT 0,
    stripe_price_id VARCHAR(100)
);

-- Seed default tiers
INSERT INTO plans (id, name, daily_ai_limit, max_tasks, max_habits, max_workspaces, price_cents, stripe_price_id)
VALUES 
    ('free', 'Free Forever', 20, 100, 20, 1, 0, NULL),
    ('pro', 'Mithra Pro', 1000, 10000, 100, 10, 999, 'price_placeholder_pro')
ON CONFLICT (id) DO UPDATE SET
    daily_ai_limit = EXCLUDED.daily_ai_limit,
    max_tasks = EXCLUDED.max_tasks,
    max_habits = EXCLUDED.max_habits,
    max_workspaces = EXCLUDED.max_workspaces;

CREATE TABLE IF NOT EXISTS user_plans (
    user_id TEXT PRIMARY KEY,
    plan_id VARCHAR(50) REFERENCES plans(id) DEFAULT 'free',
    status VARCHAR(20) DEFAULT 'active',
    stripe_customer_id VARCHAR(100),
    stripe_subscription_id VARCHAR(100),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- ─── 3. AI USAGE TRACKING ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
    calls_today INT NOT NULL DEFAULT 1,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_user_ai_usage_date UNIQUE (user_id, usage_date)
);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_date ON ai_usage(user_id, usage_date);

-- ─── 4. TASKS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    details TEXT DEFAULT '',
    list_id TEXT DEFAULT 'default',
    priority VARCHAR(20) DEFAULT 'medium',      -- 'low', 'medium', 'high'
    completed BOOLEAN DEFAULT FALSE,
    starred BOOLEAN DEFAULT FALSE,
    due_date TIMESTAMPTZ,
    recurrence VARCHAR(50) DEFAULT 'none',
    subtasks TEXT DEFAULT '[]',
    subtasks_json JSONB DEFAULT '[]'::jsonb,
    workspace_id UUID,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(user_id, completed) WHERE deleted_at IS NULL;

-- ─── 5. HABITS ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'Personal',
    color TEXT,
    streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    completed_dates TEXT[] DEFAULT '{}',
    repeat_days INT[] DEFAULT '{0,1,2,3,4,5,6}',
    frequency INT DEFAULT 1,
    reminder BOOLEAN DEFAULT FALSE,
    schedule_time VARCHAR(10) DEFAULT '08:00',
    streak_goal INT DEFAULT 30,
    streak_unit VARCHAR(20) DEFAULT 'Day',
    focus_duration INT DEFAULT 25,
    workspace_id UUID,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);

-- ─── 6. JOURNAL ENTRIES (WITH PGVECTOR RAG SUPPORT) ──────────────────────────
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    mood INT,
    tags TEXT[] DEFAULT '{}',
    date DATE DEFAULT CURRENT_DATE,
    embedding_vector vector(768),
    workspace_id UUID,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_journal_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_date ON journal_entries(user_id, date);

-- ─── 7. MOOD LOGS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mood_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    mood_value INT NOT NULL,                    -- 1 to 5
    mood_label VARCHAR(50),
    note TEXT,
    logged_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_mood_logs_user_date ON mood_logs(user_id, logged_at);

-- ─── 8. FOCUS SESSIONS ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS focus_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    habit_id UUID REFERENCES habits(id) ON DELETE SET NULL,
    duration_minutes INT DEFAULT 25,
    workspace_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_user ON focus_sessions(user_id, created_at);

-- ─── 9. CALENDAR EVENTS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    category TEXT DEFAULT 'Personal',
    workspace_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start ON calendar_events(user_id, start_time);

-- ─── 10. NOTIFICATION SETTINGS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notification_settings (
    user_id TEXT PRIMARY KEY,
    push_enabled BOOLEAN DEFAULT FALSE,
    reminder_minutes INT DEFAULT 15,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 11. ENCRYPTED OAUTH TOKENS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS oauth_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL UNIQUE,
    provider VARCHAR(50) NOT NULL DEFAULT 'google',
    encrypted_token TEXT NOT NULL,
    token_type VARCHAR(50) NOT NULL DEFAULT 'refresh_token',
    authorized_at TIMESTAMPTZ DEFAULT NOW(),
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_user_id ON oauth_tokens(user_id);

-- ─── 12. AUDIT LOG, REFERRALS & SYSTEM TABLES ───────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    resource_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);

CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id TEXT NOT NULL,
    referred_id TEXT,
    referral_code VARCHAR(12) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    converted_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);

CREATE TABLE IF NOT EXISTS email_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_email_events_user_type ON email_events(user_id, event_type);

CREATE TABLE IF NOT EXISTS data_export_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    download_url TEXT,
    expires_at TIMESTAMPTZ
);
