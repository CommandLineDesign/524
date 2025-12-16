import { and, desc, eq, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { conversations, messages } from '@524/database/schema';

import { env } from '../config/env.js';

const client = postgres(env.DATABASE_URL);
const db = drizzle(client);

export interface ConversationWithDetails {
  id: string;
  bookingId?: string;
  customerId: string;
  artistId: string;
  status: string;
  lastMessageAt: Date;
  unreadCountCustomer: number;
  unreadCountArtist: number;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  lastMessage?: {
    id: string;
    content?: string;
    messageType: string;
    sentAt: Date;
  };
}

export class ConversationRepository {
  /**
   * Get or create a conversation between a customer and artist
   */
  async getOrCreateConversation(customerId: string, artistId: string, bookingId?: string) {
    // Try to find existing active conversation
    const conversation = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.customerId, customerId),
          eq(conversations.artistId, artistId),
          eq(conversations.status, 'active')
        )
      )
      .limit(1);

    if (conversation.length > 0) {
      return conversation[0];
    }

    // Create new conversation
    const now = new Date();
    const newConversation = await db
      .insert(conversations)
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
      .returning();

    return newConversation[0];
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

    const result = await db
      .select({
        conversation: conversations,
        lastMessage: {
          id: messages.id,
          content: messages.content,
          messageType: messages.messageType,
          sentAt: messages.sentAt,
        },
      })
      .from(conversations)
      .leftJoin(messages, eq(messages.conversationId, conversations.id))
      .where(and(eq(userIdField, userId), eq(conversations.status, 'active')))
      .orderBy(desc(conversations.lastMessageAt))
      .limit(pagination.limit)
      .offset(pagination.offset);

    // Group by conversation and get the latest message
    const conversationMap = new Map<string, ConversationWithDetails>();

    for (const row of result) {
      const convId = row.conversation.id;
      if (!conversationMap.has(convId)) {
        conversationMap.set(convId, {
          ...row.conversation,
          lastMessage: undefined,
        });
      }

      // Keep only the most recent message
      const existing = conversationMap.get(convId);
      if (
        existing &&
        row.lastMessage &&
        (!existing.lastMessage || row.lastMessage.sentAt > existing.lastMessage.sentAt)
      ) {
        existing.lastMessage = row.lastMessage;
      }
    }

    return Array.from(conversationMap.values());
  }

  /**
   * Get a single conversation by ID with permission check
   */
  async getConversation(conversationId: string, userId: string) {
    const result = await db
      .select({
        conversation: conversations,
        lastMessage: {
          id: messages.id,
          content: messages.content,
          messageType: messages.messageType,
          sentAt: messages.sentAt,
        },
      })
      .from(conversations)
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
}
