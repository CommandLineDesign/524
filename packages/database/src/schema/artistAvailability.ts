import { index, jsonb, pgTable, timestamp, unique, uuid, varchar } from 'drizzle-orm/pg-core';

import { artistProfiles } from './artistProfiles.js';

/**
 * Artist availability stored on a week-by-week basis.
 * Each record represents one artist's availability for one specific ISO week.
 */
export const artistAvailability = pgTable(
  'artist_availability',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    artistId: uuid('artist_id')
      .references(() => artistProfiles.id, { onDelete: 'cascade' })
      .notNull(),
    /** ISO week ID format: "2026-W07" */
    weekId: varchar('week_id', { length: 8 }).notNull(),
    /**
     * Array of ISO datetime strings representing selected 30-minute slots.
     * Example: ["2026-02-10T09:00:00+09:00", "2026-02-10T09:30:00+09:00"]
     */
    slots: jsonb('slots').notNull().default([]),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_artist_availability_artist_id').on(table.artistId),
    index('idx_artist_availability_week_id').on(table.weekId),
    unique('artist_availability_artist_week_unique').on(table.artistId, table.weekId),
  ]
);

export type ArtistAvailability = typeof artistAvailability.$inferSelect;
export type NewArtistAvailability = typeof artistAvailability.$inferInsert;
