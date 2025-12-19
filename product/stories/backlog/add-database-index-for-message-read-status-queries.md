# Add Database Index for Message Read Status Queries

**Role**: Developer | System
**Priority**: Medium
**Status**: 📋 Backlog
**Dependencies**:

- None

**Estimated Effort**: XS (1-2 hours)

## Story Statement

**As a** System
**I want** to add a composite index on (conversationId, readAt) in the messages table
**So that** queries for read receipt status are efficient and performant at scale

## Detailed Description

The messages schema currently lacks an optimized index for read status queries, which are commonly used to determine unread message counts, display read receipts, and filter conversations by read status. As the number of messages grows, queries filtering by conversationId and readAt timestamp will perform full table scans or rely solely on the conversationId index, resulting in degraded performance. Adding a composite index on (conversationId, readAt) will significantly improve query performance for common read status operations, especially for conversations with large message histories.

## Acceptance Criteria

### Functional Requirements

- **Given** the messages table schema - **When** a composite index is added on (conversationId, readAt) - **Then** the index is created successfully in the database
- **Given** a query filtering by conversationId and readAt - **When** the query execution plan is analyzed - **Then** the composite index is utilized by the query optimizer
- **Given** existing messages in the database - **When** the index is created - **Then** all existing rows are indexed without data loss
- **Given** new messages are inserted - **When** the insert completes - **Then** the index is automatically updated

### Non-Functional Requirements

- **Performance**: Queries for unread messages by conversation should execute in <50ms even with 10,000+ messages per conversation
- **Scalability**: Index size should scale linearly with message count and remain manageable
- **Reliability**: Index creation should use online/concurrent mode to avoid locking the table during migration
- **Maintainability**: Index should be properly documented in schema files and migration history

## User Experience Flow

1. System executes query to find unread messages for a conversation
2. Database query optimizer selects the composite index on (conversationId, readAt)
3. Database efficiently filters messages using the index rather than scanning the full table
4. Query results return quickly with minimal resource usage
5. Users experience fast loading of unread message counts and read status indicators

## Technical Context

- **Epic Integration**: Part of the messaging system performance optimization epic, ensuring the system scales efficiently
- **System Components**: PostgreSQL database, messages table schema, Drizzle ORM schema definitions
- **Data Requirements**: Composite index definition in schema, database migration to add index to existing deployments
- **Integration Points**: Integrates with packages/database/src/schema/messages.ts, requires database migration file creation

## Definition of Done

- [ ] Composite index added to messages table schema in schema definition
- [ ] Database migration created and tested for adding index to existing tables
- [ ] Migration uses CREATE INDEX CONCURRENTLY to avoid table locking
- [ ] Query performance verified with EXPLAIN ANALYZE before and after index
- [ ] Index documented in schema file with comment explaining purpose
- [ ] Migration tested on database with sample message data
- [ ] Performance benchmarks show improvement in read status query times
- [ ] Code reviewed and approved

## Technical Implementation

### Schema Update

Add the composite index to the messages table definition in `packages/database/src/schema/messages.ts`:

```typescript
export const messages = pgTable('messages', {
  // ... existing columns
  conversationId: uuid('conversation_id').notNull().references(() => conversations.id),
  readAt: timestamp('read_at'),
  // ... other columns
}, (table) => ({
  // ... existing indexes
  conversationReadAtIdx: index('messages_conversation_id_read_at_idx')
    .on(table.conversationId, table.readAt),
}));
```

### Migration

Create a migration using Drizzle Kit or raw SQL:

```sql
-- Migration: add_messages_read_status_index
CREATE INDEX CONCURRENTLY IF NOT EXISTS messages_conversation_id_read_at_idx
ON messages (conversation_id, read_at);
```

### Common Queries That Benefit

- Count unread messages per conversation: `WHERE conversationId = ? AND readAt IS NULL`
- Get all unread messages in order: `WHERE conversationId = ? AND readAt IS NULL ORDER BY createdAt`
- Mark messages as read: `UPDATE messages SET readAt = NOW() WHERE conversationId = ? AND readAt IS NULL`

## Notes

The composite index order (conversationId, readAt) is optimal for queries that filter by conversationId and optionally by readAt status. PostgreSQL can use this index for queries on just conversationId as well, but queries that only filter on readAt without conversationId will not benefit. Consider monitoring index usage with `pg_stat_user_indexes` to verify the index is being utilized as expected. The CONCURRENTLY option in the migration prevents table locking but requires the migration to be run outside of a transaction block.
