# Testing Strategy

## Overview

The messaging system implements comprehensive testing at multiple levels to ensure reliability, performance, and security. Tests cover unit functionality, integration between components, and end-to-end user workflows.

## Testing Pyramid

```
End-to-End Tests (E2E)
    ↕️
Integration Tests
    ↕️
Unit Tests
    ↕️
Code (Implementation)
```

## Unit Tests

### Service Layer Testing

#### ConversationService Tests

```typescript
// packages/api/src/services/conversationService.test.ts
describe('ConversationService', () => {
  let conversationService: ConversationService;

  beforeEach(() => {
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

      mockConversationRepo.getOrCreateConversation.mockResolvedValue(mockConversation);

      const result = await conversationService.getOrCreateConversation(
        'customer-1',
        'artist-1'
      );

      expect(result).toEqual(mockConversation);
      expect(mockConversationRepo.getOrCreateConversation).toHaveBeenCalledWith(
        'customer-1',
        'artist-1',
        undefined
      );
    });

    it('should throw error for self-conversation', async () => {
      await expect(
        conversationService.getOrCreateConversation('user-1', 'user-1')
      ).rejects.toThrow('Cannot create conversation with self');
    });
  });

  describe('validateConversationAccess', () => {
    it('should return true for valid access', async () => {
      mockConversationRepo.getConversation.mockResolvedValue({
        id: 'conv-1',
        customerId: 'user-1',
      });

      const result = await conversationService.validateConversationAccess('conv-1', 'user-1');
      expect(result).toBe(true);
    });

    it('should return false for invalid access', async () => {
      mockConversationRepo.getConversation.mockResolvedValue(null);

      const result = await conversationService.validateConversationAccess('conv-1', 'user-1');
      expect(result).toBe(false);
    });
  });
});
```

#### MessageService Tests

```typescript
// packages/api/src/services/messageService.test.ts
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

      mockConversationService.validateConversationAccess.mockResolvedValue(true);
      mockMessageRepo.insertMessage.mockResolvedValue(mockMessage);

      const result = await messageService.sendMessage({
        conversationId: 'conv-1',
        senderId: 'user-1',
        senderRole: 'customer',
        messageType: 'text',
        content: 'Hello!',
      });

      expect(result).toEqual(mockMessage);
      expect(mockMessageRepo.insertMessage).toHaveBeenCalled();
    });

    it('should throw error for invalid conversation access', async () => {
      mockConversationService.validateConversationAccess.mockResolvedValue(false);

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

    it('should emit WebSocket events when io is available', async () => {
      // Mock io availability
      const mockIo = { to: vi.fn().mockReturnThis(), emit: vi.fn() };
      vi.mocked(io).mockReturnValue(mockIo as any);

      mockConversationService.validateConversationAccess.mockResolvedValue(true);
      mockMessageRepo.insertMessage.mockResolvedValue(mockMessage);

      await messageService.sendMessage({
        conversationId: 'conv-1',
        senderId: 'user-1',
        senderRole: 'customer',
        messageType: 'text',
        content: 'Hello!',
      });

      expect(mockIo.to).toHaveBeenCalledWith('conversation:conv-1');
      expect(mockIo.emit).toHaveBeenCalledWith('message:new', expect.any(Object));
    });
  });
});
```

### Repository Layer Testing

#### ConversationRepository Tests

```typescript
// packages/api/src/repositories/conversationRepository.test.ts
describe('ConversationRepository', () => {
  let conversationRepo: ConversationRepository;

  beforeEach(() => {
    conversationRepo = new ConversationRepository();
  });

  describe('getOrCreateConversation', () => {
    it('should return existing active conversation', async () => {
      const existingConversation = {
        id: 'conv-1',
        customerId: 'customer-1',
        artistId: 'artist-1',
        status: 'active',
      };

      mockDb.select().from().where().limit.mockResolvedValue([existingConversation]);

      const result = await conversationRepo.getOrCreateConversation('customer-1', 'artist-1');

      expect(result).toEqual(existingConversation);
      expect(mockDb.insert).not.toHaveBeenCalled();
    });

    it('should create new conversation if none exists', async () => {
      const newConversation = {
        id: 'conv-new',
        customerId: 'customer-1',
        artistId: 'artist-1',
        status: 'active',
      };

      mockDb.select().from().where().limit.mockResolvedValue([]);
      mockDb.insert().values().returning.mockResolvedValue([newConversation]);

      const result = await conversationRepo.getOrCreateConversation('customer-1', 'artist-1');

      expect(result).toEqual(newConversation);
      expect(mockDb.insert).toHaveBeenCalled();
    });
  });

  describe('getUserConversations', () => {
    it('should return paginated conversations with last message', async () => {
      const mockData = [
        {
          conversation: { id: 'conv-1', customerId: 'user-1' },
          lastMessage: {
            id: 'msg-1',
            content: 'Hello',
            messageType: 'text',
            sentAt: new Date(),
          },
        },
      ];

      mockDb.select().from().leftJoin().where().orderBy().limit().offset.mockResolvedValue(mockData);

      const result = await conversationRepo.getUserConversations('user-1', 'customer');

      expect(result).toHaveLength(1);
      expect(result[0].lastMessage).toBeDefined();
    });
  });
});
```

