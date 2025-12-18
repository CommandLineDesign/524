-- Add completion tracking fields to bookings table for review system
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS completed_by UUID REFERENCES users(id);

-- Create index for completed bookings queries
CREATE INDEX IF NOT EXISTS idx_bookings_completed_at ON bookings(completed_at) WHERE completed_at IS NOT NULL;