import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import type { NotificationPreference } from '@524/database';

import type { NotificationPreferenceRepository } from '../repositories/notificationPreferenceRepository.js';
import { TEST_USERS } from '../test/fixtures.js';
import { NotificationPreferenceService } from './notificationPreferenceService.js';

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

// Mock notification preference data
const mockPreference: NotificationPreference = {
  id: 'pref-id',
  userId: TEST_USERS.customer1,
  bookingCreated: true,
  bookingConfirmed: true,
  bookingDeclined: true,
  bookingCancelled: true,
  bookingInProgress: true,
  bookingCompleted: true,
  newMessage: true,
  marketing: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('NotificationPreferenceService', () => {
  let service: NotificationPreferenceService;
  let mockRepository: {
    findByUserId: MockFn<NotificationPreference | null>;
    create: MockFn<NotificationPreference>;
    update: MockFn<NotificationPreference | null>;
    upsert: MockFn<NotificationPreference>;
  };

  beforeEach(() => {
    mockRepository = {
      findByUserId: createMock<NotificationPreference | null>(mockPreference),
      create: createMock<NotificationPreference>(mockPreference),
      update: createMock<NotificationPreference | null>(mockPreference),
      upsert: createMock<NotificationPreference>(mockPreference),
    };

    service = new NotificationPreferenceService(
      mockRepository as unknown as NotificationPreferenceRepository
    );
  });

  describe('getPreferences', () => {
    it('should return existing preferences when found', async () => {
      const result = await service.getPreferences(TEST_USERS.customer1);

      assert.equal(mockRepository.findByUserId.callCount(), 1);
      assert.deepEqual(mockRepository.findByUserId.calls[0], [TEST_USERS.customer1]);
      assert.deepEqual(result, mockPreference);
    });

    it('should create default preferences when none exist', async () => {
      mockRepository.findByUserId = createMock<NotificationPreference | null>(null);

      const result = await service.getPreferences(TEST_USERS.customer1);

      assert.equal(mockRepository.findByUserId.callCount(), 1);
      assert.equal(mockRepository.create.callCount(), 1);
      assert.deepEqual(mockRepository.create.calls[0], [{ userId: TEST_USERS.customer1 }]);
      assert.deepEqual(result, mockPreference);
    });

    it('should return all preference fields correctly mapped', async () => {
      const result = await service.getPreferences(TEST_USERS.customer1);

      assert.equal(result.bookingCreated, true);
      assert.equal(result.bookingConfirmed, true);
      assert.equal(result.bookingDeclined, true);
      assert.equal(result.bookingCancelled, true);
      assert.equal(result.bookingInProgress, true);
      assert.equal(result.bookingCompleted, true);
      assert.equal(result.newMessage, true);
      assert.equal(result.marketing, false);
    });
  });

  describe('updatePreferences', () => {
    it('should call repository upsert with userId and updates', async () => {
      const updates = { bookingCreated: false };

      await service.updatePreferences(TEST_USERS.customer1, updates);

      assert.equal(mockRepository.upsert.callCount(), 1);
      assert.deepEqual(mockRepository.upsert.calls[0], [TEST_USERS.customer1, updates]);
    });

    it('should handle partial updates (single field)', async () => {
      const updates = { marketing: true };

      const result = await service.updatePreferences(TEST_USERS.customer1, updates);

      assert.equal(mockRepository.upsert.callCount(), 1);
      assert.deepEqual(mockRepository.upsert.calls[0][1], { marketing: true });
      assert.ok(result);
    });

    it('should handle multiple field updates', async () => {
      const updates = {
        bookingCreated: false,
        bookingConfirmed: false,
        newMessage: false,
      };

      await service.updatePreferences(TEST_USERS.customer1, updates);

      assert.equal(mockRepository.upsert.callCount(), 1);
      assert.deepEqual(mockRepository.upsert.calls[0][1], updates);
    });

    it('should return updated preferences', async () => {
      const updatedPrefs = { ...mockPreference, marketing: true };
      mockRepository.upsert = createMock<NotificationPreference>(updatedPrefs);

      const result = await service.updatePreferences(TEST_USERS.customer1, { marketing: true });

      assert.equal(result.marketing, true);
    });
  });

  describe('isNotificationEnabled', () => {
    it('should return true for enabled booking_created type', async () => {
      const result = await service.isNotificationEnabled(TEST_USERS.customer1, 'booking_created');

      assert.equal(result, true);
    });

    it('should return false for disabled notification type', async () => {
      const disabledPrefs = { ...mockPreference, bookingCreated: false };
      mockRepository.findByUserId = createMock<NotificationPreference | null>(disabledPrefs);

      const result = await service.isNotificationEnabled(TEST_USERS.customer1, 'booking_created');

      assert.equal(result, false);
    });

    it('should return true for unknown notification types (default enabled)', async () => {
      const result = await service.isNotificationEnabled(
        TEST_USERS.customer1,
        'unknown_notification_type'
      );

      assert.equal(result, true);
    });

    it('should map booking_confirmed to bookingConfirmed correctly', async () => {
      const prefs = { ...mockPreference, bookingConfirmed: false };
      mockRepository.findByUserId = createMock<NotificationPreference | null>(prefs);

      const result = await service.isNotificationEnabled(TEST_USERS.customer1, 'booking_confirmed');

      assert.equal(result, false);
    });

    it('should map booking_declined to bookingDeclined correctly', async () => {
      const prefs = { ...mockPreference, bookingDeclined: false };
      mockRepository.findByUserId = createMock<NotificationPreference | null>(prefs);

      const result = await service.isNotificationEnabled(TEST_USERS.customer1, 'booking_declined');

      assert.equal(result, false);
    });

    it('should map booking_cancelled to bookingCancelled correctly', async () => {
      const prefs = { ...mockPreference, bookingCancelled: false };
      mockRepository.findByUserId = createMock<NotificationPreference | null>(prefs);

      const result = await service.isNotificationEnabled(TEST_USERS.customer1, 'booking_cancelled');

      assert.equal(result, false);
    });

    it('should map booking_in_progress to bookingInProgress correctly', async () => {
      const prefs = { ...mockPreference, bookingInProgress: false };
      mockRepository.findByUserId = createMock<NotificationPreference | null>(prefs);

      const result = await service.isNotificationEnabled(
        TEST_USERS.customer1,
        'booking_in_progress'
      );

      assert.equal(result, false);
    });

    it('should map booking_completed to bookingCompleted correctly', async () => {
      const prefs = { ...mockPreference, bookingCompleted: false };
      mockRepository.findByUserId = createMock<NotificationPreference | null>(prefs);

      const result = await service.isNotificationEnabled(TEST_USERS.customer1, 'booking_completed');

      assert.equal(result, false);
    });

    it('should map new_message to newMessage correctly', async () => {
      const prefs = { ...mockPreference, newMessage: false };
      mockRepository.findByUserId = createMock<NotificationPreference | null>(prefs);

      const result = await service.isNotificationEnabled(TEST_USERS.customer1, 'new_message');

      assert.equal(result, false);
    });

    it('should map marketing to marketing correctly', async () => {
      // marketing defaults to false in our mock
      const result = await service.isNotificationEnabled(TEST_USERS.customer1, 'marketing');

      assert.equal(result, false);
    });

    it('should create default preferences if none exist when checking enabled', async () => {
      mockRepository.findByUserId = createMock<NotificationPreference | null>(null);

      await service.isNotificationEnabled(TEST_USERS.customer1, 'booking_created');

      // getPreferences should have been called which triggers create
      assert.equal(mockRepository.findByUserId.callCount(), 1);
      assert.equal(mockRepository.create.callCount(), 1);
    });
  });
});
