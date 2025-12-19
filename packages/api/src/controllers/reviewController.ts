import type { NextFunction, Response } from 'express';

import type { Review } from '@524/database';

import type { AuthRequest } from '../middleware/auth.js';
import { ReviewService } from '../services/reviewService.js';
import { createLogger } from '../utils/logger.js';

const reviewService = new ReviewService();
const logger = createLogger('review-controller');

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

      const userRoles = (req.user as { roles?: string[] }).roles || [];
      const isCustomer = userRoles.includes('customer');
      const isArtist = userRoles.includes('artist');

      // Parse pagination params
      const MAX_LIMIT = 50;
      const DEFAULT_LIMIT = 20;
      const rawLimit = Number(req.query.limit);
      const rawOffset = Number(req.query.offset);
      const limit = Number.isFinite(rawLimit)
        ? Math.min(Math.max(rawLimit, 1), MAX_LIMIT)
        : DEFAULT_LIMIT;
      const offset = Number.isFinite(rawOffset) ? Math.max(rawOffset, 0) : 0;

      let reviews: Review[];

      // Customers see reviews they've written
      if (isCustomer && !isArtist) {
        logger.debug({ userId: req.user.id, limit, offset }, 'Getting customer reviews');
        reviews = await reviewService.getReviewsForCustomer(req.user.id, limit, offset);
      }
      // Artists see reviews they've received
      else if (isArtist && !isCustomer) {
        logger.debug({ userId: req.user.id, limit, offset }, 'Getting artist reviews');
        reviews = await reviewService.getReviewsForArtist(req.user.id, limit, offset);
      }
      // If user has both roles, allow them to specify via query param
      else if (isCustomer && isArtist) {
        const role = req.query.role === 'artist' ? 'artist' : 'customer';
        logger.debug(
          { userId: req.user.id, role, limit, offset },
          'Getting reviews for dual-role user'
        );

        if (role === 'artist') {
          reviews = await reviewService.getReviewsForArtist(req.user.id, limit, offset);
        } else {
          reviews = await reviewService.getReviewsForCustomer(req.user.id, limit, offset);
        }
      } else {
        res.status(403).json({ error: 'User must have customer or artist role' });
        return;
      }

      res.json({
        reviews,
        pagination: {
          limit,
          offset,
          hasMore: reviews.length === limit,
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
      const userRoles = (req.user as { roles?: string[] }).roles || [];
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
};
