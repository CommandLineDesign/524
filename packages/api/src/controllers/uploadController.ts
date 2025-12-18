import type { NextFunction, Response } from 'express';

import type { AuthRequest } from '../middleware/auth.js';
import { createPresignedUploadUrl } from '../utils/s3.js';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_PROFILE_PHOTO_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_REVIEW_PHOTO_BYTES = 5 * 1024 * 1024; // 5 MB per review photo

export const UploadController = {
  async presignProfilePhoto(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const contentType =
        (req.body?.contentType as string | undefined) ??
        (req.headers['x-upload-content-type'] as string | undefined);

      const contentLengthHeader =
        (req.body?.contentLength as number | string | undefined) ??
        (req.headers['x-upload-content-length'] as string | undefined) ??
        (req.headers['content-length'] as string | undefined);

      const contentLength =
        typeof contentLengthHeader === 'number'
          ? contentLengthHeader
          : contentLengthHeader
            ? Number(contentLengthHeader)
            : Number.NaN;

      if (!contentType || !ALLOWED_IMAGE_TYPES.includes(contentType)) {
        res.status(400).json({
          error: 'Invalid content type',
          allowed: ALLOWED_IMAGE_TYPES,
        });
        return;
      }

      if (!Number.isFinite(contentLength) || contentLength <= 0) {
        res.status(400).json({ error: 'Missing or invalid content length' });
        return;
      }

      if (contentLength > MAX_PROFILE_PHOTO_BYTES) {
        res.status(400).json({
          error: 'File too large',
          maxBytes: MAX_PROFILE_PHOTO_BYTES,
        });
        return;
      }

      const upload = await createPresignedUploadUrl({
        userId: req.user.id,
        folder: 'artist-profile-photos',
        contentType,
        contentLength,
        allowedContentTypes: ALLOWED_IMAGE_TYPES,
        maxBytes: MAX_PROFILE_PHOTO_BYTES,
      });

      res.json(upload);
    } catch (error) {
      next(error);
    }
  },

  async presignReviewPhoto(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const contentType =
        (req.body?.contentType as string | undefined) ??
        (req.headers['x-upload-content-type'] as string | undefined);

      const contentLengthHeader =
        (req.body?.contentLength as number | string | undefined) ??
        (req.headers['x-upload-content-length'] as string | undefined) ??
        (req.headers['content-length'] as string | undefined);

      const contentLength =
        typeof contentLengthHeader === 'number'
          ? contentLengthHeader
          : contentLengthHeader
            ? Number(contentLengthHeader)
            : Number.NaN;

      if (!contentType || !ALLOWED_IMAGE_TYPES.includes(contentType)) {
        res.status(400).json({
          error: 'Invalid content type',
          allowed: ALLOWED_IMAGE_TYPES,
        });
        return;
      }

      if (!Number.isFinite(contentLength) || contentLength <= 0) {
        res.status(400).json({ error: 'Missing or invalid content length' });
        return;
      }

      if (contentLength > MAX_REVIEW_PHOTO_BYTES) {
        res.status(400).json({
          error: 'File too large',
          maxBytes: MAX_REVIEW_PHOTO_BYTES,
        });
        return;
      }

      // Use bookingId from request body or params if provided for better folder organization
      const bookingId = req.body?.bookingId || req.params?.bookingId || req.user.id;

      const upload = await createPresignedUploadUrl({
        userId: bookingId,
        folder: 'review-photos',
        contentType,
        contentLength,
        allowedContentTypes: ALLOWED_IMAGE_TYPES,
        maxBytes: MAX_REVIEW_PHOTO_BYTES,
      });

      res.json(upload);
    } catch (error) {
      next(error);
    }
  },
};