### Mobile Component Testing

#### React Query Hooks Testing

```typescript
// packages/mobile/src/query/messaging.test.ts
describe('useConversations', () => {
  it('should fetch conversations with correct parameters', async () => {
    const mockConversations = {
      conversations: [{ id: 'conv-1' }],
      total: 1,
      hasMore: false,
    };

    mockApiClient.get.mockResolvedValue({ data: mockConversations });

    const { result } = renderHook(() => useConversations('customer'), {
      wrapper: QueryClientProvider,
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockConversations);
    });

    expect(mockApiClient.get).toHaveBeenCalledWith('/messaging/conversations', {
      params: { limit: 20, offset: 0 },
    });
  });
});

describe('useSendMessage', () => {
  it('should send message successfully', async () => {
    const mockMessage = { id: 'msg-1', content: 'Hello!' };
    mockApiClient.post.mockResolvedValue({ data: { data: mockMessage } });

    const { result } = renderHook(() => useSendMessage(), {
      wrapper: QueryClientProvider,
    });

    result.current.mutate({
      conversationId: 'conv-1',
      messageType: 'text',
      content: 'Hello!',
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it('should handle offline queuing', async () => {
    // Mock offline state
    mockNetInfo.fetch.mockResolvedValue({ isConnected: false });

    const { result } = renderHook(() => useSendMessage(), {
      wrapper: QueryClientProvider,
    });

    result.current.mutate({
      conversationId: 'conv-1',
      messageType: 'text',
      content: 'Offline message',
    });

    expect(result.current.error?.message).toBe('Message queued for sending when online');
  });
});
```

#### Offline Queue Testing

```typescript
// packages/mobile/src/services/offlineMessageQueue.test.ts
describe('OfflineMessageQueue', () => {
  let queue: OfflineMessageQueue;

  beforeEach(async () => {
    queue = OfflineMessageQueue.getInstance();
    await queue.clearQueue(); // Clear any existing queue
  });

  describe('enqueueMessage', () => {
    it('should store message in AsyncStorage', async () => {
      const message = {
        conversationId: 'conv-1',
        messageType: 'text',
        content: 'Test message',
      };

      await queue.enqueueMessage(message);

      const stored = await queue.getQueue();
      expect(stored).toHaveLength(1);
      expect(stored[0].conversationId).toBe('conv-1');
      expect(stored[0].retryCount).toBe(0);
    });
  });

  describe('processQueue', () => {
    it('should process messages successfully', async () => {
      const mockSendFunction = vi.fn().mockResolvedValue(undefined);

      await queue.enqueueMessage({
        conversationId: 'conv-1',
        messageType: 'text',
        content: 'Test message',
      });

      await queue.processQueue(mockSendFunction);

      expect(mockSendFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          conversationId: 'conv-1',
          content: 'Test message',
        })
      );

      const stored = await queue.getQueue();
      expect(stored).toHaveLength(0); // Message should be removed after success
    });

    it('should handle failed messages with retry logic', async () => {
      const mockSendFunction = vi.fn().mockRejectedValue(new Error('Network error'));

      await queue.enqueueMessage({
        conversationId: 'conv-1',
        messageType: 'text',
        content: 'Test message',
      });

      await queue.processQueue(mockSendFunction);

      const stored = await queue.getQueue();
      expect(stored).toHaveLength(1);
      expect(stored[0].retryCount).toBe(1);
      expect(stored[0].lastError).toBe('Network error');
    });

    it('should remove messages after max retries', async () => {
      const mockSendFunction = vi.fn().mockRejectedValue(new Error('Persistent error'));

      // Add message with max retries reached
      await queue.enqueueMessage({
        conversationId: 'conv-1',
        messageType: 'text',
        content: 'Test message',
      });

      // Manually set retry count to max
      const stored = await queue.getQueue();
      stored[0].retryCount = 3; // MAX_RETRY_ATTEMPTS
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(stored));

      await queue.processQueue(mockSendFunction);

      const finalStored = await queue.getQueue();
      expect(finalStored).toHaveLength(0); // Should be removed
    });
  });

  describe('getQueueStats', () => {
    it('should return correct statistics', async () => {
      await queue.enqueueMessage({
        conversationId: 'conv-1',
        messageType: 'text',
        content: 'Pending message',
      });

      // Add a failed message
      const failedMessage = {
        conversationId: 'conv-2',
        messageType: 'text',
        content: 'Failed message',
        retryCount: 3,
      };
      const stored = await queue.getQueue();
      stored.push(failedMessage);
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(stored));

      const stats = await queue.getQueueStats();

      expect(stats.total).toBe(2);
      expect(stats.pending).toBe(1);
      expect(stats.failed).toBe(1);
    });
  });
});
```

