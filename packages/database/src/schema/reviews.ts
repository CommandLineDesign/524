import { integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { bookings } from './bookings.js';
import { users } from './users.js';

export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  bookingId: uuid('booking_id').references(() => bookings.id).notNull(),
  customerId: uuid('customer_id').references(() => users.id).notNull(),
  artistId: uuid('artist_id').references(() => users.id).notNull(),
  overallRating: integer('overall_rating').notNull(),
  qualityRating: integer('quality_rating'),
  professionalismRating: integer('professionalism_rating'),
  timelinessRating: integer('timeliness_rating'),
  reviewText: text('review_text'),
  reviewImages: jsonb('review_images'),
  artistResponse: text('artist_response'),
  isVisible: integer('is_visible').default(1),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export type Review = typeof reviews.$inferSelect;

