import {
  ConversationRepository,
  ConversationWithDetails,
} from '../repositories/conversationRepository.js';
import { MessageRepository } from '../repositories/messageRepository.js';

export interface PaginationOptions {
  limit?: number;
  offset?: number;
}

export interface ConversationListResult {
  conversations: ConversationWithDetails[];
  total: number;
  hasMore: boolean;
}

export class ConversationService {
  private conversationRepo: ConversationRepository;
  private messageRepo: MessageRepository;

  constructor() {
    this.conversationRepo = new ConversationRepository();
    this.messageRepo = new MessageRepository();
  }

  /**
   * Get or create a conversation between a customer and artist
   */
  async getOrCreateConversation(customerId: string, artistId: string, bookingId?: string) {
    if (customerId === artistId) {
      throw new Error('Cannot create conversation with self');
    }

    return await this.conversationRepo.getOrCreateConversation(customerId, artistId, bookingId);
  }

  /**
   * Get conversations for a user
   */
  async getUserConversations(
    userId: string,
    userRole: 'customer' | 'artist',
    pagination: PaginationOptions = { limit: 20, offset: 0 }
  ): Promise<ConversationListResult> {
    const limit = pagination.limit ?? 20;
    const offset = pagination.offset ?? 0;

    // Fetch conversations and total count in parallel
    const [conversations, total] = await Promise.all([
      this.conversationRepo.getUserConversations(userId, userRole, { limit, offset }),
      this.conversationRepo.getUserConversationsCount(userId, userRole),
    ]);

    const hasMore = offset + conversations.length < total;

    return {
      conversations,
      total,
      hasMore,
    };
  }

  /**
   * Get a single conversation by ID with permission check
   */
  async getConversation(conversationId: string, userId: string) {
    return await this.conversationRepo.getConversation(conversationId, userId);
  }

  /**
   * Archive a conversation (soft delete)
   */
  async archiveConversation(conversationId: string, userId: string) {
    const conversation = await this.conversationRepo.archiveConversation(conversationId, userId);
    if (!conversation) {
      throw new Error('Conversation not found or access denied');
    }
    return conversation;
  }

  /**
   * Mark messages as read in a conversation
   */
  async markAsRead(conversationId: string, userId: string, userRole: 'customer' | 'artist') {
    const result = await this.conversationRepo.markAsRead(conversationId, userId, userRole);
    if (!result) {
      throw new Error('Conversation not found or access denied');
    }

    // Recalculate unread counts after marking as read
    await this.updateUnreadCounts(conversationId);

    return result[0];
  }

  /**
   * Update unread counts for a conversation
   * Called after new messages or when messages are read
   */
  private async updateUnreadCounts(conversationId: string) {
    const conversation = await this.conversationRepo.getConversation(conversationId, 'dummy'); // We just need the IDs
    if (!conversation) return;

    const [customerUnread, artistUnread] = await Promise.all([
      this.messageRepo.getUnreadCount(conversationId, conversation.customerId, 'customer'),
      this.messageRepo.getUnreadCount(conversationId, conversation.artistId, 'artist'),
    ]);

    await this.conversationRepo.updateUnreadCounts(conversationId, customerUnread, artistUnread);
  }

  /**
   * Update last message timestamp when a new message is sent
   */
  async updateLastMessageAt(conversationId: string, lastMessageAt: Date) {
    return await this.conversationRepo.updateLastMessageAt(conversationId, lastMessageAt);
  }

  /**
   * Validate user has access to conversation
   */
  async validateConversationAccess(conversationId: string, userId: string): Promise<boolean> {
    const conversation = await this.conversationRepo.getConversation(conversationId, userId);
    return conversation !== null;
  }
}
