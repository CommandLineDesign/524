import { index, jsonb, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { bookings } from './bookings.js';
import { conversations } from './conversations.js';
import { users } from './users.js';

export const messages = pgTable(
  'messages',
  {
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
    sentAt: timestamp('sent_at', { withTimezone: true }).defaultNow().notNull(),
    readAt: timestamp('read_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    // Composite index for conversation messages ordered by sent time
    conversationSentAtIdx: index('messages_conversation_sent_at_idx').on(
      table.conversationId,
      table.sentAt
    ),
    // Index for sender queries
    senderIdIdx: index('messages_sender_id_idx').on(table.senderId),
    // Index for time-based queries (recent messages, etc.)
    sentAtIdx: index('messages_sent_at_idx').on(table.sentAt),
  })
);

export type Message = typeof messages.$inferSelect;
