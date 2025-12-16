import { jsonb, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { bookings } from './bookings';
import { conversations } from './conversations';
import { users } from './users';

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id')
    .references(() => conversations.id)
    .notNull(),
  senderId: uuid('sender_id')
    .references(() => users.id)
    .notNull(),
  senderRole: varchar('sender_role', { length: 20 }).notNull(),
  messageType: varchar('message_type', { length: 20 }).default('text'),
  content: text('content'),
  images: jsonb('images'),
  bookingId: uuid('booking_id').references(() => bookings.id),
  sentAt: timestamp('sent_at').defaultNow().notNull(),
  readAt: timestamp('read_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
