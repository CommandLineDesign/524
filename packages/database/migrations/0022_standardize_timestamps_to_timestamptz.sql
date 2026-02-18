-- Migration: Standardize all timestamp columns to timestamptz
-- This ensures consistent timezone handling across the database.
-- All timestamps are stored in UTC, which PostgreSQL handles automatically with timestamptz.

-- Users table
ALTER TABLE users
  ALTER COLUMN banned_at TYPE timestamptz USING banned_at AT TIME ZONE 'UTC',
  ALTER COLUMN deactivated_at TYPE timestamptz USING deactivated_at AT TIME ZONE 'UTC',
  ALTER COLUMN created_at TYPE timestamptz USING created_at AT TIME ZONE 'UTC',
  ALTER COLUMN updated_at TYPE timestamptz USING updated_at AT TIME ZONE 'UTC';

-- Bookings table (has the most timestamp columns)
ALTER TABLE bookings
  ALTER COLUMN scheduled_date TYPE timestamptz USING scheduled_date AT TIME ZONE 'UTC',
  ALTER COLUMN scheduled_start_time TYPE timestamptz USING scheduled_start_time AT TIME ZONE 'UTC',
  ALTER COLUMN scheduled_end_time TYPE timestamptz USING scheduled_end_time AT TIME ZONE 'UTC',
  ALTER COLUMN artist_arrived_at TYPE timestamptz USING artist_arrived_at AT TIME ZONE 'UTC',
  ALTER COLUMN service_started_at TYPE timestamptz USING service_started_at AT TIME ZONE 'UTC',
  ALTER COLUMN service_completed_at TYPE timestamptz USING service_completed_at AT TIME ZONE 'UTC',
  ALTER COLUMN customer_review_date TYPE timestamptz USING customer_review_date AT TIME ZONE 'UTC',
  ALTER COLUMN cancelled_at TYPE timestamptz USING cancelled_at AT TIME ZONE 'UTC',
  ALTER COLUMN created_at TYPE timestamptz USING created_at AT TIME ZONE 'UTC',
  ALTER COLUMN updated_at TYPE timestamptz USING updated_at AT TIME ZONE 'UTC',
  ALTER COLUMN confirmed_at TYPE timestamptz USING confirmed_at AT TIME ZONE 'UTC',
  ALTER COLUMN completed_at TYPE timestamptz USING completed_at AT TIME ZONE 'UTC';

-- Messages table
ALTER TABLE messages
  ALTER COLUMN sent_at TYPE timestamptz USING sent_at AT TIME ZONE 'UTC',
  ALTER COLUMN read_at TYPE timestamptz USING read_at AT TIME ZONE 'UTC',
  ALTER COLUMN created_at TYPE timestamptz USING created_at AT TIME ZONE 'UTC';

-- Conversations table
ALTER TABLE conversations
  ALTER COLUMN last_message_at TYPE timestamptz USING last_message_at AT TIME ZONE 'UTC',
  ALTER COLUMN archived_at TYPE timestamptz USING archived_at AT TIME ZONE 'UTC',
  ALTER COLUMN created_at TYPE timestamptz USING created_at AT TIME ZONE 'UTC',
  ALTER COLUMN updated_at TYPE timestamptz USING updated_at AT TIME ZONE 'UTC';

-- Payments table
ALTER TABLE payments
  ALTER COLUMN authorized_at TYPE timestamptz USING authorized_at AT TIME ZONE 'UTC',
  ALTER COLUMN captured_at TYPE timestamptz USING captured_at AT TIME ZONE 'UTC',
  ALTER COLUMN failed_at TYPE timestamptz USING failed_at AT TIME ZONE 'UTC',
  ALTER COLUMN refunded_at TYPE timestamptz USING refunded_at AT TIME ZONE 'UTC',
  ALTER COLUMN payout_date TYPE timestamptz USING payout_date AT TIME ZONE 'UTC',
  ALTER COLUMN created_at TYPE timestamptz USING created_at AT TIME ZONE 'UTC',
  ALTER COLUMN updated_at TYPE timestamptz USING updated_at AT TIME ZONE 'UTC';

-- Reviews table
ALTER TABLE reviews
  ALTER COLUMN created_at TYPE timestamptz USING created_at AT TIME ZONE 'UTC',
  ALTER COLUMN updated_at TYPE timestamptz USING updated_at AT TIME ZONE 'UTC';

-- Review images table
ALTER TABLE review_images
  ALTER COLUMN created_at TYPE timestamptz USING created_at AT TIME ZONE 'UTC';

-- Artist profiles table
ALTER TABLE artist_profiles
  ALTER COLUMN background_check_date TYPE timestamptz USING background_check_date AT TIME ZONE 'UTC',
  ALTER COLUMN insurance_expiry_date TYPE timestamptz USING insurance_expiry_date AT TIME ZONE 'UTC',
  ALTER COLUMN reviewed_at TYPE timestamptz USING reviewed_at AT TIME ZONE 'UTC',
  ALTER COLUMN created_at TYPE timestamptz USING created_at AT TIME ZONE 'UTC',
  ALTER COLUMN updated_at TYPE timestamptz USING updated_at AT TIME ZONE 'UTC',
  ALTER COLUMN verified_at TYPE timestamptz USING verified_at AT TIME ZONE 'UTC';

-- Audit logs table
ALTER TABLE audit_logs
  ALTER COLUMN created_at TYPE timestamptz USING created_at AT TIME ZONE 'UTC';

-- Customer profiles table
ALTER TABLE customer_profiles
  ALTER COLUMN created_at TYPE timestamptz USING created_at AT TIME ZONE 'UTC',
  ALTER COLUMN updated_at TYPE timestamptz USING updated_at AT TIME ZONE 'UTC';

-- Addresses table
ALTER TABLE addresses
  ALTER COLUMN created_at TYPE timestamptz USING created_at AT TIME ZONE 'UTC',
  ALTER COLUMN updated_at TYPE timestamptz USING updated_at AT TIME ZONE 'UTC';

-- Onboarding responses table
ALTER TABLE onboarding_responses
  ALTER COLUMN created_at TYPE timestamptz USING created_at AT TIME ZONE 'UTC',
  ALTER COLUMN updated_at TYPE timestamptz USING updated_at AT TIME ZONE 'UTC';
