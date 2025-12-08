-- Add onboarding completion flag to users
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false;

-- Store onboarding step responses per user
CREATE TABLE IF NOT EXISTS onboarding_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  step_key varchar(100) NOT NULL,
  response jsonb NOT NULL,
  version integer NOT NULL DEFAULT 1,
  is_completed_step boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT onboarding_responses_user_step_uidx UNIQUE (user_id, step_key)
);
