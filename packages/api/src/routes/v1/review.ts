import { type Router as ExpressRouter, NextFunction, Request, Response, Router } from 'express';

import { ReviewController } from '../../controllers/reviewController.js';
import { requireAuth } from '../../middleware/auth.js';
import { validateUUIDParam } from '../../utils/validation.js';

const router: ExpressRouter = Router();

/**
 * Validation middleware for reviewId parameter
 */
function validateReviewId(req: Request, res: Response, next: NextFunction) {
  const reviewId = req.params.id;

  const validation = validateUUIDParam(reviewId, 'reviewId');
  if (!validation.isValid && validation.error) {
    return res.status(validation.error.status).json({
      error: validation.error.message,
    });
  }

  next();
}

// Get reviews for authenticated user
// - Customers see reviews they've written
// - Artists see reviews they've received
// - Dual-role users can specify ?role=customer or ?role=artist
router.get('/', requireAuth(['customer', 'artist']), ReviewController.getReviews);

// Get specific review by ID
router.get(
  '/:id',
  requireAuth(['customer', 'artist', 'admin']),
  validateReviewId,
  ReviewController.getReviewById
);

export const reviewRouter: ExpressRouter = router;
