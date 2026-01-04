-- Update artist specialties to remove 'combo' and ensure proper hair/makeup services
-- This migration updates existing artists who had 'combo' in their specialties
-- to have both 'hair' and 'makeup' instead

-- Update artists who have 'combo' in their specialties to have both 'hair' and 'makeup'
UPDATE artist_profiles
SET specialties = '["hair", "makeup"]'::jsonb
WHERE specialties @> '["combo"]'::jsonb;

-- Remove 'skincare' from specialties as it's not a valid service type
UPDATE artist_profiles
SET specialties = specialties - 'skincare'
WHERE specialties @> '["skincare"]'::jsonb;
