import { type Router as ExpressRouter, Router } from 'express';

import { BookingController } from '../../controllers/bookingController.js';
import { requireArtist, requireAuth, requireCustomer } from '../../middleware/auth.js';

const router: ExpressRouter = Router();

// List bookings for authenticated customer
router.get('/', requireCustomer(), BookingController.listCustomerBookings);

// Create booking (customers only)
router.post('/', requireCustomer(), BookingController.createBooking);

// Get booking details (customer or artist who owns the booking)
router.get('/:bookingId', requireAuth(['customer', 'artist']), BookingController.getBookingById);

// Update booking status (artist only)
router.patch('/:bookingId/status', requireArtist(), BookingController.updateBookingStatus);

export const bookingRouter: ExpressRouter = router;
