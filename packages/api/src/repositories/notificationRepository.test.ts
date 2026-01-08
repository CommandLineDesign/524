import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';

import { TEST_USERS, cleanupNotifications, createTestNotificationInDB } from '../test/fixtures.js';
import { NotificationRepository } from './notificationRepository.js';

describe('NotificationRepository', () => {
  let repository: NotificationRepository;

  beforeEach(async () => {
    await cleanupNotifications();
    repository = new NotificationRepository();
  });

  afterEach(async () => {
    await cleanupNotifications();
  });

  describe('create', () => {
    it('should create notification with all fields', async () => {
      const result = await repository.create({
        userId: TEST_USERS.customer1,
        type: 'booking_created',
        title: 'Test Title',
        body: 'Test body',
        data: { bookingId: 'test-id' },
      });

      assert.ok(result.id);
      assert.equal(result.userId, TEST_USERS.customer1);
      assert.equal(result.type, 'booking_created');
      assert.equal(result.title, 'Test Title');
      assert.equal(result.body, 'Test body');
      assert.deepEqual(result.data, { bookingId: 'test-id' });
      assert.equal(result.readAt, null);
      assert.ok(result.createdAt);
    });

    it('should generate UUID for id', async () => {
      const result = await repository.create({
        userId: TEST_USERS.customer1,
        type: 'booking_created',
        title: 'Test',
        body: 'Test body',
      });

      assert.ok(result.id);
      assert.match(result.id, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it('should set createdAt automatically', async () => {
      const before = new Date();

      const result = await repository.create({
        userId: TEST_USERS.customer1,
        type: 'booking_created',
        title: 'Test',
        body: 'Test body',
      });

      const after = new Date();

      assert.ok(result.createdAt >= before);
      assert.ok(result.createdAt <= after);
    });

    it('should allow null data field', async () => {
      const result = await repository.create({
        userId: TEST_USERS.customer1,
        type: 'booking_created',
        title: 'Test',
        body: 'Test body',
      });

      assert.equal(result.data, null);
    });
  });

  describe('findById', () => {
    it('should return notification when found', async () => {
      const created = await createTestNotificationInDB();

      const result = await repository.findById(created.id);

      assert.ok(result);
      assert.equal(result.id, created.id);
      assert.equal(result.userId, created.userId);
    });

    it('should return null when not found', async () => {
      const result = await repository.findById('00000000-0000-0000-0000-000000000000');

      assert.equal(result, null);
    });
  });

  describe('findByUserId', () => {
    it('should return notifications for user', async () => {
      await createTestNotificationInDB({ userId: TEST_USERS.customer1 });
      await createTestNotificationInDB({ userId: TEST_USERS.customer1 });

      const result = await repository.findByUserId(TEST_USERS.customer1);

      assert.equal(result.length, 2);
    });

    it('should order by createdAt descending (newest first)', async () => {
      // Create notifications with slight delays to ensure different timestamps
      const first = await createTestNotificationInDB({
        userId: TEST_USERS.customer1,
        title: 'First',
      });
      await new Promise((resolve) => setTimeout(resolve, 10));
      const second = await createTestNotificationInDB({
        userId: TEST_USERS.customer1,
        title: 'Second',
      });

      const result = await repository.findByUserId(TEST_USERS.customer1);

      assert.equal(result.length, 2);
      assert.equal(result[0].id, second.id); // Newest first
      assert.equal(result[1].id, first.id);
    });

    it('should respect limit parameter', async () => {
      await createTestNotificationInDB({ userId: TEST_USERS.customer1 });
      await createTestNotificationInDB({ userId: TEST_USERS.customer1 });
      await createTestNotificationInDB({ userId: TEST_USERS.customer1 });

      const result = await repository.findByUserId(TEST_USERS.customer1, { limit: 2 });

      assert.equal(result.length, 2);
    });

    it('should respect offset parameter', async () => {
      await createTestNotificationInDB({ userId: TEST_USERS.customer1, title: 'First' });
      await new Promise((resolve) => setTimeout(resolve, 10));
      await createTestNotificationInDB({ userId: TEST_USERS.customer1, title: 'Second' });
      await new Promise((resolve) => setTimeout(resolve, 10));
      await createTestNotificationInDB({ userId: TEST_USERS.customer1, title: 'Third' });

      const result = await repository.findByUserId(TEST_USERS.customer1, { offset: 1 });

      assert.equal(result.length, 2);
      assert.equal(result[0].title, 'Second'); // Skip newest (Third)
    });

    it('should return empty array when no notifications', async () => {
      const result = await repository.findByUserId(TEST_USERS.customer1);

      assert.deepEqual(result, []);
    });

    it('should use default limit of 20', async () => {
      // Create 25 notifications
      for (let i = 0; i < 25; i++) {
        await createTestNotificationInDB({ userId: TEST_USERS.customer1 });
      }

      const result = await repository.findByUserId(TEST_USERS.customer1);

      assert.equal(result.length, 20);
    });

    it('should not return notifications for other users', async () => {
      await createTestNotificationInDB({ userId: TEST_USERS.customer1 });
      await createTestNotificationInDB({ userId: TEST_USERS.artist1 });

      const result = await repository.findByUserId(TEST_USERS.customer1);

      assert.equal(result.length, 1);
      assert.equal(result[0].userId, TEST_USERS.customer1);
    });
  });

  describe('countByUserId', () => {
    it('should return total count of notifications for user', async () => {
      await createTestNotificationInDB({ userId: TEST_USERS.customer1 });
      await createTestNotificationInDB({ userId: TEST_USERS.customer1 });
      await createTestNotificationInDB({ userId: TEST_USERS.customer1 });

      const result = await repository.countByUserId(TEST_USERS.customer1);

      assert.equal(result, 3);
    });

    it('should return 0 when no notifications', async () => {
      const result = await repository.countByUserId(TEST_USERS.customer1);

      assert.equal(result, 0);
    });
  });

  describe('getUnreadCount', () => {
    it('should count only notifications with null readAt', async () => {
      const notification1 = await createTestNotificationInDB({ userId: TEST_USERS.customer1 });
      await createTestNotificationInDB({ userId: TEST_USERS.customer1 });
      await createTestNotificationInDB({ userId: TEST_USERS.customer1 });

      // Mark one as read
      await repository.markAsRead(notification1.id);

      const result = await repository.getUnreadCount(TEST_USERS.customer1);

      assert.equal(result, 2);
    });

    it('should return 0 when all read', async () => {
      const notification1 = await createTestNotificationInDB({ userId: TEST_USERS.customer1 });
      const notification2 = await createTestNotificationInDB({ userId: TEST_USERS.customer1 });

      await repository.markAsRead(notification1.id);
      await repository.markAsRead(notification2.id);

      const result = await repository.getUnreadCount(TEST_USERS.customer1);

      assert.equal(result, 0);
    });

    it('should return total when none read', async () => {
      await createTestNotificationInDB({ userId: TEST_USERS.customer1 });
      await createTestNotificationInDB({ userId: TEST_USERS.customer1 });

      const result = await repository.getUnreadCount(TEST_USERS.customer1);

      assert.equal(result, 2);
    });
  });

  describe('markAsRead', () => {
    it('should set readAt to current timestamp', async () => {
      const notification = await createTestNotificationInDB({ userId: TEST_USERS.customer1 });
      const before = new Date();

      const result = await repository.markAsRead(notification.id);

      const after = new Date();

      assert.ok(result);
      assert.ok(result.readAt);
      assert.ok(result.readAt >= before);
      assert.ok(result.readAt <= after);
    });

    it('should return updated notification', async () => {
      const notification = await createTestNotificationInDB({ userId: TEST_USERS.customer1 });

      const result = await repository.markAsRead(notification.id);

      assert.ok(result);
      assert.equal(result.id, notification.id);
      assert.ok(result.readAt);
    });

    it('should return null when notification not found', async () => {
      const result = await repository.markAsRead('00000000-0000-0000-0000-000000000000');

      assert.equal(result, null);
    });

    it('should be idempotent (can mark already-read notification)', async () => {
      const notification = await createTestNotificationInDB({ userId: TEST_USERS.customer1 });

      // Mark as read twice
      await repository.markAsRead(notification.id);
      const result = await repository.markAsRead(notification.id);

      assert.ok(result);
      assert.ok(result.readAt);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all unread notifications as read', async () => {
      await createTestNotificationInDB({ userId: TEST_USERS.customer1 });
      await createTestNotificationInDB({ userId: TEST_USERS.customer1 });
      await createTestNotificationInDB({ userId: TEST_USERS.customer1 });

      const count = await repository.markAllAsRead(TEST_USERS.customer1);

      assert.equal(count, 3);

      // Verify all are now read
      const unreadCount = await repository.getUnreadCount(TEST_USERS.customer1);
      assert.equal(unreadCount, 0);
    });

    it('should return count of marked notifications', async () => {
      await createTestNotificationInDB({ userId: TEST_USERS.customer1 });
      await createTestNotificationInDB({ userId: TEST_USERS.customer1 });

      const count = await repository.markAllAsRead(TEST_USERS.customer1);

      assert.equal(count, 2);
    });

    it('should not re-mark already-read notifications', async () => {
      const notification1 = await createTestNotificationInDB({ userId: TEST_USERS.customer1 });
      await createTestNotificationInDB({ userId: TEST_USERS.customer1 });

      // Mark one as read first
      await repository.markAsRead(notification1.id);

      // Mark all as read - should only count the unread one
      const count = await repository.markAllAsRead(TEST_USERS.customer1);

      assert.equal(count, 1);
    });

    it('should return 0 when no unread notifications', async () => {
      const notification = await createTestNotificationInDB({ userId: TEST_USERS.customer1 });
      await repository.markAsRead(notification.id);

      const count = await repository.markAllAsRead(TEST_USERS.customer1);

      assert.equal(count, 0);
    });

    it('should only mark notifications for the specified user', async () => {
      await createTestNotificationInDB({ userId: TEST_USERS.customer1 });
      await createTestNotificationInDB({ userId: TEST_USERS.artist1 });

      await repository.markAllAsRead(TEST_USERS.customer1);

      // artist1's notification should still be unread
      const artistUnread = await repository.getUnreadCount(TEST_USERS.artist1);
      assert.equal(artistUnread, 1);
    });
  });
});
