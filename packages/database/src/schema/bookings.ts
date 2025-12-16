import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { users } from './users';

export const bookings = pgTable('bookings', {
  id: uuid('id').primaryKey().defaultRandom(),
  bookingNumber: varchar('booking_number', { length: 50 }).notNull().unique(),
  customerId: uuid('customer_id')
    .references(() => users.id)
    .notNull(),
  artistId: uuid('artist_id')
    .references(() => users.id)
    .notNull(),
  serviceType: varchar('service_type', { length: 20 }).notNull(),
  occasion: varchar('occasion', { length: 50 }).notNull(),
  services: jsonb('services').notNull(),
  totalDurationMinutes: integer('total_duration_minutes').notNull(),
  scheduledDate: timestamp('scheduled_date').notNull(),
  scheduledStartTime: timestamp('scheduled_start_time').notNull(),
  scheduledEndTime: timestamp('scheduled_end_time').notNull(),
  timezone: varchar('timezone', { length: 50 }).default('Asia/Seoul'),
  serviceLocation: jsonb('service_location').notNull(),
  locationType: varchar('location_type', { length: 30 }).notNull(),
  address: jsonb('address').notNull(),
  locationNotes: text('location_notes'),
  artistArrivedAt: timestamp('artist_arrived_at'),
  serviceStartedAt: timestamp('service_started_at'),
  serviceCompletedAt: timestamp('service_completed_at'),
  actualDurationMinutes: integer('actual_duration_minutes'),
  specialRequests: text('special_requests'),
  referenceImages: jsonb('reference_images'),
  status: varchar('status', { length: 30 }).notNull(),
  statusHistory: jsonb('status_history'),
  paymentId: uuid('payment_id'),
  paymentStatus: varchar('payment_status', { length: 30 }).notNull(),
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
  breakdown: jsonb('breakdown'),
  protocolChecklist: jsonb('protocol_checklist'),
  timeLimitBreached: boolean('time_limit_breached').default(false),
  completionPhoto: text('completion_photo'),
  customerRating: integer('customer_rating'),
  customerReview: text('customer_review'),
  customerReviewDate: timestamp('customer_review_date'),
  artistResponse: text('artist_response'),
  artistRatingForCustomer: integer('artist_rating_for_customer'),
  artistNotes: text('artist_notes'),
  cancelledBy: varchar('cancelled_by', { length: 20 }),
  cancelledAt: timestamp('cancelled_at'),
  cancellationReason: text('cancellation_reason'),
  cancellationFee: numeric('cancellation_fee', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  confirmedAt: timestamp('confirmed_at'),
});

export type Booking = typeof bookings.$inferSelect;
