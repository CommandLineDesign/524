-- Add archived_at timestamp to conversations table for soft deletion
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP;

-- Create index for active conversations (excluding archived ones)
CREATE INDEX IF NOT EXISTS idx_conversations_active ON conversations(status, last_message_at DESC) WHERE archived_at IS NULL;