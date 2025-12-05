import { Router } from 'express';

import { ArtistController } from '../../controllers/artistController.js';

const router = Router();

router.get('/:artistId', ArtistController.getArtistProfile);
router.patch('/:artistId', ArtistController.updateArtistProfile);
router.get('/', ArtistController.searchArtists);

export const artistRouter = router;
