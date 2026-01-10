import { type Router as IRouter, NextFunction, Request, Response, Router } from 'express';

import { ReviewController } from '../../controllers/reviewController.js';
import { requireAuth } from '../../middleware/auth.js';
import { validateUUIDParam } from '../../utils/validation.js';

const router = Router();

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

// Route ordering: /stats must come before parameterized routes (/:id) to prevent conflicts
// Get aggregate review statistics for authenticated artist
router.get('/stats', requireAuth(['artist']), ReviewController.getReviewStats);

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

export const reviewRouter: IRouter = router;
