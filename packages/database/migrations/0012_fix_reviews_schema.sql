-- Fix reviews schema to make all rating fields required and use boolean for is_visible
-- Migration: 0012_fix_reviews_schema
-- Created: 2025-12-19
-- Description: Make rating fields required and convert is_visible to boolean

-- Check for NULL values before making columns NOT NULL
DO $$
BEGIN
    -- Check quality_rating for NULL values
    IF EXISTS (SELECT 1 FROM "reviews" WHERE "quality_rating" IS NULL) THEN
        RAISE EXCEPTION 'Cannot make quality_rating NOT NULL: found NULL values in existing data';
    END IF;

    -- Check professionalism_rating for NULL values
    IF EXISTS (SELECT 1 FROM "reviews" WHERE "professionalism_rating" IS NULL) THEN
        RAISE EXCEPTION 'Cannot make professionalism_rating NOT NULL: found NULL values in existing data';
    END IF;

    -- Check timeliness_rating for NULL values
    IF EXISTS (SELECT 1 FROM "reviews" WHERE "timeliness_rating" IS NULL) THEN
        RAISE EXCEPTION 'Cannot make timeliness_rating NOT NULL: found NULL values in existing data';
    END IF;
END $$;

-- Make rating columns NOT NULL
ALTER TABLE "reviews" ALTER COLUMN "quality_rating" SET NOT NULL;
ALTER TABLE "reviews" ALTER COLUMN "professionalism_rating" SET NOT NULL;
ALTER TABLE "reviews" ALTER COLUMN "timeliness_rating" SET NOT NULL;

-- Convert is_visible to boolean with safe conversion
ALTER TABLE "reviews" ALTER COLUMN "is_visible" SET DEFAULT true;
ALTER TABLE "reviews" ALTER COLUMN "is_visible" SET DATA TYPE boolean USING CASE WHEN "is_visible" = 1 THEN true WHEN "is_visible" = 0 THEN false ELSE true END;

-- Add comments for documentation
COMMENT ON COLUMN "reviews"."quality_rating" IS 'Service quality rating (1-5, required)';
COMMENT ON COLUMN "reviews"."professionalism_rating" IS 'Professionalism rating (1-5, required)';
COMMENT ON COLUMN "reviews"."timeliness_rating" IS 'Timeliness rating (1-5, required)';
COMMENT ON COLUMN "reviews"."is_visible" IS 'Whether the review is visible to public (defaults to true)';