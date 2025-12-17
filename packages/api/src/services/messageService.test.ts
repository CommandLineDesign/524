import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MessageService } from './messageService.js';

// Mock the repositories and services
vi.mock('../repositories/messageRepository.js');
vi.mock('./conversationService.js');

describe('MessageService', () => {
  let messageService: MessageService;

  beforeEach(() => {
    vi.clearAllMocks();
    messageService = new MessageService();
  });

  describe('sendMessage', () => {
    it('should send a message successfully', async () => {
      const mockMessage = {
        id: 'msg-1',
        conversationId: 'conv-1',
        senderId: 'user-1',
        senderRole: 'customer',
        messageType: 'text',
        content: 'Hello!',
        sentAt: new Date(),
        createdAt: new Date(),
      };

      // Mock conversation access validation
      const conversationService = await import('./conversationService.js');
      conversationService.ConversationService.prototype.validateConversationAccess = vi
        .fn()
        .mockResolvedValue(true);

      // Mock message repository
      const messageRepo = await import('../repositories/messageRepository.js');
      messageRepo.MessageRepository.prototype.insertMessage = vi
        .fn()
        .mockResolvedValue(mockMessage);

      const result = await messageService.sendMessage({
        conversationId: 'conv-1',
        senderId: 'user-1',
        senderRole: 'customer',
        messageType: 'text',
        content: 'Hello!',
      });

      expect(result).toEqual(mockMessage);
    });

    it('should throw error for invalid conversation access', async () => {
      const conversationService = await import('./conversationService.js');
      conversationService.ConversationService.prototype.validateConversationAccess = vi
        .fn()
        .mockResolvedValue(false);

      await expect(
        messageService.sendMessage({
          conversationId: 'conv-1',
          senderId: 'user-1',
          senderRole: 'customer',
          messageType: 'text',
          content: 'Hello!',
        })
      ).rejects.toThrow('Access denied to conversation');
    });
  });

  describe('getMessages', () => {
    it('should return paginated messages with hasMore false when no more messages exist', async () => {
      const mockMessages = [
        {
          id: 'msg-1',
          conversationId: 'conv-1',
          senderId: 'user-1',
          senderRole: 'customer',
          messageType: 'text',
          content: 'Hello!',
          sentAt: new Date(),
          createdAt: new Date(),
        },
      ];

      const conversationService = await import('./conversationService.js');
      conversationService.ConversationService.prototype.validateConversationAccess = vi
        .fn()
        .mockResolvedValue(true);

      const messageRepo = await import('../repositories/messageRepository.js');
      messageRepo.MessageRepository.prototype.getMessages = vi.fn().mockResolvedValue(mockMessages);

      const result = await messageService.getMessages('conv-1', 'user-1');

      expect(result.messages).toEqual(mockMessages);
      expect(result.hasMore).toBe(false);
    });

    it('should return hasMore true when more messages exist beyond the limit', async () => {
      // Mock repository to return limit + 1 messages (indicating more exist)
      const mockMessagesWithExtra = Array.from({ length: 51 }, (_, i) => ({
        id: `msg-${i + 1}`,
        conversationId: 'conv-1',
        senderId: 'user-1',
        senderRole: 'customer',
        messageType: 'text',
        content: `Message ${i + 1}`,
        sentAt: new Date(),
        createdAt: new Date(),
      }));

      // Mock conversation access validation
      const conversationService = await import('./conversationService.js');
      conversationService.ConversationService.prototype.validateConversationAccess = vi
        .fn()
        .mockResolvedValue(true);

      // Mock message repository - need to mock it before creating the service
      const messageRepo = await import('../repositories/messageRepository.js');
      const originalGetMessages = messageRepo.MessageRepository.prototype.getMessages;
      messageRepo.MessageRepository.prototype.getMessages = vi
        .fn()
        .mockResolvedValue(mockMessagesWithExtra);

      try {
        const result = await messageService.getMessages('conv-1', 'user-1', {
          limit: 50,
          offset: 0,
        });

        expect(result.messages).toHaveLength(50); // Should return only the limit
        expect(result.hasMore).toBe(true); // Should indicate more messages exist
      } finally {
        // Restore original method
        messageRepo.MessageRepository.prototype.getMessages = originalGetMessages;
      }
    });

    it('should return hasMore false when exactly at the limit with no more messages', async () => {
      // Mock repository to return exactly the limit (50 messages) - no more available
      const mockMessages = Array.from({ length: 50 }, (_, i) => ({
        id: `msg-${i + 1}`,
        conversationId: 'conv-1',
        senderId: 'user-1',
        senderRole: 'customer',
        messageType: 'text',
        content: `Message ${i + 1}`,
        sentAt: new Date(),
        createdAt: new Date(),
      }));

      // Mock conversation access validation
      const conversationService = await import('./conversationService.js');
      conversationService.ConversationService.prototype.validateConversationAccess = vi
        .fn()
        .mockResolvedValue(true);

      // Mock message repository
      const messageRepo = await import('../repositories/messageRepository.js');
      const originalGetMessages = messageRepo.MessageRepository.prototype.getMessages;
      messageRepo.MessageRepository.prototype.getMessages = vi.fn().mockResolvedValue(mockMessages);

      try {
        const result = await messageService.getMessages('conv-1', 'user-1', {
          limit: 50,
          offset: 0,
        });

        expect(result.messages).toHaveLength(50);
        expect(result.hasMore).toBe(false); // Should indicate no more messages exist
      } finally {
        // Restore original method
        messageRepo.MessageRepository.prototype.getMessages = originalGetMessages;
      }
    });

    it('should throw error for invalid access', async () => {
      const conversationService = await import('./conversationService.js');
      conversationService.ConversationService.prototype.validateConversationAccess = vi
        .fn()
        .mockResolvedValue(false);

      await expect(messageService.getMessages('conv-1', 'user-1')).rejects.toThrow(
        'Access denied to conversation'
      );
    });
  });

  describe('sendSystemMessage', () => {
    it('should send a system message', async () => {
      const mockMessage = {
        id: 'msg-1',
        conversationId: 'conv-1',
        senderId: 'system',
        senderRole: 'customer',
        messageType: 'system',
        content: 'Booking confirmed',
        sentAt: new Date(),
        createdAt: new Date(),
      };

      const messageRepo = await import('../repositories/messageRepository.js');
      messageRepo.MessageRepository.prototype.insertMessage = vi
        .fn()
        .mockResolvedValue(mockMessage);

      // Mock updateLastMessageAt
      const conversationService = await import('./conversationService.js');
      conversationService.ConversationService.prototype.updateLastMessageAt = vi
        .fn()
        .mockResolvedValue(undefined);

      const result = await messageService.sendSystemMessage(
        'conv-1',
        'Booking confirmed',
        'booking-1'
      );

      expect(result.messageType).toBe('system');
      expect(result.content).toBe('Booking confirmed');
    });

    it('should send system message without access validation', async () => {
      const mockMessage = {
        id: 'msg-1',
        conversationId: 'conv-1',
        senderId: 'system',
        senderRole: 'customer',
        messageType: 'system',
        content: 'Booking confirmed',
        sentAt: new Date(),
        createdAt: new Date(),
      };

      // Mock conversation access validation to return false (should be ignored for system messages)
      const conversationService = await import('./conversationService.js');
      conversationService.ConversationService.prototype.validateConversationAccess = vi
        .fn()
        .mockResolvedValue(false);
      conversationService.ConversationService.prototype.updateLastMessageAt = vi
        .fn()
        .mockResolvedValue(undefined);

      // Mock message repository
      const messageRepo = await import('../repositories/messageRepository.js');
      messageRepo.MessageRepository.prototype.insertMessage = vi
        .fn()
        .mockResolvedValue(mockMessage);

      // This should succeed even though validateConversationAccess returns false
      const result = await messageService.sendSystemMessage(
        'conv-1',
        'Booking confirmed',
        'booking-1'
      );

      expect(result.messageType).toBe('system');
      expect(result.content).toBe('Booking confirmed');

      // Verify that validateConversationAccess was not called for system messages
      expect(
        conversationService.ConversationService.prototype.validateConversationAccess
      ).not.toHaveBeenCalled();
    });
  });
});
