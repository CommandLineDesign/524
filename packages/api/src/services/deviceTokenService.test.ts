import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import type { DeviceTokenRepository } from '../repositories/deviceTokenRepository.js';
import { DeviceTokenService, type RegisterDevicePayload } from './deviceTokenService.js';

// Create mock functions
interface MockFn<T = unknown> {
  (...args: unknown[]): Promise<T>;
  calls: unknown[][];
  callCount(): number;
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

const mockRepository = {
  upsertToken: createMock(mockDeviceToken),
  findActiveByUserId: createMock([mockDeviceToken]),
  findByToken: createMock(mockDeviceToken),
  findByDeviceId: createMock(mockDeviceToken),
  deactivateToken: createMock(undefined),
  deactivateAllForUser: createMock(undefined),
  removeToken: createMock(undefined),
  touchToken: createMock(undefined),
  findActiveByUserIds: createMock([mockDeviceToken]),
};

describe('DeviceTokenService', () => {
  let service: DeviceTokenService;

  beforeEach(() => {
    // Reset mock call counts
    for (const mock of Object.values(mockRepository)) {
      mock.calls.length = 0;
    }

    service = new DeviceTokenService(mockRepository as unknown as DeviceTokenRepository);
  });

  describe('registerDevice', () => {
    it('should register a new device token', async () => {
      const payload: RegisterDevicePayload = {
        userId: 'user-id',
        token: 'fcm-token-abc123',
        platform: 'ios',
        deviceId: 'device-123',
        appVersion: '1.0.0',
      };

      const result = await service.registerDevice(payload);

      assert.equal(mockRepository.upsertToken.callCount(), 1);
      assert.deepEqual(mockRepository.upsertToken.calls[0][0], {
        userId: 'user-id',
        token: 'fcm-token-abc123',
        platform: 'ios',
        deviceId: 'device-123',
        appVersion: '1.0.0',
      });
      assert.equal(result.id, 'device-token-id');
      assert.equal(result.platform, 'ios');
    });

    it('should register device without optional fields', async () => {
      const payload: RegisterDevicePayload = {
        userId: 'user-id',
        token: 'fcm-token-abc123',
        platform: 'android',
      };

      await service.registerDevice(payload);

      assert.equal(mockRepository.upsertToken.callCount(), 1);
      assert.deepEqual(mockRepository.upsertToken.calls[0][0], {
        userId: 'user-id',
        token: 'fcm-token-abc123',
        platform: 'android',
        deviceId: undefined,
        appVersion: undefined,
      });
    });
  });

  describe('unregisterDevice', () => {
    it('should remove a device token for user', async () => {
      const userId = 'user-id';
      const token = 'fcm-token-abc123';

      await service.unregisterDevice(userId, token);

      assert.equal(mockRepository.removeToken.callCount(), 1);
      assert.deepEqual(mockRepository.removeToken.calls[0], [userId, token]);
    });
  });

  describe('unregisterAllDevices', () => {
    it('should deactivate all device tokens for user', async () => {
      const userId = 'user-id';

      await service.unregisterAllDevices(userId);

      assert.equal(mockRepository.deactivateAllForUser.callCount(), 1);
      assert.deepEqual(mockRepository.deactivateAllForUser.calls[0], [userId]);
    });
  });

  describe('getActiveTokensForUser', () => {
    it('should return active token strings for user', async () => {
      const userId = 'user-id';

      const tokens = await service.getActiveTokensForUser(userId);

      assert.equal(mockRepository.findActiveByUserId.callCount(), 1);
      assert.deepEqual(mockRepository.findActiveByUserId.calls[0], [userId]);
      assert.deepEqual(tokens, ['fcm-token-abc123']);
    });

    it('should return empty array when no tokens found', async () => {
      const emptyMock = createMock<(typeof mockDeviceToken)[]>([]);
      const originalMock = mockRepository.findActiveByUserId;
      mockRepository.findActiveByUserId = emptyMock;

      const tokens = await service.getActiveTokensForUser('user-id');

      assert.deepEqual(tokens, []);

      mockRepository.findActiveByUserId = originalMock;
    });
  });

  describe('handleInvalidToken', () => {
    it('should deactivate an invalid token', async () => {
      const token = 'invalid-fcm-token';

      await service.handleInvalidToken(token);

      assert.equal(mockRepository.deactivateToken.callCount(), 1);
      assert.deepEqual(mockRepository.deactivateToken.calls[0], [token]);
    });
  });
});
