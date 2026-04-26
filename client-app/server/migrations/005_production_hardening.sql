-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRATION 005: Production Hardening
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Enable pgvector extension (for semantic journal search)
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add price_cents to plans table
ALTER TABLE plans ADD COLUMN IF NOT EXISTS price_cents INT NOT NULL DEFAULT 0;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS stripe_price_id VARCHAR(100);

UPDATE plans SET price_cents = 0 WHERE id = 'free';
UPDATE plans SET price_cents = 999, stripe_price_id = 'price_placeholder_pro' WHERE id = 'pro';

-- 3. Add Stripe fields to user_plans
ALTER TABLE user_plans ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(100);
ALTER TABLE user_plans ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(100);
ALTER TABLE user_plans ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- 4. Convert subtasks to JSONB (safe — preserves existing data)
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS subtasks_json JSONB DEFAULT '[]'::jsonb;

UPDATE tasks
  SET subtasks_json = subtasks::jsonb
  WHERE subtasks IS NOT NULL AND subtasks != '' AND subtasks != '[]';

-- 5. Add soft delete to all core tables
ALTER TABLE tasks        ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE habits       ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE workspaces   ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 6. Create audit_log table
CREATE TABLE IF NOT EXISTS audit_log (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     TEXT NOT NULL,
    action      TEXT NOT NULL,          -- 'create', 'update', 'delete', 'login'
    resource    TEXT NOT NULL,          -- 'task', 'habit', 'workspace', etc.
    resource_id TEXT,
    metadata    JSONB DEFAULT '{}'::jsonb,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);

-- 7. Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id     TEXT NOT NULL,
    referred_id     TEXT,
    referral_code   VARCHAR(12) UNIQUE NOT NULL,
    status          VARCHAR(20) DEFAULT 'pending', -- 'pending', 'converted', 'rewarded'
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    converted_at    TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);

-- 8. Create email_events table (track onboarding sequences)
CREATE TABLE IF NOT EXISTS email_events (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     TEXT NOT NULL,
    event_type  VARCHAR(50) NOT NULL,  -- 'welcome', 'day3_reminder', 'streak_alert', 'weekly_digest'
    sent_at     TIMESTAMPTZ DEFAULT NOW(),
    metadata    JSONB DEFAULT '{}'::jsonb
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_email_events_user_type ON email_events(user_id, event_type);

-- 9. Add ToS acceptance timestamp to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tos_accepted_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code VARCHAR(12);

-- 10. Create data_export_requests table (GDPR)
CREATE TABLE IF NOT EXISTS data_export_requests (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     TEXT NOT NULL,
    status      VARCHAR(20) DEFAULT 'pending',  -- 'pending', 'processing', 'ready', 'sent'
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    download_url TEXT,
    expires_at  TIMESTAMPTZ
);

-- 11. Update soft-delete queries: add WHERE deleted_at IS NULL to existing list queries
-- Note: application queries must be updated to filter deleted_at IS NULL

-- 12. Add journal embedding as proper vector column (for pgvector RAG)
ALTER TABLE journal_entries
  ADD COLUMN IF NOT EXISTS embedding_vector vector(768);

-- Indexes on embedding for ANN search
CREATE INDEX IF NOT EXISTS idx_journal_embedding_vector
  ON journal_entries USING ivfflat (embedding_vector vector_cosine_ops)
  WITH (lists = 100);
