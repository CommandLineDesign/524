-- Fix reviews schema to make all rating fields required and use boolean for is_visible
ALTER TABLE "reviews" ALTER COLUMN "quality_rating" SET NOT NULL;
ALTER TABLE "reviews" ALTER COLUMN "professionalism_rating" SET NOT NULL;
ALTER TABLE "reviews" ALTER COLUMN "timeliness_rating" SET NOT NULL;
ALTER TABLE "reviews" ALTER COLUMN "is_visible" SET DEFAULT true;
ALTER TABLE "reviews" ALTER COLUMN "is_visible" SET DATA TYPE boolean USING CASE WHEN "is_visible" = 1 THEN true ELSE false END;