import { conversations as conversationsTable, users } from '@524/database';
import { and, desc, eq, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

import { conversations, messages } from '@524/database';

import { db } from '../db/client.js';

// Aliases for joining users table twice (customer and artist)
const customerUser = alias(users, 'customerUser');
const artistUser = alias(users, 'artistUser');

export interface ConversationWithDetails {
  id: string;
  bookingId: string | null;
  customerId: string;
  artistId: string;
  customerName: string | null;
  artistName: string | null;
  status: string | null;
  lastMessageAt: Date;
  unreadCountCustomer: number | null;
  unreadCountArtist: number | null;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  lastMessage?: {
    id: string;
    content: string | null;
    messageType: string | null;
    sentAt: Date;
  };
}

export class ConversationRepository {
  /**
   * Get or create a conversation between a customer and artist
   */
  async getOrCreateConversation(customerId: string, artistId: string, bookingId: string) {
    const now = new Date();

    // Use upsert to handle race conditions - if conversation exists, update bookingId if provided
    const result = await db
      .insert(conversationsTable)
      .values({
        customerId,
        artistId,
        bookingId,
        status: 'active',
        lastMessageAt: now,
        unreadCountCustomer: 0,
        unreadCountArtist: 0,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [
          conversationsTable.customerId,
          conversationsTable.artistId,
          conversationsTable.status,
        ],
        set: {
          bookingId: bookingId || sql`${conversationsTable.bookingId}`, // Keep existing bookingId if not provided
          updatedAt: now,
        },
      })
      .returning();

    return result[0];
  }

  /**
   * Get count of conversations for a user
   */
  async getUserConversationsCount(
    userId: string,
    userRole: 'customer' | 'artist'
  ): Promise<number> {
    const userIdField = userRole === 'customer' ? conversations.customerId : conversations.artistId;

    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(conversations)
      .where(and(eq(userIdField, userId), eq(conversations.status, 'active')));

    return Number(result[0]?.count ?? 0);
  }

  /**
   * Get conversations for a user with pagination
   */
  async getUserConversations(
    userId: string,
    userRole: 'customer' | 'artist',
    pagination: { limit: number; offset: number } = { limit: 20, offset: 0 }
  ): Promise<ConversationWithDetails[]> {
    const userIdField = userRole === 'customer' ? conversations.customerId : conversations.artistId;

    // Get paginated conversations with user names and latest message
    const result = await db
      .select({
        conversation: conversations,
        customerName: customerUser.name,
        artistName: artistUser.name,
        lastMessage: {
          id: messages.id,
          content: messages.content,
          messageType: messages.messageType,
          sentAt: messages.sentAt,
        },
      })
      .from(conversations)
      .leftJoin(customerUser, eq(customerUser.id, conversations.customerId))
      .leftJoin(artistUser, eq(artistUser.id, conversations.artistId))
      .leftJoin(
        messages,
        and(
          eq(messages.conversationId, conversations.id),
          sql`${messages.sentAt} = (
            SELECT MAX(sent_at) FROM messages WHERE conversation_id = ${conversations.id}
          )`
        )
      )
      .where(and(eq(userIdField, userId), eq(conversations.status, 'active')))
      .orderBy(desc(conversations.lastMessageAt))
      .limit(pagination.limit)
      .offset(pagination.offset);

    return result.map((row) => ({
      ...row.conversation,
      customerName: row.customerName,
      artistName: row.artistName,
      lastMessage: row.lastMessage || undefined,
    }));
  }

  /**
   * Get a single conversation by ID with permission check
   */
  async getConversation(conversationId: string, userId: string) {
    const result = await db
      .select({
        conversation: conversations,
        customerName: customerUser.name,
        artistName: artistUser.name,
        lastMessage: {
          id: messages.id,
          content: messages.content,
          messageType: messages.messageType,
          sentAt: messages.sentAt,
        },
      })
      .from(conversations)
      .leftJoin(customerUser, eq(customerUser.id, conversations.customerId))
      .leftJoin(artistUser, eq(artistUser.id, conversations.artistId))
      .leftJoin(
        messages,
        and(
          eq(messages.conversationId, conversations.id),
          sql`${messages.sentAt} = (
            SELECT MAX(sent_at) FROM messages WHERE conversation_id = ${conversations.id}
          )`
        )
      )
      .where(
        and(
          eq(conversations.id, conversationId),
          sql`(${conversations.customerId} = ${userId} OR ${conversations.artistId} = ${userId})`
        )
      )
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return {
      ...result[0].conversation,
      customerName: result[0].customerName,
      artistName: result[0].artistName,
      lastMessage: result[0].lastMessage,
    };
  }

  /**
   * Archive a conversation
   */
  async archiveConversation(conversationId: string, userId: string) {
    const result = await db
      .update(conversations)
      .set({
        archivedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(conversations.id, conversationId),
          sql`(${conversations.customerId} = ${userId} OR ${conversations.artistId} = ${userId})`
        )
      )
      .returning();

    return result.length > 0 ? result[0] : null;
  }

  /**
   * Update unread counts for a conversation
   */
  async updateUnreadCounts(conversationId: string, customerUnread: number, artistUnread: number) {
    return await db
      .update(conversations)
      .set({
        unreadCountCustomer: customerUnread,
        unreadCountArtist: artistUnread,
        updatedAt: new Date(),
      })
      .where(eq(conversations.id, conversationId))
      .returning();
  }

  /**
   * Mark messages as read for a user
   */
  async markAsRead(conversationId: string, userId: string, userRole: 'customer' | 'artist') {
    // First, get the conversation to verify permission
    const conversation = await this.getConversation(conversationId, userId);
    if (!conversation) {
      return null;
    }

    // Mark all unread messages as read for this user
    await db
      .update(messages)
      .set({ readAt: new Date() })
      .where(
        and(
          eq(messages.conversationId, conversationId),
          eq(
            messages.senderId,
            userRole === 'customer' ? conversation.artistId : conversation.customerId
          ),
          sql`${messages.readAt} IS NULL`
        )
      );

    // Update unread counts
    const unreadCount =
      userRole === 'customer' ? conversation.unreadCountCustomer : conversation.unreadCountArtist;
    const updateField = userRole === 'customer' ? 'unreadCountCustomer' : 'unreadCountArtist';

    return await db
      .update(conversations)
      .set({
        [updateField]: 0,
        updatedAt: new Date(),
      })
      .where(eq(conversations.id, conversationId))
      .returning();
  }

  /**
   * Update last message timestamp
   */
  async updateLastMessageAt(conversationId: string, lastMessageAt: Date) {
    return await db
      .update(conversations)
      .set({
        lastMessageAt,
        updatedAt: new Date(),
      })
      .where(eq(conversations.id, conversationId))
      .returning();
  }

  /**
   * ADMIN: Get count of all conversations (bypasses user permission checks)
   */
  async getAllConversationsCount(): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(conversations)
      .where(eq(conversations.status, 'active'));

    return Number(result[0]?.count ?? 0);
  }

  /**
   * ADMIN: Get all conversations with pagination (bypasses user permission checks)
   */
  async getAllConversations(
    pagination: { limit: number; offset: number } = { limit: 20, offset: 0 }
  ): Promise<ConversationWithDetails[]> {
    // Get paginated conversations with user names and latest message
    const result = await db
      .select({
        conversation: conversations,
        customerName: customerUser.name,
        artistName: artistUser.name,
        lastMessage: {
          id: messages.id,
          content: messages.content,
          messageType: messages.messageType,
          sentAt: messages.sentAt,
        },
      })
      .from(conversations)
      .leftJoin(customerUser, eq(customerUser.id, conversations.customerId))
      .leftJoin(artistUser, eq(artistUser.id, conversations.artistId))
      .leftJoin(
        messages,
        and(
          eq(messages.conversationId, conversations.id),
          sql`${messages.sentAt} = (
            SELECT MAX(sent_at) FROM messages WHERE conversation_id = ${conversations.id}
          )`
        )
      )
      .where(eq(conversations.status, 'active'))
      .orderBy(desc(conversations.lastMessageAt))
      .limit(pagination.limit)
      .offset(pagination.offset);

    return result.map((row) => ({
      ...row.conversation,
      customerName: row.customerName,
      artistName: row.artistName,
      lastMessage: row.lastMessage || undefined,
    }));
  }

  /**
   * Get a single conversation by booking ID with permission check
   */
  async getConversationByBooking(bookingId: string, userId: string) {
    const result = await db
      .select({
        conversation: conversations,
        customerName: customerUser.name,
        artistName: artistUser.name,
        lastMessage: {
          id: messages.id,
          content: messages.content,
          messageType: messages.messageType,
          sentAt: messages.sentAt,
        },
      })
      .from(conversations)
      .leftJoin(customerUser, eq(customerUser.id, conversations.customerId))
      .leftJoin(artistUser, eq(artistUser.id, conversations.artistId))
      .leftJoin(
        messages,
        and(
          eq(messages.conversationId, conversations.id),
          sql`${messages.sentAt} = (
            SELECT MAX(sent_at) FROM messages WHERE conversation_id = ${conversations.id}
          )`
        )
      )
      .where(
        and(
          eq(conversations.bookingId, bookingId),
          sql`(${conversations.customerId} = ${userId} OR ${conversations.artistId} = ${userId})`
        )
      )
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return {
      ...result[0].conversation,
      customerName: result[0].customerName,
      artistName: result[0].artistName,
      lastMessage: result[0].lastMessage,
    };
  }

  /**
   * ADMIN: Get a single conversation by ID without permission check
   */
  async getConversationById(conversationId: string) {
    const result = await db
      .select({
        conversation: conversations,
        customerName: customerUser.name,
        artistName: artistUser.name,
        lastMessage: {
          id: messages.id,
          content: messages.content,
          messageType: messages.messageType,
          sentAt: messages.sentAt,
        },
      })
      .from(conversations)
      .leftJoin(customerUser, eq(customerUser.id, conversations.customerId))
      .leftJoin(artistUser, eq(artistUser.id, conversations.artistId))
      .leftJoin(
        messages,
        and(
          eq(messages.conversationId, conversations.id),
          sql`${messages.sentAt} = (
            SELECT MAX(sent_at) FROM messages WHERE conversation_id = ${conversations.id}
          )`
        )
      )
      .where(eq(conversations.id, conversationId))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return {
      ...result[0].conversation,
      customerName: result[0].customerName,
      artistName: result[0].artistName,
      lastMessage: result[0].lastMessage,
    };
  }
}
