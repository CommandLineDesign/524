import { type Router as ExpressRouter, Router } from 'express';

import { AdminArtistController } from '../../controllers/adminArtistController.js';
import { requireAdmin } from '../../middleware/auth.js';

const router: ExpressRouter = Router();

router.get('/pending-artists', requireAdmin(), AdminArtistController.listPendingArtists);
router.get('/pending-artists/:artistId', requireAdmin(), AdminArtistController.getPendingArtist);

export const adminRouter: ExpressRouter = router;
