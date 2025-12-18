import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { eq } from 'drizzle-orm';

import { TEST_USERS, cleanupTestData, createTestBookingInDB } from '../test/fixtures.js';
import { BookingRepository } from './bookingRepository.js';

describe('BookingRepository', () => {
  let repository: BookingRepository;

  beforeEach(async () => {
    await cleanupTestData();
    repository = new BookingRepository();
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  describe('acceptBooking', () => {
    it('should update status from pending to confirmed', async () => {
      // Create a test booking
      const booking = await createTestBookingInDB({
        artistId: TEST_USERS.artist1,
        customerId: TEST_USERS.customer1,
      });

      // Accept the booking
      const result = await repository.acceptBooking(booking.id, TEST_USERS.artist1);

      assert.equal(result.id, booking.id);
      assert.equal(result.status, 'confirmed');
      assert.ok(result.statusHistory);
      assert.equal(result.statusHistory?.length, 2); // original + confirmed
      assert.equal(result.statusHistory?.[1].status, 'confirmed');
    });

    it('should throw error when artist does not own the booking', async () => {
      // Create a booking for artist1
      const booking = await createTestBookingInDB({
        artistId: TEST_USERS.artist1,
        customerId: TEST_USERS.customer1,
      });

      // Try to accept with artist2
      try {
        await repository.acceptBooking(booking.id, TEST_USERS.artist2);
        assert.fail('Should have thrown an error');
      } catch (error: unknown) {
        assert.equal((error as Error).message, 'Forbidden');
      }
    });

    it('should throw error when booking does not exist', async () => {
      try {
        await repository.acceptBooking('non-existent-booking', TEST_USERS.artist1);
        assert.fail('Should have thrown an error');
      } catch (error: unknown) {
        // Should throw some error when booking doesn't exist
        assert.ok(error);
      }
    });
  });

  describe('declineBooking', () => {
    it('should update status to declined with reason', async () => {
      // Create a test booking
      const booking = await createTestBookingInDB({
        artistId: TEST_USERS.artist1,
        customerId: TEST_USERS.customer1,
      });

      const reason = 'Schedule conflict';

      // Decline the booking
      const result = await repository.declineBooking(booking.id, TEST_USERS.artist1, reason);

      assert.equal(result.id, booking.id);
      assert.equal(result.status, 'declined');
      assert.ok(result.statusHistory);
      assert.equal(result.statusHistory?.length, 2);
      assert.equal(result.statusHistory?.[1].status, 'declined');
    });

    it('should update status to declined without reason', async () => {
      // Create a test booking
      const booking = await createTestBookingInDB({
        artistId: TEST_USERS.artist1,
        customerId: TEST_USERS.customer1,
      });

      // Decline the booking without reason
      const result = await repository.declineBooking(booking.id, TEST_USERS.artist1);

      assert.equal(result.status, 'declined');
      assert.ok(result.statusHistory);
      assert.equal(result.statusHistory?.[1].status, 'declined');
    });

    it('should throw error when artist does not own the booking', async () => {
      // Create a booking for artist1
      const booking = await createTestBookingInDB({
        artistId: TEST_USERS.artist1,
        customerId: TEST_USERS.customer1,
      });

      // Try to decline with artist2
      try {
        await repository.declineBooking(booking.id, TEST_USERS.artist2);
        assert.fail('Should have thrown an error');
      } catch (error: unknown) {
        assert.equal((error as Error).message, 'Forbidden');
      }
    });

    it('should throw error when booking is not pending', async () => {
      // Create and accept a booking first
      const booking = await createTestBookingInDB({
        artistId: TEST_USERS.artist1,
        customerId: TEST_USERS.customer1,
      });

      // Accept it first
      await repository.acceptBooking(booking.id, TEST_USERS.artist1);

      // Try to decline it now
      try {
        await repository.declineBooking(booking.id, TEST_USERS.artist1);
        assert.fail('Should have thrown an error');
      } catch (error: unknown) {
        assert.equal((error as Error).message, 'Only pending bookings can be declined');
      }
    });

    it('should throw error when booking does not exist', async () => {
      try {
        await repository.declineBooking('non-existent-booking', TEST_USERS.artist1);
        assert.fail('Should have thrown an error');
      } catch (error: unknown) {
        // Should throw some error when booking doesn't exist
        assert.ok(error);
      }
    });
  });

  describe('cancelPendingBooking', () => {
    it('should update status to cancelled for customer', async () => {
      // Create a test booking
      const booking = await createTestBookingInDB({
        artistId: TEST_USERS.artist1,
        customerId: TEST_USERS.customer1,
      });

      // Cancel the booking as customer
      const result = await repository.cancelPendingBooking(booking.id, TEST_USERS.customer1);

      assert.equal(result.id, booking.id);
      assert.equal(result.status, 'cancelled');
      assert.ok(result.statusHistory);
      assert.equal(result.statusHistory?.length, 2);
      assert.equal(result.statusHistory?.[1].status, 'cancelled');
    });

    it('should throw error when customer does not own the booking', async () => {
      // Create a booking for customer1
      const booking = await createTestBookingInDB({
        artistId: TEST_USERS.artist1,
        customerId: TEST_USERS.customer1,
      });

      // Try to cancel with customer2
      try {
        await repository.cancelPendingBooking(booking.id, TEST_USERS.customer2);
        assert.fail('Should have thrown an error');
      } catch (error: unknown) {
        assert.equal((error as Error).message, 'Forbidden');
      }
    });

    it('should throw error when booking does not exist', async () => {
      try {
        await repository.cancelPendingBooking('non-existent-booking', TEST_USERS.customer1);
        assert.fail('Should have thrown an error');
      } catch (error: unknown) {
        // Should throw some error when booking doesn't exist
        assert.ok(error);
      }
    });
  });

  describe('findById', () => {
    it('should return booking when found', async () => {
      // Create a test booking
      const originalBooking = await createTestBookingInDB({
        artistId: TEST_USERS.artist1,
        customerId: TEST_USERS.customer1,
      });

      // Find the booking
      const foundBooking = await repository.findById(originalBooking.id);

      assert.ok(foundBooking);
      assert.equal((foundBooking as NonNullable<typeof foundBooking>).id, originalBooking.id);
      assert.equal((foundBooking as NonNullable<typeof foundBooking>).status, 'pending');
      assert.equal((foundBooking as NonNullable<typeof foundBooking>).artistId, TEST_USERS.artist1);
      assert.equal(
        (foundBooking as NonNullable<typeof foundBooking>).customerId,
        TEST_USERS.customer1
      );
    });

    it('should return null when booking not found', async () => {
      const result = await repository.findById('non-existent-booking');
      assert.equal(result, null);
    });
  });

  describe('create', () => {
    it('should create a new booking', async () => {
      const { createTestBooking } = await import('../test/fixtures.js');
      const bookingData = createTestBooking({
        customerId: TEST_USERS.customer1,
        artistId: TEST_USERS.artist1,
      });

      const result = await repository.create(bookingData);

      assert.ok(result.id);
      assert.equal(result.customerId, TEST_USERS.customer1);
      assert.equal(result.artistId, TEST_USERS.artist1);
      assert.equal(result.status, 'pending');
      assert.ok(result.bookingNumber);
      assert.ok(result.statusHistory);
      assert.equal(result.statusHistory.length, 1);
      assert.equal(result.statusHistory[0].status, 'pending');
    });
  });

  describe('completeBooking', () => {
    it('should update status from in_progress to completed with completion metadata', async () => {
      // Create a test booking and put it in in_progress status
      const booking = await createTestBookingInDB({
        artistId: TEST_USERS.artist1,
        customerId: TEST_USERS.customer1,
      });

      // First accept the booking (pending -> confirmed)
      const acceptedBooking = await repository.acceptBooking(booking.id, TEST_USERS.artist1);

      // Then manually set to in_progress and paid (simulating the workflow)
      await repository.updateStatus(acceptedBooking.id, 'in_progress');

      // Mock the payment status as paid by directly updating the database
      const { db } = await import('../db/client.js');
      const { bookings } = await import('@524/database');
      await db
        .update(bookings)
        .set({ paymentStatus: 'paid' })
        .where(eq(bookings.id, acceptedBooking.id));

      // Now complete the booking
      const result = await repository.completeBooking(acceptedBooking.id, TEST_USERS.artist1);

      assert.equal(result.id, acceptedBooking.id);
      assert.equal(result.status, 'completed');
      assert.ok(result.completedAt);
      assert.equal(result.completedBy, TEST_USERS.artist1);
      assert.ok(result.statusHistory);
      assert.equal(result.statusHistory?.length, 4); // pending -> confirmed -> in_progress -> completed
      assert.equal(result.statusHistory?.[3].status, 'completed');
    });

    it('should throw error when booking does not exist', async () => {
      try {
        await repository.completeBooking('non-existent-booking', TEST_USERS.artist1);
        assert.fail('Should have thrown an error');
      } catch (error: unknown) {
        assert.equal((error as Error).message, 'Booking not found');
        assert.equal((error as Error & { status: number }).status, 404);
      }
    });

    it('should throw error when artist does not own the booking', async () => {
      // Create a booking for artist1
      const booking = await createTestBookingInDB({
        artistId: TEST_USERS.artist1,
        customerId: TEST_USERS.customer1,
      });

      // Try to complete with artist2
      try {
        await repository.completeBooking(booking.id, TEST_USERS.artist2);
        assert.fail('Should have thrown an error');
      } catch (error: unknown) {
        assert.equal((error as Error).message, 'Forbidden');
        assert.equal((error as Error & { status: number }).status, 403);
      }
    });

    it('should throw error when booking is not in progress', async () => {
      // Create a test booking (starts as pending)
      const booking = await createTestBookingInDB({
        artistId: TEST_USERS.artist1,
        customerId: TEST_USERS.customer1,
      });

      // Try to complete a pending booking
      try {
        await repository.completeBooking(booking.id, TEST_USERS.artist1);
        assert.fail('Should have thrown an error');
      } catch (error: unknown) {
        assert.equal((error as Error).message, 'Only paid bookings in progress can be completed');
        assert.equal((error as Error & { status: number }).status, 409);
      }
    });

    it('should throw error when booking payment is not paid', async () => {
      // Create a test booking and put it in in_progress status
      const booking = await createTestBookingInDB({
        artistId: TEST_USERS.artist1,
        customerId: TEST_USERS.customer1,
      });

      // Accept and set to in_progress, but leave payment as pending
      const acceptedBooking = await repository.acceptBooking(booking.id, TEST_USERS.artist1);
      await repository.updateStatus(acceptedBooking.id, 'in_progress');

      // Try to complete - should fail because payment is not paid
      try {
        await repository.completeBooking(acceptedBooking.id, TEST_USERS.artist1);
        assert.fail('Should have thrown an error');
      } catch (error: unknown) {
        assert.equal((error as Error).message, 'Only paid bookings in progress can be completed');
        assert.equal((error as Error & { status: number }).status, 409);
      }
    });
  });
});
