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

  if (!artistId) {
    return res.status(400).json({ error: 'artistId parameter is required' });
  }

  // Check for reserved keywords that would conflict with route patterns
  const reservedKeywords = ['reviews', 'stats', 'me'];
  if (reservedKeywords.includes(artistId.toLowerCase())) {
    return res.status(400).json({
      error: `Invalid artist ID: '${artistId}' is a reserved keyword`,
    });
  }

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
