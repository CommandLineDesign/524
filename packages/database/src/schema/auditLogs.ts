import { jsonb, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { users } from './users.js';

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  adminId: uuid('admin_id')
    .references(() => users.id)
    .notNull(),
  entityType: varchar('entity_type', { length: 50 }).notNull(), // 'user', 'booking', etc.
  entityId: uuid('entity_id').notNull(),
  action: varchar('action', { length: 50 }).notNull(), // 'update', 'create', 'delete'
  changes: jsonb('changes'), // { field: { old: value, new: value } }
  metadata: jsonb('metadata'), // Additional context
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
