import { boolean, integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { bookings } from './bookings.js';
import { users } from './users.js';

export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  bookingId: uuid('booking_id')
    .references(() => bookings.id, { onDelete: 'no action', onUpdate: 'no action' })
    .notNull(),
  customerId: uuid('customer_id')
    .references(() => users.id, { onDelete: 'no action', onUpdate: 'no action' })
    .notNull(),
  artistId: uuid('artist_id')
    .references(() => users.id, { onDelete: 'no action', onUpdate: 'no action' })
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
