import { type Router as ExpressRouter, Router } from 'express';

import { healthRouter } from './health.js';
import { v1Router } from './v1/index.js';

const router: ExpressRouter = Router();

router.use('/health', healthRouter);
router.use('/v1', v1Router);

export const rootRouter: ExpressRouter = router;
