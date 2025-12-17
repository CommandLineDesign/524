import { index, integer, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { users } from './users';

export const conversations = pgTable(
  'conversations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    bookingId: uuid('booking_id'),
    customerId: uuid('customer_id')
      .references(() => users.id)
      .notNull(),
    artistId: uuid('artist_id')
      .references(() => users.id)
      .notNull(),
    status: varchar('status', { length: 20 }).default('active'),
    lastMessageAt: timestamp('last_message_at').notNull(),
    unreadCountCustomer: integer('unread_count_customer').default(0),
    unreadCountArtist: integer('unread_count_artist').default(0),
    archivedAt: timestamp('archived_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
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
  })
);

export type Conversation = typeof conversations.$inferSelect;
