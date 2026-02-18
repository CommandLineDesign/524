-- Migration: Replace static hair_price/makeup_price columns with flexible service_prices JSONB
-- This allows for future extensibility (additional services, treatments, etc.) without schema changes

-- Add flexible service_prices JSONB column
ALTER TABLE "artist_profiles" ADD COLUMN "service_prices" jsonb;

-- Migrate existing data from individual columns (if any)
UPDATE "artist_profiles"
SET "service_prices" = jsonb_build_object(
  'hair', hair_price,
  'makeup', makeup_price
)
WHERE hair_price IS NOT NULL OR makeup_price IS NOT NULL;

-- Populate ALL existing test artists with random prices from presets (40000, 50000, 80000)
UPDATE "artist_profiles"
SET "service_prices" = jsonb_build_object(
  'hair', (ARRAY[40000, 50000, 80000])[floor(random() * 3 + 1)::int],
  'makeup', (ARRAY[40000, 50000, 80000])[floor(random() * 3 + 1)::int]
)
WHERE "service_prices" IS NULL OR "service_prices" = '{}';

-- Remove old static columns
ALTER TABLE "artist_profiles" DROP COLUMN IF EXISTS "hair_price";
ALTER TABLE "artist_profiles" DROP COLUMN IF EXISTS "makeup_price";
