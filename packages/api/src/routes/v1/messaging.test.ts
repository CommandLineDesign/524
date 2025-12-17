import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { messagingRouter } from './messaging.js';

// Mock the services
vi.mock('../../services/conversationService.js');
vi.mock('../../services/messageService.js');
vi.mock('../../middleware/auth.js');

describe('Messaging API Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    vi.clearAllMocks();

    app = express();
    app.use(express.json());
    app.use('/messaging', messagingRouter);
  });

  describe('GET /messaging/conversations', () => {
    it('should return user conversations', async () => {
      const mockConversations = {
        conversations: [
          {
            id: 'conv-1',
            customerId: 'customer-1',
            artistId: 'artist-1',
            status: 'active',
            lastMessageAt: '2024-01-01T00:00:00Z',
            unreadCountCustomer: 0,
            unreadCountArtist: 0,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ],
        total: 1,
        hasMore: false,
      };

      const conversationService = await import('../../services/conversationService.js');
      conversationService.ConversationService.prototype.getUserConversations = vi
        .fn()
        .mockResolvedValue(mockConversations);

      const auth = await import('../../middleware/auth.js');
      auth.authenticate = vi.fn((req, res, next) => {
        req.user = { id: 'user-1', primaryRole: 'customer' };
        next();
      });

      const response = await request(app).get('/messaging/conversations').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockConversations.conversations);
    });
  });

  describe('POST /messaging/conversations', () => {
    it('should create or get conversation', async () => {
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

      const conversationService = await import('../../services/conversationService.js');
      conversationService.ConversationService.prototype.getOrCreateConversation = vi
        .fn()
        .mockResolvedValue(mockConversation);

      const auth = await import('../../middleware/auth.js');
      auth.authenticate = vi.fn((req, res, next) => {
        req.user = { id: 'customer-1', primaryRole: 'customer' };
        next();
      });

      const response = await request(app)
        .post('/messaging/conversations')
        .send({ artistId: 'artist-1' })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('conv-1');
    });

    it('should reject self-conversation', async () => {
      const auth = await import('../../middleware/auth.js');
      auth.authenticate = vi.fn((req, res, next) => {
        req.user = { id: 'user-1', primaryRole: 'customer' };
        next();
      });

      const response = await request(app)
        .post('/messaging/conversations')
        .send({ artistId: 'user-1' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Cannot create conversation');
    });
  });

  describe('POST /messaging/conversations/:id/messages', () => {
    it('should send a message', async () => {
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

      const messageService = await import('../../services/messageService.js');
      messageService.MessageService.prototype.sendMessage = vi.fn().mockResolvedValue(mockMessage);

      const auth = await import('../../middleware/auth.js');
      auth.authenticate = vi.fn((req, res, next) => {
        req.user = { id: 'user-1', primaryRole: 'customer' };
        next();
      });

      const response = await request(app)
        .post('/messaging/conversations/conv-1/messages')
        .send({
          messageType: 'text',
          content: 'Hello!',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('msg-1');
    });

    it('should validate message type', async () => {
      const auth = await import('../../middleware/auth.js');
      auth.authenticate = vi.fn((req, res, next) => {
        req.user = { id: 'user-1', primaryRole: 'customer' };
        next();
      });

      const response = await request(app)
        .post('/messaging/conversations/conv-1/messages')
        .send({
          messageType: 'invalid',
          content: 'Hello!',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Valid messageType is required');
    });
  });
});
