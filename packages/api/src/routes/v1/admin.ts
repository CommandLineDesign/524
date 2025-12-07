import { type Router as ExpressRouter, Router } from 'express';

import { AdminArtistController } from '../../controllers/adminArtistController.js';
import { AdminUserController } from '../../controllers/adminUserController.js';
import { requireAdmin } from '../../middleware/auth.js';

const router: ExpressRouter = Router();

router.get('/pending-artists', requireAdmin(), AdminArtistController.listPendingArtists);
router.get('/pending-artists/:artistId', requireAdmin(), AdminArtistController.getPendingArtist);
router.patch(
  '/pending-artists/:artistId',
  requireAdmin(),
  AdminArtistController.updatePendingArtist
);

router.get('/users', requireAdmin(), AdminUserController.listUsers);
router.get('/users/:id', requireAdmin(), AdminUserController.getUser);
router.put('/users/:id', requireAdmin(), AdminUserController.updateUser);

export const adminRouter: ExpressRouter = router;
