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
    it('should return paginated messages', async () => {
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

      const result = await messageService.sendSystemMessage(
        'conv-1',
        'Booking confirmed',
        'booking-1'
      );

      expect(result.messageType).toBe('system');
      expect(result.content).toBe('Booking confirmed');
    });
  });
});
