import { integer, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { users } from './users';

export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  bookingId: uuid('booking_id'),
  customerId: uuid('customer_id').references(() => users.id).notNull(),
  artistId: uuid('artist_id').references(() => users.id).notNull(),
  status: varchar('status', { length: 20 }).default('active'),
  lastMessageAt: timestamp('last_message_at').notNull(),
  unreadCountCustomer: integer('unread_count_customer').default(0),
  unreadCountArtist: integer('unread_count_artist').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export type Conversation = typeof conversations.$inferSelect;

