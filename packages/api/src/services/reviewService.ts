import { addDays, isAfter } from 'date-fns';

import { BookingRepository } from '../repositories/bookingRepository.js';
import {
  type CreateReviewPayload,
  ReviewRepository,
  type UpdateReviewPayload,
} from '../repositories/reviewRepository.js';
import { createLogger } from '../utils/logger.js';
import { ArtistService } from './artistService.js';
import { NotificationService } from './notificationService.js';

const logger = createLogger('review-service');

export interface SubmitReviewPayload {
  overallRating: number;
  qualityRating: number;
  professionalismRating: number;
  timelinessRating: number;
  reviewText?: string;
  reviewImageKeys?: Array<{
    s3Key: string;
    fileSize: number;
    mimeType: string;
    displayOrder: number;
  }>;
}

export class ReviewService {
  constructor(
    private readonly reviewRepository = new ReviewRepository(),
    private readonly bookingRepository = new BookingRepository(),
    private readonly notificationService = new NotificationService(),
    private readonly artistService = new ArtistService()
  ) {}

  /**
   * Validate that all ratings are integers between 1 and 5
   */
  private validateRatings(ratings: number[]): void {
    for (const rating of ratings) {
      if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
        throw new Error('All ratings must be integers between 1 and 5');
      }
    }
  }

  /**
   * Submit a review for a completed booking
   */
  async submitReview(bookingId: string, customerId: string, payload: SubmitReviewPayload) {
    logger.info({ bookingId, customerId }, 'Submitting review');

    // Validate rating values (1-5)
    this.validateRatings([
      payload.overallRating,
      payload.qualityRating,
      payload.professionalismRating,
      payload.timelinessRating,
    ]);

    // Check if booking exists and is completed
    const booking = await this.bookingRepository.findById(bookingId);
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
      // If review exists, return it (idempotent behavior)
      // This handles edge cases where the UI didn't update properly after submission
      logger.warn(
        { bookingId, existingReviewId: existingReview.id },
        'Review submission attempted for booking that already has a review'
      );
      return existingReview;
    }

    // Check 30-day window from completion (only for new reviews)
    if (!booking.completedAt) {
      throw new Error('Booking completion date not available');
    }
    const thirtyDaysAfterCompletion = addDays(new Date(booking.completedAt), 30);
    if (isAfter(new Date(), thirtyDaysAfterCompletion)) {
      throw new Error('Review submission window has expired (30 days after completion)');
    }

    // Validate review text length
    if (payload.reviewText && payload.reviewText.length > 1000) {
      throw new Error('Review text cannot exceed 1000 characters');
    }

    // Create the review (without images first)
    const review = await this.reviewRepository.createReview({
      bookingId,
      customerId,
      artistId: booking.artistId,
      overallRating: payload.overallRating,
      qualityRating: payload.qualityRating,
      professionalismRating: payload.professionalismRating,
      timelinessRating: payload.timelinessRating,
      reviewText: payload.reviewText,
      // reviewImages will be handled separately
    });

    // Create review image records if any photos were uploaded
    if (payload.reviewImageKeys && payload.reviewImageKeys.length > 0) {
      await this.reviewRepository.createReviewImages(review.id, payload.reviewImageKeys);
    }

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
          rating: payload.overallRating.toString(),
        },
      });
    } catch (error) {
      logger.error(
        {
          error,
          bookingId,
          artistId: booking.artistId,
          metric: 'review_notification_failure',
        },
        'Failed to send review notification'
      );
      // Don't fail the review submission if notification fails
    }

    // Update artist review statistics
    try {
      await this.artistService.recalculateArtistReviewStats(review.artistId);
    } catch (error) {
      logger.error(
        { error, artistId: review.artistId, reviewId: review.id },
        'Failed to update artist review statistics after review submission'
      );
      // Don't fail the review submission if stats update fails
    }

    logger.info({ reviewId: review.id, bookingId }, 'Review submitted successfully');
    return review;
  }

  /**
   * Update a review (within 24 hours of submission)
   */
  async updateReview(reviewId: string, customerId: string, payload: UpdateReviewPayload) {
    logger.info({ reviewId, customerId }, 'Updating review');

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
    ].filter((r) => r !== undefined);

    if (ratingsToValidate.length > 0) {
      this.validateRatings(ratingsToValidate);
    }

    // Validate review text length
    if (payload.reviewText && payload.reviewText.length > 1000) {
      throw new Error('Review text cannot exceed 1000 characters');
    }

    const updatedReview = await this.reviewRepository.updateReview(reviewId, payload);

    // Update artist review statistics
    try {
      await this.artistService.recalculateArtistReviewStats(updatedReview.artistId);
    } catch (error) {
      logger.error(
        { error, artistId: updatedReview.artistId, reviewId },
        'Failed to update artist review statistics after review update'
      );
      // Don't fail the review update if stats update fails
    }

    logger.info({ reviewId }, 'Review updated successfully');
    return updatedReview;
  }

  /**
   * Get reviews for an artist with hasMore detection
   * @param artistId The artist ID
   * @param limit The number of reviews to return (excluding the extra item for hasMore detection)
   * @param offset The pagination offset
   * @returns Object with reviews array and hasMore boolean
   */
  async getReviewsForArtistWithPagination(artistId: string, limit = 20, offset = 0) {
    logger.debug({ artistId, limit, offset }, 'Getting reviews for artist with pagination');

    // Fetch limit + 1 items to detect if there are more results
    const reviews = await this.reviewRepository.getReviewsForArtist(artistId, limit + 1, offset);

    const hasMore = reviews.length > limit;
    const reviewsToReturn = hasMore ? reviews.slice(0, limit) : reviews;

    return {
      reviews: reviewsToReturn,
      hasMore,
    };
  }

  /**
   * Get reviews for an artist (legacy method - prefer getReviewsForArtistWithPagination)
   */
  async getReviewsForArtist(artistId: string, limit = 20, offset = 0) {
    logger.debug({ artistId, limit, offset }, 'Getting reviews for artist');
    return await this.reviewRepository.getReviewsForArtist(artistId, limit, offset);
  }

  /**
   * Get reviews for a customer
   */
  async getReviewsForCustomer(customerId: string, limit = 20, offset = 0) {
    logger.debug({ customerId, limit, offset }, 'Getting reviews for customer');
    return await this.reviewRepository.getReviewsForCustomer(customerId, limit, offset);
  }

  /**
   * Get a specific review
   */
  async getReviewById(reviewId: string) {
    logger.debug({ reviewId }, 'Getting review by ID');
    return await this.reviewRepository.getReviewById(reviewId);
  }

  /**
   * Get aggregate statistics for an artist's reviews
   */
  async getArtistReviewStats(artistId: string) {
    return await this.reviewRepository.getArtistReviewStats(artistId);
  }
}
