import type { NextFunction, Request, Response } from 'express';

import { BOOKING_STATUS } from '@524/shared';

import type { AuthRequest } from '../middleware/auth.js';
import { BookingService } from '../services/bookingService.js';
import { OnboardingService } from '../services/onboardingService.js';
import { ReviewService, type SubmitReviewPayload } from '../services/reviewService.js';

interface ReviewImageKey {
  s3Key: string;
  fileSize: number;
  mimeType: string;
  displayOrder: number;
}

const bookingService = new BookingService();
const reviewService = new ReviewService();
const onboardingService = new OnboardingService();

// Utility function to extract user roles from request
function getUserRoles(req: AuthRequest): string[] {
  return (
    (Array.isArray((req.user as { roles?: string[] } | undefined)?.roles) &&
      ((req.user as { roles?: string[] }).roles as string[])) ||
    []
  );
}

// Utility function to check if user can access a booking
function canAccessBooking(
  booking: { customerId: string; artistId: string },
  userId: string,
  roles: string[]
): boolean {
  const isCustomer = roles.includes('customer');
  const isArtist = roles.includes('artist');
  const isAdmin = roles.includes('admin');

  if (isAdmin) return true;
  if (!isCustomer && !isArtist) return false;
  if (isCustomer && booking.customerId !== userId) return false;
  if (isArtist && booking.artistId !== userId) return false;

  return true;
}

