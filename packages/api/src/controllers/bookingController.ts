import type { NextFunction, Request, Response } from 'express';

import { BookingService } from '../services/bookingService.js';
import type { AuthRequest } from '../middleware/auth.js';

const bookingService = new BookingService();

export const BookingController = {
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
        customerId: req.user.id
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
      const booking = await bookingService.updateBookingStatus(req.params.bookingId, req.body.status);
      res.json(booking);
    } catch (error) {
      next(error);
    }
  }
};

