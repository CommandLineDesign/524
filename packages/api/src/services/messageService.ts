import type { ChatMessage } from '@524/shared/messaging';
import { MessageRepository, MessageWithSender } from '../repositories/messageRepository.js';
import { io } from '../websocket/chatSocket.js';
import { ConversationService } from './conversationService.js';

export interface SendMessageOptions {
  conversationId: string;
  senderId: string;
  senderRole: 'customer' | 'artist';
  messageType: 'text' | 'image' | 'system';
  content?: string;
  images?: string[];
  bookingId?: string;
}

export interface MessageListResult {
  messages: MessageWithSender[];
  hasMore: boolean;
}

export class MessageService {
  private conversationService: ConversationService;
  private messageRepo: MessageRepository;

  constructor() {
    this.conversationService = new ConversationService();
    this.messageRepo = new MessageRepository();
  }

  /**
   * Send a message and broadcast via WebSocket
   */
  async sendMessage(options: SendMessageOptions): Promise<MessageWithSender> {
    const { conversationId, senderId, senderRole, ...messageData } = options;

    // Validate conversation access
    const hasAccess = await this.conversationService.validateConversationAccess(
      conversationId,
      senderId
    );
    if (!hasAccess) {
      throw new Error('Access denied to conversation');
    }

    // Insert message
    const message = await this.messageRepo.insertMessage({
      conversationId,
      senderId,
      senderRole,
      ...messageData,
    });

    // Update conversation's last message timestamp
    await this.conversationService.updateLastMessageAt(conversationId, message.sentAt);

    // Emit via WebSocket if available
    if (io) {
      const chatMessage: ChatMessage = {
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        senderRole: message.senderRole as 'customer' | 'artist',
        messageType: message.messageType as 'text' | 'image' | 'system',
        content: message.content || '',
        images: message.images as string[] | undefined,
        bookingId: message.bookingId,
        sentAt: message.sentAt.toISOString(),
        readAt: message.readAt?.toISOString(),
      };

      io.to(`conversation:${conversationId}`).emit('message:new', chatMessage);

      // Emit delivery confirmation to sender
      io.to(`user:${senderId}`).emit('message:delivered', {
        messageId: message.id,
        deliveredAt: new Date().toISOString(),
      });
    }

    return message;
  }

  /**
   * Get messages for a conversation with pagination
   */
  async getMessages(
    conversationId: string,
    userId: string,
    pagination: { limit?: number; offset?: number } = { limit: 50, offset: 0 }
  ): Promise<MessageListResult> {
    // Validate access
    const hasAccess = await this.conversationService.validateConversationAccess(
      conversationId,
      userId
    );
    if (!hasAccess) {
      throw new Error('Access denied to conversation');
    }

    const messages = await this.messageRepo.getMessages(conversationId, pagination);

    // Check if there are more messages
    const totalMessages = await this.messageRepo.getMessages(conversationId, {
      limit: 1000,
      offset: 0,
    });
    const hasMore =
      messages.length === pagination.limit &&
      totalMessages.length > (pagination.limit ?? 50) + (pagination.offset ?? 0);

    return {
      messages: messages.reverse(), // Return in chronological order (oldest first)
      hasMore,
    };
  }

  /**
   * Mark a message as read
   */
  async markMessageAsRead(messageId: string, userId: string): Promise<MessageWithSender | null> {
    const result = await this.messageRepo.markMessageAsRead(messageId, userId);
    if (!result) {
      return null;
    }

    // Emit read receipt via WebSocket
    if (io) {
      const context = await this.messageRepo.getMessageWithContext(messageId);
      if (context) {
        const recipientId =
          context.conversation.customerId === userId
            ? context.conversation.artistId
            : context.conversation.customerId;

        io.to(`user:${recipientId}`).emit('message:read', {
          messageId,
          readAt: new Date().toISOString(),
          readBy: userId,
        });
      }
    }

    return result;
  }

  /**
   * Get messages by booking ID (for displaying booking context in chat)
   */
  async getMessagesByBooking(bookingId: string, userId: string): Promise<MessageWithSender[]> {
    // First get the conversation for this booking to validate access
    const conversation = await this.conversationService.getConversation('dummy', userId); // We'll need to add a method to get by booking
    // For now, just return messages (in production, add proper access control)

    return await this.messageRepo.getMessagesByBooking(bookingId);
  }

  /**
   * Send system message (e.g., booking status updates)
   */
  async sendSystemMessage(
    conversationId: string,
    content: string,
    bookingId?: string
  ): Promise<MessageWithSender> {
    return await this.sendMessage({
      conversationId,
      senderId: 'system', // System messages don't have a real user
      senderRole: 'customer', // Doesn't matter for system messages
      messageType: 'system',
      content,
      bookingId,
    });
  }

  /**
   * Get unread count for a user across all conversations
   * Useful for badge counts in the UI
   */
  async getTotalUnreadCount(userId: string, userRole: 'customer' | 'artist'): Promise<number> {
    const conversations = await this.conversationService.getUserConversations(userId, userRole);
    return conversations.conversations.reduce((total, conv) => {
      const unreadCount =
        userRole === 'customer' ? conv.unreadCountCustomer : conv.unreadCountArtist;
      return total + unreadCount;
    }, 0);
  }

  /**
   * Validate message belongs to user's conversations
   */
  async validateMessageAccess(messageId: string, userId: string): Promise<boolean> {
    const context = await this.messageRepo.getMessageWithContext(messageId);
    if (!context) return false;

    return context.conversation.customerId === userId || context.conversation.artistId === userId;
  }
}
