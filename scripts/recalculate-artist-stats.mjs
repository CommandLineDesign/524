#!/usr/bin/env node

/**
 * Script to recalculate artist review statistics for all artists
 * This fixes the issue where manually inserted reviews don't update the denormalized stats
 *
 * Usage: node scripts/recalculate-artist-stats.mjs
 *
 * This script uses raw SQL queries to update artist statistics based on actual review data.
 */

console.log('Starting artist review stats recalculation...');

// SQL queries to run (you can copy these to run manually in your database client)
const sqlQueries = [
  // Update artists with reviews
  `
  UPDATE artist_profiles
  SET
    average_rating = stats.avg_rating::text,
    total_reviews = stats.review_count,
    updated_at = NOW()
  FROM (
    SELECT
      r.artist_id,
      ROUND(AVG(r.overall_rating), 2) as avg_rating,
      COUNT(*) as review_count
    FROM reviews r
    WHERE r.is_visible = true
    GROUP BY r.artist_id
  ) stats
  WHERE artist_profiles.user_id = stats.artist_id;
  `,

  // Update artists with no reviews to have 0 reviews and null rating
  `
  UPDATE artist_profiles
  SET
    average_rating = NULL,
    total_reviews = 0,
    updated_at = NOW()
  WHERE user_id NOT IN (
    SELECT DISTINCT artist_id
    FROM reviews
    WHERE is_visible = true
  );
  `,
];

console.log('SQL queries to run:');
sqlQueries.forEach((query, index) => {
  console.log(`\n--- Query ${index + 1} ---`);
  console.log(query.trim());
});

console.log(
  '\n📋 Copy and run these SQL queries in your database client (like Neon Console) to fix artist review statistics.'
);
console.log(
  '✅ This will recalculate average ratings and review counts for all artists based on their actual reviews.'
);
