import type { NextFunction, Request, Response } from 'express';

import { BOOKING_STATUS } from '@524/shared';

import type { AuthRequest } from '../middleware/auth.js';
import { BookingService } from '../services/bookingService.js';

const bookingService = new BookingService();

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

      res.json(booking);
    } catch (error) {
      next(error);
    }
  },

  async updateBookingStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const booking = await bookingService.updateBookingStatus(
        req.params.bookingId,
        req.body.status
      );
      res.json(booking);
    } catch (error) {
      next(error);
    }
  },
};
