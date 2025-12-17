-- Add booking_id field to messages table for booking context tracking
ALTER TABLE messages ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES bookings(id);

-- Create partial index for booking_id (only non-null values for better performance)
CREATE INDEX IF NOT EXISTS idx_messages_booking ON messages(booking_id) WHERE booking_id IS NOT NULL;