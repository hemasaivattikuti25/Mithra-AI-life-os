-- Migration: Create oauth_tokens table for storing encrypted OAuth refresh tokens
-- This replaces the /tmp/ file-based token storage with secure database storage

CREATE TABLE IF NOT EXISTS oauth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL UNIQUE,
  provider VARCHAR(50) NOT NULL DEFAULT 'google',
  encrypted_token TEXT NOT NULL,
  token_type VARCHAR(50) NOT NULL DEFAULT 'refresh_token',
  authorized_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_user_id ON oauth_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_provider ON oauth_tokens(provider);

-- Comment on the table
COMMENT ON TABLE oauth_tokens IS 'Stores encrypted OAuth refresh tokens for external service integrations (Google Calendar, etc.)';
COMMENT ON COLUMN oauth_tokens.encrypted_token IS 'Encrypted token using Fernet cipher - never store plain text tokens';
COMMENT ON COLUMN oauth_tokens.last_used_at IS 'Track token usage for audit logs';
