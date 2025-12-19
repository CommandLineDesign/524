-- Add indexes for conversation lookups and ordering

-- Index for customer conversations ordered by last message (most recent first)
CREATE INDEX IF NOT EXISTS idx_conversations_customer ON conversations(customer_id, last_message_at DESC);

-- Index for artist conversations ordered by last message (most recent first)
CREATE INDEX IF NOT EXISTS idx_conversations_artist ON conversations(artist_id, last_message_at DESC);

-- Index for fast lookup of conversations between specific customer-artist pairs
CREATE INDEX IF NOT EXISTS idx_conversations_lookup ON conversations(customer_id, artist_id);

