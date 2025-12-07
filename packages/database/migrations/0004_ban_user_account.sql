-- Ban/unban support and token/session invalidation
ALTER TABLE "users"
  ADD COLUMN "is_banned" boolean DEFAULT false,
  ADD COLUMN "ban_reason" text,
  ADD COLUMN "banned_at" timestamp,
  ADD COLUMN "banned_by" uuid REFERENCES "users" ("id"),
  ADD COLUMN "token_version" integer DEFAULT 1,
  ADD COLUMN "session_version" integer DEFAULT 1;

-- Ensure new rows have incrementing metadata defaults
UPDATE "users"
SET
  "token_version" = COALESCE("token_version", 1),
  "session_version" = COALESCE("session_version", 1),
  "is_banned" = COALESCE("is_banned", false)
WHERE TRUE;