export const BookingController = {
  async listCustomerBookings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const statusParam = typeof req.query.status === 'string' ? req.query.status : undefined;
      const normalizedStatus =
        statusParam && (BOOKING_STATUS as readonly string[]).includes(statusParam)
          ? (statusParam as (typeof BOOKING_STATUS)[number])
          : undefined;
      const MAX_LIMIT = 50;
      const DEFAULT_LIMIT = 20;
      const rawLimit = Number(req.query.limit);
      const rawOffset = Number(req.query.offset);
      const limit = Number.isFinite(rawLimit)
        ? Math.min(Math.max(rawLimit, 1), MAX_LIMIT)
        : DEFAULT_LIMIT;
      const offset = Number.isFinite(rawOffset) ? Math.max(rawOffset, 0) : 0;

      const bookings = await bookingService.listCustomerBookings(req.user.id, normalizedStatus, {
        limit,
        offset,
      });
      res.json(bookings);
    } catch (error) {
      next(error);
    }
  },

  async listArtistBookings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const statusParam = typeof req.query.status === 'string' ? req.query.status : undefined;
      const normalizedStatus =
        statusParam && (BOOKING_STATUS as readonly string[]).includes(statusParam)
          ? (statusParam as (typeof BOOKING_STATUS)[number])
          : undefined;
      const MAX_LIMIT = 50;
      const DEFAULT_LIMIT = 20;
      const rawLimit = Number(req.query.limit);
      const rawOffset = Number(req.query.offset);
      const limit = Number.isFinite(rawLimit)
        ? Math.min(Math.max(rawLimit, 1), MAX_LIMIT)
        : DEFAULT_LIMIT;
      const offset = Number.isFinite(rawOffset) ? Math.max(rawOffset, 0) : 0;

      const bookings = await bookingService.listArtistBookings(req.user.id, normalizedStatus, {
        limit,
        offset,
      });
      res.json(bookings);
    } catch (error) {
      next(error);
    }
  },

  async createBooking(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      if (!req.body.artistId) {
        res.status(400).json({ error: 'artistId is required' });
        return;
      }

      const booking = await bookingService.createBooking({
        ...req.body,
        customerId: req.user.id,
      });
      res.status(201).json(booking);
    } catch (error) {
      next(error);
    }
  },

  async getBookingById(req: Request, res: Response, next: NextFunction) {
    try {
      const booking = await bookingService.getBookingById(req.params.bookingId);
      if (!booking) {
        res.status(404).json({ error: 'Booking not found' });
        return;
      }

      const authReq = req as AuthRequest;
      const requesterRoles = getUserRoles(authReq);

      if (!canAccessBooking(booking, authReq.user?.id || '', requesterRoles)) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      res.json(booking);
    } catch (error) {
      next(error);
    }
  },

  async updateBookingStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const requestedStatus = typeof req.body.status === 'string' ? req.body.status : undefined;
      if (!requestedStatus) {
        res.status(400).json({ error: 'status is required' });
        return;
      }

      const requesterRoles = getUserRoles(req);
      const isArtist = requesterRoles.includes('artist');
      const isAdmin = requesterRoles.includes('admin');

      if ((requestedStatus === 'confirmed' || requestedStatus === 'declined') && isArtist) {
        const booking =
          requestedStatus === 'confirmed'
            ? await bookingService.acceptBooking(req.params.bookingId, req.user.id)
            : await bookingService.declineBooking(req.params.bookingId, req.user.id);
        res.json(booking);
        return;
      }

      if (requestedStatus === 'confirmed' || requestedStatus === 'declined') {
        res.status(403).json({ error: 'Only artists can accept or decline bookings' });
        return;
      }

      if (!isArtist && !isAdmin) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      const booking = await bookingService.updateBookingStatusValidated(
        req.params.bookingId,
        requestedStatus,
        { id: req.user.id, roles: requesterRoles }
      );
      res.json(booking);
    } catch (error) {
      next(error);
    }
  },

  async acceptBooking(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }
      const booking = await bookingService.acceptBooking(req.params.bookingId, req.user.id);
      res.json(booking);
    } catch (error) {
      next(error);
    }
  },

  async declineBooking(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }
      const reason = typeof req.body?.reason === 'string' ? req.body.reason : undefined;
      const booking = await bookingService.declineBooking(
        req.params.bookingId,
        req.user.id,
        reason
      );
      res.json(booking);
    } catch (error) {
      next(error);
    }
  },

  async cancelPendingBooking(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }
      const booking = await bookingService.cancelPendingBooking(req.params.bookingId, req.user.id);
      res.json(booking);
    } catch (error) {
      next(error);
    }
  },

  async cancelConfirmedBooking(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const reason = req.body?.reason;
      if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
        res.status(400).json({ error: 'Cancellation reason is required' });
        return;
      }

      if (reason.length > 500) {
        res.status(400).json({ error: 'Cancellation reason cannot exceed 500 characters' });
        return;
      }

      const booking = await bookingService.cancelConfirmedBooking(
        req.params.bookingId,
        req.user.id,
        reason.trim()
      );
      res.json(booking);
    } catch (error) {
      next(error);
    }
  },

  async completeBooking(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const booking = await bookingService.completeBooking(req.params.bookingId, req.user.id);
      res.json(booking);
    } catch (error) {
      next(error);
    }
  },

  async submitReview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const { bookingId } = req.params;
      const userId = req.user.id;

      // Validate required rating fields
      if (
        typeof req.body.overallRating !== 'number' ||
        typeof req.body.qualityRating !== 'number' ||
        typeof req.body.professionalismRating !== 'number' ||
        typeof req.body.timelinessRating !== 'number'
      ) {
        res.status(400).json({ error: 'All rating fields are required and must be numbers' });
        return;
      }

      // Validate rating ranges
      if (
        [
          req.body.overallRating,
          req.body.qualityRating,
          req.body.professionalismRating,
          req.body.timelinessRating,
        ].some((r) => r < 1 || r > 5 || !Number.isInteger(r))
      ) {
        res.status(400).json({ error: 'All ratings must be integers between 1 and 5' });
        return;
      }

      // Validate reviewText
      if (req.body.reviewText && req.body.reviewText.length > 1000) {
        res.status(400).json({ error: 'Review text cannot exceed 1000 characters' });
        return;
      }

      // Validate reviewImageKeys
      if (
        req.body.reviewImageKeys &&
        (!Array.isArray(req.body.reviewImageKeys) ||
          req.body.reviewImageKeys.length > 10 ||
          !req.body.reviewImageKeys.every(
            (img: unknown): img is ReviewImageKey =>
              typeof img === 'object' &&
              img !== null &&
              typeof (img as ReviewImageKey).s3Key === 'string' &&
              typeof (img as ReviewImageKey).fileSize === 'number' &&
              typeof (img as ReviewImageKey).mimeType === 'string' &&
              typeof (img as ReviewImageKey).displayOrder === 'number'
          ))
      ) {
        res.status(400).json({
          error:
            'Review image keys must be valid objects with s3Key, fileSize, mimeType, and displayOrder (max 10)',
        });
        return;
      }

      const payload: SubmitReviewPayload = {
        overallRating: req.body.overallRating,
        qualityRating: req.body.qualityRating,
        professionalismRating: req.body.professionalismRating,
        timelinessRating: req.body.timelinessRating,
        reviewText: req.body.reviewText,
        reviewImageKeys: req.body.reviewImageKeys,
      };

      const review = await reviewService.submitReview(bookingId, userId, payload);
      res.status(201).json(review);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/bookings/:bookingId/customer-preferences
   * Get customer onboarding preferences that are marked as shareWithStylist
   * Only accessible by the artist assigned to the booking
   */
  async getCustomerPreferences(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const bookingId = req.params.bookingId;
      if (!bookingId) {
        res.status(400).json({ error: 'Booking ID is required' });
        return;
      }

      // Get the booking to verify access and get customer ID
      const booking = await bookingService.getBookingById(bookingId);
      if (!booking) {
        res.status(404).json({ error: 'Booking not found' });
        return;
      }

      // Only allow the artist assigned to this booking (or admin)
      const roles = getUserRoles(req);
      const isAdmin = roles.includes('admin');
      const isAssignedArtist = booking.artistId === userId;

      if (!isAdmin && !isAssignedArtist) {
        res.status(403).json({ error: 'Only the assigned artist can view customer preferences' });
        return;
      }

      // Get shared onboarding responses for the customer
      const preferences = await onboardingService.getSharedResponses(booking.customerId);

      res.json({
        success: true,
        data: {
          customerId: booking.customerId,
          preferences,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
