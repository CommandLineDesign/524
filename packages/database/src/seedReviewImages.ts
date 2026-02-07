#!/usr/bin/env node
import pg from 'pg';
import 'dotenv/config';
import { randomUUID } from 'node:crypto';

const { Pool } = pg;

// Beauty/makeup related Unsplash images
const REVIEW_IMAGES = [
  'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800', // Hair styling
  'https://images.unsplash.com/photo-1595475884562-073c30d45670?w=800', // Makeup
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800', // Salon
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800', // Beauty
  'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800', // Makeup look
  'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800', // Full look
  'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800', // Makeup closeup
  'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800', // Makeup products
  'https://images.unsplash.com/photo-1503236823255-94609f598e71?w=800', // Hair
  'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800', // Hair styling
  'https://images.unsplash.com/photo-1522338140262-f46f5913618a?w=800', // Bridal
  'https://images.unsplash.com/photo-1457972729786-0411a3b2b626?w=800', // Makeup artist
  'https://images.unsplash.com/photo-1526045478516-99145907023c?w=800', // Hair coloring
  'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800', // Beauty results
  'https://images.unsplash.com/photo-1583001931096-959e9a1a6223?w=800', // Makeup look 2
  'https://images.unsplash.com/photo-1588453251771-cd919b362ed4?w=800', // Hair style
];

function getRandomImages(count: number): string[] {
  const shuffled = [...REVIEW_IMAGES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function generateS3Key(index: number): string {
  const types = ['result', 'closeup', 'full-look', 'detail', 'before-after'];
  return `reviews/test-${types[index % types.length]}-${Date.now()}-${index}.jpg`;
}

async function seedReviewImages() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ DATABASE_URL not set');
    process.exit(1);
  }

  console.log('🖼️  Adding images to test reviews...\n');

  const pool = new Pool({ connectionString });

  try {
    // Get all reviews that we created (excluding pre-existing ones that already have images)
    const reviews = await pool.query(`
      SELECT r.id, r.artist_id, ap.stage_name
      FROM reviews r
      JOIN artist_profiles ap ON r.artist_id = ap.user_id
      WHERE NOT EXISTS (
        SELECT 1 FROM review_images ri WHERE ri.review_id = r.id
      )
      ORDER BY r.created_at DESC
    `);

    console.log(`Found ${reviews.rows.length} reviews without images\n`);

    let addedCount = 0;
    let skippedCount = 0;

    for (const review of reviews.rows) {
      // 50% chance to add images
      if (Math.random() > 0.5) {
        skippedCount++;
        continue;
      }

      // Random 1-3 images
      const imageCount = Math.floor(Math.random() * 3) + 1;
      const imageUrls = getRandomImages(imageCount);

      console.log(`📷 Adding ${imageCount} image(s) to review for "${review.stage_name}"`);

      for (let i = 0; i < imageUrls.length; i++) {
        await pool.query(
          `
          INSERT INTO review_images (
            id, review_id, s3_key, file_size, mime_type, display_order, public_url, created_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, NOW()
          )
        `,
          [
            randomUUID(),
            review.id,
            generateS3Key(i),
            Math.floor(Math.random() * 500000) + 100000, // Random file size 100KB-600KB
            'image/jpeg',
            i + 1,
            imageUrls[i],
          ]
        );
      }

      addedCount++;
    }

    // Summary
    console.log('\n📊 Summary:');
    console.log(`   Reviews with images added: ${addedCount}`);
    console.log(`   Reviews skipped (no images): ${skippedCount}`);

    // Final count
    const finalCount = await pool.query(`
      SELECT
        ap.stage_name,
        COUNT(DISTINCT r.id) as total_reviews,
        COUNT(DISTINCT CASE WHEN ri.id IS NOT NULL THEN r.id END) as reviews_with_images
      FROM reviews r
      JOIN artist_profiles ap ON r.artist_id = ap.user_id
      LEFT JOIN review_images ri ON r.id = ri.review_id
      WHERE ap.verification_status = 'verified'
      GROUP BY ap.stage_name
      ORDER BY ap.stage_name
    `);

    console.log('\n📸 Reviews with images by artist:\n');
    for (const row of finalCount.rows) {
      console.log(
        `   ${row.stage_name}: ${row.reviews_with_images}/${row.total_reviews} reviews have images`
      );
    }

    console.log('\n✅ Review images seeding complete!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedReviewImages();
