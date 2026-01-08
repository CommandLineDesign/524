import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';

import { TEST_USERS, cleanupNotificationPreferences } from '../test/fixtures.js';
import { NotificationPreferenceRepository } from './notificationPreferenceRepository.js';

describe('NotificationPreferenceRepository', () => {
  let repository: NotificationPreferenceRepository;

  beforeEach(async () => {
    await cleanupNotificationPreferences();
    repository = new NotificationPreferenceRepository();
  });

  afterEach(async () => {
    await cleanupNotificationPreferences();
  });

  describe('findByUserId', () => {
    it('should return preference when found', async () => {
      // Create a preference first
      await repository.create({ userId: TEST_USERS.customer1 });

      const result = await repository.findByUserId(TEST_USERS.customer1);

      assert.ok(result);
      assert.equal(result.userId, TEST_USERS.customer1);
    });

    it('should return null when not found', async () => {
      const result = await repository.findByUserId(TEST_USERS.customer1);

      assert.equal(result, null);
    });
  });

  describe('create', () => {
    it('should create preference with default values', async () => {
      const result = await repository.create({ userId: TEST_USERS.customer1 });

      assert.ok(result.id);
      assert.equal(result.userId, TEST_USERS.customer1);
      // Default values should be true (except marketing which defaults to false)
      assert.equal(result.bookingCreated, true);
      assert.equal(result.bookingConfirmed, true);
      assert.equal(result.bookingDeclined, true);
      assert.equal(result.bookingCancelled, true);
      assert.equal(result.bookingInProgress, true);
      assert.equal(result.bookingCompleted, true);
      assert.equal(result.newMessage, true);
      assert.equal(result.marketing, false);
    });

    it('should create preference with custom values', async () => {
      const result = await repository.create({
        userId: TEST_USERS.customer1,
        bookingCreated: false,
        marketing: true,
      });

      assert.equal(result.bookingCreated, false);
      assert.equal(result.marketing, true);
    });

    it('should generate UUID for id', async () => {
      const result = await repository.create({ userId: TEST_USERS.customer1 });

      assert.ok(result.id);
      // UUID format check (basic)
      assert.match(result.id, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });
  });

  describe('update', () => {
    it('should update single preference field', async () => {
      await repository.create({ userId: TEST_USERS.customer1 });

      const result = await repository.update(TEST_USERS.customer1, { bookingCreated: false });

      assert.ok(result);
      assert.equal(result.bookingCreated, false);
      // Other fields should remain unchanged
      assert.equal(result.bookingConfirmed, true);
    });

    it('should update multiple preference fields', async () => {
      await repository.create({ userId: TEST_USERS.customer1 });

      const result = await repository.update(TEST_USERS.customer1, {
        bookingCreated: false,
        bookingConfirmed: false,
        newMessage: false,
      });

      assert.ok(result);
      assert.equal(result.bookingCreated, false);
      assert.equal(result.bookingConfirmed, false);
      assert.equal(result.newMessage, false);
      // Unchanged fields
      assert.equal(result.bookingDeclined, true);
    });

    it('should update updatedAt timestamp', async () => {
      const created = await repository.create({ userId: TEST_USERS.customer1 });
      const originalUpdatedAt = created.updatedAt;

      // Small delay to ensure timestamp changes
      await new Promise((resolve) => setTimeout(resolve, 10));

      const result = await repository.update(TEST_USERS.customer1, { marketing: true });

      assert.ok(result);
      assert.ok(result.updatedAt > originalUpdatedAt);
    });

    it('should return null when user not found', async () => {
      const result = await repository.update(TEST_USERS.customer1, { bookingCreated: false });

      assert.equal(result, null);
    });
  });

  describe('upsert', () => {
    it('should create new record when user has no preferences', async () => {
      const result = await repository.upsert(TEST_USERS.customer1, { bookingCreated: false });

      assert.ok(result);
      assert.equal(result.userId, TEST_USERS.customer1);
      assert.equal(result.bookingCreated, false);
    });

    it('should update existing record when user has preferences', async () => {
      // First create
      await repository.create({ userId: TEST_USERS.customer1 });

      // Then upsert
      const result = await repository.upsert(TEST_USERS.customer1, { bookingCreated: false });

      assert.ok(result);
      assert.equal(result.bookingCreated, false);
    });

    it('should merge new values with existing values on update', async () => {
      // Create with custom value
      await repository.create({
        userId: TEST_USERS.customer1,
        marketing: true,
      });

      // Upsert with different field
      const result = await repository.upsert(TEST_USERS.customer1, { bookingCreated: false });

      assert.ok(result);
      assert.equal(result.bookingCreated, false);
      // Original custom value should be preserved
      assert.equal(result.marketing, true);
    });
  });
});
