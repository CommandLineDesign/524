#!/usr/bin/env node
import pg from 'pg';
import 'dotenv/config';
import { randomUUID } from 'node:crypto';

const { Pool } = pg;

// Test review texts for variety
const POSITIVE_REVIEWS = [
  '정말 최고의 서비스였어요! 결과물이 너무 예쁘고 아티스트분이 친절하셨습니다.',
  '기대 이상이었어요. 시간도 정확하게 지켜주시고 꼼꼼하게 해주셨습니다.',
  '완벽한 결과물! 친구들한테도 추천하고 싶어요.',
  '너무 만족스러웠어요. 다음에도 꼭 예약할게요!',
  'Amazing work! The artist was professional and the results exceeded my expectations.',
  '세심한 배려와 프로페셔널한 서비스에 감동받았습니다.',
  '분위기도 좋고 실력도 좋아요. 강추합니다!',
  '처음 이용해봤는데 너무 좋았어요. 재방문 의사 100%입니다.',
];

const MIXED_REVIEWS = [
  '전반적으로 좋았지만 대기 시간이 조금 길었어요.',
  '결과물은 좋았는데 가격이 조금 비싼 것 같아요.',
  '실력은 좋은데 커뮤니케이션이 조금 아쉬웠어요.',
  '나쁘지 않았어요. 다음에 다시 와볼 것 같아요.',
];

// Artists to give reviews to (by stage_name)
const STUDIO_524_TEST_ID = 'fbe69878-422c-436f-ab2d-cafd6ce7b8c4';
const MY_STUDIO_ID = '8514b937-3a34-42f5-ad43-925143ecebc7';

// Customer IDs
const CUSTOMERS = [
  '11111111-1111-1111-1111-111111111111', // 데모 고객
  '0eddd84a-a6ee-457b-820d-fcb92df01364', // 김고객
  'dd79e0ed-8d84-49e8-89c5-14ed29c91b7d', // 이고객
  'c3634841-4c78-4483-b308-840235f571f7', // Jonathan
  '2f4f5cb4-e738-4ba6-a02b-0895dc8bf457', // our tester
];

