-- Add simplified pricing columns to artist_profiles
-- Artists can set a single price for hair services and a single price for makeup services

ALTER TABLE "artist_profiles" ADD COLUMN "hair_price" integer;
ALTER TABLE "artist_profiles" ADD COLUMN "makeup_price" integer;
