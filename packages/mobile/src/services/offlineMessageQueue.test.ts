import { beforeEach, describe, expect, it, vi } from '@testing-library/react-native';

import { OfflineMessageQueue } from './offlineMessageQueue';

// Mock AsyncStorage
const mockAsyncStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: mockAsyncStorage,
}));

describe('OfflineMessageQueue', () => {
  let queue: OfflineMessageQueue;

  beforeEach(() => {
    vi.clearAllMocks();
    queue = OfflineMessageQueue.getInstance();
  });

  describe('enqueueMessage', () => {
    it('should add message to queue', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      mockAsyncStorage.setItem.mockResolvedValue();

      await queue.enqueueMessage({
        conversationId: 'conv-1',
        messageType: 'text',
        content: 'Hello offline!',
      });

      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
      const callArgs = mockAsyncStorage.setItem.mock.calls[0];
      const storedData = JSON.parse(callArgs[1]);

      expect(storedData).toHaveLength(1);
      expect(storedData[0].conversationId).toBe('conv-1');
      expect(storedData[0].content).toBe('Hello offline!');
      expect(storedData[0].retryCount).toBe(0);
    });
  });

  describe('getQueue', () => {
    it('should return empty array when no queue exists', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await queue.getQueue();

      expect(result).toEqual([]);
    });

    it('should return stored messages', async () => {
      const storedMessages = [
        {
          id: 'msg-1',
          conversationId: 'conv-1',
          messageType: 'text',
          content: 'Stored message',
          timestamp: Date.now(),
          retryCount: 0,
        },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedMessages));

      const result = await queue.getQueue();

      expect(result).toEqual(storedMessages);
    });
  });

  describe('dequeueMessage', () => {
    it('should remove message from queue', async () => {
      const storedMessages = [
        {
          id: 'msg-1',
          conversationId: 'conv-1',
          messageType: 'text',
          content: 'Message 1',
          timestamp: Date.now(),
          retryCount: 0,
        },
        {
          id: 'msg-2',
          conversationId: 'conv-2',
          messageType: 'text',
          content: 'Message 2',
          timestamp: Date.now(),
          retryCount: 0,
        },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedMessages));
      mockAsyncStorage.setItem.mockResolvedValue();

      await queue.dequeueMessage('msg-1');

      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
      const callArgs = mockAsyncStorage.setItem.mock.calls[0];
      const updatedData = JSON.parse(callArgs[1]);

      expect(updatedData).toHaveLength(1);
      expect(updatedData[0].id).toBe('msg-2');
    });
  });

  describe('processQueue', () => {
    it('should process messages successfully', async () => {
      const storedMessages = [
        {
          id: 'msg-1',
          conversationId: 'conv-1',
          messageType: 'text',
          content: 'Message 1',
          timestamp: Date.now(),
          retryCount: 0,
        },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedMessages));
      mockAsyncStorage.setItem.mockResolvedValue();

      const mockSendFunction = vi.fn().mockResolvedValue(undefined);

      await queue.processQueue(mockSendFunction);

      expect(mockSendFunction).toHaveBeenCalledWith(storedMessages[0]);
      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should handle failed messages with retry logic', async () => {
      const storedMessages = [
        {
          id: 'msg-1',
          conversationId: 'conv-1',
          messageType: 'text',
          content: 'Message 1',
          timestamp: Date.now(),
          retryCount: 0,
        },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedMessages));
      mockAsyncStorage.setItem.mockResolvedValue();

      const mockSendFunction = vi.fn().mockRejectedValue(new Error('Network error'));

      await queue.processQueue(mockSendFunction);

      expect(mockSendFunction).toHaveBeenCalledWith(storedMessages[0]);

      // Should update retry count
      const callArgs = mockAsyncStorage.setItem.mock.calls[0];
      const updatedData = JSON.parse(callArgs[1]);
      expect(updatedData[0].retryCount).toBe(1);
      expect(updatedData[0].lastError).toBe('Network error');
    });
  });

  describe('getQueueStats', () => {
    it('should return correct statistics', async () => {
      const storedMessages = [
        {
          id: 'msg-1',
          conversationId: 'conv-1',
          messageType: 'text',
          content: 'Pending message',
          timestamp: Date.now(),
          retryCount: 0,
        },
        {
          id: 'msg-2',
          conversationId: 'conv-2',
          messageType: 'text',
          content: 'Failed message',
          timestamp: Date.now(),
          retryCount: 3, // Max retries
        },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedMessages));

      const stats = await queue.getQueueStats();

      expect(stats.total).toBe(2);
      expect(stats.pending).toBe(1);
      expect(stats.failed).toBe(1);
    });
  });
});
