import { type Router as IRouter, Router } from 'express';

import { UploadController } from '../../controllers/uploadController.js';
import { requireArtist, requireCustomer } from '../../middleware/auth.js';

const router = Router();

router.post('/profile-photo/presign', requireArtist(), UploadController.presignProfilePhoto);
router.post('/review-photos/presign', requireCustomer(), UploadController.presignReviewPhoto);

export const uploadRouter: IRouter = router;
