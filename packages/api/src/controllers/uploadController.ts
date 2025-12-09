import type { NextFunction, Response } from 'express';

import type { AuthRequest } from '../middleware/auth.js';
import { createPresignedUploadUrl } from '../utils/s3.js';

export const UploadController = {
  async presignProfilePhoto(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const contentType =
        (req.body?.contentType as string | undefined) ??
        (req.headers['x-upload-content-type'] as string | undefined) ??
        'image/jpeg';

      const upload = await createPresignedUploadUrl({
        userId: req.user.id,
        folder: 'artist-profile-photos',
        contentType,
      });

      res.json(upload);
    } catch (error) {
      next(error);
    }
  },
};
