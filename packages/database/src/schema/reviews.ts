import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { bookings } from './bookings.js';
import { users } from './users.js';

export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  bookingId: uuid('booking_id')
    .references(() => bookings.id, { onDelete: 'cascade', onUpdate: 'restrict' })
    .notNull(),
  customerId: uuid('customer_id')
    .references(() => users.id, { onDelete: 'restrict', onUpdate: 'restrict' })
    .notNull(),
  artistId: uuid('artist_id')
    .references(() => users.id, { onDelete: 'restrict', onUpdate: 'restrict' })
    .notNull(),
  overallRating: integer('overall_rating').notNull(),
  qualityRating: integer('quality_rating').notNull(),
  professionalismRating: integer('professionalism_rating').notNull(),
  timelinessRating: integer('timeliness_rating').notNull(),
  reviewText: text('review_text'),
  reviewImages: jsonb('review_images'),
  artistResponse: text('artist_response'),
  isVisible: boolean('is_visible').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;

export const reviewImages = pgTable(
  'review_images',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    reviewId: uuid('review_id')
      .references(() => reviews.id, { onDelete: 'cascade', onUpdate: 'restrict' })
      .notNull(),
    s3Key: text('s3_key').notNull(),
    fileSize: integer('file_size').notNull(),
    mimeType: text('mime_type').notNull(),
    displayOrder: integer('display_order').notNull(), // Client must provide explicit order (0, 1, 2, 3, 4)
    publicUrl: text('public_url'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    reviewImagesReviewIdIdx: index('review_images_review_id_idx').on(table.reviewId), // Optimize queries for photos by review
  })
);

export type ReviewImage = typeof reviewImages.$inferSelect;
