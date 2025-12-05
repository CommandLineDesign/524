import { jsonb, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { users } from './users.js';

export const addresses = pgTable('addresses', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  label: varchar('label', { length: 20 }),
  sido: varchar('sido', { length: 50 }).notNull(),
  sigungu: varchar('sigungu', { length: 50 }).notNull(),
  dong: varchar('dong', { length: 50 }).notNull(),
  roadName: varchar('road_name', { length: 100 }),
  buildingNumber: varchar('building_number', { length: 50 }),
  buildingName: varchar('building_name', { length: 100 }),
  detailAddress: varchar('detail_address', { length: 100 }),
  postalCode: varchar('postal_code', { length: 10 }).notNull(),
  fullAddressKorean: varchar('full_address_korean', { length: 255 }).notNull(),
  location: jsonb('location'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Address = typeof addresses.$inferSelect;
