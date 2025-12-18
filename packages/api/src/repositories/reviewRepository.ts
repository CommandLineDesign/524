import { eq, and } from 'drizzle-orm';

import { db } from '../db/connection.js';
import { reviews } from '../../../database/src/schema/reviews.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('review-repository');

export interface CreateReviewPayload {
  bookingId: string;
  customerId: string;
  artistId: string;
  overallRating: number;
  qualityRating: number;
  professionalismRating: number;
  timelinessRating: number;
  reviewText?: string;
  reviewImages?: string[];
}

export interface UpdateReviewPayload {
  overallRating?: number;
  qualityRating?: number;
  professionalismRating?: number;
  timelinessRating?: number;
  reviewText?: string;
  reviewImages?: string[];
}

export class ReviewRepository {
  async createReview(payload: CreateReviewPayload) {
    logger.info('Creating review', { bookingId: payload.bookingId, customerId: payload.customerId });

    const result = await db.insert(reviews).values({
      bookingId: payload.bookingId,
      customerId: payload.customerId,
      artistId: payload.artistId,
      overallRating: payload.overallRating,
      qualityRating: payload.qualityRating,
      professionalismRating: payload.professionalismRating,
      timelinessRating: payload.timelinessRating,
      reviewText: payload.reviewText,
      reviewImages: payload.reviewImages,
    }).returning();

    return result[0];
  }

  async getReviewById(id: string) {
    logger.debug('Getting review by ID', { id });

    const result = await db.select().from(reviews).where(eq(reviews.id, id)).limit(1);
    return result[0] || null;
  }

  async getReviewByBookingId(bookingId: string) {
    logger.debug('Getting review by booking ID', { bookingId });

    const result = await db.select().from(reviews).where(eq(reviews.bookingId, bookingId)).limit(1);
    return result[0] || null;
  }

  async updateReview(id: string, payload: UpdateReviewPayload) {
    logger.info('Updating review', { id });

    const result = await db
      .update(reviews)
      .set({
        ...payload,
        updatedAt: new Date(),
      })
      .where(eq(reviews.id, id))
      .returning();

    return result[0] || null;
  }

  async deleteReview(id: string) {
    logger.info('Deleting review', { id });

    const result = await db.delete(reviews).where(eq(reviews.id, id)).returning();
    return result[0] || null;
  }

  async getReviewsForArtist(artistId: string, limit = 20, offset = 0) {
    logger.debug('Getting reviews for artist', { artistId, limit, offset });

    return await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.artistId, artistId), eq(reviews.isVisible, true)))
      .orderBy(reviews.createdAt)
      .limit(limit)
      .offset(offset);
  }

  async getReviewsForCustomer(customerId: string, limit = 20, offset = 0) {
    logger.debug('Getting reviews for customer', { customerId, limit, offset });

    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.customerId, customerId))
      .orderBy(reviews.createdAt)
      .limit(limit)
      .offset(offset);
  }
}