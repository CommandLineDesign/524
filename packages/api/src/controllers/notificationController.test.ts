import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';
import type { Response } from 'express';

import type { AuthRequest } from '../middleware/auth.js';
import {
  TEST_USERS,
  cleanupNotificationPreferences,
  cleanupNotifications,
  createTestNext,
  createTestNotificationInDB,
  createTestRequest,
  createTestResponse,
} from '../test/fixtures.js';
import { NotificationController } from './notificationController.js';

describe('NotificationController', () => {
  beforeEach(async () => {
    await cleanupNotifications();
    await cleanupNotificationPreferences();
  });

  afterEach(async () => {
    await cleanupNotifications();
    await cleanupNotificationPreferences();
  });

  describe('getPreferences', () => {
    it('should return 401 when user not authenticated', async () => {
      const req = createTestRequest({ user: undefined });
      const res = createTestResponse();
      const next = createTestNext();

      await NotificationController.getPreferences(req as AuthRequest, res as Response, next);

      assert.equal((res as { _statusCode?: number })._statusCode, 401);
      assert.deepEqual((res as { _jsonData?: unknown })._jsonData, {
        error: 'User not authenticated',
      });
    });

    it('should return preferences for authenticated user', async () => {
      const req = createTestRequest({
        user: { id: TEST_USERS.customer1 },
      });
      const res = createTestResponse();
      const next = createTestNext();

      await NotificationController.getPreferences(req as AuthRequest, res as Response, next);

      const response = (res as { _jsonData?: { preferences?: unknown } })._jsonData;
      assert.ok(response?.preferences);
    });

    it('should create default preferences if none exist', async () => {
      const req = createTestRequest({
        user: { id: TEST_USERS.customer1 },
      });
      const res = createTestResponse();
      const next = createTestNext();

      await NotificationController.getPreferences(req as AuthRequest, res as Response, next);

      const response = (res as { _jsonData?: { preferences?: Record<string, boolean> } })._jsonData;
      assert.ok(response?.preferences);
      // Default values
      assert.equal(response.preferences.bookingCreated, true);
      assert.equal(response.preferences.marketing, false);
    });

    it('should return all 8 preference fields', async () => {
      const req = createTestRequest({
        user: { id: TEST_USERS.customer1 },
      });
      const res = createTestResponse();
      const next = createTestNext();

      await NotificationController.getPreferences(req as AuthRequest, res as Response, next);

      const response = (res as { _jsonData?: { preferences?: Record<string, boolean> } })._jsonData;
      assert.ok(response?.preferences);
      assert.ok('bookingCreated' in response.preferences);
      assert.ok('bookingConfirmed' in response.preferences);
      assert.ok('bookingDeclined' in response.preferences);
      assert.ok('bookingCancelled' in response.preferences);
      assert.ok('bookingInProgress' in response.preferences);
      assert.ok('bookingCompleted' in response.preferences);
      assert.ok('newMessage' in response.preferences);
      assert.ok('marketing' in response.preferences);
    });
  });

  describe('updatePreferences', () => {
    it('should return 401 when user not authenticated', async () => {
      const req = createTestRequest({
        user: undefined,
        body: { bookingCreated: false },
      });
      const res = createTestResponse();
      const next = createTestNext();

      await NotificationController.updatePreferences(req as AuthRequest, res as Response, next);

      assert.equal((res as { _statusCode?: number })._statusCode, 401);
    });

    it('should return 400 for invalid request body', async () => {
      const req = createTestRequest({
        user: { id: TEST_USERS.customer1 },
        body: { bookingCreated: 'not-a-boolean' },
      });
      const res = createTestResponse();
      const next = createTestNext();

      await NotificationController.updatePreferences(req as AuthRequest, res as Response, next);

      assert.equal((res as { _statusCode?: number })._statusCode, 400);
      const response = (res as { _jsonData?: { error?: string } })._jsonData;
      assert.equal(response?.error, 'Invalid request');
    });

    it('should return 400 for invalid field types (non-boolean)', async () => {
      const req = createTestRequest({
        user: { id: TEST_USERS.customer1 },
        body: { marketing: 123 },
      });
      const res = createTestResponse();
      const next = createTestNext();

      await NotificationController.updatePreferences(req as AuthRequest, res as Response, next);

      assert.equal((res as { _statusCode?: number })._statusCode, 400);
    });

    it('should update single preference field', async () => {
      const req = createTestRequest({
        user: { id: TEST_USERS.customer1 },
        body: { bookingCreated: false },
      });
      const res = createTestResponse();
      const next = createTestNext();

      await NotificationController.updatePreferences(req as AuthRequest, res as Response, next);

      const response = (res as { _jsonData?: { preferences?: Record<string, boolean> } })._jsonData;
      assert.ok(response?.preferences);
      assert.equal(response.preferences.bookingCreated, false);
    });

    it('should update multiple preference fields', async () => {
      const req = createTestRequest({
        user: { id: TEST_USERS.customer1 },
        body: {
          bookingCreated: false,
          bookingConfirmed: false,
          marketing: true,
        },
      });
      const res = createTestResponse();
      const next = createTestNext();

      await NotificationController.updatePreferences(req as AuthRequest, res as Response, next);

      const response = (res as { _jsonData?: { preferences?: Record<string, boolean> } })._jsonData;
      assert.ok(response?.preferences);
      assert.equal(response.preferences.bookingCreated, false);
      assert.equal(response.preferences.bookingConfirmed, false);
      assert.equal(response.preferences.marketing, true);
    });

    it('should return updated preferences', async () => {
      const req = createTestRequest({
        user: { id: TEST_USERS.customer1 },
        body: { marketing: true },
      });
      const res = createTestResponse();
      const next = createTestNext();

      await NotificationController.updatePreferences(req as AuthRequest, res as Response, next);

      const response = (res as { _jsonData?: { preferences?: Record<string, boolean> } })._jsonData;
      assert.ok(response?.preferences);
      assert.equal(response.preferences.marketing, true);
    });

    it('should ignore unknown fields in request body', async () => {
      const req = createTestRequest({
        user: { id: TEST_USERS.customer1 },
        body: {
          bookingCreated: false,
          unknownField: true,
        },
      });
      const res = createTestResponse();
      const next = createTestNext();

      // Should not throw due to unknown field
      await NotificationController.updatePreferences(req as AuthRequest, res as Response, next);

      const response = (res as { _jsonData?: { preferences?: Record<string, boolean> } })._jsonData;
      assert.ok(response?.preferences);
      assert.equal(response.preferences.bookingCreated, false);
      assert.ok(!('unknownField' in response.preferences));
    });
  });

  describe('getNotifications', () => {
    it('should return 401 when user not authenticated', async () => {
      const req = createTestRequest({ user: undefined });
      const res = createTestResponse();
      const next = createTestNext();

      await NotificationController.getNotifications(req as AuthRequest, res as Response, next);

      assert.equal((res as { _statusCode?: number })._statusCode, 401);
    });

    it('should return 400 for invalid pagination params', async () => {
      const req = createTestRequest({
        user: { id: TEST_USERS.customer1 },
        query: { limit: '200' }, // Max is 100
      });
      const res = createTestResponse();
      const next = createTestNext();

      await NotificationController.getNotifications(req as AuthRequest, res as Response, next);

      assert.equal((res as { _statusCode?: number })._statusCode, 400);
    });

    it('should return notifications with pagination', async () => {
      await createTestNotificationInDB({ userId: TEST_USERS.customer1 });
      await createTestNotificationInDB({ userId: TEST_USERS.customer1 });

      const req = createTestRequest({
        user: { id: TEST_USERS.customer1 },
        query: { limit: '10', offset: '0' },
      });
      const res = createTestResponse();
      const next = createTestNext();

      await NotificationController.getNotifications(req as AuthRequest, res as Response, next);

      const response = (res as { _jsonData?: { notifications?: unknown[]; total?: number } })
        ._jsonData;
      assert.ok(response?.notifications);
      assert.equal(response.notifications.length, 2);
      assert.equal(response.total, 2);
    });

    it('should return total count', async () => {
      await createTestNotificationInDB({ userId: TEST_USERS.customer1 });
      await createTestNotificationInDB({ userId: TEST_USERS.customer1 });
      await createTestNotificationInDB({ userId: TEST_USERS.customer1 });

      const req = createTestRequest({
        user: { id: TEST_USERS.customer1 },
        query: {},
      });
      const res = createTestResponse();
      const next = createTestNext();

      await NotificationController.getNotifications(req as AuthRequest, res as Response, next);

      const response = (res as { _jsonData?: { total?: number } })._jsonData;
      assert.equal(response?.total, 3);
    });

    it('should return hasMore flag correctly', async () => {
      // Create 5 notifications
      for (let i = 0; i < 5; i++) {
        await createTestNotificationInDB({ userId: TEST_USERS.customer1 });
      }

      const req = createTestRequest({
        user: { id: TEST_USERS.customer1 },
        query: { limit: '2', offset: '0' },
      });
      const res = createTestResponse();
      const next = createTestNext();

      await NotificationController.getNotifications(req as AuthRequest, res as Response, next);

      const response = (res as { _jsonData?: { hasMore?: boolean } })._jsonData;
      assert.equal(response?.hasMore, true);
    });

    it('should use default pagination (limit 20, offset 0)', async () => {
      await createTestNotificationInDB({ userId: TEST_USERS.customer1 });

      const req = createTestRequest({
        user: { id: TEST_USERS.customer1 },
        query: {},
      });
      const res = createTestResponse();
      const next = createTestNext();

      await NotificationController.getNotifications(req as AuthRequest, res as Response, next);

      const response = (res as { _jsonData?: { notifications?: unknown[] } })._jsonData;
      assert.ok(response?.notifications);
    });

    it('should respect custom limit and offset', async () => {
      for (let i = 0; i < 5; i++) {
        await createTestNotificationInDB({
          userId: TEST_USERS.customer1,
          title: `Notification ${i}`,
        });
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      const req = createTestRequest({
        user: { id: TEST_USERS.customer1 },
        query: { limit: '2', offset: '2' },
      });
      const res = createTestResponse();
      const next = createTestNext();

      await NotificationController.getNotifications(req as AuthRequest, res as Response, next);

      const response = (res as { _jsonData?: { notifications?: { title: string }[] } })._jsonData;
      assert.ok(response?.notifications);
      assert.equal(response.notifications.length, 2);
    });

    it('should return empty array when no notifications', async () => {
      const req = createTestRequest({
        user: { id: TEST_USERS.customer1 },
        query: {},
      });
      const res = createTestResponse();
      const next = createTestNext();

      await NotificationController.getNotifications(req as AuthRequest, res as Response, next);

      const response = (res as { _jsonData?: { notifications?: unknown[] } })._jsonData;
      assert.deepEqual(response?.notifications, []);
    });
  });

  describe('getUnreadCount', () => {
    it('should return 401 when user not authenticated', async () => {
      const req = createTestRequest({ user: undefined });
      const res = createTestResponse();
      const next = createTestNext();

      await NotificationController.getUnreadCount(req as AuthRequest, res as Response, next);

      assert.equal((res as { _statusCode?: number })._statusCode, 401);
    });

    it('should return unread count for user', async () => {
      await createTestNotificationInDB({ userId: TEST_USERS.customer1 });
      await createTestNotificationInDB({ userId: TEST_USERS.customer1 });

      const req = createTestRequest({
        user: { id: TEST_USERS.customer1 },
      });
      const res = createTestResponse();
      const next = createTestNext();

      await NotificationController.getUnreadCount(req as AuthRequest, res as Response, next);

      const response = (res as { _jsonData?: { unreadCount?: number } })._jsonData;
      assert.equal(response?.unreadCount, 2);
    });

    it('should return 0 when no unread notifications', async () => {
      const req = createTestRequest({
        user: { id: TEST_USERS.customer1 },
      });
      const res = createTestResponse();
      const next = createTestNext();

      await NotificationController.getUnreadCount(req as AuthRequest, res as Response, next);

      const response = (res as { _jsonData?: { unreadCount?: number } })._jsonData;
      assert.equal(response?.unreadCount, 0);
    });
  });

  describe('markAsRead', () => {
    it('should return 401 when user not authenticated', async () => {
      const req = createTestRequest({
        user: undefined,
        params: { id: 'notification-id' },
      });
      const res = createTestResponse();
      const next = createTestNext();

      await NotificationController.markAsRead(req as AuthRequest, res as Response, next);

      assert.equal((res as { _statusCode?: number })._statusCode, 401);
    });

    it('should return 400 when notification ID missing', async () => {
      const req = createTestRequest({
        user: { id: TEST_USERS.customer1 },
        params: {},
      });
      const res = createTestResponse();
      const next = createTestNext();

      await NotificationController.markAsRead(req as AuthRequest, res as Response, next);

      assert.equal((res as { _statusCode?: number })._statusCode, 400);
    });

    it('should return 404 when notification not found', async () => {
      const req = createTestRequest({
        user: { id: TEST_USERS.customer1 },
        params: { id: '00000000-0000-0000-0000-000000000000' },
      });
      const res = createTestResponse();
      const next = createTestNext();

      await NotificationController.markAsRead(req as AuthRequest, res as Response, next);

      assert.equal((res as { _statusCode?: number })._statusCode, 404);
    });

    it('should return 403 when notification belongs to different user', async () => {
      const notification = await createTestNotificationInDB({ userId: TEST_USERS.artist1 });

      const req = createTestRequest({
        user: { id: TEST_USERS.customer1 },
        params: { id: notification.id },
      });
      const res = createTestResponse();
      const next = createTestNext();

      await NotificationController.markAsRead(req as AuthRequest, res as Response, next);

      assert.equal((res as { _statusCode?: number })._statusCode, 403);
    });

    it('should mark notification as read', async () => {
      const notification = await createTestNotificationInDB({ userId: TEST_USERS.customer1 });

      const req = createTestRequest({
        user: { id: TEST_USERS.customer1 },
        params: { id: notification.id },
      });
      const res = createTestResponse();
      const next = createTestNext();

      await NotificationController.markAsRead(req as AuthRequest, res as Response, next);

      const response = (res as { _jsonData?: { notification?: { readAt?: Date } } })._jsonData;
      assert.ok(response?.notification?.readAt);
    });

    it('should return updated notification with readAt set', async () => {
      const notification = await createTestNotificationInDB({ userId: TEST_USERS.customer1 });

      const req = createTestRequest({
        user: { id: TEST_USERS.customer1 },
        params: { id: notification.id },
      });
      const res = createTestResponse();
      const next = createTestNext();

      await NotificationController.markAsRead(req as AuthRequest, res as Response, next);

      const response = (
        res as {
          _jsonData?: { notification?: { id: string; readAt: Date; title: string; body: string } };
        }
      )._jsonData;
      assert.ok(response?.notification);
      assert.equal(response.notification.id, notification.id);
      assert.ok(response.notification.readAt);
    });
  });

  describe('markAllAsRead', () => {
    it('should return 401 when user not authenticated', async () => {
      const req = createTestRequest({ user: undefined });
      const res = createTestResponse();
      const next = createTestNext();

      await NotificationController.markAllAsRead(req as AuthRequest, res as Response, next);

      assert.equal((res as { _statusCode?: number })._statusCode, 401);
    });

    it('should mark all unread notifications as read', async () => {
      await createTestNotificationInDB({ userId: TEST_USERS.customer1 });
      await createTestNotificationInDB({ userId: TEST_USERS.customer1 });

      const req = createTestRequest({
        user: { id: TEST_USERS.customer1 },
      });
      const res = createTestResponse();
      const next = createTestNext();

      await NotificationController.markAllAsRead(req as AuthRequest, res as Response, next);

      const response = (res as { _jsonData?: { success?: boolean; markedCount?: number } })
        ._jsonData;
      assert.equal(response?.success, true);
      assert.equal(response?.markedCount, 2);
    });

    it('should return count of marked notifications', async () => {
      await createTestNotificationInDB({ userId: TEST_USERS.customer1 });
      await createTestNotificationInDB({ userId: TEST_USERS.customer1 });
      await createTestNotificationInDB({ userId: TEST_USERS.customer1 });

      const req = createTestRequest({
        user: { id: TEST_USERS.customer1 },
      });
      const res = createTestResponse();
      const next = createTestNext();

      await NotificationController.markAllAsRead(req as AuthRequest, res as Response, next);

      const response = (res as { _jsonData?: { markedCount?: number } })._jsonData;
      assert.equal(response?.markedCount, 3);
    });

    it('should return 0 count when no unread notifications', async () => {
      const req = createTestRequest({
        user: { id: TEST_USERS.customer1 },
      });
      const res = createTestResponse();
      const next = createTestNext();

      await NotificationController.markAllAsRead(req as AuthRequest, res as Response, next);

      const response = (res as { _jsonData?: { markedCount?: number } })._jsonData;
      assert.equal(response?.markedCount, 0);
    });
  });
});
