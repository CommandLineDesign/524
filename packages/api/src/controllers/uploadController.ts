import type { NextFunction, Response } from 'express';

import type { AuthRequest } from '../middleware/auth.js';
import { BookingRepository } from '../repositories/bookingRepository.js';
import { createLogger } from '../utils/logger.js';
import { createPresignedUploadUrl } from '../utils/s3.js';

const logger = createLogger('upload-controller');

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_PROFILE_PHOTO_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_REVIEW_PHOTO_BYTES = 5 * 1024 * 1024; // 5 MB per review photo

// Shared helper function for photo presign requests
async function presignPhotoUpload(
  req: AuthRequest,
  res: Response,
  options: {
    folder: string;
    maxBytes: number;
    getUserIdForFolder: (user: NonNullable<AuthRequest['user']>) => string;
    additionalValidation?: (req: AuthRequest, user: NonNullable<AuthRequest['user']>) => void;
  }
) {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  // At this point, req.user is guaranteed to be non-null
  const user = req.user;

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

  if (contentLength > options.maxBytes) {
    res.status(400).json({
      error: 'File too large',
      maxBytes: options.maxBytes,
    });
    return;
  }

  // Run additional validation if provided
  if (options.additionalValidation) {
    options.additionalValidation(req, user);
  }

  const userId = options.getUserIdForFolder(user);

  logger.info(
    {
      userId,
      folder: options.folder,
      contentType,
      contentLength,
      maxBytes: options.maxBytes,
    },
    'Generating presigned upload URL'
  );

  const upload = await createPresignedUploadUrl({
    userId,
    folder: options.folder,
    contentType,
    contentLength,
    allowedContentTypes: ALLOWED_IMAGE_TYPES,
    maxBytes: options.maxBytes,
  });

  res.json(upload);
}

export const UploadController = {
  async presignProfilePhoto(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await presignPhotoUpload(req, res, {
        folder: 'artist-profile-photos',
        maxBytes: MAX_PROFILE_PHOTO_BYTES,
        getUserIdForFolder: (user) => user.id,
      });
    } catch (error) {
      next(error);
    }
  },

  async presignReviewPhoto(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await presignPhotoUpload(req, res, {
        folder: 'review-photos',
        maxBytes: MAX_REVIEW_PHOTO_BYTES,
        getUserIdForFolder: (user) => req.body?.bookingId || req.params?.bookingId || user.id,
        additionalValidation: async (req, user) => {
          // bookingId is required for proper authorization validation in the review service
          const bookingId = req.body?.bookingId || req.params?.bookingId;
          if (!bookingId) {
            throw new Error('bookingId is required for review photo uploads');
          }

          // Verify customer owns the booking
          const bookingRepository = new BookingRepository();
          const booking = await bookingRepository.findById(bookingId);
          if (!booking || booking.customerId !== user.id) {
            throw new Error('Not authorized to upload photos for this booking');
          }
        },
      });
    } catch (error) {
      // Handle validation errors
      if (
        error instanceof Error &&
        (error.message === 'bookingId is required for review photo uploads' ||
          error.message === 'Not authorized to upload photos for this booking')
      ) {
        const statusCode =
          error.message === 'bookingId is required for review photo uploads' ? 400 : 403;
        res.status(statusCode).json({ error: error.message });
        return;
      }
      next(error);
    }
  },
};
