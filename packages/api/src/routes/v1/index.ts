import { type Router as ExpressRouter, Router } from 'express';

import { artistRouter } from './artist.js';
import authRouter from './auth.js';
import { bookingRouter } from './booking.js';

const router: ExpressRouter = Router();

router.use('/auth', authRouter);
router.use('/bookings', bookingRouter);
router.use('/artists', artistRouter);

export const v1Router: ExpressRouter = router;
