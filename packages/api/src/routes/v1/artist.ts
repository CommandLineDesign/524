import { type Router as ExpressRouter, Router } from 'express';

import { ArtistController } from '../../controllers/artistController.js';
import { requireArtist } from '../../middleware/auth.js';

const router: ExpressRouter = Router();

router.get('/me/profile', requireArtist(), ArtistController.getMyProfile);
router.patch('/me/profile', requireArtist(), ArtistController.updateMyProfile);

router.get('/:artistId/reviews/stats', ArtistController.getArtistReviewStats);
router.get('/:artistId/reviews', ArtistController.getArtistReviews);
router.get('/:artistId', ArtistController.getArtistProfile);
router.patch('/:artistId', ArtistController.updateArtistProfile);
router.get('/', ArtistController.searchArtists);

export const artistRouter: ExpressRouter = router;
