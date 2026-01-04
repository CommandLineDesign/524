import { type SQL, and, count, desc, eq, sql } from 'drizzle-orm';

import { type Review, reviewImages, reviews } from '@524/database';
import { db } from '../db/client.js';
import { createLogger } from '../utils/logger.js';

// Custom error classes for specific repository errors
export class ReviewNotFoundError extends Error {
  constructor(identifier: string) {
    super(`Review not found: ${identifier}`);
    this.name = 'ReviewNotFoundError';
  }
}

export class ReviewValidationError extends Error {
  constructor(message: string) {
    super(`Review validation error: ${message}`);
    this.name = 'ReviewValidationError';
  }
}

export class DuplicateReviewError extends Error {
  constructor(bookingId: string) {
    super(`Review already exists for booking: ${bookingId}`);
    this.name = 'DuplicateReviewError';
  }
}

// Validation functions
function validateUUID(id: string, fieldName: string): void {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    throw new ReviewValidationError(`${fieldName} must be a valid UUID`);
  }
}

function validateRating(rating: number, fieldName: string): void {
  if (typeof rating !== 'number' || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new ReviewValidationError(`${fieldName} must be an integer between 1 and 5`);
  }
}

function validateReviewText(text?: string): void {
  if (text && text.length > 1000) {
    throw new ReviewValidationError('Review text cannot exceed 1000 characters');
  }
}

function validatePaginationParams(limit: number, offset: number): void {
  if (limit < 1 || limit > 100) {
    throw new ReviewValidationError('Limit must be between 1 and 100');
  }
  if (offset < 0) {
    throw new ReviewValidationError('Offset must be non-negative');
  }
}

const logger = createLogger('review-repository');

// Mapping function to convert database Review to API response format
function mapReviewToResponse(review: Review, images?: string[]) {
  return {
    ...review,
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
    reviewImages: images,
  };
}

export interface CreateReviewPayload {
  bookingId: string;
  customerId: string;
  artistId: string;
  overallRating: number;
  qualityRating: number;
  professionalismRating: number;
  timelinessRating: number;
  reviewText?: string;
}

export interface ReviewImagePayload {
  s3Key: string;
  fileSize: number;
  mimeType: string;
  displayOrder: number;
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
    // Validate input parameters
    validateUUID(payload.bookingId, 'bookingId');
    validateUUID(payload.customerId, 'customerId');
    validateUUID(payload.artistId, 'artistId');
    validateRating(payload.overallRating, 'overallRating');
    validateRating(payload.qualityRating, 'qualityRating');
    validateRating(payload.professionalismRating, 'professionalismRating');
    validateRating(payload.timelinessRating, 'timelinessRating');
    validateReviewText(payload.reviewText);

    logger.info(
      {
        bookingId: payload.bookingId,
        customerId: payload.customerId,
      },
      'Creating review'
    );

