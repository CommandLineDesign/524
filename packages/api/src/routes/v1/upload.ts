import { type Router as ExpressRouter, Router } from 'express';

import { UploadController } from '../../controllers/uploadController.js';
import { requireArtist } from '../../middleware/auth.js';

const router: ExpressRouter = Router();

router.post('/profile-photo/presign', requireArtist(), UploadController.presignProfilePhoto);

export const uploadRouter: ExpressRouter = router;
