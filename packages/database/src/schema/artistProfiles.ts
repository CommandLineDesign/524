import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { users } from './users.js';

export const artistVerificationStatus = pgEnum('artist_verification_status', [
  'pending_review',
  'in_review',
  'verified',
  'rejected',
  'suspended',
]);

export const artistProfiles = pgTable('artist_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  stageName: varchar('stage_name', { length: 100 }).notNull(),
  bio: text('bio'),
  specialties: jsonb('specialties'),
  yearsExperience: integer('years_experience').notNull(),
  businessRegistrationNumber: varchar('business_registration_number', { length: 20 }),
  businessVerified: boolean('business_verified').default(false),
  licenses: jsonb('licenses'),
  certifications: jsonb('certifications'),
  serviceRadiusKm: numeric('service_radius_km', { precision: 5, scale: 2 }).notNull(),
  primaryLocation: jsonb('primary_location').notNull(),
  serviceAreas: jsonb('service_areas'),
  workingHours: jsonb('working_hours'),
  bufferTimeMinutes: integer('buffer_time_minutes').default(30),
  advanceBookingDays: integer('advance_booking_days').default(14),
  services: jsonb('services'),
  packages: jsonb('packages'),
  travelFee: numeric('travel_fee', { precision: 10, scale: 2 }),
  portfolioImages: jsonb('portfolio_images'),
  beforeAfterSets: jsonb('before_after_sets'),
  featuredWork: jsonb('featured_work'),
  totalServices: integer('total_services').default(0),
  completedServices: integer('completed_services').default(0),
  cancelledServices: integer('cancelled_services').default(0),
  averageRating: numeric('average_rating', { precision: 3, scale: 2 }),
  totalReviews: integer('total_reviews').default(0),
  responseTimeMinutes: integer('response_time_minutes'),
  onTimeCompletionRate: numeric('on_time_completion_rate', { precision: 5, scale: 2 }),
  backgroundCheckCompleted: boolean('background_check_completed').default(false),
  backgroundCheckDate: timestamp('background_check_date'),
  insuranceVerified: boolean('insurance_verified').default(false),
  insuranceExpiryDate: timestamp('insurance_expiry_date'),
  bankAccount: jsonb('bank_account'),
  taxId: text('tax_id'),
  isAcceptingBookings: boolean('is_accepting_bookings').default(true),
  verificationStatus: artistVerificationStatus('verification_status').default('pending_review'),
  accountStatus: varchar('account_status', { length: 20 }).default('active'),
  reviewedBy: uuid('reviewed_by').references(() => users.id),
  reviewNotes: text('review_notes'),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  verifiedAt: timestamp('verified_at'),
});

export type ArtistProfile = typeof artistProfiles.$inferSelect;
