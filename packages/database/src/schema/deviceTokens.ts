import { boolean, index, pgEnum, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const platformEnum = pgEnum('device_platform', ['ios', 'android', 'web']);

export const deviceTokens = pgTable(
  'device_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    token: varchar('token', { length: 512 }).notNull().unique(),
    platform: platformEnum('platform').notNull(),
    deviceId: varchar('device_id', { length: 255 }),
    appVersion: varchar('app_version', { length: 50 }),
    isActive: boolean('is_active').notNull().default(true),
    lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_device_tokens_user_id').on(table.userId),
    index('idx_device_tokens_token').on(table.token),
    index('idx_device_tokens_user_active').on(table.userId, table.isActive),
    index('idx_device_tokens_platform').on(table.platform),
  ]
);

export type DeviceToken = typeof deviceTokens.$inferSelect;
export type NewDeviceToken = typeof deviceTokens.$inferInsert;
export type DevicePlatform = (typeof platformEnum.enumValues)[number];
