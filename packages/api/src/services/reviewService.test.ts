import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import { addDays, subDays } from 'date-fns';

import type { BookingRepository } from '../repositories/bookingRepository.js';
import type { ReviewRepository } from '../repositories/reviewRepository.js';
import type { NotificationService } from '../services/notificationService.js';
import { TEST_USERS, createTestBookingWithStatus } from '../test/fixtures.js';
import type { SubmitReviewPayload } from './reviewService.js';
import { ReviewService } from './reviewService.js';

// Create mock functions
interface MockFn<T = unknown> {
  (...args: unknown[]): Promise<T>;
  calls: unknown[][];
  callCount(): number;
}

function createMock<T = unknown>(defaultReturn?: T): MockFn<T> {
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

// Mock dependencies
const mockReviewRepository = {
  createReview: createMock({ id: 'test-review-id', createdAt: new Date() }),
  getReviewByBookingId: createMock(null),
  getReviewById: createMock(null),
  updateReview: createMock({ id: 'test-review-id', updatedAt: new Date() }),
  getReviewsForArtist: createMock([]),
  getReviewsForCustomer: createMock([]),
};

const mockBookingRepository = {
  findById: createMock({
    id: 'test-booking-id',
    customerId: TEST_USERS.customer1,
    artistId: TEST_USERS.artist1,
    status: 'completed',
    completedAt: new Date(),
  }),
};

const mockNotificationService = {
  sendNotification: createMock(),
};

describe('ReviewService', () => {
  let service: ReviewService;

  beforeEach(() => {
    // Reset mock call counts
    for (const mock of Object.values(mockReviewRepository)) {
      mock.calls.length = 0;
    }
    for (const mock of Object.values(mockBookingRepository)) {
      mock.calls.length = 0;
    }
    for (const mock of Object.values(mockNotificationService)) {
      mock.calls.length = 0;
    }

    // Create service with mocked dependencies
    service = new ReviewService(
      mockReviewRepository as unknown as ReviewRepository,
      mockBookingRepository as unknown as BookingRepository,
      mockNotificationService as unknown as NotificationService
    );
  });

  describe('submitReview', () => {
    const validPayload: SubmitReviewPayload = {
      overallRating: 5,
      qualityRating: 4,
      professionalismRating: 5,
      timelinessRating: 4,
      reviewText: 'Great service!',
    };

    it('should successfully submit a review with valid data', async () => {
      const result = await service.submitReview('booking-id', TEST_USERS.customer1, validPayload);

      assert.strictEqual(mockReviewRepository.createReview.callCount(), 1);
      assert.strictEqual(mockNotificationService.sendNotification.callCount(), 1);
      assert(result.id, 'Should return review with ID');
    });

    it('should validate rating values - must be integers 1-5', async () => {
      const invalidPayloads = [
        { ...validPayload, overallRating: 0 },
        { ...validPayload, qualityRating: 6 },
        { ...validPayload, professionalismRating: 2.5 },
        { ...validPayload, timelinessRating: 3.5 },
      ];

      for (const payload of invalidPayloads) {
        await assert.rejects(
          service.submitReview('booking-id', TEST_USERS.customer1, payload),
          /All ratings must be integers between 1 and 5/
        );
      }
    });

    it('should reject review for non-existent booking', async () => {
      mockBookingRepository.findById = createMock(null);

      await assert.rejects(
        service.submitReview('non-existent-booking', TEST_USERS.customer1, validPayload),
        /Booking not found/
      );
    });

    it('should reject review for non-completed booking', async () => {
      mockBookingRepository.findById = createMock({
        id: 'booking-id',
        status: 'confirmed',
      });

      await assert.rejects(
        service.submitReview('booking-id', TEST_USERS.customer1, validPayload),
        /Can only review completed bookings/
      );
    });

    it('should reject review from non-customer', async () => {
      mockBookingRepository.findById = createMock({
        id: 'booking-id',
        customerId: TEST_USERS.customer2, // Different customer
        status: 'completed',
      });

      await assert.rejects(
        service.submitReview('booking-id', TEST_USERS.customer1, validPayload),
        /Only the booking customer can submit a review/
      );
    });

    it('should return existing review instead of creating duplicate (idempotent)', async () => {
      const existingReview = {
        id: 'existing-review',
        bookingId: 'booking-id',
        customerId: TEST_USERS.customer1,
        overallRating: 4,
        qualityRating: 4,
        professionalismRating: 4,
        timelinessRating: 4,
        reviewText: 'Original review',
        createdAt: new Date(),
      };

      // Ensure booking is valid and customer owns it
      mockBookingRepository.findById = createMock({
        id: 'booking-id',
        customerId: TEST_USERS.customer1,
        artistId: TEST_USERS.artist1,
        status: 'completed',
        completedAt: new Date(),
      });

      mockReviewRepository.getReviewByBookingId = createMock(existingReview);

      const result = await service.submitReview('booking-id', TEST_USERS.customer1, validPayload);

      // Should not call createReview or updateReview, just return existing
      assert.strictEqual(mockReviewRepository.createReview.callCount(), 0);
      assert.strictEqual(mockReviewRepository.updateReview.callCount(), 0);
      assert.strictEqual(result.id, 'existing-review', 'Should return existing review');
      assert.strictEqual(
        result.reviewText,
        'Original review',
        'Should return original content unchanged'
      );
    });

    it('should enforce 30-day submission window for new reviews', async () => {
      const thirtyOneDaysAgo = subDays(new Date(), 31);
      mockBookingRepository.findById = createMock({
        id: 'booking-id',
        customerId: TEST_USERS.customer1,
        status: 'completed',
        completedAt: thirtyOneDaysAgo,
      });

      await assert.rejects(
        service.submitReview('booking-id', TEST_USERS.customer1, validPayload),
        /Review submission window has expired/
      );
    });

    it('should validate review text length', async () => {
      const longText = 'a'.repeat(1001);
      const payloadWithLongText = { ...validPayload, reviewText: longText };

      await assert.rejects(
        service.submitReview('booking-id', TEST_USERS.customer1, payloadWithLongText),
        /Review text cannot exceed 1000 characters/
      );
    });

    it('should handle optional review text', async () => {
      const payloadWithoutText = { ...validPayload, reviewText: undefined };

      await service.submitReview('booking-id', TEST_USERS.customer1, payloadWithoutText);

      assert.strictEqual(mockReviewRepository.createReview.callCount(), 1);
    });

    it('should continue if notification fails', async () => {
      mockNotificationService.sendNotification = createMock();
      mockNotificationService.sendNotification = () =>
        Promise.reject(new Error('Notification failed'));

      const result = await service.submitReview('booking-id', TEST_USERS.customer1, validPayload);

      assert(result.id, 'Should still return review despite notification failure');
      assert.strictEqual(mockNotificationService.sendNotification.callCount(), 1);
    });

    it('should send correct notification data', async () => {
      await service.submitReview('booking-id', TEST_USERS.customer1, validPayload);

      const notificationCall = mockNotificationService.sendNotification.calls[0][0];
      assert.strictEqual(notificationCall.type, 'review_received');
      assert.strictEqual(notificationCall.title, 'New Review Received');
      assert(notificationCall.message.includes('5-star'));
      assert.strictEqual(notificationCall.data.bookingId, 'booking-id');
    });
  });

  describe('updateReview', () => {
    const updatePayload = {
      overallRating: 4,
      reviewText: 'Updated review text',
    };

    it('should successfully update review within 24 hours', async () => {
      const createdAt = new Date();
      mockReviewRepository.getReviewById = createMock({
        id: 'review-id',
        customerId: TEST_USERS.customer1,
        createdAt,
      });

      const result = await service.updateReview('review-id', TEST_USERS.customer1, updatePayload);

      assert.strictEqual(mockReviewRepository.updateReview.callCount(), 1);
      assert(result.id, 'Should return updated review');
    });

    it('should reject update for non-existent review', async () => {
      mockReviewRepository.getReviewById = createMock(null);

      await assert.rejects(
        service.updateReview('non-existent-review', TEST_USERS.customer1, updatePayload),
        /Review not found/
      );
    });

    it('should reject update from non-author', async () => {
      mockReviewRepository.getReviewById = createMock({
        id: 'review-id',
        customerId: TEST_USERS.customer2, // Different customer
      });

      await assert.rejects(
        service.updateReview('review-id', TEST_USERS.customer1, updatePayload),
        /Only the review author can update the review/
      );
    });

    it('should enforce 24-hour edit window', async () => {
      const twentyFiveHoursAgo = subDays(new Date(), 1);
      twentyFiveHoursAgo.setHours(twentyFiveHoursAgo.getHours() - 1);

      mockReviewRepository.getReviewById = createMock({
        id: 'review-id',
        customerId: TEST_USERS.customer1,
        createdAt: twentyFiveHoursAgo,
      });

      await assert.rejects(
        service.updateReview('review-id', TEST_USERS.customer1, updatePayload),
        /Review can only be edited within 24 hours of submission/
      );
    });

    it('should validate updated ratings', async () => {
      mockReviewRepository.getReviewById = createMock({
        id: 'review-id',
        customerId: TEST_USERS.customer1,
        createdAt: new Date(),
      });

      const invalidUpdate = { overallRating: 6 };

      await assert.rejects(
        service.updateReview('review-id', TEST_USERS.customer1, invalidUpdate),
        /All ratings must be integers between 1 and 5/
      );
    });

    it('should validate updated review text length', async () => {
      mockReviewRepository.getReviewById = createMock({
        id: 'review-id',
        customerId: TEST_USERS.customer1,
        createdAt: new Date(),
      });

      const longText = 'a'.repeat(1001);
      const updateWithLongText = { reviewText: longText };

      await assert.rejects(
        service.updateReview('review-id', TEST_USERS.customer1, updateWithLongText),
        /Review text cannot exceed 1000 characters/
      );
    });
  });

  describe('getReviewsForArtist', () => {
    it('should return reviews for artist', async () => {
      const mockReviews = [{ id: 'review-1' }, { id: 'review-2' }];
      mockReviewRepository.getReviewsForArtist = createMock(mockReviews);

      const result = await service.getReviewsForArtist(TEST_USERS.artist1, 10, 0);

      assert.strictEqual(result, mockReviews);
      assert.strictEqual(mockReviewRepository.getReviewsForArtist.callCount(), 1);
    });

    it('should use default pagination values', async () => {
      await service.getReviewsForArtist(TEST_USERS.artist1);

      const call = mockReviewRepository.getReviewsForArtist.calls[0];
      assert.strictEqual(call[1], 20); // default limit
      assert.strictEqual(call[2], 0); // default offset
    });
  });

  describe('getReviewsForCustomer', () => {
    it('should return reviews for customer', async () => {
      const mockReviews = [{ id: 'review-1' }];
      mockReviewRepository.getReviewsForCustomer = createMock(mockReviews);

      const result = await service.getReviewsForCustomer(TEST_USERS.customer1);

      assert.strictEqual(result, mockReviews);
      assert.strictEqual(mockReviewRepository.getReviewsForCustomer.callCount(), 1);
    });
  });

  describe('getReviewById', () => {
    it('should return review by ID', async () => {
      const mockReview = { id: 'review-id' };
      mockReviewRepository.getReviewById = createMock(mockReview);

      const result = await service.getReviewById('review-id');

      assert.strictEqual(result, mockReview);
      assert.strictEqual(mockReviewRepository.getReviewById.callCount(), 1);
    });
  });
});
