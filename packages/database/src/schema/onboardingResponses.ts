import {
  boolean,
  integer,
  jsonb,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const onboardingResponses = pgTable(
  'onboarding_responses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    flowId: varchar('flow_id', { length: 100 }).notNull().default('default'),
    flowVersion: varchar('flow_version', { length: 50 }).notNull().default('v1'),
    variantId: varchar('variant_id', { length: 100 }).notNull().default('variant-a'),
    stepKey: varchar('step_key', { length: 100 }).notNull(),
    response: jsonb('response').notNull(),
    version: integer('version').notNull().default(1),
    isCompletedStep: boolean('is_completed_step').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userFlowStepUnique: uniqueIndex('onboarding_responses_user_flow_step_uidx').on(
      table.userId,
      table.flowId,
      table.variantId,
      table.stepKey
    ),
  })
);

export type OnboardingResponse = typeof onboardingResponses.$inferSelect;
