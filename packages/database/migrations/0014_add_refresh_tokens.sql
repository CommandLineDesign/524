-- Migration: Add refresh_tokens table for JWT refresh token storage
-- This enables secure token refresh without requiring re-authentication

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  family_id UUID NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  revoked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Index for looking up tokens by user (for cleanup/revocation)
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);

-- Unique constraint on token_hash creates an implicit index for token lookup

-- Index for family-based revocation (when detecting token reuse)
CREATE INDEX idx_refresh_tokens_family_id ON refresh_tokens(family_id);

-- Index for cleanup of expired tokens
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
