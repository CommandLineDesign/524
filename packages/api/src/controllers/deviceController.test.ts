import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import type { AuthRequest } from '../middleware/auth.js';
import {
  TEST_USERS,
  createTestNext,
  createTestRequest,
  createTestResponse,
} from '../test/fixtures.js';
import { DeviceController } from './deviceController.js';

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

describe('DeviceController', () => {
  describe('registerDevice', () => {
    it('should return 401 when user is not authenticated', async () => {
      const req = createTestRequest({
        user: undefined,
        body: {
          token: 'fcm-token-abc123',
          platform: 'ios',
        },
      }) as AuthRequest;
      const res = createTestResponse();
      const next = createTestNext();

      await DeviceController.registerDevice(req, res, next);

      assert.equal((res as { _statusCode?: number })._statusCode, 401);
      assert.deepEqual((res as { _jsonData?: unknown })._jsonData, {
        error: 'User not authenticated',
      });
    });

    it('should return 400 when token is missing', async () => {
      const req = createTestRequest({
        user: { id: TEST_USERS.customer1, roles: ['customer'] },
        body: {
          platform: 'ios',
        },
      }) as AuthRequest;
      const res = createTestResponse();
      const next = createTestNext();

      await DeviceController.registerDevice(req, res, next);

      assert.equal((res as { _statusCode?: number })._statusCode, 400);
      const responseData = (res as { _jsonData?: { error?: string } })._jsonData;
      assert.equal(responseData?.error, 'Invalid request');
    });

    it('should return 400 when platform is invalid', async () => {
      const req = createTestRequest({
        user: { id: TEST_USERS.customer1, roles: ['customer'] },
        body: {
          token: 'fcm-token-abc123',
          platform: 'invalid-platform',
        },
      }) as AuthRequest;
      const res = createTestResponse();
      const next = createTestNext();

      await DeviceController.registerDevice(req, res, next);

      assert.equal((res as { _statusCode?: number })._statusCode, 400);
      const responseData = (res as { _jsonData?: { error?: string } })._jsonData;
      assert.equal(responseData?.error, 'Invalid request');
    });

    it('should return 400 when token exceeds max length', async () => {
      const req = createTestRequest({
        user: { id: TEST_USERS.customer1, roles: ['customer'] },
        body: {
          token: 'a'.repeat(600), // Exceeds 512 max
          platform: 'ios',
        },
      }) as AuthRequest;
      const res = createTestResponse();
      const next = createTestNext();

      await DeviceController.registerDevice(req, res, next);

      assert.equal((res as { _statusCode?: number })._statusCode, 400);
    });
  });

  describe('unregisterDevice', () => {
    it('should return 401 when user is not authenticated', async () => {
      const req = createTestRequest({
        user: undefined,
        body: {
          token: 'fcm-token-abc123',
        },
      }) as AuthRequest;
      const res = createTestResponse();
      const next = createTestNext();

      await DeviceController.unregisterDevice(req, res, next);

      assert.equal((res as { _statusCode?: number })._statusCode, 401);
      assert.deepEqual((res as { _jsonData?: unknown })._jsonData, {
        error: 'User not authenticated',
      });
    });

    it('should return 400 when token is missing', async () => {
      const req = createTestRequest({
        user: { id: TEST_USERS.customer1, roles: ['customer'] },
        body: {},
      }) as AuthRequest;
      const res = createTestResponse();
      const next = createTestNext();

      await DeviceController.unregisterDevice(req, res, next);

      assert.equal((res as { _statusCode?: number })._statusCode, 400);
      const responseData = (res as { _jsonData?: { error?: string } })._jsonData;
      assert.equal(responseData?.error, 'Invalid request');
    });
  });

  describe('unregisterAllDevices', () => {
    it('should return 401 when user is not authenticated', async () => {
      const req = createTestRequest({
        user: undefined,
        body: {},
      }) as AuthRequest;
      const res = createTestResponse();
      const next = createTestNext();

      await DeviceController.unregisterAllDevices(req, res, next);

      assert.equal((res as { _statusCode?: number })._statusCode, 401);
      assert.deepEqual((res as { _jsonData?: unknown })._jsonData, {
        error: 'User not authenticated',
      });
    });
  });
});
