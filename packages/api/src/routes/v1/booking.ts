import { Router } from 'express';

import { BookingController } from '../../controllers/bookingController';
import { requireAuth, requireCustomer, requireArtist } from '../../middleware/auth';

const router = Router();

// Create booking (customers only)
router.post('/', requireCustomer(), BookingController.createBooking);

// Get booking details (customer or artist who owns the booking)
router.get('/:bookingId', requireAuth(['customer', 'artist']), BookingController.getBookingById);

// Update booking status (artist only)
router.patch('/:bookingId/status', requireArtist(), BookingController.updateBookingStatus);

export const bookingRouter = router;

