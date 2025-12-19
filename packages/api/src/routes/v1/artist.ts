import { type Router as ExpressRouter, Router } from 'express';
import type { NextFunction, Request, Response } from 'express';

import { ArtistController } from '../../controllers/artistController.js';
import { requireArtist } from '../../middleware/auth.js';
import { validateUUIDParam } from '../../utils/validation.js';

const router: ExpressRouter = Router();

/**
 * Validation middleware for artistId parameter
 */
function validateArtistId(req: Request, res: Response, next: NextFunction) {
  const artistId = req.params.artistId;

  const validation = validateUUIDParam(artistId, 'artistId');
  if (!validation.isValid && validation.error) {
    return res.status(validation.error.status).json({
      error: validation.error.message,
    });
  }

  next();
}

router.get('/me/profile', requireArtist(), ArtistController.getMyProfile);
router.patch('/me/profile', requireArtist(), ArtistController.updateMyProfile);

router.get('/:artistId/reviews/stats', validateArtistId, ArtistController.getArtistReviewStats);
router.get('/:artistId/reviews', validateArtistId, ArtistController.getArtistReviews);
router.get('/:artistId', validateArtistId, ArtistController.getArtistProfile);
router.patch('/:artistId', validateArtistId, ArtistController.updateArtistProfile);
router.get('/', ArtistController.searchArtists);

export const artistRouter: ExpressRouter = router;
