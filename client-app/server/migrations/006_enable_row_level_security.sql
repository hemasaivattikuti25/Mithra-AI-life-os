-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRATION 006: Enable Row Level Security (RLS)
-- ═══════════════════════════════════════════════════════════════════════════
-- Resolves Supabase Security Advisor advisory: rls_disabled_in_public
--
-- Why this is required:
-- Supabase automatically exposes the 'public' schema over PostgREST (HTTP API).
-- Without RLS enabled, anyone with the project URL and anon key could query,
-- insert, or modify records across all tables.
--
-- How this affects the FastAPI backend:
-- The backend connects via PostgreSQL (postgres user / pooler) which has
-- the BYPASSRLS attribute, so all server-side queries continue to function
-- with zero disruption.
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Enable RLS on all known core tables
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ai_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS oauth_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS email_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS data_export_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS schema_migrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS workspace_members ENABLE ROW LEVEL SECURITY;

-- 2. Dynamic safety loop: Ensure EVERY table in the public schema has RLS enabled
DO $$
DECLARE
    tbl RECORD;
BEGIN
    FOR tbl IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl.tablename);
    END LOOP;
END $$;

-- 3. Public read-only policy for plans (allow clients to inspect pricing & limits)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'plans' AND policyname = 'Allow public read-only access to plans'
    ) THEN
        CREATE POLICY "Allow public read-only access to plans" ON public.plans
            FOR SELECT
            USING (true);
    END IF;
END $$;
