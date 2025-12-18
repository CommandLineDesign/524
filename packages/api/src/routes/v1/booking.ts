import { type Router as ExpressRouter, NextFunction, Request, Response, Router } from 'express';

import { BookingController } from '../../controllers/bookingController.js';
import { requireArtist, requireAuth, requireCustomer } from '../../middleware/auth.js';
import { validateUUIDParam } from '../../utils/validation.js';

const router: ExpressRouter = Router();

/**
 * Validation middleware for bookingId parameter
 */
function validateBookingId(req: Request, res: Response, next: NextFunction) {
  const bookingId = req.params.bookingId;

  const validation = validateUUIDParam(bookingId, 'bookingId');
  if (!validation.isValid && validation.error) {
    return res.status(validation.error.status).json({
      error: validation.error.message,
    });
  }

  next();
}

// List bookings for authenticated customer
router.get('/', requireCustomer(), BookingController.listCustomerBookings);

// List bookings for authenticated artist
router.get('/artist', requireArtist(), BookingController.listArtistBookings);

// Create booking (customers only)
router.post('/', requireCustomer(), BookingController.createBooking);

// Get booking details (customer or artist who owns the booking)
router.get(
  '/:bookingId',
  requireAuth(['customer', 'artist', 'admin']),
  validateBookingId,
  BookingController.getBookingById
);

// Update booking status (artist or admin with validation)
router.patch(
  '/:bookingId/status',
  requireAuth(['artist', 'admin']),
  validateBookingId,
  BookingController.updateBookingStatus
);

// Artist actions
router.post(
  '/:bookingId/accept',
  requireArtist(),
  validateBookingId,
  BookingController.acceptBooking
);
router.post(
  '/:bookingId/decline',
  requireArtist(),
  validateBookingId,
  BookingController.declineBooking
);

// Customer action: cancel pending booking
router.post(
  '/:bookingId/cancel',
  requireCustomer(),
  validateBookingId,
  BookingController.cancelPendingBooking
);

// Artist action: mark booking as complete
router.post(
  '/:bookingId/complete',
  requireArtist(),
  validateBookingId,
  BookingController.completeBooking
);

// Customer action: submit review for completed booking
router.post(
  '/:bookingId/review',
  requireCustomer(),
  validateBookingId,
  BookingController.submitReview
);

export const bookingRouter: ExpressRouter = router;
