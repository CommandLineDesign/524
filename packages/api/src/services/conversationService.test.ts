import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ConversationService } from './conversationService.js';

// Mock the repositories
vi.mock('../repositories/conversationRepository.js');
vi.mock('../repositories/messageRepository.js');

describe('ConversationService', () => {
  let conversationService: ConversationService;

  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();
    conversationService = new ConversationService();
  });

  describe('getOrCreateConversation', () => {
    it('should return existing conversation if found', async () => {
      const mockConversation = {
        id: 'conv-1',
        customerId: 'customer-1',
        artistId: 'artist-1',
        status: 'active',
        lastMessageAt: new Date(),
        unreadCountCustomer: 0,
        unreadCountArtist: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock the repository method
      const conversationRepo = await import('../repositories/conversationRepository.js');
      conversationRepo.ConversationRepository.prototype.getOrCreateConversation = vi
        .fn()
        .mockResolvedValue(mockConversation);

      const result = await conversationService.getOrCreateConversation('customer-1', 'artist-1');

      expect(result).toEqual(mockConversation);
    });

    it('should throw error for self-conversation', async () => {
      await expect(conversationService.getOrCreateConversation('user-1', 'user-1')).rejects.toThrow(
        'Cannot create conversation with self'
      );
    });
  });

  describe('getUserConversations', () => {
    it('should return paginated conversations', async () => {
      const mockConversations = [
        {
          id: 'conv-1',
          customerId: 'customer-1',
          artistId: 'artist-1',
          status: 'active',
          lastMessageAt: new Date(),
          unreadCountCustomer: 0,
          unreadCountArtist: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const conversationRepo = await import('../repositories/conversationRepository.js');
      conversationRepo.ConversationRepository.prototype.getUserConversations = vi
        .fn()
        .mockResolvedValue(mockConversations);
      conversationRepo.ConversationRepository.prototype.getUserConversationsCount = vi
        .fn()
        .mockResolvedValue(1);

      const result = await conversationService.getUserConversations('customer-1', 'customer');

      expect(result.conversations).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.hasMore).toBe(false);
    });
  });

  describe('validateConversationAccess', () => {
    it('should return true for valid access', async () => {
      const conversationRepo = await import('../repositories/conversationRepository.js');
      conversationRepo.ConversationRepository.prototype.getConversation = vi
        .fn()
        .mockResolvedValue({ id: 'conv-1' });

      const result = await conversationService.validateConversationAccess('conv-1', 'user-1');

      expect(result).toBe(true);
    });

    it('should return false for invalid access', async () => {
      const conversationRepo = await import('../repositories/conversationRepository.js');
      conversationRepo.ConversationRepository.prototype.getConversation = vi
        .fn()
        .mockResolvedValue(null);

      const result = await conversationService.validateConversationAccess('conv-1', 'user-1');

      expect(result).toBe(false);
    });
  });
});
