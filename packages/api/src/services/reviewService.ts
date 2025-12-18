import { addDays, isAfter } from 'date-fns';

import { BookingRepository } from '../repositories/bookingRepository.js';
import { ReviewRepository, type CreateReviewPayload, type UpdateReviewPayload } from '../repositories/reviewRepository.js';
import { NotificationService } from './notificationService.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('review-service');

export interface SubmitReviewPayload {
  overallRating: number;
  qualityRating: number;
  professionalismRating: number;
  timelinessRating: number;
  reviewText?: string;
  reviewImages?: string[];
}

export class ReviewService {
  constructor(
    private readonly reviewRepository = new ReviewRepository(),
    private readonly bookingRepository = new BookingRepository(),
    private readonly notificationService = new NotificationService()
  ) {}

  /**
   * Submit a review for a completed booking
   */
  async submitReview(bookingId: string, customerId: string, payload: SubmitReviewPayload) {
    logger.info('Submitting review', { bookingId, customerId });

    // Validate rating values (1-5)
    const ratings = [
      payload.overallRating,
      payload.qualityRating,
      payload.professionalismRating,
      payload.timelinessRating,
    ];

    for (const rating of ratings) {
      if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
        throw new Error('All ratings must be integers between 1 and 5');
      }
    }

    // Check if booking exists and is completed
    const booking = await this.bookingRepository.getBookingById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.status !== 'completed') {
      throw new Error('Can only review completed bookings');
    }

    // Check if customer owns the booking
    if (booking.customerId !== customerId) {
      throw new Error('Only the booking customer can submit a review');
    }

    // Check if review already exists
    const existingReview = await this.reviewRepository.getReviewByBookingId(bookingId);
    if (existingReview) {
      throw new Error('Review already exists for this booking');
    }

    // Check 30-day window from completion
    const thirtyDaysAfterCompletion = addDays(booking.serviceCompletedAt || booking.createdAt, 30);
    if (isAfter(new Date(), thirtyDaysAfterCompletion)) {
      throw new Error('Review submission window has expired (30 days after completion)');
    }

    // Validate review text length
    if (payload.reviewText && payload.reviewText.length > 1000) {
      throw new Error('Review text cannot exceed 1000 characters');
    }

    // Create the review
    const review = await this.reviewRepository.createReview({
      bookingId,
      customerId,
      artistId: booking.artistId,
      ...payload,
    });

    // Send notification to artist
    try {
      await this.notificationService.sendNotification({
        userId: booking.artistId,
        type: 'review_received',
        title: 'New Review Received',
        message: `You received a ${payload.overallRating}-star review from a customer`,
        data: {
          bookingId,
          reviewId: review.id,
          rating: payload.overallRating,
        },
      });
    } catch (error) {
      logger.error('Failed to send review notification', { error, bookingId, artistId: booking.artistId });
      // Don't fail the review submission if notification fails
    }

    logger.info('Review submitted successfully', { reviewId: review.id, bookingId });
    return review;
  }

  /**
   * Update a review (within 24 hours of submission)
   */
  async updateReview(reviewId: string, customerId: string, payload: UpdateReviewPayload) {
    logger.info('Updating review', { reviewId, customerId });

    const review = await this.reviewRepository.getReviewById(reviewId);
    if (!review) {
      throw new Error('Review not found');
    }

    if (review.customerId !== customerId) {
      throw new Error('Only the review author can update the review');
    }

    // Check 24-hour edit window
    const twentyFourHoursAfterCreation = addDays(review.createdAt, 1);
    if (isAfter(new Date(), twentyFourHoursAfterCreation)) {
      throw new Error('Review can only be edited within 24 hours of submission');
    }

    // Validate ratings if provided
    const ratingsToValidate = [
      payload.overallRating,
      payload.qualityRating,
      payload.professionalismRating,
      payload.timelinessRating,
    ].filter(r => r !== undefined);

    for (const rating of ratingsToValidate) {
      if (rating! < 1 || rating! > 5 || !Number.isInteger(rating)) {
        throw new Error('All ratings must be integers between 1 and 5');
      }
    }

    // Validate review text length
    if (payload.reviewText && payload.reviewText.length > 1000) {
      throw new Error('Review text cannot exceed 1000 characters');
    }

    const updatedReview = await this.reviewRepository.updateReview(reviewId, payload);

    logger.info('Review updated successfully', { reviewId });
    return updatedReview;
  }

  /**
   * Get reviews for an artist
   */
  async getReviewsForArtist(artistId: string, limit = 20, offset = 0) {
    logger.debug('Getting reviews for artist', { artistId, limit, offset });
    return await this.reviewRepository.getReviewsForArtist(artistId, limit, offset);
  }

  /**
   * Get reviews for a customer
   */
  async getReviewsForCustomer(customerId: string, limit = 20, offset = 0) {
    logger.debug('Getting reviews for customer', { customerId, limit, offset });
    return await this.reviewRepository.getReviewsForCustomer(customerId, limit, offset);
  }

  /**
   * Get a specific review
   */
  async getReviewById(reviewId: string) {
    logger.debug('Getting review by ID', { reviewId });
    return await this.reviewRepository.getReviewById(reviewId);
  }
}