-- Add unique constraint on device_tokens.token column
-- This ensures no duplicate FCM tokens can be registered across users
ALTER TABLE "device_tokens" ADD CONSTRAINT "device_tokens_token_unique" UNIQUE ("token");
