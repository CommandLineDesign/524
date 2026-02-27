import { type Router as IRouter, Router } from 'express';

import { adminRouter } from './admin.js';
import { artistRouter } from './artist.js';
import authRouter from './auth.js';
import { bookingRouter } from './booking.js';
import { customerRouter } from './customer.js';
import { deviceRouter } from './devices.js';
import { geocodeRouter } from './geocode.js';
import { messagingRouter } from './messaging.js';
import { notificationRouter } from './notifications.js';
import { onboardingRouter } from './onboarding.js';
import { reviewRouter } from './review.js';
import { uploadRouter } from './upload.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/bookings', bookingRouter);
router.use('/artists', artistRouter);
router.use('/customers', customerRouter);
router.use('/admin', adminRouter);
router.use('/devices', deviceRouter);
router.use('/geocode', geocodeRouter);
router.use('/onboarding', onboardingRouter);
router.use('/reviews', reviewRouter);
router.use('/uploads', uploadRouter);
router.use('/notifications', notificationRouter);
router.use('/messaging', messagingRouter);

export const v1Router: IRouter = router;