## Integration Tests

### API Endpoint Testing

```typescript
// packages/api/src/routes/v1/messaging.test.ts
describe('Messaging API Integration', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use((req, res, next) => {
      req.user = { id: 'test-user', primaryRole: 'customer' };
      next();
    });
    app.use('/messaging', messagingRouter);
  });

  describe('POST /conversations', () => {
    it('should create conversation successfully', async () => {
      mockConversationService.getOrCreateConversation.mockResolvedValue({
        id: 'conv-1',
        customerId: 'test-user',
        artistId: 'artist-1',
        status: 'active',
        lastMessageAt: new Date(),
        unreadCountCustomer: 0,
        unreadCountArtist: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app)
        .post('/messaging/conversations')
        .send({ artistId: 'artist-1' })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('conv-1');
    });

    it('should reject self-conversation', async () => {
      const response = await request(app)
        .post('/messaging/conversations')
        .send({ artistId: 'test-user' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Cannot create conversation');
    });
  });

  describe('POST /conversations/:id/messages', () => {
    it('should send message successfully', async () => {
      const mockMessage = {
        id: 'msg-1',
        conversationId: 'conv-1',
        senderId: 'test-user',
        senderRole: 'customer',
        messageType: 'text',
        content: 'Hello!',
        sentAt: new Date(),
        createdAt: new Date(),
      };

      mockMessageService.sendMessage.mockResolvedValue(mockMessage);
      mockConversationService.validateConversationAccess.mockResolvedValue(true);

      const response = await request(app)
        .post('/messaging/conversations/conv-1/messages')
        .send({
          messageType: 'text',
          content: 'Hello!',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.content).toBe('Hello!');
    });

    it('should validate message content', async () => {
      const response = await request(app)
        .post('/messaging/conversations/conv-1/messages')
        .send({
          messageType: 'invalid',
          content: 'Test',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Valid messageType is required');
    });
  });

  describe('WebSocket Integration', () => {
    it('should handle real-time message sending', async () => {
      // This would require a WebSocket test client
      // Example using socket.io-client in tests
      const clientSocket = io(`http://localhost:${PORT}`, {
        auth: { token: 'test-token' },
      });

      await new Promise((resolve) => {
        clientSocket.on('connect', () => {
          clientSocket.emit('join:conversation', 'conv-1');

          clientSocket.emit('message:send', {
            conversationId: 'conv-1',
            messageType: 'text',
            content: 'Real-time message',
          });

          clientSocket.on('message:delivered', (data) => {
            expect(data.messageId).toBeDefined();
            resolve(undefined);
          });
        });
      });

      clientSocket.disconnect();
    });
  });
});
```

## End-to-End Tests

### Complete Messaging Flow

```typescript
// packages/api/src/routes/v1/messaging.e2e.test.ts
describe('Messaging E2E Flow', () => {
  it('should handle complete conversation lifecycle', async () => {
    // 1. Create conversation
    const createResponse = await request(app)
      .post('/messaging/conversations')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ artistId: 'artist-1' })
      .expect(201);

    const conversationId = createResponse.body.data.id;

    // 2. Send message
    const messageResponse = await request(app)
      .post(`/messaging/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        messageType: 'text',
        content: 'Hello from customer!',
      })
      .expect(201);

    const messageId = messageResponse.body.data.id;

    // 3. Retrieve messages
    const getMessagesResponse = await request(app)
      .get(`/messaging/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);

    expect(getMessagesResponse.body.data).toHaveLength(1);
    expect(getMessagesResponse.body.data[0].content).toBe('Hello from customer!');

    // 4. Mark as read (from artist perspective)
    await request(app)
      .put(`/messaging/conversations/${conversationId}/read`)
      .set('Authorization', `Bearer ${artistToken}`)
      .expect(200);

    // 5. Verify read status
    const verifyReadResponse = await request(app)
      .get(`/messaging/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);

    expect(verifyReadResponse.body.data[0].readAt).toBeDefined();
  });

  it('should handle image upload flow', async () => {
    // 1. Get upload URL
    const uploadUrlResponse = await request(app)
      .post('/messaging/upload-image')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        fileName: 'test-image.jpg',
        fileType: 'image/jpeg',
        conversationId: 'conv-1',
      })
      .expect(200);

    expect(uploadUrlResponse.body.data.uploadUrl).toBeDefined();
    expect(uploadUrlResponse.body.data.publicUrl).toContain('s3.');

    // 2. Send message with image
    const messageResponse = await request(app)
      .post('/messaging/conversations/conv-1/messages')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        messageType: 'image',
        images: [uploadUrlResponse.body.data.publicUrl],
      })
      .expect(201);

    expect(messageResponse.body.data.images).toHaveLength(1);
  });

  it('should enforce access control', async () => {
    // Try to access conversation user doesn't participate in
    await request(app)
      .get('/messaging/conversations/unauthorized-conv/messages')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(500); // Would be 403 in production with better error handling

    // Try to send message to unauthorized conversation
    await request(app)
      .post('/messaging/conversations/unauthorized-conv/messages')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        messageType: 'text',
        content: 'This should fail',
      })
      .expect(500);
  });
});
```

### Mobile E2E Tests

```typescript
// packages/mobile/e2e/messaging.e2e.test.ts
describe('Mobile Messaging E2E', () => {
  beforeAll(async () => {
    await device.launchApp();
    // Login user
    await loginUser('customer@example.com', 'password');
  });

  it('should send and receive messages', async () => {
    // Navigate to booking detail
    await navigateToBooking('booking-1');

    // Tap message button
    await element(by.id('message-artist-button')).tap();

    // Should navigate to chat screen
    await expect(element(by.id('chat-screen'))).toBeVisible();

    // Send message
    await element(by.id('message-input')).typeText('Hello from E2E test!');
    await element(by.id('send-button')).tap();

    // Verify message appears
    await expect(element(by.text('Hello from E2E test!'))).toBeVisible();

    // Verify message status
    await expect(element(by.id('message-status-sent'))).toBeVisible();
  });

  it('should handle offline messaging', async () => {
    // Disable network
    await device.setNetworkConnection({ type: 'none' });

    // Send message
    await element(by.id('message-input')).typeText('Offline message');
    await element(by.id('send-button')).tap();

    // Should show queued status
    await expect(element(by.id('message-status-queued'))).toBeVisible();

    // Re-enable network
    await device.setNetworkConnection({ type: 'wifi' });

    // Wait for sync
    await waitFor(element(by.id('message-status-sent')))
      .toBeVisible()
      .withTimeout(10000);
  });

  it('should handle image uploads', async () => {
    // Open image picker
    await element(by.id('image-picker-button')).tap();

    // Select image from library
    await element(by.id('image-library')).tap();
    await element(by.text('test-image.jpg')).tap();

    // Should show upload progress
    await expect(element(by.id('upload-progress'))).toBeVisible();

    // Should display uploaded image
    await expect(element(by.id('message-image'))).toBeVisible();
  });
});
```

## Performance Testing

### Load Testing

```typescript
// packages/api/src/tests/performance/messaging.load.test.ts
describe('Messaging Performance', () => {
  it('should handle high message throughput', async () => {
    const startTime = Date.now();
    const messageCount = 1000;

    // Send multiple messages concurrently
    const promises = Array(messageCount).fill().map((_, i) =>
      request(app)
        .post('/messaging/conversations/conv-1/messages')
        .set('Authorization', `Bearer ${token}`)
        .send({
          messageType: 'text',
          content: `Message ${i}`,
        })
    );

    const responses = await Promise.all(promises);
    const endTime = Date.now();

    const successCount = responses.filter(r => r.status === 201).length;
    const throughput = messageCount / ((endTime - startTime) / 1000);

    expect(successCount).toBe(messageCount);
    expect(throughput).toBeGreaterThan(50); // 50 messages/second minimum
  });

  it('should handle concurrent WebSocket connections', async () => {
    const connectionCount = 100;
    const connections = [];

    // Create multiple WebSocket connections
    for (let i = 0; i < connectionCount; i++) {
      const socket = io(WS_URL, { auth: { token } });
      connections.push(socket);

      await new Promise((resolve) => {
        socket.on('connect', resolve);
      });
    }

    // Send broadcast message
    const testSocket = connections[0];
    testSocket.emit('message:send', {
      conversationId: 'conv-1',
      messageType: 'text',
      content: 'Broadcast test',
    });

    // Verify all connections receive the message
    const receivedPromises = connections.map(socket =>
      new Promise((resolve) => {
        socket.on('message:new', (msg) => {
          if (msg.content === 'Broadcast test') resolve(true);
        });
      })
    );

    const results = await Promise.all(receivedPromises);
    expect(results.filter(Boolean)).toHaveLength(connectionCount);

    // Cleanup
    connections.forEach(socket => socket.disconnect());
  });
});
```

## Security Testing

### Authentication Testing

```typescript
describe('Authentication Security', () => {
  it('should reject invalid JWT tokens', async () => {
    const invalidTokens = [
      'invalid.jwt.token',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c', // expired
      '', // empty
    ];

    for (const token of invalidTokens) {
      await request(app)
        .get('/messaging/conversations')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);
    }
  });

  it('should validate conversation access', async () => {
    // Try to access conversation user doesn't participate in
    await request(app)
      .get('/messaging/conversations/other-user-conversation/messages')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(500); // Access denied
  });
});
```

### Rate Limiting Tests

```typescript
describe('Rate Limiting', () => {
  it('should enforce message rate limits', async () => {
    const requests = Array(70).fill().map(() =>
      request(app)
        .post('/messaging/conversations/conv-1/messages')
        .set('Authorization', `Bearer ${token}`)
        .send({ messageType: 'text', content: 'spam' })
    );

    const responses = await Promise.all(requests);
    const rateLimited = responses.filter(r => r.status === 429);

    expect(rateLimited.length).toBeGreaterThan(0);
  });

  it('should enforce image upload rate limits', async () => {
    const requests = Array(15).fill().map(() =>
      request(app)
        .post('/messaging/upload-image')
        .set('Authorization', `Bearer ${token}`)
        .send({
          fileName: 'test.jpg',
          fileType: 'image/jpeg',
          conversationId: 'conv-1',
        })
    );

    const responses = await Promise.all(requests);
    const rateLimited = responses.filter(r => r.status === 429);

    expect(rateLimited.length).toBeGreaterThan(0);
  });
});
```

## Test Automation

### CI/CD Integration

```yaml
# .github/workflows/messaging-tests.yml
name: Messaging Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
      redis:
        image: redis:7

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Setup test database
        run: pnpm --filter @524/database db:migrate:test

      - name: Run unit tests
        run: pnpm test:unit

      - name: Run integration tests
        run: pnpm test:integration

      - name: Run E2E tests
        run: pnpm test:e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

### Test Data Management

```typescript
// packages/api/src/test/testData.ts
export const createTestConversations = async () => {
  const conversations = [
    {
      id: 'test-conv-1',
      customerId: 'test-customer',
      artistId: 'test-artist',
      status: 'active',
    },
  ];

  for (const conv of conversations) {
    await db.insert(conversationsTable).values(conv);
  }

  return conversations;
};

export const cleanupTestData = async () => {
  await db.delete(messagesTable);
  await db.delete(conversationsTable);
};
```

## Coverage Goals

### Code Coverage Targets

- **Unit Tests**: 90%+ coverage
- **Integration Tests**: All API endpoints and WebSocket events
- **E2E Tests**: Critical user journeys
- **Performance Tests**: Load and stress scenarios
- **Security Tests**: Authentication and authorization

### Coverage Report

```bash
# Generate coverage report
pnpm test --coverage

# Coverage thresholds
coverageThreshold: {
  global: {
    branches: 90,
    functions: 90,
    lines: 90,
    statements: 90,
  },
}
```

This comprehensive testing strategy ensures the messaging system is reliable, secure, and performant across all scenarios.