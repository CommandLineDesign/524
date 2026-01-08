import { boolean, index, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const notificationPreferences = pgTable(
  'notification_preferences',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),
    // Granular booking controls
    bookingCreated: boolean('booking_created').notNull().default(true),
    bookingConfirmed: boolean('booking_confirmed').notNull().default(true),
    bookingDeclined: boolean('booking_declined').notNull().default(true),
    bookingCancelled: boolean('booking_cancelled').notNull().default(true),
    bookingInProgress: boolean('booking_in_progress').notNull().default(true),
    bookingCompleted: boolean('booking_completed').notNull().default(true),
    // Other categories
    newMessage: boolean('new_message').notNull().default(true),
    marketing: boolean('marketing').notNull().default(false), // Opt-in for Korea compliance
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('idx_notification_preferences_user_id').on(table.userId)]
);

export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type NewNotificationPreference = typeof notificationPreferences.$inferInsert;
