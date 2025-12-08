-- Add flow/version/variant to onboarding responses for dynamic flows and A/B variants
ALTER TABLE onboarding_responses
  ADD COLUMN IF NOT EXISTS flow_id varchar(100) NOT NULL DEFAULT 'default',
  ADD COLUMN IF NOT EXISTS flow_version varchar(50) NOT NULL DEFAULT 'v1',
  ADD COLUMN IF NOT EXISTS variant_id varchar(100) NOT NULL DEFAULT 'variant-a';

-- Drop legacy uniqueness on (user_id, step_key) so flow/variant combinations can coexist
ALTER TABLE onboarding_responses
  DROP CONSTRAINT IF EXISTS onboarding_responses_user_step_uidx;
DROP INDEX IF EXISTS onboarding_responses_user_step_uidx;

-- Update uniqueness to include flow and variant
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'onboarding_responses_user_flow_step_uidx'
  ) THEN
    CREATE UNIQUE INDEX onboarding_responses_user_flow_step_uidx
      ON onboarding_responses (user_id, flow_id, variant_id, step_key);
  END IF;
END $$;
