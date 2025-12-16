import { and, desc, eq, sql } from 'drizzle-orm';

import { messages } from '@524/database';

import { db } from '../db/client.js';

export interface MessageWithSender {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: string;
  messageType: string | null;
  content: string | null;
  images: unknown;
  bookingId: string | null;
  sentAt: Date;
  readAt: Date | null;
  createdAt: Date;
}

export class MessageRepository {
  /**
   * Insert a new message
   */
  async insertMessage(message: {
    conversationId: string;
    senderId: string;
    senderRole: 'customer' | 'artist';
    messageType: 'text' | 'image' | 'system';
    content?: string;
    images?: string[];
    bookingId?: string;
  }): Promise<MessageWithSender> {
    const result = await db
      .insert(messages)
      .values({
        ...message,
        sentAt: new Date(),
        createdAt: new Date(),
      })
      .returning();

    return result[0];
  }

  /**
   * Get messages for a conversation with pagination
   */
  async getMessages(
    conversationId: string,
    pagination: { limit: number; offset: number } = { limit: 50, offset: 0 }
  ): Promise<MessageWithSender[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(desc(messages.sentAt))
      .limit(pagination.limit)
      .offset(pagination.offset);
  }

  /**
   * Mark a message as read
   */
  async markMessageAsRead(messageId: string, userId: string): Promise<MessageWithSender | null> {
    // First check if user has permission to read this message
    const message = await db
      .select({
        message: messages,
        conversation: sql`conversations.customer_id, conversations.artist_id`,
      })
      .from(messages)
      .innerJoin(sql`conversations`, eq(messages.conversationId, sql`conversations.id`))
      .where(eq(messages.id, messageId))
      .limit(1);

    if (message.length === 0) {
      return null;
    }

    const { message: msg, conversation } = message[0];
    const hasPermission =
      // biome-ignore lint/suspicious/noExplicitAny: SQL join result type is dynamic
      (conversation as any).customer_id === userId || (conversation as any).artist_id === userId;

    if (!hasPermission) {
      return null;
    }

    const result = await db
      .update(messages)
      .set({ readAt: new Date() })
      .where(eq(messages.id, messageId))
      .returning();

    return result.length > 0 ? result[0] : null;
  }

  /**
   * Get unread message count for a user in a conversation
   */
  async getUnreadCount(
    conversationId: string,
    userId: string,
    userRole: 'customer' | 'artist'
  ): Promise<number> {
    const senderIdField = userRole === 'customer' ? 'artist_id' : 'customer_id';

    const result = await db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(messages)
      .innerJoin(sql`conversations`, eq(messages.conversationId, sql`conversations.id`))
      .where(
        and(
          eq(messages.conversationId, conversationId),
          eq(sql`conversations.${sql.identifier(senderIdField)}`, userId),
          sql`${messages.readAt} IS NULL`
        )
      );

    return result[0]?.count ?? 0;
  }

  /**
   * Get messages by booking ID (for context display)
   */
  async getMessagesByBooking(bookingId: string): Promise<MessageWithSender[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.bookingId, bookingId))
      .orderBy(messages.sentAt);
  }

  /**
   * Delete messages older than a certain date (for data retention)
   * This would be used for periodic cleanup jobs
   */
  async deleteOldMessages(olderThan: Date): Promise<number> {
    const result = await db.delete(messages).where(sql`${messages.createdAt} < ${olderThan}`);

    return result.rowCount ?? 0;
  }

  /**
   * Get message by ID with conversation context
   */
  async getMessageWithContext(messageId: string): Promise<{
    message: MessageWithSender;
    conversation: { customerId: string; artistId: string };
  } | null> {
    const result = await db
      .select({
        message: messages,
        conversation: sql`conversations.customer_id, conversations.artist_id`,
      })
      .from(messages)
      .innerJoin(sql`conversations`, eq(messages.conversationId, sql`conversations.id`))
      .where(eq(messages.id, messageId))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    // biome-ignore lint/suspicious/noExplicitAny: SQL join result type is dynamic
    return result[0] as any;
  }
}
