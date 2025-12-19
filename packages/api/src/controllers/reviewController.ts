import type { NextFunction, Response } from 'express';

import type { Review } from '@524/database';

import type { AuthRequest } from '../middleware/auth.js';
import { ReviewService } from '../services/reviewService.js';
import { createLogger } from '../utils/logger.js';
import { parsePaginationParams } from '../utils/pagination.js';

const reviewService = new ReviewService();
const logger = createLogger('review-controller');

/**
 * Safely extract user roles from request
 */
function getUserRoles(req: AuthRequest): string[] {
  return (
    (Array.isArray((req.user as { roles?: string[] } | undefined)?.roles) &&
      ((req.user as { roles?: string[] }).roles as string[])) ||
    []
  );
}

/**
 * Determine the effective role for review fetching
 */
function determineRole(
  isCustomer: boolean,
  isArtist: boolean,
  queryRole?: string
): 'customer' | 'artist' | null {
  // If user has both roles, use query param, default to customer
  if (isCustomer && isArtist) {
    return queryRole === 'artist' ? 'artist' : 'customer';
  }
  // Single role users
  if (isCustomer) return 'customer';
  if (isArtist) return 'artist';
  return null;
}

export const ReviewController = {
  /**
   * GET /api/v1/reviews
   * Get reviews for the authenticated user
   * - For customers: returns reviews they've written
   * - For artists: returns reviews they've received
   */
  async getReviews(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const userRoles = getUserRoles(req);
      const isCustomer = userRoles.includes('customer');
      const isArtist = userRoles.includes('artist');

      // Parse pagination params
      const { limit, offset } = parsePaginationParams(req.query, { limit: 20, maxLimit: 50 });

      const role = determineRole(isCustomer, isArtist, req.query.role as string);
      if (!role) {
        res.status(403).json({ error: 'User must have customer or artist role' });
        return;
      }

      if (process.env.NODE_ENV === 'development') {
        logger.debug({ userId: req.user.id, role, limit, offset }, 'Getting reviews');
      }

      const reviews =
        role === 'artist'
          ? await reviewService.getReviewsForArtist(req.user.id, limit + 1, offset)
          : await reviewService.getReviewsForCustomer(req.user.id, limit + 1, offset);

      const hasMore = reviews.length > limit;
      const reviewsToReturn = hasMore ? reviews.slice(0, limit) : reviews;

      res.json({
        reviews: reviewsToReturn,
        pagination: {
          limit,
          offset,
          hasMore,
        },
      });
    } catch (error) {
      logger.error({ error }, 'Failed to get reviews');
      next(error);
    }
  },

  /**
   * GET /api/v1/reviews/:id
   * Get a specific review by ID
   */
  async getReviewById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const { id } = req.params;
      const review = await reviewService.getReviewById(id);

      if (!review) {
        res.status(404).json({ error: 'Review not found' });
        return;
      }

      // Authorization: user must be the customer or artist in the review
      const userRoles = getUserRoles(req);
      const isAdmin = userRoles.includes('admin');
      const isReviewCustomer = review.customerId === req.user.id;
      const isReviewArtist = review.artistId === req.user.id;

      if (!isAdmin && !isReviewCustomer && !isReviewArtist) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      res.json(review);
    } catch (error) {
      logger.error({ error, reviewId: req.params.id }, 'Failed to get review');
      next(error);
    }
  },

  /**
   * GET /api/v1/reviews/stats
   * Get aggregate review statistics for the authenticated artist
   */
  async getReviewStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const userRoles = getUserRoles(req);
      const isArtist = userRoles.includes('artist');

      if (!isArtist) {
        res.status(403).json({ error: 'User must have artist role' });
        return;
      }

      const stats = await reviewService.getArtistReviewStats(req.user.id);
      res.json(stats);
    } catch (error) {
      logger.error({ error }, 'Failed to get review stats');
      next(error);
    }
  },
};