function generateBookingNumber() {
  return `BK${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

function randomPastDate(daysAgo: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
}

async function seedReviews() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ DATABASE_URL not set');
    process.exit(1);
  }

  console.log('🌱 Seeding test reviews...\n');

  const pool = new Pool({ connectionString });

  try {
    // Get all verified artists except "My studio"
    const artistsResult = await pool.query(`
      SELECT
        ap.user_id as id,
        ap.stage_name,
        ap.average_rating,
        ap.total_reviews
      FROM artist_profiles ap
      WHERE ap.verification_status = 'verified'
      ORDER BY ap.stage_name
    `);

    const artists = artistsResult.rows;
    console.log(`Found ${artists.length} verified artists\n`);

    // Clear existing test reviews (optional - keep existing reviews)
    // await pool.query(`DELETE FROM reviews WHERE review_text LIKE '%test review%'`);

    // Process each artist
    for (const artist of artists) {
      // Skip "My studio" - it should have no reviews
      if (artist.id === MY_STUDIO_ID) {
        console.log(`⏭️  Skipping "${artist.stage_name}" (My studio - should have no reviews)`);

        // Make sure My studio has 0 reviews
        await pool.query(
          `
          UPDATE artist_profiles
          SET average_rating = NULL, total_reviews = 0
          WHERE user_id = $1
        `,
          [MY_STUDIO_ID]
        );
        continue;
      }

      // Check existing reviews for this artist
      const existingReviewsResult = await pool.query(
        'SELECT COUNT(*) as count FROM reviews WHERE artist_id = $1',
        [artist.id]
      );
      const existingReviewCount = Number.parseInt(existingReviewsResult.rows[0].count);

      // Determine how many reviews to add
      let reviewsToAdd = 0;
      let targetRating = 0;

      if (artist.id === STUDIO_524_TEST_ID) {
        // Studio 524-test: Give 5 reviews with perfect 5.0 rating
        reviewsToAdd = Math.max(0, 5 - existingReviewCount);
        targetRating = 5;
        console.log(`⭐ Processing "${artist.stage_name}" (Studio 524-test - highest rating)`);
      } else {
        // Other artists: Random 1-4 reviews with random ratings 3-5
        const targetReviews = Math.floor(Math.random() * 4) + 1;
        reviewsToAdd = Math.max(0, targetReviews - existingReviewCount);
        targetRating = 0; // Will be randomized
        console.log(`📝 Processing "${artist.stage_name}"`);
      }

      if (reviewsToAdd === 0) {
        console.log(`   Already has ${existingReviewCount} reviews, skipping...\n`);
        continue;
      }

      // Create bookings and reviews
      for (let i = 0; i < reviewsToAdd; i++) {
        const customerId = CUSTOMERS[i % CUSTOMERS.length];
        const bookingId = randomUUID();
        const reviewId = randomUUID();
        const daysAgo = Math.floor(Math.random() * 30) + 1;
        const bookingDate = randomPastDate(daysAgo);

        // Determine rating
        let overallRating: number;
        if (targetRating > 0) {
          overallRating = targetRating;
        } else {
          // Random rating between 3 and 5
          overallRating = Math.floor(Math.random() * 3) + 3;
        }

        // Pick review text based on rating
        const reviewText =
          overallRating >= 4
            ? POSITIVE_REVIEWS[Math.floor(Math.random() * POSITIVE_REVIEWS.length)]
            : MIXED_REVIEWS[Math.floor(Math.random() * MIXED_REVIEWS.length)];

        // Create a completed booking first
        await pool.query(
          `
          INSERT INTO bookings (
            id, booking_number, customer_id, artist_id,
            service_type, occasion, services, total_duration_minutes,
            scheduled_date, scheduled_start_time, scheduled_end_time,
            service_location, location_type, address,
            status, payment_status, total_amount, breakdown,
            created_at, updated_at, completed_at
          ) VALUES (
            $1, $2, $3, $4,
            'makeup', 'special', '[]'::jsonb, 60,
            $5, $5, $5,
            '{"latitude": 37.5665, "longitude": 126.978}'::jsonb,
            'customer_location',
            '{"city": "Seoul", "district": "Gangnam"}'::jsonb,
            'completed', 'completed', 150000, '{}'::jsonb,
            $5, $5, $5
          )
          ON CONFLICT (id) DO NOTHING
        `,
          [bookingId, generateBookingNumber(), customerId, artist.id, bookingDate]
        );

        // Create the review
        await pool.query(
          `
          INSERT INTO reviews (
            id, booking_id, customer_id, artist_id,
            overall_rating, quality_rating, professionalism_rating, timeliness_rating,
            review_text, is_visible, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4,
            $5, $5, $5, $5,
            $6, true, $7, $7
          )
          ON CONFLICT (id) DO NOTHING
        `,
          [reviewId, bookingId, customerId, artist.id, overallRating, reviewText, bookingDate]
        );

        console.log(`   Added review: ${overallRating}⭐ from customer`);
      }

      // Update artist's average rating and total reviews
      const statsResult = await pool.query(
        `
        SELECT
          COUNT(*) as total,
          AVG(overall_rating) as avg_rating
        FROM reviews
        WHERE artist_id = $1 AND is_visible = true
      `,
        [artist.id]
      );

      const stats = statsResult.rows[0];
      await pool.query(
        `
        UPDATE artist_profiles
        SET
          average_rating = $2,
          total_reviews = $3,
          updated_at = NOW()
        WHERE user_id = $1
      `,
        [artist.id, Number.parseFloat(stats.avg_rating).toFixed(2), Number.parseInt(stats.total)]
      );

      console.log(
        `   Updated stats: ${Number.parseFloat(stats.avg_rating).toFixed(2)}⭐ (${stats.total} reviews)\n`
      );
    }

    // Final verification
    console.log('\n📊 Final Artist Ratings:\n');
    const finalStats = await pool.query(`
      SELECT
        ap.stage_name,
        ap.average_rating,
        ap.total_reviews
      FROM artist_profiles ap
      WHERE ap.verification_status = 'verified'
      ORDER BY ap.average_rating DESC NULLS LAST, ap.total_reviews DESC
    `);

    for (const stat of finalStats.rows) {
      const rating = stat.average_rating ? `${stat.average_rating}⭐` : 'No rating';
      console.log(`  ${stat.stage_name}: ${rating} (${stat.total_reviews || 0} reviews)`);
    }

    console.log('\n✅ Review seeding complete!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedReviews();
