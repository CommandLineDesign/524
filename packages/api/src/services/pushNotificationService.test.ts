import assert from 'node:assert/strict';
import { beforeEach, describe, it, mock } from 'node:test';

import type { DeviceTokenRepository } from '../repositories/deviceTokenRepository.js';
import type { DeviceTokenService } from './deviceTokenService.js';
import { PushNotificationService } from './pushNotificationService.js';

// Mock firebase-admin module
mock.module('firebase-admin', {
  namedExports: {
    default: {
      initializeApp: () => {},
      credential: {
        cert: () => ({}),
      },
      messaging: () => ({
        send: async () => 'message-id',
        sendEachForMulticast: async () => ({
          successCount: 1,
          failureCount: 0,
          responses: [{ success: true }],
        }),
        subscribeToTopic: async () => ({ successCount: 1, failureCount: 0 }),
        unsubscribeFromTopic: async () => ({ successCount: 1, failureCount: 0 }),
      }),
    },
  },
});

// Mock features config
mock.module('../config/features.js', {
  namedExports: {
    features: {
      ENABLE_PUSH_NOTIFICATIONS: true,
    },
  },
});

// Create mock functions
interface MockFn<T = unknown> {
  (...args: unknown[]): Promise<T>;
  calls: unknown[][];
  callCount(): number;
  reset(): void;
}

function createMock<T>(defaultReturn: T): MockFn<T> {
  const calls: unknown[][] = [];
  const mockFn = Object.assign(
    (...args: unknown[]) => {
      calls.push(args);
      return Promise.resolve(defaultReturn);
    },
    {
      calls,
      callCount: () => calls.length,
      reset: () => {
        calls.length = 0;
      },
    }
  );
  return mockFn;
}

const mockDeviceToken = {
  id: 'device-token-id',
  userId: 'user-id',
  token: 'fcm-token-abc123',
  platform: 'ios' as const,
  deviceId: 'device-123',
  appVersion: '1.0.0',
  isActive: true,
  lastUsedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('PushNotificationService', () => {
  let service: PushNotificationService;
  let mockTokenService: {
    getActiveTokensForUser: MockFn<string[]>;
    handleInvalidToken: MockFn<void>;
  };
  let mockTokenRepository: {
    findActiveByUserIds: MockFn<(typeof mockDeviceToken)[]>;
  };

  beforeEach(() => {
    mockTokenService = {
      getActiveTokensForUser: createMock(['fcm-token-abc123']),
      handleInvalidToken: createMock(undefined),
    };

    mockTokenRepository = {
      findActiveByUserIds: createMock([mockDeviceToken]),
    };

    service = new PushNotificationService();

    // Inject mocks via private property access (for testing)
    (service as unknown as { tokenService: typeof mockTokenService }).tokenService =
      mockTokenService as unknown as DeviceTokenService;
    (service as unknown as { tokenRepository: typeof mockTokenRepository }).tokenRepository =
      mockTokenRepository as unknown as DeviceTokenRepository;
  });

  describe('sendToUser', () => {
    it('should return empty result when no tokens found', async () => {
      mockTokenService.getActiveTokensForUser = createMock([]);

      const result = await service.sendToUser('user-id', {
        title: 'Test',
        body: 'Test body',
      });

      assert.equal(result.successCount, 0);
      assert.equal(result.failureCount, 0);
      assert.deepEqual(result.invalidTokens, []);
    });
  });

  describe('sendToUsers', () => {
    it('should return empty result when no user IDs provided', async () => {
      const result = await service.sendToUsers([], {
        title: 'Test',
        body: 'Test body',
      });

      assert.equal(result.successCount, 0);
      assert.equal(result.failureCount, 0);
    });

    it('should return empty result when no tokens found for users', async () => {
      mockTokenRepository.findActiveByUserIds = createMock([]);

      const result = await service.sendToUsers(['user-1', 'user-2'], {
        title: 'Test',
        body: 'Test body',
      });

      assert.equal(result.successCount, 0);
      assert.equal(result.failureCount, 0);
    });
  });

  describe('chunkArray (via sendToTokens)', () => {
    it('should handle empty token array', async () => {
      mockTokenService.getActiveTokensForUser = createMock([]);

      const result = await service.sendToUser('user-id', {
        title: 'Test',
        body: 'Test body',
      });

      assert.equal(result.successCount, 0);
      assert.equal(result.failureCount, 0);
    });
  });

  describe('payload handling', () => {
    it('should accept payload with all optional fields', async () => {
      const result = await service.sendToUser('user-id', {
        title: 'Test Title',
        body: 'Test body',
        data: { key: 'value' },
        imageUrl: 'https://example.com/image.png',
        badge: 5,
        sound: 'custom-sound',
      });

      // The method should complete without error
      assert.ok(result);
    });

    it('should accept minimal payload', async () => {
      const result = await service.sendToUser('user-id', {
        title: 'Test',
        body: 'Body',
      });

      assert.ok(result);
    });
  });
});
