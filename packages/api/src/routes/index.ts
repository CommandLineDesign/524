import { type Router as IRouter, Router } from 'express';

import { healthRouter } from './health.js';
import { v1Router } from './v1/index.js';

const router = Router();

router.use('/health', healthRouter);
router.use('/v1', v1Router);

export const rootRouter: IRouter = router;
