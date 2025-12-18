import { type Router as ExpressRouter, Router } from 'express';

import { BookingController } from '../../controllers/bookingController.js';
import { requireArtist, requireAuth, requireCustomer } from '../../middleware/auth.js';

const router: ExpressRouter = Router();

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
  BookingController.getBookingById
);

// Update booking status (artist or admin with validation)
router.patch(
  '/:bookingId/status',
  requireAuth(['artist', 'admin']),
  BookingController.updateBookingStatus
);

// Artist actions
router.post('/:bookingId/accept', requireArtist(), BookingController.acceptBooking);
router.post('/:bookingId/decline', requireArtist(), BookingController.declineBooking);

// Customer action: cancel pending booking
router.post('/:bookingId/cancel', requireCustomer(), BookingController.cancelPendingBooking);

// Artist action: mark booking as complete
router.post('/:bookingId/complete', requireArtist(), BookingController.completeBooking);

export const bookingRouter: ExpressRouter = router;