    try {
      const result = await db
        .insert(reviews)
        .values({
          bookingId: payload.bookingId,
          customerId: payload.customerId,
          artistId: payload.artistId,
          overallRating: payload.overallRating,
          qualityRating: payload.qualityRating,
          professionalismRating: payload.professionalismRating,
          timelinessRating: payload.timelinessRating,
          reviewText: payload.reviewText,
        })
        .returning();

      return result[0];
    } catch (error) {
      // Handle unique constraint violations (duplicate reviews)
      const dbError = error as { code?: string; constraint?: string };
      if (dbError.code === '23505' && dbError.constraint?.includes('booking_id')) {
        throw new DuplicateReviewError(payload.bookingId);
      }
      throw error;
    }
  }

  async getReviewById(id: string) {
    validateUUID(id, 'reviewId');

    logger.debug({ id }, 'Getting review by ID');

    const result = await db.select().from(reviews).where(eq(reviews.id, id)).limit(1);
    return result[0] ? mapReviewToResponse(result[0]) : null;
  }

  async getReviewByBookingId(bookingId: string) {
    validateUUID(bookingId, 'bookingId');

    logger.debug({ bookingId }, 'Getting review by booking ID');

    const result = await db.select().from(reviews).where(eq(reviews.bookingId, bookingId)).limit(1);
    return result[0] || null;
  }

  async updateReview(id: string, payload: UpdateReviewPayload) {
    validateUUID(id, 'reviewId');

    // Validate rating fields if provided
    if (payload.overallRating !== undefined) {
      validateRating(payload.overallRating, 'overallRating');
    }
    if (payload.qualityRating !== undefined) {
      validateRating(payload.qualityRating, 'qualityRating');
    }
    if (payload.professionalismRating !== undefined) {
      validateRating(payload.professionalismRating, 'professionalismRating');
    }
    if (payload.timelinessRating !== undefined) {
      validateRating(payload.timelinessRating, 'timelinessRating');
    }
    validateReviewText(payload.reviewText);

    logger.info({ id }, 'Updating review');

    const result = await db
      .update(reviews)
      .set({
        ...payload,
        updatedAt: new Date(),
      })
      .where(eq(reviews.id, id))
      .returning();

    if (!result[0]) {
      throw new ReviewNotFoundError(id);
    }

    return result[0];
  }

  async deleteReview(id: string) {
    logger.info({ id }, 'Deleting review');

    const result = await db.delete(reviews).where(eq(reviews.id, id)).returning();
    return result[0] || null;
  }

  async getReviewsForArtist(artistId: string, limit = 20, offset = 0) {
    validateUUID(artistId, 'artistId');
    validatePaginationParams(limit, offset);

    logger.debug({ artistId, limit, offset }, 'Getting reviews for artist');

    try {
      const query = db
        .select()
        .from(reviews)
        .where(and(eq(reviews.artistId, artistId), eq(reviews.isVisible, true)))
        .orderBy(desc(reviews.createdAt))
        .limit(limit)
        .offset(offset);

      const rows = await query;

      // Fetch images for all reviews in a single query
      const reviewIds = rows.map((r) => r.id);
      const s3PublicBaseUrl = process.env.S3_PUBLIC_BASE_URL;

      let imagesByReviewId: Record<string, string[]> = {};
      if (reviewIds.length > 0) {
        const allImages = await db
          .select()
          .from(reviewImages)
          .where(sql`${reviewImages.reviewId} IN ${reviewIds}`)
          .orderBy(reviewImages.displayOrder);

        // Group images by review ID
        imagesByReviewId = allImages.reduce(
          (acc, img) => {
            const url = s3PublicBaseUrl ? `${s3PublicBaseUrl}/${img.s3Key}` : img.publicUrl;
            if (url) {
              if (!acc[img.reviewId]) {
                acc[img.reviewId] = [];
              }
              acc[img.reviewId].push(url);
            }
            return acc;
          },
          {} as Record<string, string[]>
        );
      }

      return rows.map((review) => mapReviewToResponse(review, imagesByReviewId[review.id]));
    } catch (error) {
      logger.error({ error, artistId }, 'Failed to get reviews for artist');
      throw error;
    }
  }

  async getReviewsForCustomer(customerId: string, limit = 20, offset = 0) {
    validateUUID(customerId, 'customerId');
    validatePaginationParams(limit, offset);

    logger.debug({ customerId, limit, offset }, 'Getting reviews for customer');

    const rows = await db
      .select()
      .from(reviews)
      .where(eq(reviews.customerId, customerId))
      .orderBy(reviews.createdAt)
      .limit(limit)
      .offset(offset);

    return rows.map((review) => mapReviewToResponse(review));
  }

  async createReviewImages(reviewId: string, imageKeys: ReviewImagePayload[]) {
    validateUUID(reviewId, 'reviewId');

    if (!imageKeys.length) {
      return;
    }

    logger.info({ reviewId, imageCount: imageKeys.length }, 'Creating review images');

    try {
      // Store only s3Key - publicUrl will be computed at query time
      const imageRecords = imageKeys.map((image) => ({
        reviewId,
        s3Key: image.s3Key,
        fileSize: image.fileSize,
        mimeType: image.mimeType,
        displayOrder: image.displayOrder,
        publicUrl: null, // Will be computed at query time from s3Key + S3_PUBLIC_BASE_URL
      }));

      await db.insert(reviewImages).values(imageRecords);
    } catch (error) {
      logger.error({ error, reviewId }, 'Failed to create review images');
      throw error;
    }
  }

  async getReviewImages(reviewId: string) {
    validateUUID(reviewId, 'reviewId');

    logger.debug({ reviewId }, 'Getting review images');

    const images = await db.select().from(reviewImages).where(eq(reviewImages.reviewId, reviewId));

    // Compute publicUrl at query time from s3Key + S3_PUBLIC_BASE_URL
    const s3PublicBaseUrl = process.env.S3_PUBLIC_BASE_URL;

    return images.map((image) => ({
      ...image,
      publicUrl: s3PublicBaseUrl ? `${s3PublicBaseUrl}/${image.s3Key}` : null,
    }));
  }

  async getArtistReviewStats(artistId: string) {
    validateUUID(artistId, 'artistId');
    const query = db
      .select({
        totalReviews: count(),
        averageOverallRating: sql<number>`ROUND(AVG(${reviews.overallRating}), 1)`,
        averageQualityRating: sql<number>`ROUND(AVG(${reviews.qualityRating}), 1)`,
        averageProfessionalismRating: sql<number>`ROUND(AVG(${reviews.professionalismRating}), 1)`,
        averageTimelinessRating: sql<number>`ROUND(AVG(${reviews.timelinessRating}), 1)`,
      })
      .from(reviews)
      .where(and(eq(reviews.artistId, artistId), eq(reviews.isVisible, true)));

    const [stats] = await query;

    return {
      totalReviews: stats.totalReviews ?? 0,
      averageOverallRating: Number(stats.averageOverallRating) || 0,
      averageQualityRating: Number(stats.averageQualityRating) || 0,
      averageProfessionalismRating: Number(stats.averageProfessionalismRating) || 0,
      averageTimelinessRating: Number(stats.averageTimelinessRating) || 0,
    };
  }

  async getAllReviewsCount(filters: { search?: string; isVisible?: boolean } = {}) {
    const conditions = [];

    if (filters.isVisible !== undefined) {
      conditions.push(eq(reviews.isVisible, filters.isVisible));
    }

    if (filters.search) {
      // Simple search on review text for now - could be expanded to search customer/artist names
      conditions.push(sql`${reviews.reviewText} ILIKE ${`%${filters.search}%`}`);
    }

    const [result] = await db
      .select({ count: count() })
      .from(reviews)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return result.count ?? 0;
  }

  async getAllReviews(params: {
    limit: number;
    offset: number;
    sortField: 'createdAt' | 'overallRating' | 'customerId' | 'artistId';
    sortOrder: 'ASC' | 'DESC';
    search?: string;
    isVisible?: boolean;
  }) {
    const conditions = [];

    if (params.isVisible !== undefined) {
      conditions.push(eq(reviews.isVisible, params.isVisible));
    }

    if (params.search) {
      // Simple search on review text for now - could be expanded to search customer/artist names
      conditions.push(sql`${reviews.reviewText} ILIKE ${`%${params.search}%`}`);
    }

    let orderBy: SQL;
    switch (params.sortField) {
      case 'createdAt':
        orderBy = params.sortOrder === 'DESC' ? desc(reviews.createdAt) : reviews.createdAt;
        break;
      case 'overallRating':
        orderBy = params.sortOrder === 'DESC' ? desc(reviews.overallRating) : reviews.overallRating;
        break;
      case 'customerId':
        orderBy = params.sortOrder === 'DESC' ? desc(reviews.customerId) : reviews.customerId;
        break;
      case 'artistId':
        orderBy = params.sortOrder === 'DESC' ? desc(reviews.artistId) : reviews.artistId;
        break;
      default:
        orderBy = desc(reviews.createdAt);
    }

    const rows = await db
      .select()
      .from(reviews)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(orderBy)
      .limit(params.limit)
      .offset(params.offset);

    return rows.map((review) => mapReviewToResponse(review));
  }
}
