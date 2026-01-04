import type { ReviewImage } from '@524/database';
import type { NextFunction, Request, Response } from 'express';

import { AdminReviewRepository } from '../repositories/adminReviewRepository.js';
import { ReviewRepository } from '../repositories/reviewRepository.js';
import { createLogger } from '../utils/logger.js';

const adminReviewRepository = new AdminReviewRepository();
const reviewRepository = new ReviewRepository();
const logger = createLogger('admin-review-controller');

export const AdminReviewController = {
  async listReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const page =
        typeof req.query.page === 'string'
          ? Number.parseInt(req.query.page, 10)
          : typeof req.query._page === 'string'
            ? Number.parseInt(req.query._page, 10)
            : 1;
      const perPage =
        typeof req.query.perPage === 'string'
          ? Number.parseInt(req.query.perPage, 10)
          : typeof req.query._perPage === 'string'
            ? Number.parseInt(req.query._perPage, 10)
            : 25;
      const sortField =
        (req.query.sortField as
          | 'createdAt'
          | 'overallRating'
          | 'customerId'
          | 'artistId'
          | undefined) ??
        (req.query._sort as
          | 'createdAt'
          | 'overallRating'
          | 'customerId'
          | 'artistId'
          | undefined) ??
        'createdAt';
      const sortOrder =
        (req.query.sortOrder as 'ASC' | 'DESC' | undefined) ??
        (req.query._order as 'ASC' | 'DESC' | undefined) ??
        'DESC';
      const search = req.query.search as string | undefined;
      const isVisible =
        req.query.isVisible === 'true' ? true : req.query.isVisible === 'false' ? false : undefined;

      // Get total count
      const totalQuery = await adminReviewRepository.getAllReviewsCount({ search, isVisible });

      // Get paginated results with related data
      const reviews = await adminReviewRepository.getAllReviews({
        limit: Number.isNaN(perPage) ? 25 : Math.max(perPage, 1),
        offset: Number.isNaN(page) ? 0 : Math.max((page - 1) * perPage, 0),
        sortField,
        sortOrder,
        search,
        isVisible,
      });

      res.json({
        data: reviews,
        total: totalQuery,
      });
    } catch (error) {
      logger.error({ error }, 'Failed to list reviews for admin');
      next(error);
    }
  },

  async getReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const review = await adminReviewRepository.getReviewById(id);

      if (!review) {
        res.status(404).json({ error: 'Review not found' });
        return;
      }

      // Get review images
      let images: ReviewImage[] = [];
      try {
        images = await reviewRepository.getReviewImages(id);
      } catch (error) {
        console.error('Failed to get review images:', error);
        // Continue without images - table might not be created yet
      }

      // Get customer and artist details (simplified - in real implementation might join with user tables)
      const reviewWithDetails = {
        ...review,
        reviewImages: images,
        // Note: In a full implementation, you'd join with user tables to get customer/artist names
        // For now, just return the IDs
      };

      res.json({ data: reviewWithDetails });
    } catch (error) {
      logger.error({ error, reviewId: req.params.id }, 'Failed to get review for admin');
      next(error);
    }
  },
};
