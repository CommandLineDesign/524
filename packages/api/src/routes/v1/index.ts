import { type Router as ExpressRouter, Router } from 'express';

import { adminRouter } from './admin.js';
import { artistRouter } from './artist.js';
import authRouter from './auth.js';
import { bookingRouter } from './booking.js';
import { geocodeRouter } from './geocode.js';
import { messagingRouter } from './messaging.js';
import { onboardingRouter } from './onboarding.js';
import { reviewRouter } from './review.js';
import { uploadRouter } from './upload.js';

const router: ExpressRouter = Router();

router.use('/auth', authRouter);
router.use('/bookings', bookingRouter);
router.use('/artists', artistRouter);
router.use('/admin', adminRouter);
router.use('/geocode', geocodeRouter);
router.use('/onboarding', onboardingRouter);
router.use('/reviews', reviewRouter);
router.use('/uploads', uploadRouter);
router.use('/', messagingRouter);

export const v1Router: ExpressRouter = router;
