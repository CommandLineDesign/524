import { index, integer, pgTable, timestamp, unique, uuid, varchar } from 'drizzle-orm/pg-core';

import { bookings } from './bookings.js';
import { users } from './users.js';

export const conversations = pgTable(
  'conversations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    bookingId: uuid('booking_id')
      .references(() => bookings.id)
      .notNull(),
    customerId: uuid('customer_id')
      .references(() => users.id)
      .notNull(),
    artistId: uuid('artist_id')
      .references(() => users.id)
      .notNull(),
    status: varchar('status', { length: 20 }).default('active'),
    lastMessageAt: timestamp('last_message_at', { withTimezone: true }).notNull(),
    unreadCountCustomer: integer('unread_count_customer').default(0),
    unreadCountArtist: integer('unread_count_artist').default(0),
    archivedAt: timestamp('archived_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    // Indexes for admin queries and performance optimization
    customerIdIdx: index('conversations_customer_id_idx').on(table.customerId),
    artistIdIdx: index('conversations_artist_id_idx').on(table.artistId),
    customerArtistIdx: index('conversations_customer_artist_idx').on(
      table.customerId,
      table.artistId
    ),
    statusIdx: index('conversations_status_idx').on(table.status),
    lastMessageAtIdx: index('conversations_last_message_at_idx').on(table.lastMessageAt),
    // Unique constraint to prevent duplicate active conversations between same user pair
    customerArtistActiveUnique: unique('conversations_customer_artist_active_unique').on(
      table.customerId,
      table.artistId,
      table.status
    ),
  })
);

export type Conversation = typeof conversations.$inferSelect;
