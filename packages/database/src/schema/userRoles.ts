import { pgEnum, pgTable, primaryKey, timestamp, uuid } from 'drizzle-orm/pg-core';

import { users } from './users';

export const userRoleType = pgEnum('user_role_type', ['customer', 'artist', 'admin', 'support']);

export const userRoles = pgTable(
  'user_roles',
  {
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    role: userRoleType('role').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ name: 'user_roles_pk', columns: [table.userId, table.role] }),
  })
);

export type UserRole = typeof userRoles.$inferSelect;
