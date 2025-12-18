import type { NextFunction, Request, Response } from 'express';

import { BOOKING_STATUS } from '@524/shared';

import type { AuthRequest } from '../middleware/auth.js';
import { BookingService } from '../services/bookingService.js';
import { ReviewService } from '../services/reviewService.js';

const bookingService = new BookingService();
const reviewService = new ReviewService();

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
      const userRoles = getUserRoles(req);

      // Only customers can submit reviews
      if (!userRoles.includes('customer')) {
        res.status(403).json({ error: 'Only customers can submit reviews' });
        return;
      }

      const payload = req.body as {
        overallRating: number;
        qualityRating: number;
        professionalismRating: number;
        timelinessRating: number;
        reviewText?: string;
        reviewImages?: string[];
      };

      const review = await reviewService.submitReview(bookingId, userId, payload);
      res.status(201).json(review);
    } catch (error) {
      next(error);
    }
  },
};
