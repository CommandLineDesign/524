import { integer, jsonb, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { users } from './users.js';

export const customerProfiles = pgTable('customer_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  skinType: varchar('skin_type', { length: 20 }),
  skinTone: varchar('skin_tone', { length: 50 }),
  hairType: varchar('hair_type', { length: 20 }),
  hairLength: varchar('hair_length', { length: 20 }),
  allergies: jsonb('allergies'),
  sensitivities: jsonb('sensitivities'),
  medicalNotes: text('medical_notes'),
  preferredStyles: jsonb('preferred_styles'),
  favoriteArtists: jsonb('favorite_artists'),
  genderPreference: varchar('gender_preference', { length: 20 }),
  primaryAddress: jsonb('primary_address'),
  savedAddresses: jsonb('saved_addresses'),
  totalBookings: integer('total_bookings').default(0),
  completedBookings: integer('completed_bookings').default(0),
  cancelledBookings: integer('cancelled_bookings').default(0),
  averageRatingGiven: integer('average_rating_given'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type CustomerProfile = typeof customerProfiles.$inferSelect;
