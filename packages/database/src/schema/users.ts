import {
  boolean,
  foreignKey,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    firebaseUid: varchar('firebase_uid', { length: 128 }).unique(),
    kakaoId: varchar('kakao_id', { length: 128 }).unique(),
    naverId: varchar('naver_id', { length: 128 }).unique(),
    appleId: varchar('apple_id', { length: 128 }).unique(),
    phoneNumber: varchar('phone_number', { length: 20 }).unique(),
    phoneVerified: boolean('phone_verified').default(false),
    email: varchar('email', { length: 255 }).unique(),
    passwordHash: varchar('password_hash', { length: 255 }), // For dev/testing with email/password
    role: varchar('role', { length: 20 }).notNull().default('customer'),
    name: varchar('name', { length: 100 }).notNull(),
    profileImageUrl: text('profile_image_url'),
    birthYear: integer('birth_year'),
    gender: varchar('gender', { length: 10 }),
    language: varchar('language', { length: 5 }).default('ko'),
    timezone: varchar('timezone', { length: 50 }).default('Asia/Seoul'),
    notificationPreferences: jsonb('notification_preferences'),
    isActive: boolean('is_active').default(true),
    isVerified: boolean('is_verified').default(false),
    isBanned: boolean('is_banned').default(false),
    banReason: text('ban_reason'),
    bannedAt: timestamp('banned_at'),
    bannedBy: uuid('banned_by'),
    tokenVersion: integer('token_version').default(1),
    sessionVersion: integer('session_version').default(1),
    deactivatedAt: timestamp('deactivated_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    bannedByFk: foreignKey({
      columns: [table.bannedBy],
      foreignColumns: [table.id],
      name: 'users_banned_by_fk',
    }),
  })
);

export type User = typeof users.$inferSelect;
