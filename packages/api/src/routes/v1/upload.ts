import { type Router as ExpressRouter, Router } from 'express';

import { UploadController } from '../../controllers/uploadController.js';
import { requireArtist, requireCustomer } from '../../middleware/auth.js';

const router: ExpressRouter = Router();

router.post('/profile-photo/presign', requireArtist(), UploadController.presignProfilePhoto);
router.post('/review-photo/presign', requireCustomer(), UploadController.presignReviewPhoto);

export const uploadRouter: ExpressRouter = router;
