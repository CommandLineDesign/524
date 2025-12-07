-- Create enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_type') THEN
    CREATE TYPE user_role_type AS ENUM ('customer', 'artist', 'admin', 'support');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'artist_verification_status') THEN
    CREATE TYPE artist_verification_status AS ENUM (
      'pending_review',
      'in_review',
      'verified',
      'rejected',
      'suspended'
    );
  END IF;
END$$;

-- Normalize existing verification_status values before type change
UPDATE artist_profiles
SET verification_status = CASE
  WHEN verification_status IN ('pending', 'pending_review') OR verification_status IS NULL THEN 'pending_review'
  WHEN verification_status = 'verified' THEN 'verified'
  WHEN verification_status = 'rejected' THEN 'rejected'
  WHEN verification_status = 'suspended' THEN 'suspended'
  ELSE 'pending_review'
END;

-- Alter artist_profiles verification_status to enum and add review metadata
ALTER TABLE artist_profiles
  ALTER COLUMN verification_status TYPE artist_verification_status USING verification_status::artist_verification_status,
  ALTER COLUMN verification_status SET DEFAULT 'pending_review',
  ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS review_notes text,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamp;

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role user_role_type NOT NULL,
  created_at timestamp DEFAULT now() NOT NULL,
  CONSTRAINT user_roles_pk PRIMARY KEY (user_id, role)
);

-- Backfill roles from users.role
INSERT INTO user_roles (user_id, role, created_at)
SELECT id, role::user_role_type, now()
FROM users
ON CONFLICT (user_id, role) DO NOTHING;

-- Ensure every artist profile has an artist role
INSERT INTO user_roles (user_id, role, created_at)
SELECT DISTINCT user_id, 'artist', now()
FROM artist_profiles
ON CONFLICT (user_id, role) DO NOTHING;
